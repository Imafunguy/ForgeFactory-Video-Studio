/**
 * Premium orchestrator — AI co-director, script→storyboard→assets workflow,
 * variant critic pick, and full premium gate aggregation.
 */

import type { Project } from './storage';
import type { PremiumGateSnapshot, VariantResult } from './pipeline';
import {
  assessControlsGates,
  assessPlanQuality,
  buildPlanningPrompt,
  extractHyperframesDesc,
  extractKeyframeSection,
} from './videoPipelinePrompts';
import {
  type VideoControls,
  DEFAULT_VIDEO_CONTROLS,
  injectControlsToPrompt,
  serializePreset,
} from './videoControls';
import { buildComfyPayload, type ComfyBridgePayload } from './comfyAdvancedBridge';
import type { TemplateId } from './videoRenderer';
import { getLocalRenderBias } from './openrouter';

export type WorkflowStageId =
  | 'co-director'
  | 'script'
  | 'storyboard'
  | 'assets'
  | 'refine'
  | 'export';

export type WorkflowStageStatus = 'pending' | 'active' | 'complete' | 'skipped' | 'error';

export interface WorkflowStageResult {
  id: WorkflowStageId;
  label: string;
  status: WorkflowStageStatus;
  summary: string;
  output?: string;
  score?: number;
  gates?: PremiumGateSnapshot[];
  durationMs?: number;
}

export interface CoDirectorBreakdown {
  brief: string;
  hookAngle: string;
  cameraPlan: string;
  motionPlan: string;
  audioPlan: string;
  refLockPlan: string;
  variantNote: string;
}

export interface PremiumOrchestratorInput {
  goal: string;
  project: Pick<Project, 'name' | 'colors' | 'uiElements' | 'tone'>;
  controls: VideoControls;
  maximizeLocal: boolean;
  templateId?: TemplateId | null;
  presetId?: string | null;
}

export interface PremiumOrchestratorResult {
  goal: string;
  script: string;
  storyboard: string;
  imagePrompts: string;
  hyperDesc: string;
  coDirector: CoDirectorBreakdown;
  stages: WorkflowStageResult[];
  premiumGates: PremiumGateSnapshot[];
  variantResults: VariantResult[];
  qualityScore: number;
  planRefined: boolean;
  controlsSnapshot: string;
  activePresetId?: string;
  comfyPayload: ComfyBridgePayload;
}

export interface OrchestratorCallbacks {
  callPlanner: (prompt: string, model: string, maxTokens?: number) => Promise<string>;
  callImagePrompts: (script: string) => Promise<string>;
  generateVariants?: (
    basePlan: string,
  ) => Promise<VariantResult[]>;
  refinePlan?: (plan: string, issues: string[]) => Promise<string>;
  planningModel: string;
}

const STAGE_DEFS: Array<{ id: WorkflowStageId; label: string }> = [
  { id: 'co-director', label: 'AI Co-Director' },
  { id: 'script', label: 'Script' },
  { id: 'storyboard', label: 'Storyboard' },
  { id: 'assets', label: 'Assets' },
  { id: 'refine', label: 'Refine & Gates' },
  { id: 'export', label: 'Export Ready' },
];

/** Build co-director breakdown from goal + controls (plain-language plan decomposition). */
export function buildCoDirectorBreakdown(
  goal: string,
  controls: VideoControls,
): CoDirectorBreakdown {
  const brushSummary =
    controls.motionBrush.areas.length > 0
      ? controls.motionBrush.areas
          .map((a) => `${a.desc ?? 'area'}: ${typeof a.vector === 'string' ? a.vector : a.vector.label ?? 'motion'} @ ${Math.round(a.intensity * 100)}%`)
          .join('; ')
      : 'global camera-driven motion';

  const audioSummary =
    controls.musicSyncLevel === 'none'
      ? 'no scored audio — ambient UI only'
      : `${controls.musicSyncLevel} sync${controls.musicSync?.bpm ? ` @ ${controls.musicSync.bpm} BPM` : ''}${
          controls.lipSyncStrength ? `, lip ${controls.lipSyncStrength}%` : ''
        }`;

  const refSummary = controls.brandKitLock.enabled
    ? `Brand kit "${controls.brandKitLock.kitName ?? 'active'}" @ ${controls.brandKitLock.lockStrength}% + ref ${controls.refConsistencyStrength}%`
    : `Ref/Ingredients lock @ ${controls.refConsistencyStrength}%`;

  const variantNote =
    controls.variantCount > 1
      ? `Generate ${controls.variantCount} variants (${controls.variantStrategy}), critic-pick best`
      : 'Single take — no variant branch';

  const brief = [
    `GOAL: ${goal}`,
    `LENGTH: ${controls.lengthSec}s ${controls.aspectRatio} | CAMERA: ${controls.cameraStyle} | MOTION: ${controls.motionIntensity}`,
    `MOOD: ${controls.moodTone} | PACE: ${controls.pace} | PHYSICS: ${controls.physicsIntensity}`,
    controls.directorModePlainLang ? `DIRECTOR BRIEF: ${controls.directorModePlainLang}` : '',
    `MOTION BRUSH: ${brushSummary}`,
    `REF LOCK: ${refSummary}`,
    `AUDIO: ${audioSummary}`,
    `LENS: ${controls.lensOptics ?? 'standard'}`,
    variantNote,
    controls.nodeGraph.enabled ? `NODE GRAPH: ${controls.nodeGraph.templateName ?? 'custom pipeline'}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return {
    brief,
    hookAngle: `${controls.moodTone} hook — ${controls.pace} pacing, ${controls.textAnimationStyle} text reveal`,
    cameraPlan: `${controls.cameraStyle} with ${controls.lensOptics ?? 'standard lens'}, ${controls.motionIntensity} energy`,
    motionPlan: brushSummary,
    audioPlan: audioSummary,
    refLockPlan: refSummary,
    variantNote,
  };
}

/** Extract storyboard section from full plan (or synthesize from script beats). */
export function extractStoryboard(plan: string): string {
  const storyboardMatch = plan.match(/##\s*storyboard([\s\S]*?)(?=##\s*keyframe|##\s*hyperframes|$)/i);
  if (storyboardMatch?.[1]?.trim()) return storyboardMatch[1].trim();

  const beats = plan.match(/\d+[–-]\d+s[^\n]*/gi) ?? plan.match(/\d:\d{2}[^\n]*/g);
  if (beats?.length) {
    return beats.map((b, i) => `Beat ${i + 1}: ${b.trim()}`).join('\n');
  }

  return plan.slice(0, 1200);
}

/** Critic-pick best variant by strategy. */
export function pickBestVariant(
  variants: VariantResult[],
  strategy: VideoControls['variantStrategy'],
): VariantResult {
  if (variants.length === 0) {
    throw new Error('No variants to pick from');
  }

  if (strategy === 'user-pick') {
    return variants.find((v) => v.selected) ?? variants[0];
  }

  if (strategy === 'diversity') {
    const sorted = [...variants].sort((a, b) => b.score - a.score);
    return sorted[Math.min(1, sorted.length - 1)] ?? sorted[0];
  }

  return variants.reduce((best, v) => (v.score > best.score ? v : best));
}

/** Aggregate all premium gate results with overall pass rate. */
export function aggregatePremiumGates(
  plan: string,
  controls: VideoControls,
  extraGates?: PremiumGateSnapshot[],
): PremiumGateSnapshot[] {
  const controlGates = assessControlsGates(plan, controls);
  const merged = new Map<string, PremiumGateSnapshot>();

  for (const g of [...controlGates, ...(extraGates ?? [])]) {
    const existing = merged.get(g.category);
    if (!existing || g.score > existing.score) {
      merged.set(g.category, g);
    }
  }

  return Array.from(merged.values());
}

function gatePassRate(gates: PremiumGateSnapshot[]): number {
  if (gates.length === 0) return 100;
  const passed = gates.filter((g) => g.pass).length;
  return Math.round((passed / gates.length) * 100);
}

function initStages(): WorkflowStageResult[] {
  return STAGE_DEFS.map((s) => ({
    id: s.id,
    label: s.label,
    status: 'pending' as WorkflowStageStatus,
    summary: 'Waiting',
  }));
}

function updateStage(
  stages: WorkflowStageResult[],
  id: WorkflowStageId,
  patch: Partial<WorkflowStageResult>,
): WorkflowStageResult[] {
  return stages.map((s) => (s.id === id ? { ...s, ...patch } : s));
}

/**
 * Run full premium workflow: co-director → script → storyboard → assets → refine → export-ready.
 */
export async function runPremiumOrchestrator(
  input: PremiumOrchestratorInput,
  callbacks: OrchestratorCallbacks,
): Promise<PremiumOrchestratorResult> {
  const controls = input.controls ?? DEFAULT_VIDEO_CONTROLS;
  let stages = initStages();
  const t0 = Date.now();

  // Stage 1: Co-director
  stages = updateStage(stages, 'co-director', { status: 'active', summary: 'Breaking down goal + controls…' });
  const coDirector = buildCoDirectorBreakdown(input.goal, controls);
  stages = updateStage(stages, 'co-director', {
    status: 'complete',
    summary: `Camera: ${controls.cameraStyle} | Brush areas: ${controls.motionBrush.areas.length}`,
    output: coDirector.brief,
    durationMs: Date.now() - t0,
  });

  // Stage 2: Script (planning)
  const scriptT0 = Date.now();
  stages = updateStage(stages, 'script', { status: 'active', summary: 'Generating production plan…' });
  const planningPrompt = injectControlsToPrompt(
    buildPlanningPrompt(input.project, input.goal, {
      maximizeLocal: input.maximizeLocal,
      templateId: input.templateId,
      durationSec: controls.lengthSec,
      localBias: getLocalRenderBias(input.maximizeLocal),
      controls,
    }),
    controls,
  );

  let script = await callbacks.callPlanner(planningPrompt, callbacks.planningModel, 3200);
  let planRefined = false;

  // Stage 3: Storyboard (extract + validate)
  stages = updateStage(stages, 'script', {
    status: 'complete',
    summary: `${script.length} chars plan`,
    output: script.slice(0, 500) + (script.length > 500 ? '…' : ''),
    durationMs: Date.now() - scriptT0,
  });

  const storyT0 = Date.now();
  stages = updateStage(stages, 'storyboard', { status: 'active', summary: 'Extracting storyboard beats…' });
  let storyboard = extractStoryboard(script);
  stages = updateStage(stages, 'storyboard', {
    status: 'complete',
    summary: `${storyboard.split('\n').filter(Boolean).length} beats`,
    output: storyboard.slice(0, 600),
    durationMs: Date.now() - storyT0,
  });

  // Variants + critic pick (during refine prep)
  let variantResults: VariantResult[] = [];
  if (controls.variantCount > 1 && callbacks.generateVariants) {
    variantResults = await callbacks.generateVariants(script);
    const picked = pickBestVariant(variantResults, controls.variantStrategy);
    variantResults = variantResults.map((v) => ({ ...v, selected: v.id === picked.id }));
    script = picked.plan;
    storyboard = extractStoryboard(script);
  } else {
    const quality = assessPlanQuality(script, controls);
    variantResults = [
      {
        id: 1,
        plan: script,
        score: quality.score,
        strategy: controls.variantStrategy,
        selected: true,
      },
    ];
  }

  // Stage 4: Assets (image prompts)
  const assetsT0 = Date.now();
  stages = updateStage(stages, 'assets', { status: 'active', summary: 'Building keyframe asset prompts…' });
  const imagePrompts = await callbacks.callImagePrompts(script);
  const hyperDesc = extractHyperframesDesc(script, input.project, input.templateId ?? null, controls);
  stages = updateStage(stages, 'assets', {
    status: 'complete',
    summary: `${imagePrompts.split(/\n\s*\d+\./).length - 1} keyframe prompts`,
    output: extractKeyframeSection(imagePrompts).slice(0, 400) || imagePrompts.slice(0, 400),
    durationMs: Date.now() - assetsT0,
  });

  // Stage 5: Refine & gates
  const refineT0 = Date.now();
  stages = updateStage(stages, 'refine', { status: 'active', summary: 'Running premium gates…' });
  let quality = assessPlanQuality(script, controls);
  let premiumGates = aggregatePremiumGates(script, controls);

  const failedIssues = [
    ...quality.issues,
    ...premiumGates.filter((g) => !g.pass).flatMap((g) => g.issues.map((i) => `${g.category}: ${i}`)),
  ];

  if ((!quality.pass || premiumGates.some((g) => !g.pass)) && callbacks.refinePlan && failedIssues.length > 0) {
    const refined = await callbacks.refinePlan(script, failedIssues);
    if (refined.length > script.length * 0.7) {
      script = refined;
      storyboard = extractStoryboard(script);
      planRefined = true;
      quality = assessPlanQuality(script, controls);
      premiumGates = aggregatePremiumGates(script, controls);
    }
  }

  const passRate = gatePassRate(premiumGates);
  stages = updateStage(stages, 'refine', {
    status: 'complete',
    summary: `Gates ${passRate}% | Quality ${quality.score}`,
    score: quality.score,
    gates: premiumGates,
    durationMs: Date.now() - refineT0,
  });

  // Stage 6: Export ready
  const comfyPayload = buildComfyPayload(controls, script, input.goal);
  stages = updateStage(stages, 'export', {
    status: 'complete',
    summary: `Comfy graph ${comfyPayload.nodeCount} nodes | ${controls.lengthSec}s ${controls.aspectRatio}`,
    output: hyperDesc.slice(0, 300),
    durationMs: Date.now() - t0,
  });

  return {
    goal: input.goal,
    script,
    storyboard,
    imagePrompts,
    hyperDesc,
    coDirector,
    stages,
    premiumGates,
    variantResults,
    qualityScore: quality.score,
    planRefined,
    controlsSnapshot: serializePreset(controls),
    activePresetId: input.presetId ?? undefined,
    comfyPayload,
  };
}

export function getWorkflowStageDefs(): typeof STAGE_DEFS {
  return STAGE_DEFS;
}