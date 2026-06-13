/**
 * Premium testing harness — expanded Ultimate rubric, preset auto-score, regression guard.
 */

import {
  type VideoControls,
  loadPremiumPreset,
  PREMIUM_PRESET_IDS,
  DEFAULT_VIDEO_CONTROLS,
} from './videoControls';
import { assessControlsGates, assessPlanQuality } from './videoPipelinePrompts';
import { buildCoDirectorBreakdown, type CoDirectorBreakdown } from './premiumOrchestrator';
import { buildComfyPayload } from './comfyAdvancedBridge';
import type { PremiumGateSnapshot } from './pipeline';

export interface RubricCategory {
  id: string;
  label: string;
  weight: number;
  score: number;
  maxScore: number;
  evidence: string;
  pass: boolean;
}

export interface PresetTestResult {
  presetId: string;
  label: string;
  timestamp: string;
  goal: string;
  controls: VideoControls;
  categories: RubricCategory[];
  overallScore: number;
  overallPass: boolean;
  gatePassRate: number;
  premiumFeelTags: string[];
  regressionDelta?: number;
}

export interface RegressionReport {
  runAt: string;
  results: PresetTestResult[];
  averageScore: number;
  baselineAverage?: number;
  regressionOk: boolean;
  failures: string[];
  logMarkdown: string;
}

const RUBRIC_THRESHOLDS = {
  categoryPass: 8.5,
  overallPass: 8.7,
  gatePassRate: 85,
  regressionMaxDelta: 0.2,
  categoryRegressionMax: 1.0,
};

function clampScore(n: number): number {
  return Math.max(0, Math.min(10, Math.round(n * 10) / 10));
}

function scoreFromChecks(checks: Array<{ pass: boolean; weight: number }>): number {
  const total = checks.reduce((s, c) => s + c.weight, 0);
  const earned = checks.filter((c) => c.pass).reduce((s, c) => s + c.weight, 0);
  return clampScore(total > 0 ? (earned / total) * 10 : 0);
}

/** Score a single rubric category from controls + synthetic plan evidence. */
function scoreCategory(
  id: string,
  label: string,
  weight: number,
  score: number,
  evidence: string,
): RubricCategory {
  return {
    id,
    label,
    weight,
    score: clampScore(score),
    maxScore: 10,
    evidence,
    pass: score >= RUBRIC_THRESHOLDS.categoryPass,
  };
}

/** Build synthetic plan text from controls for offline rubric scoring. */
export function buildSyntheticPlanForScoring(
  goal: string,
  controls: VideoControls,
  coDirector?: CoDirectorBreakdown,
): string {
  const cd = coDirector ?? buildCoDirectorBreakdown(goal, controls);
  const brushLines = controls.motionBrush.areas.map(
    (a) => `Motion brush area "${a.desc}": ${typeof a.vector === 'string' ? a.vector : 'custom vector'} intensity ${Math.round(a.intensity * 100)}%`,
  );

  return `
## HOOK (0-${Math.min(6, controls.lengthSec)}s)
${cd.hookAngle} — ${goal}

## SCRIPT (${controls.lengthSec}s total)
0-${controls.lengthSec}s: ${controls.directorModePlainLang ?? goal}
Camera: ${controls.cameraStyle} | Lens: ${controls.lensOptics ?? 'standard'}
Physics: ${controls.physicsIntensity} momentum on UI elements

## STORYBOARD
Beat 1: Hook with ${controls.moodTone} tone
Beat 2: Dashboard reveal [LOCAL] with ref lock ${controls.refConsistencyStrength}%
Beat 3: Feature highlight with motion brush
Beat 4: Proof / metrics
Beat 5: CTA — ${controls.endCardCTAStyle} end card

## KEYFRAME PROMPTS
1. [HOOK] Hero frame — ${controls.heroFrameFirst ? 'HERO FRAME FIRST locked composition' : 'opening shot'}
2. [REVEAL] Dashboard with brand kit ${controls.brandKitLock.kitName ?? 'Elements'} @ ${controls.refConsistencyStrength}%
3. [FEATURE] Motion brush localized: ${brushLines.join('; ') || 'global motion'}
4. [PROOF] Metrics with ${controls.textAnimationStyle} text
5. [CTA] End card ${controls.endCardCTAStyle}

## HYPERFRAMES SCENES
Scene timeline ${controls.lengthSec}s @ ${controls.aspectRatio}
${controls.nodeGraph.enabled ? `Node graph: ${controls.nodeGraph.templateName ?? 'custom'} — ${controls.nodeGraph.nodes.map((n) => n.label).join(' → ')}` : ''}

MCSLA + Constraint Sandwich per shot. Subject anchor: brand UI.
${controls.firstLastFrameRefs.start || controls.firstLastFrameRefs.end ? `First/last frame anchors: start=${controls.firstLastFrameRefs.start ? 'locked' : 'auto'} end=${controls.firstLastFrameRefs.end ? 'locked' : 'auto'}` : ''}
Audio: ${cd.audioPlan} | BPM ${controls.musicSync?.bpm ?? 'n/a'}
Variants: ${controls.variantCount} (${controls.variantStrategy})
Director co-director breakdown applied.
${cd.brief}
`.trim();
}

/** Score all expanded Ultimate rubric categories. */
export function scoreExpandedRubric(
  goal: string,
  controls: VideoControls,
  plan?: string,
  gates?: PremiumGateSnapshot[],
): RubricCategory[] {
  const syntheticPlan = plan ?? buildSyntheticPlanForScoring(goal, controls);
  const planQuality = assessPlanQuality(syntheticPlan, controls);
  const controlGates = gates ?? assessControlsGates(syntheticPlan, controls);
  const comfy = buildComfyPayload(controls, syntheticPlan, goal);
  const coDirector = buildCoDirectorBreakdown(goal, controls);

  const gatePassRate =
    controlGates.length > 0
      ? controlGates.filter((g) => g.pass).length / controlGates.length
      : 1;

  const categories: RubricCategory[] = [
    scoreCategory(
      'cinematic',
      'Cinematic Quality (camera, physics, lens)',
      0.1,
      scoreFromChecks([
        { pass: /camera|lens|dof|mm/i.test(syntheticPlan), weight: 3 },
        { pass: /physics|momentum/i.test(syntheticPlan), weight: 3 },
        { pass: !!controls.lensOptics, weight: 2 },
        { pass: controls.physicsIntensity !== 'low', weight: 2 },
      ]),
      `${controls.cameraStyle} + ${controls.lensOptics ?? 'standard'} + physics ${controls.physicsIntensity}`,
    ),
    scoreCategory(
      'brand',
      'Brand Fidelity (kit/Elements lock)',
      0.08,
      scoreFromChecks([
        { pass: controls.refConsistencyStrength >= 80, weight: 4 },
        { pass: controls.brandKitLock.enabled, weight: 3 },
        { pass: /brand|elements|ingredients/i.test(syntheticPlan), weight: 3 },
      ]),
      `Ref ${controls.refConsistencyStrength}% | Kit: ${controls.brandKitLock.kitName ?? 'off'}`,
    ),
    scoreCategory(
      'consistency',
      'Consistency (ref lock, first/last)',
      0.08,
      scoreFromChecks([
        { pass: controlGates.find((g) => g.category === 'Ref Lock')?.pass ?? true, weight: 4 },
        { pass: controlGates.find((g) => g.category === 'First/Last Frame')?.pass ?? true, weight: 3 },
        { pass: controls.refConsistencyStrength >= 75, weight: 3 },
      ]),
      `Gates ref/first-last | strength ${controls.refConsistencyStrength}%`,
    ),
    scoreCategory(
      'motion-brush',
      'Motion Brush Fidelity',
      0.08,
      scoreFromChecks([
        { pass: controls.motionBrush.areas.length > 0, weight: 3 },
        { pass: controlGates.find((g) => g.category === 'Motion Brush')?.pass ?? controls.motionBrush.areas.length === 0, weight: 4 },
        { pass: comfy.motionBrushMasks.length > 0 || controls.motionBrush.areas.length === 0, weight: 3 },
      ]),
      `${controls.motionBrush.areas.length} brush areas | Comfy masks ${comfy.motionBrushMasks.length}`,
    ),
    scoreCategory(
      'ref-lock',
      'First/Last + Ingredients Lock',
      0.08,
      scoreFromChecks([
        { pass: !!(controls.firstLastFrameRefs.start || controls.firstLastFrameRefs.end), weight: 3 },
        { pass: comfy.interp.interpFrames > 0 || !controls.firstLastFrameRefs.start, weight: 3 },
        { pass: controls.brandKitLock.lockStrength >= 70 || !controls.brandKitLock.enabled, weight: 4 },
      ]),
      `Frames start/end | interp ${comfy.interp.interpFrames}f`,
    ),
    scoreCategory(
      'co-director',
      'AI Co-Director + Workflow',
      0.07,
      scoreFromChecks([
        { pass: !!controls.directorModePlainLang, weight: 4 },
        { pass: coDirector.brief.length > 100, weight: 3 },
        { pass: planQuality.score >= 70, weight: 3 },
      ]),
      coDirector.hookAngle,
    ),
    scoreCategory(
      'variants',
      'Variant Gen + Selection',
      0.06,
      scoreFromChecks([
        { pass: controls.variantCount >= 2, weight: 4 },
        { pass: ['best-critic', 'diversity', 'lock-max'].includes(controls.variantStrategy), weight: 3 },
        { pass: comfy.batch.variantCount >= 2 || controls.variantCount <= 1, weight: 3 },
      ]),
      `${controls.variantCount} variants (${controls.variantStrategy})`,
    ),
    scoreCategory(
      'node-graph',
      'Node Graph / Canvas Orchestration',
      0.06,
      scoreFromChecks([
        { pass: controls.nodeGraph.enabled, weight: 4 },
        { pass: controls.nodeGraph.nodes.length >= 3, weight: 3 },
        { pass: comfy.nodeCount >= 5, weight: 3 },
      ]),
      `${controls.nodeGraph.nodes.length} nodes | Comfy ${comfy.nodeCount} nodes`,
    ),
    scoreCategory(
      'audio',
      'Native-Style Audio/Lip/Beat',
      0.06,
      scoreFromChecks([
        { pass: controls.musicSyncLevel !== 'none', weight: 4 },
        { pass: !!(controls.musicSync?.bpm || controls.musicSync?.cues?.length), weight: 3 },
        { pass: controlGates.find((g) => g.category === 'Audio/Beat')?.pass ?? true, weight: 3 },
      ]),
      `${controls.musicSyncLevel} | BPM ${controls.musicSync?.bpm ?? '—'}`,
    ),
    scoreCategory(
      'guardrails',
      'Guardrails / Gates / Refine',
      0.08,
      scoreFromChecks([
        { pass: gatePassRate >= 0.85, weight: 5 },
        { pass: planQuality.pass, weight: 3 },
        { pass: planQuality.score >= 80, weight: 2 },
      ]),
      `Gate pass ${Math.round(gatePassRate * 100)}% | Plan ${planQuality.score}`,
    ),
    scoreCategory(
      'ultimate-feel',
      'Ultimate Premium SaaS Feel',
      0.09,
      scoreFromChecks([
        { pass: controls.brandIntensity !== 'subtle-accents', weight: 3 },
        { pass: controls.motionBrush.areas.length > 0 || controls.nodeGraph.enabled, weight: 3 },
        { pass: controls.directorModeEnabled !== false && !!controls.directorModePlainLang, weight: 2 },
        { pass: comfy.enabled, weight: 2 },
      ]),
      'Directed, consistent, controllable premium generator feel',
    ),
  ];

  return categories;
}

export function computeOverallScore(categories: RubricCategory[]): number {
  const totalWeight = categories.reduce((s, c) => s + c.weight, 0);
  const weighted = categories.reduce((s, c) => s + c.score * c.weight, 0);
  return clampScore(totalWeight > 0 ? weighted / totalWeight : 0);
}

export function derivePremiumFeelTags(controls: VideoControls): string[] {
  const tags: string[] = [];
  if (controls.motionBrush.areas.length > 0) tags.push('motion-brush');
  if (controls.refConsistencyStrength >= 85) tags.push('ref-lock');
  if (controls.brandKitLock.enabled) tags.push('brand-kit');
  if (controls.musicSyncLevel === 'strong') tags.push('audio-sync');
  if (controls.firstLastFrameRefs.start || controls.firstLastFrameRefs.end) tags.push('frame-anchors');
  if (controls.variantCount > 1) tags.push('variants');
  if (controls.nodeGraph.enabled) tags.push('node-graph');
  if (controls.directorModePlainLang) tags.push('co-director');
  if (controls.lipSyncStrength && controls.lipSyncStrength > 0) tags.push('lip-sync');
  return tags;
}

/** Run auto-score for a single premium preset. */
export function runPresetTest(presetId: string): PresetTestResult {
  const bundle = loadPremiumPreset(presetId);
  const plan = buildSyntheticPlanForScoring(bundle.goal, bundle.controls);
  const gates = assessControlsGates(plan, bundle.controls);
  const categories = scoreExpandedRubric(bundle.goal, bundle.controls, plan, gates);
  const overallScore = computeOverallScore(categories);
  const gatePassRate = Math.round(
    (gates.filter((g) => g.pass).length / Math.max(1, gates.length)) * 100,
  );

  return {
    presetId,
    label: bundle.label,
    timestamp: new Date().toISOString(),
    goal: bundle.goal,
    controls: bundle.controls,
    categories,
    overallScore,
    overallPass: overallScore >= RUBRIC_THRESHOLDS.overallPass && gatePassRate >= RUBRIC_THRESHOLDS.gatePassRate,
    gatePassRate,
    premiumFeelTags: derivePremiumFeelTags(bundle.controls),
  };
}

/** Compare current run against baseline for regression guard. */
export function checkRegressionGuard(
  current: PresetTestResult[],
  baseline?: PresetTestResult[],
): { ok: boolean; failures: string[]; deltas: Record<string, number> } {
  if (!baseline?.length) {
    return { ok: true, failures: [], deltas: {} };
  }

  const failures: string[] = [];
  const deltas: Record<string, number> = {};
  const baselineMap = new Map(baseline.map((b) => [b.presetId, b]));

  let totalDelta = 0;
  for (const result of current) {
    const base = baselineMap.get(result.presetId);
    if (!base) continue;
    const delta = result.overallScore - base.overallScore;
    deltas[result.presetId] = delta;
    totalDelta += delta;

    if (delta < -RUBRIC_THRESHOLDS.regressionMaxDelta) {
      failures.push(`${result.presetId}: overall dropped ${Math.abs(delta).toFixed(1)} (${base.overallScore} → ${result.overallScore})`);
    }

    for (const cat of result.categories) {
      const baseCat = base.categories.find((c) => c.id === cat.id);
      if (baseCat && baseCat.score - cat.score > RUBRIC_THRESHOLDS.categoryRegressionMax) {
        failures.push(`${result.presetId}/${cat.id}: dropped ${(baseCat.score - cat.score).toFixed(1)}`);
      }
    }
  }

  const avgDelta = totalDelta / current.length;
  if (avgDelta < -RUBRIC_THRESHOLDS.regressionMaxDelta) {
    failures.push(`Average score delta ${avgDelta.toFixed(2)} exceeds -${RUBRIC_THRESHOLDS.regressionMaxDelta}`);
  }

  return { ok: failures.length === 0, failures, deltas };
}

/** Run full preset regression suite (all 5 presets or subset). */
export function runPresetRegression(
  presetIds: string[] = [...PREMIUM_PRESET_IDS],
  baseline?: PresetTestResult[],
): RegressionReport {
  const results = presetIds.map(runPresetTest);
  const averageScore = clampScore(
    results.reduce((s, r) => s + r.overallScore, 0) / Math.max(1, results.length),
  );
  const baselineAverage = baseline
    ? clampScore(baseline.reduce((s, r) => s + r.overallScore, 0) / baseline.length)
    : undefined;

  const { ok, failures } = checkRegressionGuard(results, baseline);
  const logMarkdown = formatRegressionLog(results, averageScore, baselineAverage, ok, failures);

  return {
    runAt: new Date().toISOString(),
    results,
    averageScore,
    baselineAverage,
    regressionOk: ok,
    failures,
    logMarkdown,
  };
}

export function formatRegressionLog(
  results: PresetTestResult[],
  averageScore: number,
  baselineAverage: number | undefined,
  regressionOk: boolean,
  failures: string[],
): string {
  const lines = [
    `# Premium Preset Regression — ${new Date().toISOString().slice(0, 10)}`,
    '',
    `**Average score:** ${averageScore}/10${baselineAverage !== undefined ? ` (baseline ${baselineAverage})` : ''}`,
    `**Regression guard:** ${regressionOk ? 'PASS' : 'FAIL'}`,
    '',
    '## Results',
    '',
    '| Preset | Overall | Gates | Pass | Premium Feel |',
    '|--------|---------|-------|------|--------------|',
  ];

  for (const r of results) {
    lines.push(
      `| ${r.label} | ${r.overallScore} | ${r.gatePassRate}% | ${r.overallPass ? '✓' : '✗'} | ${r.premiumFeelTags.join(', ')} |`,
    );
  }

  lines.push('', '## Category Scores', '');
  for (const r of results) {
    lines.push(`### ${r.label}`);
    for (const c of r.categories) {
      lines.push(`- ${c.label}: **${c.score}**/10 ${c.pass ? '✓' : '✗'} — ${c.evidence}`);
    }
    lines.push('');
  }

  if (failures.length > 0) {
    lines.push('## Regression Failures', '');
    failures.forEach((f) => lines.push(`- ${f}`));
  }

  return lines.join('\n');
}

/** StrataBody 30s focused test (Higgsfield cinematic preset). */
export function runStrataBody30sTest(): PresetTestResult {
  return runPresetTest('higgsfield-cinematic');
}

export { RUBRIC_THRESHOLDS, DEFAULT_VIDEO_CONTROLS };