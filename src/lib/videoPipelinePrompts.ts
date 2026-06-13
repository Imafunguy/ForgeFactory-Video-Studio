/**
 * ForgeFactory v2 — Video pipeline prompt engineering
 * Cinematic SaaS marketing plans, keyframe prompts, quality gates, and brand profiles.
 */

import type { Project } from './storage';
import type { TemplateId } from './videoRenderer';
import { getTemplateLabel } from './localVideoTemplates';
import { PROJECT_DESCRIPTIONS } from './constants';

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

export function buildBrandContext(project: BrandProject): string {
  const profile = getBrandVideoProfile(project);
  return [
    `BRAND: ${project.name}`,
    `ACCENT COLOR: ${project.colors}`,
    `TONE: ${project.tone}`,
    `UI ELEMENTS: ${project.uiElements}`,
    `PRODUCT: ${PROJECT_DESCRIPTIONS[project.name] ?? project.name}`,
    `TAGLINE: ${profile.tagline}`,
    `VISUAL STYLE: ${profile.visualStyle}`,
    `MOTION LANGUAGE: ${profile.motionHints}`,
  ].join('\n');
}

export function buildPlanningPrompt(
  project: BrandProject,
  goal: string,
  options: {
    maximizeLocal: boolean;
    templateId?: TemplateId | null;
    durationSec?: number;
    localBias: string;
  },
): string {
  const profile = getBrandVideoProfile(project);
  const duration = options.durationSec ?? (options.templateId === 'how-it-works-45s' ? 45 : 30);
  const templateNote = options.templateId
    ? `Use the "${getTemplateLabel(options.templateId)}" narrative structure.`
    : 'Use a premium 30s product explainer structure.';

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

OUTPUT FORMAT (use these exact section headers):

## HOOK (0–${Math.min(6, Math.floor(duration * 0.2))}s)
[LOCAL] Kinetic typography + pain-point line. One punchy spoken hook sentence.

## SCRIPT (${duration}s total)
Write second-by-second narration with timestamps (e.g. 0:00–0:06). Conversational, premium, on-brand. Include micro-pauses for UI beats.

## STORYBOARD
Number each beat. For each: timestamp, [LOCAL] or [CLOUD], shot description, on-screen text, UI motion (e.g. "progress ring fills 0→78%", "card lifts", "poll bar animates"), camera move, transition.

## KEYFRAME PROMPTS
Exactly 5 numbered prompts (1. 2. 3. 4. 5.) for image generation. Each 80–140 words. Include:
- Brand accent color ${project.colors} in UI chrome and highlights
- 16:9 cinematic composition, shallow depth of field where appropriate
- Crisp readable SaaS UI (not blurry mockups)
- Lighting direction (soft key light, rim light, studio gradient backdrop)
- Motion hint for Hyperframes (zoom-in, pan-left, parallax, UI element to animate)
- Scene role: HOOK / DASHBOARD REVEAL / FEATURE / PROOF / CTA

## HYPERFRAMES SCENES
List timed scene blocks for local canvas render: kinetic, sidebar, card, progress, metric, bars, quote, logo, cta, keyframe.
Include start/end ms, scene type, label/text, and which keyframe index (0–4) to weave in.

## CTA CLOSE
Final 3 seconds: logo lockup + "${profile.cta}" + "${profile.tagline}"

Rules:
- Prioritize high-production-value LOCAL Hyperframes sequences (dashboard UI, metrics, kinetic type, quotes).
- Every keyframe must be usable as a motion-graphic panel — not generic stock photo.
- Brand consistency: ${project.name} name visible in UI chrome where appropriate.
- Avoid vague adjectives; be specific about layout, colors, and motion.`;
}

export function assessPlanQuality(plan: string): PlanQualityResult {
  const issues: string[] = [];
  const lower = plan.toLowerCase();

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

  const score = Math.max(0, 100 - issues.length * 14);
  return { pass: issues.length <= 2 && plan.length >= 600, score, issues };
}

export function buildRefinementPrompt(project: BrandProject, draft: string, issues: string[]): string {
  return `Refine this video production plan for ${project.name}. Fix these quality issues: ${issues.join('; ')}.

Keep all good content. Expand weak sections. Ensure exactly 5 detailed KEYFRAME PROMPTS and a complete HYPERFRAMES SCENES timeline.

DRAFT PLAN:
${draft}

Return the complete refined plan with all section headers intact.`;
}

export function buildImagePromptsPrompt(
  project: BrandProject,
  script: string,
  imageModel: string,
): string {
  const profile = getBrandVideoProfile(project);
  return `You are a senior marketing art director creating keyframe prompts for ${imageModel}.

BRAND: ${project.name} | ACCENT: ${project.colors} | TONE: ${project.tone}
UI FOCUS: ${profile.uiFocus}
VISUAL STYLE: ${profile.visualStyle}

From this production plan, output EXACTLY 5 numbered keyframe prompts (format: "1. " then "2. " etc).
Each prompt must be 90–150 words and include ALL of:
- Subject: specific SaaS UI screen or marketing moment for ${project.name}
- Composition: 16:9, rule-of-thirds, negative space for kinetic text overlay
- Brand colors: accent ${project.colors} on buttons, progress rings, highlights
- Lighting: soft studio key + subtle rim, no muddy shadows
- UI clarity: sharp readable text labels, realistic dashboard chrome (not abstract blobs)
- Motion hint: what Hyperframes should animate (ring fill, card slide, poll bar, counter tick)
- Scene role tag at end: [HOOK] [REVEAL] [FEATURE] [PROOF] or [CTA]

Do NOT output anything except the 5 numbered prompts.

PRODUCTION PLAN:
${script}`;
}

export function buildKeyframeImagePrompt(
  project: BrandProject,
  rawPrompt: string,
  sceneIndex: number,
): string {
  const profile = getBrandVideoProfile(project);
  const roles = ['HOOK hero frame', 'dashboard reveal', 'feature highlight', 'social proof / metrics', 'CTA end card'];
  return `Create a single ultra-high-quality 16:9 marketing keyframe image for ${project.name}.

SCENE: ${roles[sceneIndex] ?? `scene ${sceneIndex + 1}`}
BRAND ACCENT: ${project.colors} — use on primary buttons, progress indicators, and highlights
VISUAL STYLE: ${profile.visualStyle}
REQUIREMENTS:
- Photoreal or premium 3D-rendered SaaS UI mockup — NOT illustration unless brand-appropriate
- Crystal-sharp UI text and icons; readable at 1080p
- Cinematic lighting: soft key from upper-left, subtle gradient backdrop (#0a0f1a to #1a2332)
- Leave 15% negative space for motion-graphics text overlay
- No watermarks, no generic stock-photo people unless scene requires it
- Motion-ready: composition supports slow zoom-in or pan

PROMPT DETAIL:
${rawPrompt}`;
}

export function buildPreRenderRefinementPrompt(
  project: BrandProject,
  script: string,
  keyframeCount: number,
  imagesGenerated: number,
): string {
  return `Quick quality check before final render for ${project.name}.

SCRIPT (excerpt): ${script.slice(0, 1200)}
KEYFRAMES: ${keyframeCount} prompts, ${imagesGenerated} images generated.

Reply with ONLY a JSON object (no markdown):
{"approved":true|false,"adjustments":"one sentence if not approved"}

Approve if: hook is strong, CTA clear, keyframes support the story, Hyperframes scenes are specific.
Reject if: generic copy, missing brand, weak hook, or keyframes don't match UI-focused SaaS explainer.`;
}

export function extractHyperframesDesc(plan: string, project: BrandProject, templateId?: TemplateId | null): string {
  const match = plan.match(/##\s*HYPERFRAMES[^\n]*\n([\s\S]*?)(?=\n##\s|$)/i);
  if (match?.[1]?.trim()) return match[1].trim().slice(0, 2000);

  const profile = getBrandVideoProfile(project);
  const tpl = templateId ? getTemplateLabel(templateId) : 'Custom explainer';
  return `${tpl} for ${project.name}: ${profile.kineticHook} opener → ${profile.featureLabels.join(' → ')} → metric proof → "${profile.quote.text}" → ${profile.cta}. Accent ${project.colors}. ${profile.motionHints}`;
}

export function extractKeyframeSection(plan: string): string {
  const match = plan.match(/##\s*KEYFRAME[^\n]*\n([\s\S]*?)(?=\n##\s|$)/i);
  if (match?.[1]?.trim()) return match[1].trim();
  return plan;
}