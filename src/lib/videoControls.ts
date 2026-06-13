/**
 * ForgeFactory v2 — Ultimate VideoControls
 * Full parametric control surface for premium local + hybrid video generation.
 */

// ── Core enums / union types ──

export type LengthPreset = 5 | 10 | 15 | 30 | 45 | 60 | 'custom';

export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:5' | 'custom';

export type CameraStyle =
  | 'static'
  | 'cinematic-pan'
  | 'zoom'
  | 'dolly'
  | 'orbiting'
  | 'tracking'
  | 'crane'
  | 'handheld'
  | 'dynamic'
  | 'custom';

export type MotionIntensity = 'subtle' | 'medium' | 'high-energy';

export type MoodTone =
  | 'professional'
  | 'energetic'
  | 'warm'
  | 'futuristic'
  | 'minimalist'
  | 'premium';

export type Pace = 'slow-build' | 'fast-paced' | 'balanced';

export type BrandIntensity = 'subtle-accents' | 'strong-branding' | 'full-lockup';

export type TextAnimStyle = 'kinetic' | 'simple-fade' | 'bold-reveal' | 'glitch' | 'custom';

export type EndCardCTAStyle = 'minimal' | 'standard' | 'bold' | 'branded-slate';

export type MusicSyncLevel = 'none' | 'light' | 'medium' | 'strong';

export type VariantStrategy = 'best-critic' | 'diversity' | 'user-pick' | 'lock-max';

export type PhysicsIntensity = 'low' | 'medium' | 'high';

// ── Motion brush & refs ──

export interface MotionBrushMask {
  /** Normalized 0–1 rect */
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface MotionBrushVector {
  x: number;
  y: number;
  speed?: number;
  label?: string;
}

export interface MotionBrushArea {
  id?: string;
  desc?: string;
  mask?: MotionBrushMask;
  vector: string | MotionBrushVector;
  intensity: number;
}

export interface MotionBrushConfig {
  areas: MotionBrushArea[];
}

export interface FirstLastFrameRefs {
  start?: string;
  end?: string;
}

export interface MusicCue {
  timeSec: number;
  type: 'beat' | 'drop' | 'accent' | 'dialogue' | 'ambient';
  label?: string;
}

export interface MusicSyncConfig {
  bpm?: number;
  cues?: MusicCue[];
}

// ── Node graph stub (Canvas / Comfy-style) ──

export type NodeGraphNodeType =
  | 'prompt'
  | 'image'
  | 'video'
  | 'motion'
  | 'ref'
  | 'camera'
  | 'audio'
  | 'output';

export interface NodeGraphNode {
  id: string;
  type: NodeGraphNodeType;
  label: string;
  params?: Record<string, unknown>;
}

export interface NodeGraphConnection {
  from: string;
  to: string;
}

export interface NodeGraphConfig {
  enabled: boolean;
  nodes: NodeGraphNode[];
  connections: NodeGraphConnection[];
  templateName?: string;
}

// ── Brand kit & extend/stitch ──

export interface BrandKitLock {
  enabled: boolean;
  kitName?: string;
  characterRefs?: string[];
  propRefs?: string[];
  styleRef?: string;
  voiceRef?: string;
  lockStrength: number;
}

export interface InsertEditParams {
  object: string;
  timeSec: number;
}

export interface ExtendStitchParams {
  extendFromLastSec?: number;
  stitchTransitions?: boolean;
  insertEdit?: InsertEditParams;
  reframe?: boolean;
  relight?: boolean;
}

// ── Main controls interface ──

export interface VideoControls {
  lengthSec: number;
  lengthPreset: LengthPreset;
  aspectRatio: AspectRatio;
  customAspect?: { width: number; height: number };
  cameraStyle: CameraStyle;
  motionIntensity: MotionIntensity;
  moodTone: MoodTone;
  pace: Pace;
  brandIntensity: BrandIntensity;
  refConsistencyStrength: number;
  musicSyncLevel: MusicSyncLevel;
  musicAudioUrl?: string;
  musicSync?: MusicSyncConfig;
  textAnimationStyle: TextAnimStyle;
  endCardCTAStyle: EndCardCTAStyle;
  motionBrush: MotionBrushConfig;
  firstLastFrameRefs: FirstLastFrameRefs;
  directorModePlainLang?: string;
  directorModeEnabled?: boolean;
  variantCount: number;
  variantStrategy: VariantStrategy;
  nodeGraph: NodeGraphConfig;
  brandKitLock: BrandKitLock;
  physicsIntensity: PhysicsIntensity;
  lensOptics?: string;
  extendStitchParams: ExtendStitchParams;
  lipSyncStrength?: number;
  lightingHints?: string;
  genre?: string;
  customStyleText?: string;
  heroFrameFirst?: boolean;
}

export interface PremiumPresetBundle {
  id: string;
  label: string;
  feel: string;
  projectHint?: string;
  goal: string;
  controls: VideoControls;
}

export interface RendererControlParams {
  width: number;
  height: number;
  durationMs: number;
  fps: number;
  cameraMotion: string;
  motionScale: number;
  physicsWeight: number;
  moodOverlay: string;
  brandWeight: number;
  refStrength: number;
  textStyle: TextAnimStyle;
  endCardStyle: EndCardCTAStyle;
  musicSyncLevel: MusicSyncLevel;
  beatIntervalMs?: number;
}

// ── Defaults ──

export const LENGTH_PRESETS: LengthPreset[] = [5, 10, 15, 30, 45, 60, 'custom'];

export const ASPECT_RATIO_OPTIONS: AspectRatio[] = ['16:9', '9:16', '1:1', '4:5', 'custom'];

export const DEFAULT_VIDEO_CONTROLS: VideoControls = {
  lengthSec: 30,
  lengthPreset: 30,
  aspectRatio: '16:9',
  cameraStyle: 'cinematic-pan',
  motionIntensity: 'medium',
  moodTone: 'professional',
  pace: 'balanced',
  brandIntensity: 'strong-branding',
  refConsistencyStrength: 80,
  musicSyncLevel: 'medium',
  textAnimationStyle: 'kinetic',
  endCardCTAStyle: 'standard',
  motionBrush: { areas: [] },
  firstLastFrameRefs: {},
  directorModeEnabled: false,
  variantCount: 1,
  variantStrategy: 'best-critic',
  nodeGraph: { enabled: false, nodes: [], connections: [] },
  brandKitLock: { enabled: false, lockStrength: 70 },
  physicsIntensity: 'medium',
  lensOptics: '50mm standard',
  extendStitchParams: {},
  lipSyncStrength: 0,
  heroFrameFirst: false,
};

// ── Canvas dimensions ──

const BASE_LANDSCAPE = { width: 1920, height: 1080 };

export function getCanvasDimensions(
  aspectRatio: AspectRatio,
  customAspect?: { width: number; height: number },
): { width: number; height: number; previewLabel: string } {
  if (aspectRatio === 'custom' && customAspect) {
    const maxEdge = 1920;
    const scale = maxEdge / Math.max(customAspect.width, customAspect.height);
    return {
      width: Math.round(customAspect.width * scale),
      height: Math.round(customAspect.height * scale),
      previewLabel: `${customAspect.width}:${customAspect.height}`,
    };
  }

  switch (aspectRatio) {
    case '9:16':
      return { width: 1080, height: 1920, previewLabel: '9:16 vertical' };
    case '1:1':
      return { width: 1080, height: 1080, previewLabel: '1:1 square' };
    case '4:5':
      return { width: 1080, height: 1350, previewLabel: '4:5 social' };
    case '16:9':
    default:
      return { ...BASE_LANDSCAPE, previewLabel: '16:9 landscape' };
  }
}

export function getAspectPreviewStyle(aspectRatio: AspectRatio): { width: string; height: string } {
  const dims = getCanvasDimensions(aspectRatio);
  const ratio = dims.width / dims.height;
  if (ratio >= 1) {
    return { width: '100%', height: `${Math.round(100 / ratio)}%` };
  }
  return { width: `${Math.round(100 * ratio)}%`, height: '100%' };
}

// ── Duration scaling ──

export function resolveLengthMs(controls: VideoControls): number {
  return Math.max(1000, Math.min(120000, controls.lengthSec * 1000));
}

export interface ScaledSceneTiming {
  start: number;
  end: number;
  type?: string;
  [key: string]: unknown;
}

export function scaleTimingsForLength(
  scenes: ScaledSceneTiming[],
  lengthSec: number,
  pace: Pace = 'balanced',
): ScaledSceneTiming[] {
  const durationMs = lengthSec * 1000;
  const baselineSec = 30;
  let factor = lengthSec / baselineSec;

  if (lengthSec <= 10) {
    const paceBoost = pace === 'fast-paced' ? 0.85 : pace === 'slow-build' ? 1.15 : 1;
    factor *= (lengthSec / 10) * paceBoost;
  }

  const scaled = scenes.map((s) => ({
    ...s,
    start: Math.round(s.start * factor),
    end: Math.round(s.end * factor),
  }));

  if (lengthSec <= 10) {
    const essential = scaled.filter(
      (s) =>
        s.end > s.start &&
        s.start < durationMs &&
        ['bg', 'kinetic', 'bars', 'metric', 'cta', 'logo', 'keyframe', 'progress', 'card'].includes(
          String(s.type),
        ),
    );
    return essential.map((s) => ({
      ...s,
      end: Math.min(s.end as number, durationMs),
    }));
  }

  return scaled.filter((s) => s.end > s.start && s.start < durationMs);
}

// ── Motion brush vector parsing ──

export function parseMotionVector(vector: string | MotionBrushVector): MotionBrushVector {
  if (typeof vector !== 'string') return vector;

  const lower = vector.toLowerCase();
  const speed = lower.includes('fast') ? 1.6 : lower.includes('slow') ? 0.6 : 1;
  if (lower.includes('up')) return { x: 0, y: -1, speed, label: vector };
  if (lower.includes('down')) return { x: 0, y: 1, speed, label: vector };
  if (lower.includes('left')) return { x: -1, y: 0, speed, label: vector };
  if (lower.includes('right')) return { x: 1, y: 0, speed, label: vector };
  if (lower.includes('scale')) return { x: 0, y: 0, speed: speed * 0.8, label: 'scale' };
  return { x: 0, y: -0.5, speed, label: vector };
}

// ── Prompt injection ──

export function injectControlsToPrompt(basePrompt: string, controls: VideoControls): string {
  const dims = getCanvasDimensions(controls.aspectRatio, controls.customAspect);
  const brushDesc =
    controls.motionBrush.areas.length > 0
      ? controls.motionBrush.areas
          .map((a) => `${a.desc ?? 'area'}: ${typeof a.vector === 'string' ? a.vector : a.vector.label ?? 'motion'} @ ${Math.round(a.intensity * 100)}%`)
          .join('; ')
      : 'none';

  const sections = [
    `LENGTH: ${controls.lengthSec}s (${controls.lengthPreset})`,
    `ASPECT: ${controls.aspectRatio} (${dims.width}x${dims.height})`,
    `CAMERA: ${controls.cameraStyle} | MOTION: ${controls.motionIntensity}`,
    `MOOD: ${controls.moodTone} | PACE: ${controls.pace}`,
    `BRAND: ${controls.brandIntensity} @ ${controls.refConsistencyStrength}% ref strength`,
    `TEXT: ${controls.textAnimationStyle} | END CARD: ${controls.endCardCTAStyle}`,
    `MUSIC SYNC: ${controls.musicSyncLevel}${controls.musicSync?.bpm ? ` @ ${controls.musicSync.bpm} BPM` : ''}`,
    `MOTION BRUSH: ${brushDesc}`,
    controls.firstLastFrameRefs.start || controls.firstLastFrameRefs.end
      ? `FRAMES: start=${controls.firstLastFrameRefs.start ? 'locked' : 'auto'} end=${controls.firstLastFrameRefs.end ? 'locked' : 'auto'}`
      : '',
    controls.directorModePlainLang
      ? `DIRECTOR: ${controls.directorModePlainLang}`
      : '',
    `PHYSICS: ${controls.physicsIntensity} | LENS: ${controls.lensOptics ?? 'standard'}`,
    controls.brandKitLock.enabled ? `BRAND KIT LOCK: ${controls.brandKitLock.kitName ?? 'active'} @ ${controls.brandKitLock.lockStrength}%` : '',
    controls.variantCount > 1 ? `VARIANTS: ${controls.variantCount} (${controls.variantStrategy})` : '',
    controls.nodeGraph.enabled ? `NODE GRAPH: ${controls.nodeGraph.templateName ?? 'custom pipeline'}` : '',
  ].filter(Boolean);

  return `${basePrompt}\n\n[VIDEO CONTROLS]\n${sections.join('\n')}`;
}

// ── Renderer mapping ──

const MOTION_INTENSITY_SCALE: Record<MotionIntensity, number> = {
  subtle: 0.5,
  medium: 1,
  'high-energy': 1.65,
};

const PHYSICS_WEIGHT: Record<PhysicsIntensity, number> = {
  low: 0.25,
  medium: 0.55,
  high: 0.9,
};

const CAMERA_MOTION_MAP: Record<CameraStyle, string> = {
  static: 'static',
  'cinematic-pan': 'pan-right',
  zoom: 'zoom-in',
  dolly: 'zoom-in',
  orbiting: 'parallax',
  tracking: 'pan-left',
  crane: 'parallax',
  handheld: 'parallax',
  dynamic: 'parallax',
  custom: 'zoom-in',
};

export function mapToRenderer(controls: VideoControls, fps = 60): RendererControlParams {
  const { width, height } = getCanvasDimensions(controls.aspectRatio, controls.customAspect);
  const beatIntervalMs =
    controls.musicSync?.bpm && controls.musicSync.bpm > 0
      ? Math.round(60000 / controls.musicSync.bpm)
      : undefined;

  return {
    width,
    height,
    durationMs: resolveLengthMs(controls),
    fps,
    cameraMotion: CAMERA_MOTION_MAP[controls.cameraStyle] ?? 'zoom-in',
    motionScale: MOTION_INTENSITY_SCALE[controls.motionIntensity],
    physicsWeight: PHYSICS_WEIGHT[controls.physicsIntensity],
    moodOverlay: controls.moodTone,
    brandWeight:
      controls.brandIntensity === 'full-lockup' ? 1 : controls.brandIntensity === 'strong-branding' ? 0.75 : 0.4,
    refStrength: controls.refConsistencyStrength / 100,
    textStyle: controls.textAnimationStyle,
    endCardStyle: controls.endCardCTAStyle,
    musicSyncLevel: controls.musicSyncLevel,
    beatIntervalMs,
  };
}

// ── Preset serialization ──

export function serializePreset(controls: VideoControls): string {
  return JSON.stringify(controls, null, 2);
}

export function deserializePreset(json: string): VideoControls {
  const parsed = JSON.parse(json) as Partial<VideoControls>;
  return { ...DEFAULT_VIDEO_CONTROLS, ...parsed };
}

// ── Premium one-click presets (5 feels from Ultimate doc) ──

const PREMIUM_PRESETS: Record<string, PremiumPresetBundle> = {
  'higgsfield-cinematic': {
    id: 'higgsfield-cinematic',
    label: 'Higgsfield Cinematic',
    feel: 'Canvas + Cinema Studio directed, Elements lock, orbiting camera',
    projectHint: 'StrataBody',
    goal: '30s cinematic explainer: hook kinetic, dashboard rings fill, metrics, testimonial, full brand CTA. Use Elements for exact character/UI lock.',
    controls: {
      ...DEFAULT_VIDEO_CONTROLS,
      lengthSec: 30,
      lengthPreset: 30,
      aspectRatio: '16:9',
      cameraStyle: 'orbiting',
      motionIntensity: 'medium',
      moodTone: 'premium',
      pace: 'balanced',
      brandIntensity: 'full-lockup',
      refConsistencyStrength: 95,
      musicSyncLevel: 'strong',
      musicSync: { bpm: 120, cues: [{ timeSec: 0, type: 'beat' }, { timeSec: 15, type: 'accent' }] },
      textAnimationStyle: 'kinetic',
      endCardCTAStyle: 'branded-slate',
      directorModeEnabled: true,
      directorModePlainLang: 'Premium body comp coaching reveal with rings as hero, soft clinical cinematic lighting',
      variantCount: 3,
      variantStrategy: 'diversity',
      nodeGraph: {
        enabled: true,
        templateName: 'progress-ring-subgraph',
        nodes: [
          { id: 'hero', type: 'image', label: 'Hero Frame' },
          { id: 'rings', type: 'motion', label: 'Progress Rings' },
          { id: 'out', type: 'output', label: 'Final' },
        ],
        connections: [{ from: 'hero', to: 'rings' }, { from: 'rings', to: 'out' }],
      },
      brandKitLock: { enabled: true, kitName: 'StrataBody Elements', lockStrength: 95 },
      physicsIntensity: 'medium',
      lensOptics: '50mm prime f/2 shallow DOF',
      heroFrameFirst: true,
    },
  },

  'runway-motion-brush': {
    id: 'runway-motion-brush',
    label: 'Runway Motion Brush + Director',
    feel: 'Paint motion areas, director camera, physics interactions',
    projectHint: 'ClubCensus',
    goal: '15s vertical social: live poll bars racing with brush motion, avatars, Engage live CTA. Replicate Runway polished motion control.',
    controls: {
      ...DEFAULT_VIDEO_CONTROLS,
      lengthSec: 15,
      lengthPreset: 15,
      aspectRatio: '9:16',
      cameraStyle: 'dynamic',
      motionIntensity: 'high-energy',
      moodTone: 'energetic',
      pace: 'fast-paced',
      brandIntensity: 'strong-branding',
      refConsistencyStrength: 85,
      musicSyncLevel: 'medium',
      textAnimationStyle: 'bold-reveal',
      endCardCTAStyle: 'bold',
      motionBrush: {
        areas: [
          { id: 'bars', desc: 'poll bars', mask: { x: 0.55, y: 0.35, w: 0.35, h: 0.4 }, vector: 'upward fill fast', intensity: 0.9 },
          { id: 'avatars', desc: 'avatars pop', mask: { x: 0.1, y: 0.2, w: 0.3, h: 0.25 }, vector: 'scale in', intensity: 0.7 },
        ],
      },
      firstLastFrameRefs: { start: '__generate_start__', end: '__generate_end__' },
      directorModeEnabled: true,
      directorModePlainLang: 'Energetic community poll reveal with brush on bars/avatars, tracking camera, physics on interactions',
      variantCount: 4,
      variantStrategy: 'best-critic',
      physicsIntensity: 'high',
      extendStitchParams: { stitchTransitions: true, extendFromLastSec: 2 },
    },
  },

  'kling-reference-lock': {
    id: 'kling-reference-lock',
    label: 'Kling Reference Lock + Multi-Shot',
    feel: 'Elements/Omni consistency, first/last frame, storytelling',
    projectHint: 'SpeedMend',
    goal: '45s B2B explainer multi-shot: consistent team/props across angles, strong character lock like Kling Omni, audio synced.',
    controls: {
      ...DEFAULT_VIDEO_CONTROLS,
      lengthSec: 45,
      lengthPreset: 45,
      aspectRatio: '16:9',
      cameraStyle: 'cinematic-pan',
      motionIntensity: 'medium',
      moodTone: 'professional',
      pace: 'balanced',
      brandIntensity: 'full-lockup',
      refConsistencyStrength: 90,
      musicSyncLevel: 'strong',
      musicSync: { bpm: 100, cues: [{ timeSec: 0, type: 'dialogue', label: 'handoff VO' }] },
      textAnimationStyle: 'simple-fade',
      endCardCTAStyle: 'standard',
      firstLastFrameRefs: { start: '__generate_start__', end: '__generate_end__' },
      directorModeEnabled: true,
      directorModePlainLang: 'Multi-shot repair workflow story: handoff timeline, kanban, metrics. Lock elements across shots with high consistency, realistic motion physics',
      variantCount: 2,
      variantStrategy: 'lock-max',
      brandKitLock: {
        enabled: true,
        kitName: 'SpeedMend Elements',
        lockStrength: 90,
        characterRefs: ['team-sheet-front', 'team-sheet-side'],
        propRefs: ['wrench', 'kanban-card'],
      },
      physicsIntensity: 'high',
      lensOptics: 'anamorphic',
      lipSyncStrength: 70,
    },
  },

  'veo-audio-sync': {
    id: 'veo-audio-sync',
    label: 'Veo Audio Sync + Ingredients',
    feel: 'Native audio cues, multi-ref Ingredients, Frames to Video',
    projectHint: 'StrataBody',
    goal: '10s hook: rings animate with native audio sync and Veo-level photoreal lighting/prompt adherence.',
    controls: {
      ...DEFAULT_VIDEO_CONTROLS,
      lengthSec: 10,
      lengthPreset: 10,
      aspectRatio: '9:16',
      cameraStyle: 'dolly',
      motionIntensity: 'subtle',
      moodTone: 'professional',
      pace: 'slow-build',
      brandIntensity: 'strong-branding',
      refConsistencyStrength: 80,
      musicSyncLevel: 'strong',
      musicSync: {
        bpm: 90,
        cues: [
          { timeSec: 0, type: 'ambient', label: 'soft room tone' },
          { timeSec: 3, type: 'dialogue', label: 'light voiceover' },
        ],
      },
      textAnimationStyle: 'kinetic',
      endCardCTAStyle: 'minimal',
      firstLastFrameRefs: { start: '__generate_start__', end: '__generate_end__' },
      directorModeEnabled: true,
      directorModePlainLang: 'Photoreal premium coaching moment with audio ambient + light voiceover, perfect lighting/shadows, Ingredients lock on UI elements',
      variantCount: 3,
      variantStrategy: 'diversity',
      brandKitLock: {
        enabled: true,
        kitName: 'StrataBody Ingredients',
        lockStrength: 80,
        propRefs: ['rings-ui', 'coach-portrait', 'metric-card'],
      },
      physicsIntensity: 'low',
      lensOptics: '85mm portrait soft key + rim',
      lipSyncStrength: 55,
      extendStitchParams: {
        insertEdit: { object: 'new progress ring highlight', timeSec: 4 },
      },
    },
  },

  'hybrid-comfy-descript': {
    id: 'hybrid-comfy-descript',
    label: 'Hybrid Comfy + Descript Workflow',
    feel: 'Full node graph, script→storyboard, brand kit, 5s vertical hook',
    projectHint: 'ClubCensus',
    goal: '5s vertical energetic hook: live poll pulse, futuristic UI, brush-localized motion, anchored first/last frames.',
    controls: {
      ...DEFAULT_VIDEO_CONTROLS,
      lengthSec: 5,
      lengthPreset: 5,
      aspectRatio: '9:16',
      cameraStyle: 'tracking',
      motionIntensity: 'high-energy',
      moodTone: 'futuristic',
      pace: 'fast-paced',
      brandIntensity: 'strong-branding',
      refConsistencyStrength: 82,
      musicSyncLevel: 'strong',
      musicSync: { bpm: 128, cues: [{ timeSec: 0, type: 'beat' }, { timeSec: 2.5, type: 'drop' }] },
      textAnimationStyle: 'bold-reveal',
      endCardCTAStyle: 'bold',
      motionBrush: {
        areas: [
          { id: 'poll', desc: 'poll bars', mask: { x: 0.5, y: 0.4, w: 0.4, h: 0.35 }, vector: 'upward fill fast', intensity: 0.95 },
          { id: 'feed', desc: 'feed cards', mask: { x: 0.08, y: 0.55, w: 0.45, h: 0.3 }, vector: 'scale in', intensity: 0.75 },
        ],
      },
      firstLastFrameRefs: { start: '__generate_start__', end: '__generate_end__' },
      directorModeEnabled: true,
      directorModePlainLang: '5s futuristic community pulse: poll bars surge, feed cards pop, high-energy tracking camera',
      variantCount: 3,
      variantStrategy: 'best-critic',
      nodeGraph: {
        enabled: true,
        templateName: 'comfy-brand-lock-pipeline',
        nodes: [
          { id: 'script', type: 'prompt', label: 'Script' },
          { id: 'storyboard', type: 'image', label: 'Storyboard' },
          { id: 'ipadapter', type: 'ref', label: 'Brand Lock' },
          { id: 'motion', type: 'motion', label: 'AnimateDiff' },
          { id: 'audio', type: 'audio', label: 'Beat Sync' },
          { id: 'out', type: 'output', label: 'Export' },
        ],
        connections: [
          { from: 'script', to: 'storyboard' },
          { from: 'storyboard', to: 'ipadapter' },
          { from: 'ipadapter', to: 'motion' },
          { from: 'motion', to: 'audio' },
          { from: 'audio', to: 'out' },
        ],
      },
      brandKitLock: { enabled: true, kitName: 'ClubCensus Brand Kit', lockStrength: 85 },
      physicsIntensity: 'high',
      lensOptics: '24mm wide neon rim light',
      extendStitchParams: { stitchTransitions: true },
      heroFrameFirst: true,
    },
  },
};

export const PREMIUM_PRESET_IDS = Object.keys(PREMIUM_PRESETS) as Array<keyof typeof PREMIUM_PRESETS>;

export function loadPremiumPreset(name: string): PremiumPresetBundle {
  const preset = PREMIUM_PRESETS[name];
  if (!preset) {
    throw new Error(
      `Unknown premium preset "${name}". Available: ${PREMIUM_PRESET_IDS.join(', ')}`,
    );
  }
  return {
    ...preset,
    controls: { ...DEFAULT_VIDEO_CONTROLS, ...preset.controls },
  };
}

export function listPremiumPresets(): Array<{ id: string; label: string; feel: string }> {
  return PREMIUM_PRESET_IDS.map((id) => ({
    id,
    label: PREMIUM_PRESETS[id].label,
    feel: PREMIUM_PRESETS[id].feel,
  }));
}

export function mergeControls(partial: Partial<VideoControls>): VideoControls {
  return {
    ...DEFAULT_VIDEO_CONTROLS,
    ...partial,
    motionBrush: { ...DEFAULT_VIDEO_CONTROLS.motionBrush, ...partial.motionBrush },
    firstLastFrameRefs: { ...DEFAULT_VIDEO_CONTROLS.firstLastFrameRefs, ...partial.firstLastFrameRefs },
    nodeGraph: { ...DEFAULT_VIDEO_CONTROLS.nodeGraph, ...partial.nodeGraph },
    brandKitLock: { ...DEFAULT_VIDEO_CONTROLS.brandKitLock, ...partial.brandKitLock },
    extendStitchParams: { ...DEFAULT_VIDEO_CONTROLS.extendStitchParams, ...partial.extendStitchParams },
    musicSync: partial.musicSync ? { ...DEFAULT_VIDEO_CONTROLS.musicSync, ...partial.musicSync } : DEFAULT_VIDEO_CONTROLS.musicSync,
  };
}