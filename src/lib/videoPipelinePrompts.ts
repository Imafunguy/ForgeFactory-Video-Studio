/**
 * ForgeFactory v2 — Video pipeline prompt engineering
 * Ultimate VideoControls injection, premium patterns (MCSLA + Constraint Sandwich),
 * quality gates, and brand profiles.
 */

import type { Project } from './storage';
import type { TemplateId } from './videoRenderer';
import { getTemplateLabel } from './localVideoTemplates';
import { PROJECT_DESCRIPTIONS } from './constants';
import {
  type VideoControls,
  DEFAULT_VIDEO_CONTROLS,
  getCanvasDimensions,
  injectControlsToPrompt,
} from './videoControls';

export const QUALITY_BOOST_PLANNING_MODEL = 'x-ai/grok-4';
export const QUALITY_BOOST_IMAGE_MODEL = 'black-forest-labs/flux.2-pro';

export interface BrandVideoProfile {
  hookLine: string;
  kineticHook: string;
  painPoint: string;
  featureLabels: [string, string, string];
  metricLabels: [string, string];
  quote: { text: string; author: string };
  cta: string;
  tagline: string;
  visualStyle: string;
  motionHints: string;
  uiFocus: string;
}

export interface PlanQualityResult {
  pass: boolean;
  score: number;
  issues: string[];
}

export interface ControlGateResult {
  category: string;
  pass: boolean;
  score: number;
  issues: string[];
}

export interface EffectivePipelineModels {
  planning: string;
  image: string;
  boosted: boolean;
}

const BRAND_PROFILES: Record<string, Partial<BrandVideoProfile>> = {
  StrataBody: {
    hookLine: 'Stop guessing — see your body composition change in real time.',
    kineticHook: 'TRACK PROGRESS',
    painPoint: 'Scattered fitness apps, no clear picture of real body composition progress.',
    featureLabels: ['AI Body Coach', 'Progress Rings', 'Live Tracking'],
    metricLabels: ['Consistency', 'Body Fat %'],
    quote: { text: 'I finally saw past the plateau — the rings made progress undeniable.', author: 'Sam K., Wellness Coach' },
    cta: 'Start Coaching Free',
    tagline: 'Science-backed coaching, beautifully simple.',
    visualStyle: 'Clean indigo-violet SaaS UI, soft clinical lighting, progress rings as hero elements, minimal chrome.',
    motionHints: 'Rings animate 0→target, cards lift on hover, metric counters tick up, subtle parallax on dashboard.',
    uiFocus: 'dashboard with progress rings, AI coach cards, body composition charts, Start Coaching CTA',
  },
  SpeedMend: {
    hookLine: 'Repairs move faster when every handoff is visible.',
    kineticHook: 'SHIP FASTER',
    painPoint: 'Repair shops lose time in phone calls, sticky notes, and mystery status.',
    featureLabels: ['Kanban Board', 'Repair Timeline', 'Team Handoff'],
    metricLabels: ['Turnaround', 'Jobs Closed'],
    quote: { text: 'We cut average repair time by 34% in the first month.', author: 'Marcus T., Shop Owner' },
    cta: 'Try SpeedMend Free',
    tagline: 'Fast repairs. Clear handoffs. Happy customers.',
    visualStyle: 'Emerald-teal workflow UI, kanban columns, timeline bars, crisp practical lighting, trustworthy B2B aesthetic.',
    motionHints: 'Cards slide between columns, timeline scrub animates, status badges pulse, handoff arrows draw in.',
    uiFocus: 'kanban board, repair timeline, quick-action buttons, team handoff panel',
  },
  ClubCensus: {
    hookLine: 'Your community already has opinions — now you can hear them instantly.',
    kineticHook: 'ENGAGE LIVE',
    painPoint: 'Clubs and communities guess what members want instead of asking in the moment.',
    featureLabels: ['Live Polls', 'Member Feed', 'Census Analytics'],
    metricLabels: ['Participation', 'Response Rate'],
    quote: { text: 'Our event turnout doubled once we started live polls in the feed.', author: 'Priya L., Community Lead' },
    cta: 'Launch Your Census',
    tagline: 'Polls, feeds, and insights — all in one pulse.',
    visualStyle: 'Vibrant magenta-purple community UI, avatar stacks, live poll bars filling, energetic social lighting.',
    motionHints: 'Poll bars race to percentages, avatars pop in, feed cards slide up, live badge pulses.',
    uiFocus: 'live poll widget, community feed, member avatars, real-time census dashboard',
  },
};

export type BrandProject = Pick<Project, 'name' | 'colors' | 'uiElements' | 'tone'>;

export function getBrandVideoProfile(project: BrandProject): BrandVideoProfile {
  const preset = BRAND_PROFILES[project.name] ?? {};
  const splitName = project.name.split(/(?=[A-Z])/).join(' ').slice(0, 14).toUpperCase();
  return {
    hookLine: preset.hookLine ?? `The smarter way to run ${project.name}.`,
    kineticHook: preset.kineticHook ?? (splitName || 'GROW FASTER'),
    painPoint: preset.painPoint ?? 'Teams waste time on fragmented tools and unclear results.',
    featureLabels: preset.featureLabels ?? ['Dashboard', 'Smart Insights', 'Team View'],
    metricLabels: preset.metricLabels ?? ['Impact', 'Growth'],
    quote: preset.quote ?? { text: 'This changed how our team works every day.', author: 'Team Lead' },
    cta: preset.cta ?? 'Start free trial',
    tagline: preset.tagline ?? `${project.name} — make it real.`,
    visualStyle: preset.visualStyle ?? `Premium ${project.tone} SaaS UI with accent ${project.colors}, soft studio lighting, crisp UI chrome.`,
    motionHints: preset.motionHints ?? 'Smooth UI transitions, kinetic typography, metric counters, card lifts, progress fills.',
    uiFocus: preset.uiFocus ?? project.uiElements,
  };
}

export function resolveEffectiveModels(
  qualityBoost: boolean,
  planningModel: string,
  imageModel: string,
): EffectivePipelineModels {
  if (!qualityBoost) {
    return { planning: planningModel, image: imageModel, boosted: false };
  }
  return {
    planning: QUALITY_BOOST_PLANNING_MODEL,
    image: QUALITY_BOOST_IMAGE_MODEL,
    boosted: true,
  };
}

/** Premium MCSLA + Constraint Sandwich block for all pipeline stages. */
export function buildPremiumPatternsBlock(project: BrandProject, controls: VideoControls): string {
  const profile = getBrandVideoProfile(project);
  const dims = getCanvasDimensions(controls.aspectRatio, controls.customAspect);
  const brushDesc = controls.motionBrush.areas.length
    ? controls.motionBrush.areas.map((a) =>
        `${a.desc ?? 'area'}: vector ${typeof a.vector === 'string' ? a.vector : a.vector.label ?? 'motion'} @ ${Math.round(a.intensity * 100)}% intensity`,
      ).join('; ')
    : 'none (global camera motion only)';

  const ingredients = controls.brandKitLock.enabled
    ? `Ingredients/Elements lock: ${controls.brandKitLock.kitName ?? 'brand kit'} @ ${controls.brandKitLock.lockStrength}% — preserve character sheets, props, UI chrome across shots.`
    : `Reference adherence: ${controls.refConsistencyStrength}% — lock ${project.name} UI, accent ${project.colors}, typography.`;

  const audioBlock = controls.musicSyncLevel !== 'none'
    ? `Audio cues (${controls.musicSyncLevel} sync)${controls.musicSync?.bpm ? ` @ ${controls.musicSync.bpm} BPM` : ''}: ambient + SFX + ${controls.lipSyncStrength && controls.lipSyncStrength > 0 ? `dialogue lip-sync @ ${controls.lipSyncStrength}%` : 'optional VO'}. Beat-match transitions at cue times.`
    : 'Audio: minimal — UI motion carries rhythm.';

  const firstLast = controls.firstLastFrameRefs.start || controls.firstLastFrameRefs.end
    ? `Frames to Video: START anchor ${controls.firstLastFrameRefs.start ? 'LOCKED' : 'generated'} → END anchor ${controls.firstLastFrameRefs.end ? 'LOCKED' : 'generated'} — seamless continuity.`
    : '';

  const variants = controls.variantCount > 1
    ? `Generate ${controls.variantCount} variant directions (${controls.variantStrategy}) for critic selection.`
    : '';

  const director = controls.directorModeEnabled && controls.directorModePlainLang
    ? `AI Co-Director brief: "${controls.directorModePlainLang}"`
    : '';

  return `
## PREMIUM CONTROL SPEC (MCSLA + Constraint Sandwich)

MCSLA:
- Mood: ${controls.moodTone} | Pace: ${controls.pace} | Genre: ${controls.genre ?? 'SaaS commercial'}
- Camera: ${controls.cameraStyle} named move, ${controls.motionIntensity} intensity
- Subject Anchor: ${project.name} — ${profile.uiFocus} (hero: ${profile.kineticHook})
- Lighting: ${controls.lightingHints ?? 'soft key + rim, studio gradient'} | Lens: ${controls.lensOptics ?? '50mm standard'}
- Action + Audio: ${profile.motionHints}. ${audioBlock}

CONSTRAINT SANDWICH (every shot):
1. Subject Anchor — ${project.name} UI/brand at ${controls.refConsistencyStrength}% fidelity. ${ingredients}
2. Shot + Action — ${controls.cameraStyle} camera, motion brush areas: ${brushDesc}. Physics: ${controls.physicsIntensity} weight/momentum.
3. Constraints — ${firstLast} Brand ${controls.brandIntensity}, text ${controls.textAnimationStyle}, end card ${controls.endCardCTAStyle}. Negatives: no brand drift, no extra limbs, no morphing UI text, maintain momentum continuity.

FORMAT: ${controls.lengthSec}s @ ${controls.aspectRatio} (${dims.width}x${dims.height})
${controls.heroFrameFirst ? 'HERO FRAME FIRST: lock lighting/mood/lens on still before animating.' : ''}
${director}
${variants}
${controls.nodeGraph.enabled ? `Node graph pipeline: ${controls.nodeGraph.templateName ?? 'custom'} (${controls.nodeGraph.nodes.length} nodes)` : ''}
`.trim();
}

export function buildBrandContext(project: BrandProject, controls?: VideoControls): string {
  const profile = getBrandVideoProfile(project);
  const base = [
    `BRAND: ${project.name}`,
    `ACCENT COLOR: ${project.colors}`,
    `TONE: ${project.tone}`,
    `UI ELEMENTS: ${project.uiElements}`,
    `PRODUCT: ${PROJECT_DESCRIPTIONS[project.name] ?? project.name}`,
    `TAGLINE: ${profile.tagline}`,
    `VISUAL STYLE: ${profile.visualStyle}`,
    `MOTION LANGUAGE: ${profile.motionHints}`,
  ].join('\n');

  if (!controls) return base;
  return `${base}\n\n${buildPremiumPatternsBlock(project, controls)}`;
}

export function buildPlanningPrompt(
  project: BrandProject,
  goal: string,
  options: {
    maximizeLocal: boolean;
    templateId?: TemplateId | null;
    durationSec?: number;
    localBias: string;
    controls?: VideoControls;
  },
): string {
  const controls = options.controls ?? DEFAULT_VIDEO_CONTROLS;
  const profile = getBrandVideoProfile(project);
  const duration = options.durationSec ?? controls.lengthSec;
  const dims = getCanvasDimensions(controls.aspectRatio, controls.customAspect);
  const templateNote = options.templateId
    ? `Use the "${getTemplateLabel(options.templateId)}" narrative structure scaled to ${duration}s.`
    : `Use a premium ${duration}s product explainer structure.`;

  const premiumBlock = buildPremiumPatternsBlock(project, controls);

  return `${options.localBias}

You are an award-winning SaaS motion-design director. Create a ${duration}-second cinematic marketing video production plan for ${project.name}.

USER GOAL: ${goal}
${templateNote}

BRAND PROFILE:
- Hook (spoken): "${profile.hookLine}"
- Pain point: ${profile.painPoint}
- Kinetic title text: "${profile.kineticHook}"
- Features to highlight: ${profile.featureLabels.join(' → ')}
- Hero metrics: ${profile.metricLabels.join(', ')}
- Testimonial: "${profile.quote.text}" — ${profile.quote.author}
- CTA button: "${profile.cta}"
- UI focus: ${profile.uiFocus}
- Visual style: ${profile.visualStyle}

${premiumBlock}

OUTPUT FORMAT (use these exact section headers):

## HOOK (0–${Math.min(6, Math.floor(duration * 0.2))}s)
[LOCAL] Kinetic typography (${controls.textAnimationStyle}) + pain-point line. One punchy spoken hook sentence.

## SCRIPT (${duration}s total)
Write second-by-second narration with timestamps (e.g. 0:00–0:06). ${controls.pace} pacing, ${controls.moodTone} tone. Include micro-pauses for UI beats and ${controls.musicSyncLevel} music sync cues.

## STORYBOARD
Number each beat. For each: timestamp, [LOCAL] or [CLOUD], shot description, on-screen text, UI motion (specify motion brush areas if any), named camera move (${controls.cameraStyle}), transition. Apply Constraint Sandwich per shot.

## KEYFRAME PROMPTS
Exactly 5 numbered prompts (1. 2. 3. 4. 5.) for image generation. Each 80–140 words. Include:
- Brand accent color ${project.colors} in UI chrome and highlights
- ${controls.aspectRatio} composition (${dims.width}x${dims.height}), shallow depth of field where appropriate
- Crisp readable SaaS UI (not blurry mockups)
- Lighting: ${controls.lightingHints ?? 'soft key + rim'} | Lens: ${controls.lensOptics ?? 'standard'}
- Ref strength ${controls.refConsistencyStrength}% — lock UI elements
- Motion hint for Hyperframes (${controls.cameraStyle}, ${controls.motionIntensity})
- ${controls.firstLastFrameRefs.start || controls.firstLastFrameRefs.end ? 'First/last frame anchoring for continuity' : 'Scene role tag'}
- Scene role: HOOK / DASHBOARD REVEAL / FEATURE / PROOF / CTA

## HYPERFRAMES SCENES
List timed scene blocks for local canvas render (${duration}s total): kinetic, sidebar, card, progress, metric, bars, quote, logo, cta, keyframe, endcard.
Include start/end ms (scaled for ${duration}s), scene type, label/text, motion brush area refs, and which keyframe index (0–4) to weave in.
Specify ${controls.endCardCTAStyle} end card and ${controls.textAnimationStyle} text animations.

## CTA CLOSE
Final 3 seconds: ${controls.endCardCTAStyle} style — logo lockup + "${profile.cta}" + "${profile.tagline}"

## PREMIUM GATES CHECKLIST
Explicitly confirm: motion brush areas defined, first/last frames anchored, ref strength ${controls.refConsistencyStrength}%, physics ${controls.physicsIntensity}, audio sync ${controls.musicSyncLevel}, variant count ${controls.variantCount}.

Rules:
- Prioritize high-production-value LOCAL Hyperframes sequences (dashboard UI, metrics, kinetic type, quotes).
- Every keyframe must be usable as a motion-graphic panel — not generic stock photo.
- Brand consistency: ${project.name} name visible in UI chrome where appropriate.
- Avoid vague adjectives; be specific about layout, colors, motion brush vectors, and camera presets.`;
}

export function assessPlanQuality(plan: string, controls?: VideoControls): PlanQualityResult {
  const issues: string[] = [];
  const lower = plan.toLowerCase();
  const c = controls ?? DEFAULT_VIDEO_CONTROLS;

  if (plan.length < 800) issues.push('Plan too short — needs richer detail');
  if (!/##\s*hook|hook\s*\(/i.test(plan) && !/0[–-]\d+s.*hook/i.test(lower)) issues.push('Missing HOOK section');
  if (!/##\s*script|script\s*\(/i.test(plan) && !/\d:\d{2}/.test(plan)) issues.push('Missing timed SCRIPT');
  if (!/##\s*storyboard|storyboard/i.test(plan)) issues.push('Missing STORYBOARD beats');
  if (!/##\s*keyframe|keyframe prompt/i.test(plan) && !(/\n\s*1\.\s/.test(plan) && plan.split(/\n\s*\d+\.\s/).length < 4)) {
    issues.push('Missing KEYFRAME PROMPTS (need 5 numbered)');
  }
  if (!/##\s*hyperframes|hyperframes scene/i.test(plan)) issues.push('Missing HYPERFRAMES SCENES');
  if (!/cta|call.to.action|start free|try|launch/i.test(lower)) issues.push('Missing CTA');
  if (!/\[local\]|\[cloud\]/i.test(plan)) issues.push('Missing [LOCAL]/[CLOUD] shot markers');

  if (c.motionBrush.areas.length > 0 && !/motion brush|brush area|localized motion/i.test(lower)) {
    issues.push('Motion brush areas not reflected in plan');
  }
  if ((c.firstLastFrameRefs.start || c.firstLastFrameRefs.end) && !/first.*frame|last.*frame|frames to video|anchor/i.test(lower)) {
    issues.push('First/last frame anchoring not specified');
  }
  if (c.refConsistencyStrength >= 80 && !/ref|ingredients|elements|consistency|lock/i.test(lower)) {
    issues.push('Reference/Elements lock strength not addressed');
  }
  if (c.musicSyncLevel !== 'none' && !/audio|music|beat|sync|bpm/i.test(lower)) {
    issues.push('Music/audio sync cues missing');
  }
  if (c.directorModeEnabled && c.directorModePlainLang && !c.directorModePlainLang.split(' ').slice(0, 3).every(w => lower.includes(w.toLowerCase().slice(0, 4)))) {
    if (!/director|co-director/i.test(lower)) issues.push('Director mode brief not incorporated');
  }
  if (!/mcsla|constraint sandwich|subject anchor/i.test(lower)) issues.push('Missing MCSLA / Constraint Sandwich patterns');
  if (!String(c.lengthSec).includes(plan.match(/\d+s/)?.[0]?.replace('s', '') ?? 'x') && !new RegExp(`${c.lengthSec}\\s*s`, 'i').test(plan)) {
    if (!/\d+\s*s\s*total/i.test(plan)) issues.push(`Duration should reference ${c.lengthSec}s`);
  }

  const score = Math.max(0, 100 - issues.length * 10);
  return { pass: issues.length <= 3 && plan.length >= 600, score, issues };
}

export function assessControlsGates(plan: string, controls: VideoControls): ControlGateResult[] {
  const lower = plan.toLowerCase();
  const gates: ControlGateResult[] = [];

  const check = (category: string, tests: Array<{ label: string; pass: boolean }>) => {
    const failed = tests.filter((t) => !t.pass).map((t) => t.label);
    gates.push({
      category,
      pass: failed.length === 0,
      score: Math.round(((tests.length - failed.length) / tests.length) * 100),
      issues: failed,
    });
  };

  check('Motion Brush', [
    { label: 'Brush areas in plan', pass: controls.motionBrush.areas.length === 0 || /motion brush|brush area/i.test(lower) },
    { label: 'Vectors described', pass: controls.motionBrush.areas.length === 0 || controls.motionBrush.areas.every((a) => lower.includes((a.desc ?? 'area').slice(0, 6).toLowerCase()) || /vector|upward|scale/i.test(lower)) },
  ]);

  check('First/Last Frame', [
    { label: 'Anchors specified', pass: !(controls.firstLastFrameRefs.start || controls.firstLastFrameRefs.end) || /first|last|anchor|frames to video/i.test(lower) },
  ]);

  check('Ref Lock', [
    { label: `Ref strength ${controls.refConsistencyStrength}%`, pass: /ref|consistency|ingredients|elements|lock/i.test(lower) },
    { label: 'Brand kit', pass: !controls.brandKitLock.enabled || /brand kit|elements/i.test(lower) },
  ]);

  check('Audio/Beat', [
    { label: `Music sync ${controls.musicSyncLevel}`, pass: controls.musicSyncLevel === 'none' || /audio|music|beat|sync/i.test(lower) },
    { label: 'BPM/cues', pass: !controls.musicSync?.bpm || /bpm|beat|cue/i.test(lower) },
  ]);

  check('Physics/Lens', [
    { label: `Physics ${controls.physicsIntensity}`, pass: /physics|momentum|weight/i.test(lower) },
    { label: 'Lens optics', pass: !controls.lensOptics || /lens|dof|bokeh|mm/i.test(lower) },
  ]);

  check('Variants', [
    { label: `Variant count ${controls.variantCount}`, pass: controls.variantCount <= 1 || /variant/i.test(lower) },
  ]);

  return gates;
}

export function buildRefinementPrompt(
  project: BrandProject,
  draft: string,
  issues: string[],
  controls?: VideoControls,
): string {
  const premium = controls ? buildPremiumPatternsBlock(project, controls) : '';
  return `Refine this video production plan for ${project.name}. Fix these quality issues: ${issues.join('; ')}.

${premium ? `${premium}\n\n` : ''}Keep all good content. Expand weak sections. Ensure exactly 5 detailed KEYFRAME PROMPTS, complete HYPERFRAMES SCENES timeline, MCSLA + Constraint Sandwich per shot, and all premium control gates pass.

DRAFT PLAN:
${draft}

Return the complete refined plan with all section headers intact.`;
}

export function buildImagePromptsPrompt(
  project: BrandProject,
  script: string,
  imageModel: string,
  controls?: VideoControls,
): string {
  const c = controls ?? DEFAULT_VIDEO_CONTROLS;
  const profile = getBrandVideoProfile(project);
  const dims = getCanvasDimensions(c.aspectRatio, c.customAspect);
  const premium = buildPremiumPatternsBlock(project, c);

  return `You are a senior marketing art director creating keyframe prompts for ${imageModel}.

BRAND: ${project.name} | ACCENT: ${project.colors} | TONE: ${project.tone}
UI FOCUS: ${profile.uiFocus}
VISUAL STYLE: ${profile.visualStyle}

${premium}

From this production plan, output EXACTLY 5 numbered keyframe prompts (format: "1. " then "2. " etc).
Each prompt must be 90–150 words and include ALL of:
- Subject Anchor: specific SaaS UI screen for ${project.name} at ${c.refConsistencyStrength}% fidelity
- Composition: ${c.aspectRatio} (${dims.width}x${dims.height}), rule-of-thirds
- Constraint Sandwich: shot + action + constraints (no drift, no morph)
- Brand colors: accent ${project.colors} on buttons, progress rings, highlights
- Lighting: ${c.lightingHints ?? 'soft studio key + rim'} | Lens: ${c.lensOptics ?? 'standard'}
- UI clarity: sharp readable text labels, realistic dashboard chrome
- Motion hint: ${c.cameraStyle} camera, ${c.motionIntensity} — what Hyperframes animates
- ${c.heroFrameFirst ? 'HERO FRAME: perfect still before motion' : 'Scene role tag'}: [HOOK] [REVEAL] [FEATURE] [PROOF] or [CTA]
- Physics: ${c.physicsIntensity} weight on interactive elements

Do NOT output anything except the 5 numbered prompts.

PRODUCTION PLAN:
${script}`;
}

export function buildKeyframeImagePrompt(
  project: BrandProject,
  rawPrompt: string,
  sceneIndex: number,
  controls?: VideoControls,
): string {
  const c = controls ?? DEFAULT_VIDEO_CONTROLS;
  const profile = getBrandVideoProfile(project);
  const dims = getCanvasDimensions(c.aspectRatio, c.customAspect);
  const roles = ['HOOK hero frame', 'dashboard reveal', 'feature highlight', 'social proof / metrics', 'CTA end card'];
  const aspectLabel = c.aspectRatio === '16:9' ? '16:9' : c.aspectRatio;

  return `Create a single ultra-high-quality ${aspectLabel} (${dims.width}x${dims.height}) marketing keyframe image for ${project.name}.

SCENE: ${roles[sceneIndex] ?? `scene ${sceneIndex + 1}`}
BRAND ACCENT: ${project.colors} — use on primary buttons, progress indicators, and highlights
REF STRENGTH: ${c.refConsistencyStrength}% — lock UI chrome, typography, brand elements
VISUAL STYLE: ${profile.visualStyle}
LENS: ${c.lensOptics ?? '50mm standard'} | MOOD: ${c.moodTone}
REQUIREMENTS:
- Photoreal or premium 3D-rendered SaaS UI mockup — NOT illustration unless brand-appropriate
- Crystal-sharp UI text and icons; readable at target resolution
- Cinematic lighting: ${c.lightingHints ?? 'soft key from upper-left'}, subtle gradient backdrop
- Leave 15% negative space for ${c.textAnimationStyle} motion-graphics overlay
- ${c.firstLastFrameRefs.start && sceneIndex === 0 ? 'START FRAME ANCHOR — lock composition for continuity' : ''}
- ${c.firstLastFrameRefs.end && sceneIndex === 4 ? 'END FRAME ANCHOR — lock final composition' : ''}
- No watermarks, no generic stock-photo people unless scene requires it
- Motion-ready: ${c.cameraStyle} composition supports ${c.motionIntensity} animation
- Negatives: no brand drift, no blurry UI text, no extra limbs

PROMPT DETAIL:
${rawPrompt}`;
}

export function buildPreRenderRefinementPrompt(
  project: BrandProject,
  script: string,
  keyframeCount: number,
  imagesGenerated: number,
  controls?: VideoControls,
): string {
  const c = controls ?? DEFAULT_VIDEO_CONTROLS;
  const gates = assessControlsGates(script, c);
  const failedGates = gates.filter((g) => !g.pass).map((g) => `${g.category}: ${g.issues.join(', ')}`);

  return `Quick quality check before final render for ${project.name}.

CONTROLS: ${c.lengthSec}s ${c.aspectRatio} | camera ${c.cameraStyle} | motion ${c.motionIntensity} | ref ${c.refConsistencyStrength}%
PREMIUM GATES: ${failedGates.length ? failedGates.join('; ') : 'all passing'}

SCRIPT (excerpt): ${script.slice(0, 1200)}
KEYFRAMES: ${keyframeCount} prompts, ${imagesGenerated} images generated.

Reply with ONLY a JSON object (no markdown):
{"approved":true|false,"adjustments":"one sentence if not approved","gateFailures":["category if any"]}

Approve if: hook strong, CTA clear, keyframes support story, Hyperframes scenes specific, all premium controls reflected.
Reject if: generic copy, missing brand, weak hook, controls/gates failed, or keyframes don't match UI-focused SaaS explainer.`;
}

export function buildVariantPrompt(
  project: BrandProject,
  basePlan: string,
  controls: VideoControls,
  variantIndex: number,
): string {
  const strategyNote = controls.variantStrategy === 'diversity'
    ? 'Create a meaningfully different creative direction (camera, pacing, hook angle) while keeping brand lock.'
    : controls.variantStrategy === 'lock-max'
      ? 'Maximize reference/Elements consistency — minimal creative drift.'
      : 'Optimize for critic score — strongest hook, clearest CTA, best motion brush fidelity.';

  return `Generate VARIANT ${variantIndex + 1} of ${controls.variantCount} for ${project.name}.
Strategy: ${controls.variantStrategy} — ${strategyNote}

${buildPremiumPatternsBlock(project, controls)}

Base plan to diverge from:
${basePlan.slice(0, 2000)}

Output a complete refined plan with all standard section headers. Variant ${variantIndex + 1} must be distinct but on-brand.`;
}

export function extractHyperframesDesc(
  plan: string,
  project: BrandProject,
  templateId?: TemplateId | null,
  controls?: VideoControls,
): string {
  const match = plan.match(/##\s*HYPERFRAMES[^\n]*\n([\s\S]*?)(?=\n##\s|$)/i);
  if (match?.[1]?.trim()) {
    const excerpt = match[1].trim().slice(0, 2000);
    if (controls) {
      return `${excerpt}\n[Controls: ${controls.lengthSec}s ${controls.aspectRatio}, camera ${controls.cameraStyle}, motion ${controls.motionIntensity}, brush areas: ${controls.motionBrush.areas.length}]`;
    }
    return excerpt;
  }

  const profile = getBrandVideoProfile(project);
  const tpl = templateId ? getTemplateLabel(templateId) : 'Custom explainer';
  const duration = controls?.lengthSec ?? 30;
  return `${tpl} for ${project.name} (${duration}s): ${profile.kineticHook} opener → ${profile.featureLabels.join(' → ')} → metric proof → "${profile.quote.text}" → ${profile.cta}. Accent ${project.colors}. ${profile.motionHints}${controls ? `. Camera: ${controls.cameraStyle}, mood: ${controls.moodTone}` : ''}`;
}

export function extractKeyframeSection(plan: string): string {
  const match = plan.match(/##\s*KEYFRAME[^\n]*\n([\s\S]*?)(?=\n##\s|$)/i);
  if (match?.[1]?.trim()) return match[1].trim();
  return plan;
}

export function buildEnrichedCloudVideoPrompt(
  project: BrandProject,
  goal: string,
  script: string,
  controls: VideoControls,
): string {
  const base = `${project.name} SaaS marketing video: ${goal}. ${script.slice(0, 400)}`;
  return injectControlsToPrompt(base, controls);
}