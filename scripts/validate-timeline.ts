/**
 * Validates scene timeline spans full control duration (30s ClubCensus / Higgsfield test).
 * Usage: npx tsx scripts/validate-timeline.ts
 */

import { CLUBCENSUS_BRAND_KIT } from '../src/lib/brandKits';
import { loadPremiumPreset } from '../src/lib/videoControls';
import { getBrandVideoProfile } from '../src/lib/videoPipelinePrompts';
import { buildRenderScenes } from '../src/lib/videoRenderer';

const preset = loadPremiumPreset('higgsfield-cinematic');
const controls = {
  ...preset.controls,
  lengthSec: 30,
  lengthPreset: 30 as const,
  brandPalette: CLUBCENSUS_BRAND_KIT.palette,
  fontFamily: 'Inter',
};

const profile = getBrandVideoProfile({
  name: 'ClubCensus',
  colors: CLUBCENSUS_BRAND_KIT.primaryColor,
  uiElements: CLUBCENSUS_BRAND_KIT.uiElements,
  tone: CLUBCENSUS_BRAND_KIT.tone,
  brandPalette: CLUBCENSUS_BRAND_KIT.paletteArray,
  defaultFont: 'Inter',
  brandVoice: CLUBCENSUS_BRAND_KIT.brandVoice,
  personality: CLUBCENSUS_BRAND_KIT.personality,
  values: CLUBCENSUS_BRAND_KIT.values,
  logoDescription: CLUBCENSUS_BRAND_KIT.logoDescription,
});

const brand = {
  name: 'ClubCensus',
  accent: CLUBCENSUS_BRAND_KIT.palette.accent,
  tone: CLUBCENSUS_BRAND_KIT.tone,
  kineticHook: profile.kineticHook,
  featureLabels: profile.featureLabels,
  metricLabels: profile.metricLabels,
  quote: profile.quote,
  cta: profile.cta,
  tagline: profile.tagline,
  brandPalette: CLUBCENSUS_BRAND_KIT.palette,
  fontFamily: 'Inter',
};

const durationMs = controls.lengthSec * 1000;
const scenes = buildRenderScenes(undefined, preset.goal, brand, controls, 5);
const maxEnd = Math.max(...scenes.map((s) => s.end));
const motionTypes = new Set(scenes.map((s) => s.type));
const keyframeCount = scenes.filter((s) => s.type === 'keyframe').length;

const checks = [
  { label: 'Duration >= 29s', pass: maxEnd >= durationMs - 1000, value: `${(maxEnd / 1000).toFixed(1)}s` },
  { label: 'Scene count >= 10', pass: scenes.length >= 10, value: String(scenes.length) },
  { label: 'Has kinetic', pass: motionTypes.has('kinetic'), value: motionTypes.has('kinetic') ? 'yes' : 'no' },
  { label: 'Has progress', pass: motionTypes.has('progress'), value: motionTypes.has('progress') ? 'yes' : 'no' },
  { label: 'Has card', pass: motionTypes.has('card'), value: motionTypes.has('card') ? 'yes' : 'no' },
  { label: 'Has metric', pass: motionTypes.has('metric'), value: motionTypes.has('metric') ? 'yes' : 'no' },
  { label: 'Keyframes woven', pass: keyframeCount >= 3, value: String(keyframeCount) },
  { label: 'Brand primary green', pass: controls.brandPalette?.primary === '#2F3D34', value: controls.brandPalette?.primary },
];

console.log('\n=== ClubCensus 30s Higgsfield Timeline Validation ===\n');
let allPass = true;
for (const c of checks) {
  const mark = c.pass ? 'PASS' : 'FAIL';
  if (!c.pass) allPass = false;
  console.log(`  [${mark}] ${c.label}: ${c.value}`);
}

console.log('\nScene breakdown:');
for (const t of ['kinetic', 'card', 'progress', 'metric', 'quote', 'cta', 'logo', 'keyframe', 'bg']) {
  const ofType = scenes.filter((s) => s.type === t);
  if (ofType.length) {
    const span = ofType.map((s) => `${(s.start / 1000).toFixed(1)}–${(s.end / 1000).toFixed(1)}s`).join(', ');
    console.log(`  ${t}: ${span}`);
  }
}

if (!allPass) {
  console.error('\nTimeline validation FAILED');
  process.exit(1);
}
console.log('\nTimeline validation PASSED');
process.exit(0);