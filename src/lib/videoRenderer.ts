// ForgeFactory v2 — Premium local Hyperframes renderer (canvas 2D)
// Brand-aware SaaS templates, keyframe motion integration, cinematic easing,
// Ultimate VideoControls (motion brush, first/last frame, physics, lens optics),
// and FFmpeg post-processing for marketing-grade output.

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';
import {
  type VideoControls,
  type TextAnimStyle,
  type EndCardCTAStyle,
  type MotionBrushArea,
  type LogoPlacement,
  type VideoStyle,
  DEFAULT_VIDEO_CONTROLS,
  getCanvasDimensions,
  mapToRenderer,
  parseMotionVector,
  resolveLengthMs,
  resolveBrandPalette,
  scaleTimingsForLength,
  type ScaledSceneTiming,
} from './videoControls';

export type QualityPreset = 'fast' | 'balanced' | 'high';
export type TemplateId = 'product-explainer-30s' | 'feature-deep-dive' | 'customer-story' | 'how-it-works-45s';

export interface ProjectBrand {
  name: string;
  accent: string;
  tone?: string;
  uiElements?: string;
  kineticHook?: string;
  featureLabels?: string[];
  metricLabels?: string[];
  quote?: { text: string; author: string };
  cta?: string;
  tagline?: string;
  brandPalette?: import('./videoControls').BrandPalette;
  fontFamily?: string;
}

export interface RenderOptions {
  width?: number;
  height?: number;
  fps?: number;
  durationMs?: number;
  qualityPreset?: QualityPreset;
  templateId?: TemplateId;
  keyframeImages?: string[];
  controls?: VideoControls;
}

export type SceneType =
  | 'card' | 'progress' | 'metric' | 'quote' | 'kinetic' | 'logo' | 'bars'
  | 'sidebar' | 'topbar' | 'cta' | 'keyframe' | 'linear' | 'bg' | 'endcard';

export interface SceneCameraPath {
  style: string;
  motion: string;
  intensity: number;
}

export interface Scene {
  start: number;
  end: number;
  type: SceneType;
  params?: Record<string, unknown>;
  cameraPath?: SceneCameraPath;
  moodTone?: string;
  textVariant?: TextAnimStyle;
  endCardVariant?: EndCardCTAStyle;
}

interface BrandDrawColors {
  primary: string;
  accent: string;
  secondary: string;
  neutral: string;
  surface: string;
  text: string;
}

interface RenderContext {
  controls: VideoControls;
  rendererParams: ReturnType<typeof mapToRenderer>;
  motionBrushAreas: MotionBrushArea[];
  physicsWeight: number;
  refStrength: number;
}

function resolveBrandDrawColors(brand: ProjectBrand): BrandDrawColors {
  const p = brand.brandPalette;
  const fallback = brand.accent || '#6366f1';
  return {
    primary: p?.primary ?? fallback,
    accent: p?.accent ?? fallback,
    secondary: p?.secondary ?? p?.primary ?? '#818CF8',
    neutral: p?.neutral ?? '#0f172a',
    surface: p?.surface ?? '#1e2937',
    text: p?.text ?? '#e2e8f0',
  };
}

function brandFont(family: string | undefined, size: number, weight: string | number = 'bold'): string {
  return `${weight} ${size}px ${family ?? 'system-ui, sans-serif'}`;
}

const DEFAULT_WIDTH = 1920;
const DEFAULT_HEIGHT = 1080;
const DEFAULT_FPS = 60;

let ffmpegInstance: FFmpeg | null = null;
let ffmpegLoadFailed = false;

const FFMPEG_CDN_BASES = [
  // Local /ffmpeg folder intentionally omitted (no assets in public/).
  // CDNs below are fallbacks; they can be unreliable with the strict COEP/COOP headers in vite.config.
  'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm',
  'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm',
];

// ── Easing & animation helpers ──

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);
}

function easeInOutCubic(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function easeWithPhysics(t: number, weight: number): number {
  const base = easeInOutCubic(t);
  if (weight < 0.15) return base;
  const momentum = Math.sin(t * Math.PI * 1.2) * 0.1 * weight;
  const settle = t > 0.7 ? (1 - t) * 0.05 * weight : 0;
  return Math.min(1, Math.max(0, base + momentum - settle));
}

function sceneProgress(scene: Scene, elapsed: number, physicsWeight = 0): number {
  const raw = (elapsed - scene.start) / Math.max(1, scene.end - scene.start);
  return physicsWeight > 0 ? easeWithPhysics(raw, physicsWeight) : easeInOutCubic(raw);
}

function sceneAlpha(scene: Scene, elapsed: number, fadeMs = 420): number {
  const fadeIn = Math.min(1, (elapsed - scene.start) / fadeMs);
  const fadeOut = Math.min(1, (scene.end - elapsed) / fadeMs);
  return easeOutCubic(Math.min(fadeIn, fadeOut));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function resolveRenderContext(opts: RenderOptions): RenderContext {
  const controls = opts.controls ?? DEFAULT_VIDEO_CONTROLS;
  const rendererParams = mapToRenderer(controls, opts.fps ?? DEFAULT_FPS);
  return {
    controls,
    rendererParams,
    motionBrushAreas: controls.motionBrush.areas,
    physicsWeight: rendererParams.physicsWeight,
    refStrength: rendererParams.refStrength,
  };
}

function getMoodGradientStops(mood: string, colors: BrandDrawColors): [string, string, string] {
  const { neutral, surface, accent, secondary } = colors;
  switch (mood) {
    case 'energetic':
      return [neutral, surface, secondary + '44'];
    case 'futuristic':
      return [neutral, surface, accent + '38'];
    case 'warm':
      return [neutral, surface, secondary + '33'];
    case 'minimalist':
      return [neutral, surface, accent + '14'];
    case 'premium':
      return [neutral, surface, accent + '28'];
    default:
      return [neutral, surface, accent + '22'];
  }
}

function applyMoodOverlay(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  mood: string,
  colors: BrandDrawColors,
  alpha = 0.35,
) {
  const [a, b, c] = getMoodGradientStops(mood, colors);
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, a);
  grad.addColorStop(0.55, b);
  grad.addColorStop(1, c);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

function applyLensOptics(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  lensOptics: string | undefined,
  progress: number,
) {
  if (!lensOptics) return;
  const lower = lensOptics.toLowerCase();
  const shallowDof = lower.includes('f/2') || lower.includes('shallow') || lower.includes('portrait');
  const anamorphic = lower.includes('anamorphic');
  const wide = lower.includes('24mm') || lower.includes('wide');

  ctx.save();
  const cx = w / 2;
  const cy = h / 2;
  const maxR = Math.sqrt(cx * cx + cy * cy);

  if (shallowDof || anamorphic) {
    const vig = ctx.createRadialGradient(cx, cy, maxR * 0.25, cx, cy, maxR);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(0.65, 'rgba(0,0,0,0)');
    vig.addColorStop(1, `rgba(0,0,0,${anamorphic ? 0.55 : 0.4})`);
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);
  }

  if (wide) {
    ctx.strokeStyle = `rgba(120,180,255,${0.08 + progress * 0.04})`;
    ctx.lineWidth = 3;
    ctx.strokeRect(12, 12, w - 24, h - 24);
  }

  if (lower.includes('neon') || lower.includes('rim')) {
    ctx.shadowColor = 'rgba(99,102,241,0.35)';
    ctx.shadowBlur = 24 + progress * 12;
    ctx.strokeStyle = 'rgba(99,102,241,0.15)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, w, h);
  }
  ctx.restore();
}

function getBrushOffset(
  area: MotionBrushArea,
  progress: number,
  w: number,
  h: number,
  motionScale: number,
): { dx: number; dy: number; scale: number } {
  const vec = parseMotionVector(area.vector);
  const t = easeOutCubic(progress) * area.intensity * motionScale * (vec.speed ?? 1);
  const isScale = vec.label?.toLowerCase().includes('scale') ?? false;
  if (isScale) {
    return { dx: 0, dy: 0, scale: 1 + t * 0.25 };
  }
  return {
    dx: vec.x * t * w * 0.08,
    dy: vec.y * t * h * 0.08,
    scale: 1,
  };
}

function pointInBrushMask(
  px: number,
  py: number,
  w: number,
  h: number,
  area: MotionBrushArea,
): boolean {
  if (!area.mask) return true;
  const mx = area.mask.x * w;
  const my = area.mask.y * h;
  const mw = area.mask.w * w;
  const mh = area.mask.h * h;
  return px >= mx && px <= mx + mw && py >= my && py <= my + mh;
}

// ── FFmpeg ──

async function tryLoadFFmpegFromBase(base: string): Promise<FFmpeg> {
  const ffmpeg = new FFmpeg();
  const coreURL = base.startsWith('http')
    ? `${base}/ffmpeg-core.js`
    : await toBlobURL(`${base}/ffmpeg-core.js`, 'text/javascript');
  const wasmURL = base.startsWith('http')
    ? `${base}/ffmpeg-core.wasm`
    : await toBlobURL(`${base}/ffmpeg-core.wasm`, 'application/wasm');

  await ffmpeg.load({ coreURL, wasmURL });
  return ffmpeg;
}

export async function ensureFFmpeg(onProgress?: (p: number) => void): Promise<FFmpeg> {
  if (ffmpegLoadFailed) {
    throw new Error('FFmpeg unavailable in this environment — using raw WebM capture');
  }
  if (ffmpegInstance) return ffmpegInstance;

  const ffmpeg = new FFmpeg();
  ffmpeg.on('progress', ({ progress }) => onProgress?.(Math.round(progress * 100)));

  const errors: string[] = [];
  for (const base of FFMPEG_CDN_BASES) {
    try {
      const loaded = await tryLoadFFmpegFromBase(base);
      ffmpegInstance = loaded;
      return loaded;
    } catch (e) {
      errors.push(`${base}: ${e instanceof Error ? e.message : 'load failed'}`);
    }
  }

  try {
    await ffmpeg.load();
    ffmpegInstance = ffmpeg;
    return ffmpeg;
  } catch (e) {
    ffmpegLoadFailed = true;
    ffmpegInstance = null;
    throw new Error(
      `FFmpeg could not load (${errors.join('; ')}). Falling back to raw WebM — still playable in browsers.`,
    );
  }
}

export interface PostProcessResult {
  blob: Blob;
  usedFFmpeg: boolean;
  format: 'mp4' | 'webm';
  note: string;
}

export const QUALITY_PRESETS: Record<QualityPreset, { label: string; crf: number; preset: string; fps: number; note: string }> = {
  fast:     { label: 'Fast',     crf: 28, preset: 'veryfast', fps: 30, note: 'Quick drafts, smaller files' },
  balanced: { label: 'Balanced', crf: 22, preset: 'medium',   fps: 30, note: 'Great quality / size' },
  high:     { label: 'High Quality', crf: 18, preset: 'slow', fps: 60, note: 'Best local motion & detail' },
};

export const TEMPLATE_LABELS: Record<TemplateId, string> = {
  'product-explainer-30s': '30s Product Explainer',
  'feature-deep-dive': 'Feature Deep Dive',
  'customer-story': 'Customer Story',
  'how-it-works-45s': 'How it Works (45s)',
};

export const TEMPLATE_DURATIONS: Record<TemplateId, number> = {
  'product-explainer-30s': 30000,
  'feature-deep-dive': 30000,
  'customer-story': 30000,
  'how-it-works-45s': 45000,
};

function defaultBrandParams(brand: ProjectBrand) {
  return {
    kinetic: brand.kineticHook ?? brand.name.slice(0, 14).toUpperCase(),
    features: brand.featureLabels ?? ['AI Feature', 'Smart View', 'Team Hub'],
    metrics: brand.metricLabels ?? ['Impact', 'Growth'],
    quote: brand.quote ?? { text: 'This finally made the numbers feel real.', author: 'Alex T.' },
    cta: brand.cta ?? 'Start free trial',
    tagline: brand.tagline ?? 'Make it real.',
  };
}

function brandAccentWeight(intensity: string): number {
  if (intensity === 'full-lockup') return 1;
  if (intensity === 'strong-branding') return 0.8;
  return 0.45;
}

// ── Drawing primitives (premium motion-graphics style) ──

function drawGradientBg(ctx: CanvasRenderingContext2D, w: number, h: number, colors: BrandDrawColors, mood = 'professional') {
  const [a, b, c] = getMoodGradientStops(mood, colors);
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, a);
  grad.addColorStop(0.55, b);
  grad.addColorStop(1, c);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

function drawDashboardCard(
  ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number,
  colors: BrandDrawColors, progress: number, label = 'Feature', alpha = 1, physicsWeight = 0, fontFamily?: string,
) {
  const eased = physicsWeight > 0 ? easeWithPhysics(progress, physicsWeight) : easeOutCubic(progress);
  const lift = eased * 14;
  const slideX = lerp(x + 40, x, eased);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 8;
  ctx.fillStyle = colors.surface;
  ctx.fillRect(slideX, y - lift, w, h);
  ctx.shadowBlur = 0;
  ctx.fillStyle = colors.primary;
  ctx.fillRect(slideX, y - lift, w, 6);
  ctx.fillStyle = colors.text;
  ctx.font = brandFont(fontFamily, 22);
  ctx.fillText(label, slideX + 20, y - lift + 38);
  ctx.fillStyle = colors.secondary + 'aa';
  ctx.font = brandFont(fontFamily, 14, 'normal');
  ctx.fillText('Live • Updated just now', slideX + 20, y - lift + 62);
  for (let i = 0; i < 4; i++) {
    const barH = 20 + Math.sin(i * 1.2 + progress * 4) * 12;
    ctx.fillStyle = i === 2 ? colors.accent + 'cc' : colors.neutral + '88';
    ctx.fillRect(slideX + 20 + i * 28, y - lift + h - 30 - barH, 18, barH);
  }
  ctx.restore();
}

function drawProgressRing(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, progress: number, colors: BrandDrawColors, alpha = 1, physicsWeight = 0, fontFamily?: string) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = colors.surface;
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  const eased = physicsWeight > 0 ? easeWithPhysics(progress, physicsWeight) : easeOutCubic(progress);
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 14;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, Math.max(0, eased)));
  ctx.stroke();
  ctx.fillStyle = colors.text;
  ctx.font = brandFont(fontFamily, 28);
  ctx.textAlign = 'center';
  ctx.fillText(`${Math.floor(eased * 100)}%`, cx, cy + 10);
  ctx.textAlign = 'left';
  ctx.restore();
}

function drawLinearProgress(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, progress: number, colors: BrandDrawColors, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = colors.surface;
  ctx.fillRect(x, y, w, 12);
  const eased = easeOutCubic(progress);
  ctx.fillStyle = colors.primary;
  ctx.fillRect(x, y, w * eased, 12);
  ctx.restore();
}

function drawMetricCounter(ctx: CanvasRenderingContext2D, x: number, y: number, value: number, label: string, delta: number, colors: BrandDrawColors, alpha = 1, physicsWeight = 0, progress = 1, fontFamily?: string) {
  ctx.save();
  ctx.globalAlpha = alpha;
  const eased = physicsWeight > 0 ? easeWithPhysics(progress, physicsWeight) : easeOutCubic(progress);
  const displayVal = Math.floor(lerp(12, value, eased));
  ctx.fillStyle = colors.text;
  ctx.font = brandFont(fontFamily, 52);
  ctx.fillText(displayVal.toString(), x, y);
  ctx.fillStyle = colors.secondary + 'bb';
  ctx.font = brandFont(fontFamily, 15, 'normal');
  ctx.fillText(label, x, y + 24);
  if (delta) {
    ctx.fillStyle = colors.accent;
    ctx.font = brandFont(fontFamily, 18);
    ctx.fillText(`+${Math.floor(displayVal * 0.15)}%`, x + 130, y - 6);
  }
  ctx.restore();
}

function drawSidebar(ctx: CanvasRenderingContext2D, h: number, colors: BrandDrawColors, projectName: string, progress: number, brandWeight = 0.75, fontFamily?: string) {
  const slide = lerp(-260, 0, easeOutCubic(progress));
  ctx.save();
  ctx.fillStyle = colors.neutral;
  ctx.fillRect(slide, 0, 260, h);
  ctx.fillStyle = colors.primary;
  ctx.globalAlpha = brandWeight;
  ctx.font = brandFont(fontFamily, 16);
  ctx.fillText(projectName, 20 + slide, 40);
  ctx.globalAlpha = 1;
  ctx.font = brandFont(fontFamily, 13, 'normal');
  ['Dashboard', 'Insights', 'Team', 'Settings'].forEach((t, i) => {
    const active = i === 0;
    if (active) {
      ctx.fillStyle = colors.accent + '33';
      ctx.fillRect(12 + slide, 68 + i * 32, 236, 26);
      ctx.fillStyle = colors.accent;
    } else {
      ctx.fillStyle = colors.secondary + '99';
    }
    ctx.fillText(t, 24 + slide, 86 + i * 32);
  });
  ctx.restore();
}

function drawTopbar(ctx: CanvasRenderingContext2D, w: number, projectName: string, progress: number, colors: BrandDrawColors, fontFamily?: string) {
  const slide = lerp(-w, 0, easeOutCubic(progress));
  ctx.save();
  ctx.fillStyle = colors.surface;
  ctx.fillRect(260 + slide, 0, w - 260, 68);
  ctx.fillStyle = colors.text;
  ctx.font = brandFont(fontFamily, 20);
  ctx.fillText(projectName, 290 + slide, 44);
  ctx.restore();
}

function drawTestimonialQuote(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, quote: string, author: string, colors: BrandDrawColors, progress: number, fontFamily?: string) {
  const slideY = lerp(y + 60, y, easeOutCubic(progress));
  ctx.save();
  ctx.globalAlpha = easeOutCubic(progress);
  ctx.fillStyle = colors.surface;
  ctx.fillRect(x, slideY, w, 120);
  ctx.fillStyle = colors.primary;
  ctx.fillRect(x, slideY, 5, 120);
  ctx.fillStyle = colors.text;
  ctx.font = brandFont(fontFamily, 17, 'normal');
  const display = quote.length > 90 ? quote.slice(0, 88) + '…' : quote;
  ctx.fillText('"' + display + '"', x + 22, slideY + 36);
  ctx.fillStyle = colors.secondary + 'cc';
  ctx.font = brandFont(fontFamily, 13, 'normal');
  ctx.fillText('— ' + author, x + 22, slideY + 96);
  ctx.restore();
}

function drawKineticText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, elapsed: number, colors: BrandDrawColors, progress: number, style: TextAnimStyle = 'kinetic', fontFamily?: string) {
  ctx.save();
  if (style === 'simple-fade') {
    ctx.globalAlpha = easeOutCubic(progress);
    ctx.fillStyle = colors.text;
    ctx.font = brandFont(fontFamily, 72);
    ctx.fillText(text, x, y);
    ctx.restore();
    return;
  }

  if (style === 'bold-reveal') {
    const scale = lerp(0.6, 1.08, easeOutCubic(progress));
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.translate(-x, -y);
    ctx.fillStyle = colors.text;
    ctx.font = brandFont(fontFamily, 88);
    ctx.globalAlpha = easeOutCubic(progress);
    ctx.fillText(text, x, y);
    ctx.fillStyle = colors.primary;
    ctx.fillRect(x, y + 18, Math.min(600, text.length * 48), 8);
    ctx.restore();
    return;
  }

  if (style === 'glitch') {
    const jitter = (1 - progress) * 4;
    ctx.fillStyle = colors.accent;
    ctx.globalAlpha = 0.4;
    ctx.font = brandFont(fontFamily, 76);
    ctx.fillText(text, x + jitter, y - jitter);
    ctx.fillStyle = colors.text;
    ctx.globalAlpha = easeOutCubic(progress);
    ctx.fillText(text, x, y);
    ctx.restore();
    return;
  }

  const scale = lerp(0.85, 1, easeOutCubic(progress));
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.translate(-x, -y);
  ctx.fillStyle = colors.text;
  ctx.font = brandFont(fontFamily, 80);
  const letters = text.split('');
  let ox = x;
  letters.forEach((ch, i) => {
    const delay = i * 0.06;
    const letterP = easeOutCubic(Math.max(0, progress - delay) / Math.max(0.01, 1 - delay));
    const bounce = Math.sin((elapsed + i * 140) / 280) * 3 * letterP;
    ctx.globalAlpha = letterP;
    ctx.fillText(ch, ox, y + bounce);
    ox += ctx.measureText(ch).width + 3;
  });
  ctx.globalAlpha = easeOutCubic(progress);
  ctx.fillStyle = colors.accent;
  ctx.fillRect(x, y + 22, Math.min(520, text.length * 42), 6);
  ctx.restore();
}

function drawLogoLockup(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  name: string,
  colors: BrandDrawColors,
  tagline: string,
  progress: number,
  brandWeight = 0.75,
  fontFamily?: string,
  sizeScale = 1,
  opacity = 1,
) {
  const scale = lerp(0.7, 1, easeOutCubic(progress)) * (0.85 + brandWeight * 0.15) * sizeScale;
  ctx.save();
  ctx.globalAlpha = easeOutCubic(progress) * brandWeight * opacity;
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.translate(-x, -y);
  ctx.fillStyle = colors.primary;
  ctx.beginPath();
  ctx.roundRect(x, y, 22, 22, 4);
  ctx.fill();
  ctx.fillStyle = colors.text;
  ctx.font = brandFont(fontFamily, 26);
  ctx.fillText(name, x + 34, y + 18);
  ctx.fillStyle = colors.secondary + 'cc';
  ctx.font = brandFont(fontFamily, 14, 'normal');
  ctx.fillText(tagline, x + 34, y + 40);
  ctx.restore();
}

function getLogoPlacementLayout(
  placement: LogoPlacement,
  w: number,
  h: number,
): { x: number; y: number; scale: number; opacity: number } {
  const pad = 28;
  switch (placement) {
    case 'top-left':
      return { x: 280 + pad, y: pad + 12, scale: 0.82, opacity: 1 };
    case 'bottom-right':
      return { x: w - 240, y: h - 52, scale: 0.7, opacity: 0.92 };
    case 'watermark':
      return { x: w - 200, y: h - 44, scale: 0.58, opacity: 0.5 };
    case 'hero':
      return { x: w * 0.17, y: h * 0.52, scale: 1.15, opacity: 1 };
    case 'centered':
      return { x: w * 0.5 - 90, y: h * 0.5 - 24, scale: 1.05, opacity: 1 };
    case 'end-card-only':
      return { x: w * 0.1, y: h * 0.35, scale: 1, opacity: 1 };
    default:
      return { x: w - 240, y: h - 52, scale: 0.7, opacity: 0.92 };
  }
}

function shouldDrawPersistentLogo(controls: VideoControls, elapsed: number, durationMs: number): boolean {
  const placement = controls.logoPlacement ?? 'bottom-right';
  if (placement === 'end-card-only') return false;
  if (placement === 'centered') return false;
  if (placement === 'hero') return elapsed < durationMs * 0.38;
  if (placement === 'watermark') return true;
  return !!controls.logoLock && (placement === 'top-left' || placement === 'bottom-right');
}

function drawCtaButton(ctx: CanvasRenderingContext2D, x: number, y: number, label: string, colors: BrandDrawColors, progress: number, style: EndCardCTAStyle = 'standard', fontFamily?: string) {
  const pulse = style === 'bold' ? 1 + Math.sin(progress * Math.PI * 6) * 0.04 : 1 + Math.sin(progress * Math.PI * 4) * 0.02;
  const baseW = style === 'minimal' ? 240 : style === 'bold' ? 360 : 300;
  const baseH = style === 'bold' ? 64 : 56;
  const bw = baseW * pulse;
  const bh = baseH * pulse;
  const bx = x - (bw - baseW) / 2;
  const by = y - (bh - baseH) / 2;
  ctx.save();
  ctx.globalAlpha = easeOutCubic(progress);
  if (style === 'branded-slate') {
    ctx.fillStyle = colors.neutral + 'ee';
    ctx.fillRect(bx - 20, by - 20, bw + 40, bh + 60);
    ctx.fillStyle = colors.primary + '66';
    ctx.fillRect(bx - 20, by - 20, 6, bh + 60);
  }
  ctx.shadowColor = colors.accent + '88';
  ctx.shadowBlur = style === 'bold' ? 28 : 20;
  ctx.fillStyle = colors.primary;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, style === 'bold' ? 14 : 10);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = colors.text;
  ctx.font = brandFont(fontFamily, style === 'bold' ? 24 : 20);
  ctx.textAlign = 'center';
  ctx.fillText(label, x + baseW / 2, y + (style === 'bold' ? 40 : 36));
  ctx.textAlign = 'left';
  ctx.restore();
}

function drawEndCard(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  brand: ProjectBrand,
  progress: number,
  style: EndCardCTAStyle,
) {
  const colors = resolveBrandDrawColors(brand);
  const font = brand.fontFamily;
  const endLogo = getLogoPlacementLayout('end-card-only', w, h);
  ctx.save();
  ctx.globalAlpha = easeOutCubic(progress);
  if (style === 'branded-slate') {
    ctx.fillStyle = colors.neutral + 'ee';
    ctx.fillRect(0, 0, w, h);
    drawLogoLockup(ctx, endLogo.x, endLogo.y, brand.name, colors, brand.tagline ?? '', progress, 1, font, endLogo.scale);
    drawCtaButton(ctx, w * 0.1, h * 0.55, brand.cta ?? 'Get started', colors, progress, 'branded-slate', font);
  } else if (style === 'minimal') {
    ctx.fillStyle = colors.neutral + '88';
    ctx.fillRect(0, h - 120, w, 120);
    ctx.fillStyle = colors.text;
    ctx.font = brandFont(font, 16, 'normal');
    ctx.fillText(brand.name, 40, h - 70);
    drawCtaButton(ctx, w - 320, h - 90, brand.cta ?? 'Learn more', colors, progress, 'minimal', font);
  } else {
    drawCtaButton(ctx, w / 2 - 150, h / 2, brand.cta ?? 'Start free trial', colors, progress, style, font);
  }
  ctx.restore();
}

function resolveCameraMotion(motion: string, progress: number, motionScale: number): { zoom: number; panX: number; panY: number; rotation: number } {
  const t = easeOutCubic(progress) * motionScale;
  let zoom = 1;
  let panX = 0;
  let panY = 0;
  let rotation = 0;

  if (motion === 'zoom-in') zoom = lerp(1, 1.14, t);
  else if (motion === 'pan-left') panX = lerp(30, -40, t);
  else if (motion === 'pan-right') panX = lerp(-30, 40, t);
  else if (motion === 'parallax') {
    zoom = lerp(1.02, 1.1, t);
    panX = lerp(-20, 20, t);
    panY = lerp(10, -10, t);
    rotation = lerp(-0.008, 0.008, t);
  } else if (motion === 'static') {
    zoom = 1;
  } else {
    zoom = lerp(1, 1.08, t);
  }

  return { zoom, panX, panY, rotation };
}

function drawKeyframePanel(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number,
  progress: number,
  motion: string,
  colors: BrandDrawColors,
  brandName: string,
  index: number,
  total: number,
  ctx2: RenderContext,
  fontFamily?: string,
  anchor?: 'start' | 'end' | 'interp',
  anchorProgress?: number,
) {
  ctx.save();
  const alpha = easeOutCubic(Math.min(1, progress * 2)) * easeOutCubic(Math.min(1, (1 - progress) * 2 + 0.5));
  ctx.globalAlpha = Math.min(1, alpha * (0.7 + ctx2.refStrength * 0.3));

  const pad = Math.round(w * 0.03);
  const panelX = Math.round(w * 0.36);
  const panelY = Math.round(h * 0.1);
  const panelW = w - panelX - pad;
  const panelH = h - panelY - pad - 56;
  const baseScale = Math.min(panelW / img.naturalWidth, panelH / img.naturalHeight);

  applyMoodOverlay(ctx, w, h, ctx2.controls.moodTone, colors, 0.12);
  ctx.fillStyle = colors.surface + '44';
  ctx.beginPath();
  ctx.roundRect(panelX - 8, panelY - 8, panelW + 16, panelH + 16, 14);
  ctx.fill();

  let { zoom, panX, panY, rotation } = resolveCameraMotion(motion, progress, ctx2.rendererParams.motionScale);

  if (anchor === 'start') {
    zoom = lerp(zoom, 1, 0.35);
    panX *= 0.4;
    panY *= 0.4;
  } else if (anchor === 'end') {
    const endT = easeOutCubic(progress);
    zoom = lerp(1.02, zoom, endT);
    panX = lerp(0, panX, endT);
    panY = lerp(0, panY, endT);
  } else if (anchor === 'interp' && anchorProgress !== undefined) {
    const startCam = resolveCameraMotion(motion, 0, ctx2.rendererParams.motionScale);
    const endCam = resolveCameraMotion(motion, 1, ctx2.rendererParams.motionScale);
    zoom = lerp(startCam.zoom, endCam.zoom, anchorProgress);
    panX = lerp(startCam.panX, endCam.panX, anchorProgress);
    panY = lerp(startCam.panY, endCam.panY, anchorProgress);
    rotation = lerp(startCam.rotation, endCam.rotation, anchorProgress);
  }

  const dw = img.naturalWidth * baseScale * zoom;
  const dh = img.naturalHeight * baseScale * zoom;
  const dx = panelX + (panelW - dw) / 2 + panX;
  const dy = panelY + (panelH - dh) / 2 + panY;

  const pivotX = panelX + panelW / 2;
  const pivotY = panelY + panelH / 2;
  ctx.translate(pivotX, pivotY);
  ctx.rotate(rotation);
  ctx.translate(-pivotX, -pivotY);

  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 40;
  ctx.drawImage(img, dx, dy, dw, dh);

  for (const area of ctx2.motionBrushAreas) {
    if (!area.mask) continue;
    const { dx: bdx, dy: bdy, scale: bScale } = getBrushOffset(area, progress, w, h, ctx2.rendererParams.motionScale);
    const mx = area.mask.x * w;
    const my = area.mask.y * h;
    const mw = area.mask.w * w;
    const mh = area.mask.h * h;
    ctx.save();
    ctx.beginPath();
    ctx.rect(mx, my, mw, mh);
    ctx.clip();
    ctx.translate(bdx, bdy);
    const cx = dx + dw / 2;
    const cy = dy + dh / 2;
    ctx.translate(cx, cy);
    ctx.scale(bScale, bScale);
    ctx.translate(-cx, -cy);
    ctx.globalAlpha = 0.85 + area.intensity * 0.15;
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.restore();
  }

  ctx.shadowBlur = 0;
  applyLensOptics(ctx, w, h, ctx2.controls.lensOptics, progress);

  ctx.strokeStyle = colors.accent + '66';
  ctx.lineWidth = 2;
  ctx.strokeRect(dx - 2, dy - 2, dw + 4, dh + 4);

  const barGrad = ctx.createLinearGradient(0, h - 72, 0, h);
  barGrad.addColorStop(0, 'transparent');
  barGrad.addColorStop(1, colors.neutral + 'cc');
  ctx.fillStyle = barGrad;
  ctx.fillRect(0, h - 72, w, 72);
  ctx.fillStyle = colors.text;
  ctx.font = brandFont(fontFamily, 16);
  ctx.fillText(`${brandName}`, pad, h - 38);
  ctx.fillStyle = colors.primary;
  ctx.font = brandFont(fontFamily, 13, 'normal');
  const anchorLabel = anchor ? ` • ${anchor} frame` : '';
  ctx.fillText(`Scene ${index + 1} of ${total}${anchorLabel}`, pad, h - 18);

  ctx.restore();
}

function drawBarsWithBrush(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  progress: number,
  colors: BrandDrawColors,
  alpha: number,
  ctx2: RenderContext,
  baseX = 840,
  baseY = 400,
) {
  const barW = 62;
  for (let i = 0; i < 5; i++) {
    const bp = easeOutCubic(Math.min(1, Math.max(0, progress * (1 + i * 0.08))));
    let extraH = 0;
    let extraX = 0;

    for (const area of ctx2.motionBrushAreas) {
      const bx = baseX + i * 72;
      const by = baseY - bp * 180;
      if (pointInBrushMask(bx + barW / 2, by, w, h, area)) {
        const off = getBrushOffset(area, progress, w, h, ctx2.rendererParams.motionScale);
        extraH += -off.dy * 0.5;
        extraX += off.dx * 0.3;
        if (off.scale > 1) extraH += (off.scale - 1) * 40;
      }
    }

    ctx.globalAlpha = alpha;
    const barColor = i === 3 ? colors.accent : i === 1 ? colors.primary + '99' : colors.surface;
    ctx.fillStyle = barColor;
    ctx.fillRect(baseX + i * 72 + extraX, baseY - bp * 180 + extraH, barW, bp * 180 - extraH);
  }
  ctx.globalAlpha = 1;
}

// ── Scene renderer ──

function drawScene(
  ctx: CanvasRenderingContext2D,
  scene: Scene,
  brand: ProjectBrand,
  elapsed: number,
  w: number,
  h: number,
  keyframeImgs: HTMLImageElement[],
  firstLastImgs: { start?: HTMLImageElement; end?: HTMLImageElement },
  renderCtx: RenderContext,
) {
  const progress = sceneProgress(scene, elapsed, renderCtx.physicsWeight);
  const alpha = sceneAlpha(scene, elapsed);
  if (alpha <= 0.01) return;

  const colors = resolveBrandDrawColors(brand);
  const font = brand.fontFamily;
  const name = brand.name || 'Forge';
  const params = scene.params ?? {};
  const textStyle = (scene.textVariant ?? renderCtx.rendererParams.textStyle) as TextAnimStyle;
  const endStyle = (scene.endCardVariant ?? renderCtx.rendererParams.endCardStyle) as EndCardCTAStyle;
  const brandWeight = brandAccentWeight(renderCtx.controls.brandIntensity);
  const logoPlacement = renderCtx.controls.logoPlacement ?? 'bottom-right';

  switch (scene.type) {
    case 'bg':
      drawGradientBg(ctx, w, h, colors, renderCtx.controls.moodTone);
      break;
    case 'sidebar':
      drawSidebar(ctx, h, colors, name, progress, brandWeight, font);
      break;
    case 'topbar':
      drawTopbar(ctx, w, name, progress, colors, font);
      break;
    case 'card':
      drawDashboardCard(ctx, w * 0.17, h * 0.13, w * 0.23, h * 0.2, colors, progress, (params.label as string) || 'AI Feature', alpha, renderCtx.physicsWeight, font);
      break;
    case 'progress':
      drawProgressRing(ctx, w * 0.33, h * 0.28, Math.min(w, h) * 0.06, progress, colors, alpha, renderCtx.physicsWeight, font);
      break;
    case 'linear':
      drawLinearProgress(ctx, w * 0.19, h * 0.37, w * 0.27, progress, colors, alpha);
      break;
    case 'metric': {
      const target = (params.target as number) ?? 78;
      drawMetricCounter(ctx, w * 0.47, h * 0.22, target, (params.label as string) || 'Impact', Math.floor(target * 0.15), colors, alpha, renderCtx.physicsWeight, progress, font);
      break;
    }
    case 'quote':
      drawTestimonialQuote(ctx, w * 0.17, h * 0.39, w * 0.44, (params.quote as string) || '', (params.author as string) || '', colors, progress, font);
      break;
    case 'kinetic':
      drawKineticText(ctx, (params.text as string) || 'GROW FASTER', w * 0.16, h * 0.18, elapsed, colors, progress, textStyle, font);
      break;
    case 'logo': {
      const layout = getLogoPlacementLayout(
        logoPlacement === 'watermark' || logoPlacement === 'top-left' || logoPlacement === 'bottom-right'
          ? 'hero'
          : logoPlacement,
        w,
        h,
      );
      drawLogoLockup(ctx, layout.x, layout.y, name, colors, (params.tagline as string) || brand.tagline || 'Make it real.', progress, brandWeight, font, layout.scale);
      break;
    }
    case 'bars':
      drawBarsWithBrush(ctx, w, h, progress, colors, alpha, renderCtx);
      break;
    case 'cta':
      drawCtaButton(ctx, w * 0.34, h * 0.48, (params.label as string) || brand.cta || 'Start free trial', colors, progress, endStyle, font);
      break;
    case 'endcard':
      drawEndCard(ctx, w, h, brand, progress, endStyle);
      break;
    case 'keyframe': {
      const idx = (params.index as number) ?? 0;
      const anchor = params.anchor as 'start' | 'end' | 'interp' | undefined;
      let img = keyframeImgs[idx];

      if (anchor === 'start' && firstLastImgs.start?.complete) {
        img = firstLastImgs.start;
      } else if (anchor === 'end' && firstLastImgs.end?.complete) {
        img = firstLastImgs.end;
      }

      if (img?.complete && img.naturalWidth > 0) {
        const anchorProgress = (params.anchorProgress as number) ?? progress;
        drawKeyframePanel(
          ctx, img, w, h, progress,
          (params.motion as string) || renderCtx.rendererParams.cameraMotion,
          colors, name, idx, keyframeImgs.length,
          renderCtx,
          font,
          anchor,
          anchor === 'interp' ? anchorProgress : undefined,
        );
      } else {
        drawDashboardCard(
          ctx, w * 0.36, h * 0.12, w * 0.55, h * 0.68,
          colors, progress, `Keyframe ${idx + 1}`, alpha, renderCtx.physicsWeight, font,
        );
      }
      break;
    }
  }
}

const MOTION_CYCLE = ['zoom-in', 'parallax', 'pan-left', 'zoom-in', 'pan-right'] as const;

function weaveKeyframeScenes(
  base: Scene[],
  keyframeCount: number,
  durationMs: number,
  controls?: VideoControls,
  hasFirstLast = false,
): Scene[] {
  if (keyframeCount <= 0 && !hasFirstLast) return ensureFullTimeline(base, durationMs);

  const scenes = base.filter((s) => s.type !== 'keyframe');
  const slotCount = Math.max(keyframeCount, hasFirstLast ? 2 : 0);
  const effectiveSlots = Math.min(Math.max(slotCount, 1), 5);
  const segmentMs = durationMs / (effectiveSlots + 1);
  const keyframeDur = Math.min(3800, Math.max(1800, Math.round(segmentMs * 0.42)));
  const cameraMotion = controls ? mapToRenderer(controls).cameraMotion : 'zoom-in';
  const motionScale = controls ? mapToRenderer(controls).motionScale : 1;

  for (let i = 0; i < effectiveSlots; i++) {
    const center = Math.round(segmentMs * (i + 1));
    const start = Math.max(0, center - Math.round(keyframeDur / 2));
    const end = Math.min(durationMs, start + keyframeDur);
    let anchor: 'start' | 'end' | 'interp' | undefined;
    if (hasFirstLast) {
      if (i === 0) anchor = 'start';
      else if (i === effectiveSlots - 1) anchor = 'end';
      else anchor = 'interp';
    }

    const motion = controls?.cameraStyle === 'orbiting'
      ? 'parallax'
      : MOTION_CYCLE[i % MOTION_CYCLE.length] ?? cameraMotion;

    scenes.push({
      start,
      end,
      type: 'keyframe',
      params: {
        index: Math.min(i, Math.max(0, keyframeCount - 1)),
        motion,
        anchor,
        anchorProgress: anchor === 'interp' ? i / Math.max(1, effectiveSlots - 1) : undefined,
      },
      cameraPath: controls
        ? { style: controls.cameraStyle, motion, intensity: motionScale }
        : undefined,
      moodTone: controls?.moodTone,
      textVariant: controls?.textAnimationStyle,
      endCardVariant: controls?.endCardCTAStyle,
    });
  }

  return ensureFullTimeline(scenes.sort((a, b) => a.start - b.start), durationMs);
}

function applyControlsToScenes(
  scenes: Scene[],
  controls: VideoControls,
  durationMs: number,
  proportional = false,
): Scene[] {
  const scaled = scaleTimingsForLength(
    scenes as unknown as ScaledSceneTiming[],
    controls.lengthSec,
    controls.pace,
    { proportional },
  ) as unknown as Scene[];

  return ensureFullTimeline(
    scaled.map((s) => ({
      ...s,
      end: Math.min(s.end, durationMs),
      moodTone: controls.moodTone,
      textVariant: controls.textAnimationStyle,
      endCardVariant: controls.endCardCTAStyle,
      cameraPath: s.cameraPath ?? {
        style: controls.cameraStyle,
        motion: mapToRenderer(controls).cameraMotion,
        intensity: mapToRenderer(controls).motionScale,
      },
    })),
    durationMs,
  );
}

/** Guarantee bg spans full duration and timeline reaches the end. */
function ensureFullTimeline(scenes: Scene[], durationMs: number): Scene[] {
  const result = scenes.map((s) => ({ ...s }));
  const bg = result.find((s) => s.type === 'bg');
  if (bg) {
    bg.start = 0;
    bg.end = durationMs;
  } else {
    result.unshift({ start: 0, end: durationMs, type: 'bg' });
  }
  return result;
}

function finalizeScenesWithEndCard(scenes: Scene[], duration: number, endCardStyle: EndCardCTAStyle): Scene[] {
  if (endCardStyle === 'branded-slate') {
    const filtered = scenes.filter((s) => s.type !== 'cta');
    filtered.push({ start: Math.round(duration * 0.88), end: duration, type: 'endcard' });
    return filtered;
  }
  return scenes;
}

function getScenesForVideoStyle(
  style: VideoStyle,
  brand: ProjectBrand,
  controls: VideoControls,
  duration: number,
): Scene[] {
  const p = defaultBrandParams(brand);
  const endCardStyle = controls.endCardCTAStyle;
  const d = duration;
  let scenes: Scene[];

  switch (style) {
    case 'promo-hook': {
      scenes = [
        { start: 0, end: d, type: 'bg' },
        { start: 0, end: Math.round(d * 0.2), type: 'kinetic', params: { text: p.kinetic } },
        { start: Math.round(d * 0.12), end: Math.round(d * 0.5), type: 'bars' },
        { start: Math.round(d * 0.32), end: Math.round(d * 0.68), type: 'metric', params: { label: p.metrics[0], target: 92 } },
        { start: Math.round(d * 0.65), end: d, type: 'cta', params: { label: p.cta } },
        { start: Math.round(d * 0.78), end: d, type: 'logo', params: { tagline: p.tagline } },
      ];
      break;
    }
    case 'testimonial': {
      scenes = [
        { start: 0, end: d, type: 'bg' },
        { start: 0, end: Math.round(d * 0.12), type: 'kinetic', params: { text: 'REAL RESULTS' } },
        { start: Math.round(d * 0.1), end: Math.round(d * 0.42), type: 'quote', params: { quote: p.quote.text, author: p.quote.author } },
        { start: Math.round(d * 0.35), end: Math.round(d * 0.62), type: 'metric', params: { label: p.metrics[0], target: 67 } },
        { start: Math.round(d * 0.52), end: Math.round(d * 0.78), type: 'card', params: { label: p.features[2] ?? 'Team View' } },
        { start: Math.round(d * 0.72), end: d, type: 'logo', params: { tagline: p.tagline } },
        { start: Math.round(d * 0.82), end: d, type: 'cta', params: { label: p.cta } },
      ];
      break;
    }
    case 'how-it-works': {
      scenes = [
        { start: 0, end: d, type: 'bg' },
        { start: 0, end: Math.round(d * 0.1), type: 'kinetic', params: { text: 'HOW IT WORKS' } },
        { start: Math.round(d * 0.08), end: Math.round(d * 0.22), type: 'sidebar' },
        { start: Math.round(d * 0.18), end: Math.round(d * 0.38), type: 'card', params: { label: `Step 1 — ${p.features[0]}` } },
        { start: Math.round(d * 0.32), end: Math.round(d * 0.52), type: 'progress' },
        { start: Math.round(d * 0.46), end: Math.round(d * 0.66), type: 'card', params: { label: `Step 2 — ${p.features[1]}` } },
        { start: Math.round(d * 0.58), end: Math.round(d * 0.78), type: 'metric', params: { label: p.metrics[0], target: 85 } },
        { start: Math.round(d * 0.72), end: d, type: 'logo', params: { tagline: p.tagline } },
        { start: Math.round(d * 0.82), end: d, type: 'cta', params: { label: p.cta } },
      ];
      break;
    }
    case 'vertical-social': {
      scenes = [
        { start: 0, end: d, type: 'bg' },
        { start: 0, end: Math.round(d * 0.25), type: 'kinetic', params: { text: p.kinetic } },
        { start: Math.round(d * 0.18), end: Math.round(d * 0.55), type: 'bars' },
        { start: Math.round(d * 0.42), end: Math.round(d * 0.75), type: 'metric', params: { label: p.metrics[1] ?? 'Growth', target: 84 } },
        { start: Math.round(d * 0.68), end: d, type: 'cta', params: { label: p.cta } },
      ];
      break;
    }
    case 'product-deep-dive': {
      scenes = [
        { start: 0, end: d, type: 'bg' },
        { start: 0, end: Math.round(d * 0.08), type: 'kinetic', params: { text: p.features[0].toUpperCase() } },
        { start: Math.round(d * 0.06), end: Math.round(d * 0.2), type: 'sidebar' },
        { start: Math.round(d * 0.14), end: Math.round(d * 0.32), type: 'card', params: { label: p.features[0] } },
        { start: Math.round(d * 0.28), end: Math.round(d * 0.46), type: 'progress' },
        { start: Math.round(d * 0.4), end: Math.round(d * 0.58), type: 'card', params: { label: p.features[1] } },
        { start: Math.round(d * 0.52), end: Math.round(d * 0.7), type: 'linear' },
        { start: Math.round(d * 0.64), end: Math.round(d * 0.82), type: 'metric', params: { label: p.metrics[0], target: 94 } },
        { start: Math.round(d * 0.74), end: Math.round(d * 0.9), type: 'quote', params: { quote: p.quote.text, author: p.quote.author } },
        { start: Math.round(d * 0.84), end: d, type: 'logo', params: { tagline: p.tagline } },
        { start: Math.round(d * 0.88), end: d, type: 'cta', params: { label: p.cta } },
      ];
      break;
    }
    case 'explainer':
    default: {
      scenes = [
        { start: 0, end: d, type: 'bg' },
        { start: 0, end: Math.round(d * 0.16), type: 'kinetic', params: { text: p.kinetic } },
        { start: Math.round(d * 0.12), end: Math.round(d * 0.2), type: 'sidebar' },
        { start: Math.round(d * 0.16), end: Math.round(d * 0.38), type: 'card', params: { label: p.features[0] } },
        { start: Math.round(d * 0.3), end: Math.round(d * 0.48), type: 'progress' },
        { start: Math.round(d * 0.42), end: Math.round(d * 0.6), type: 'metric', params: { label: p.metrics[0], target: 78 } },
        { start: Math.round(d * 0.54), end: Math.round(d * 0.72), type: 'card', params: { label: p.features[1] } },
        { start: Math.round(d * 0.64), end: Math.round(d * 0.82), type: 'quote', params: { quote: p.quote.text, author: p.quote.author } },
        { start: Math.round(d * 0.76), end: d, type: 'logo', params: { tagline: p.tagline } },
        { start: Math.round(d * 0.84), end: d, type: 'cta', params: { label: p.cta } },
      ];
      break;
    }
  }

  scenes = finalizeScenesWithEndCard(scenes, d, endCardStyle);
  return applyControlsToScenes(scenes, controls, d, true);
}

function getTemplateScenes(id: TemplateId, brand: ProjectBrand, controls?: VideoControls): Scene[] {
  const p = defaultBrandParams(brand);
  const duration = controls ? resolveLengthMs(controls) : TEMPLATE_DURATIONS[id];
  const endCardStyle = controls?.endCardCTAStyle ?? 'standard';

  let scenes: Scene[];

  if (id === 'product-explainer-30s') {
    scenes = [
      { start: 0, end: duration, type: 'bg' },
      { start: 0, end: 4800, type: 'kinetic', params: { text: p.kinetic } },
      { start: 3800, end: 5200, type: 'sidebar' },
      { start: 4200, end: 5600, type: 'topbar' },
      { start: 5000, end: 12000, type: 'card', params: { label: p.features[0] } },
      { start: 8800, end: 13200, type: 'progress' },
      { start: 11800, end: 16800, type: 'metric', params: { label: p.metrics[0], target: 78 } },
      { start: 15200, end: 20000, type: 'card', params: { label: p.features[1] } },
      { start: 18600, end: 22800, type: 'bars' },
      { start: 21000, end: 26400, type: 'quote', params: { quote: p.quote.text, author: p.quote.author } },
      { start: 25000, end: duration, type: 'logo', params: { tagline: p.tagline } },
      { start: 26800, end: duration, type: 'cta', params: { label: p.cta } },
    ];
  } else if (id === 'feature-deep-dive') {
    scenes = [
      { start: 0, end: duration, type: 'bg' },
      { start: 0, end: 4000, type: 'kinetic', params: { text: p.features[0].toUpperCase() } },
      { start: 3200, end: 5200, type: 'sidebar' },
      { start: 3800, end: 5600, type: 'topbar' },
      { start: 4800, end: 14000, type: 'card', params: { label: p.features[1] } },
      { start: 10000, end: 15200, type: 'linear' },
      { start: 12800, end: 18800, type: 'progress' },
      { start: 16800, end: 22800, type: 'metric', params: { label: p.metrics[1] ?? 'Accuracy', target: 94 } },
      { start: 21000, end: 26800, type: 'quote', params: { quote: p.quote.text, author: p.quote.author } },
      { start: 25200, end: duration, type: 'logo', params: { tagline: p.tagline } },
      { start: 27200, end: duration, type: 'cta', params: { label: p.cta } },
    ];
  } else if (id === 'customer-story') {
    scenes = [
      { start: 0, end: duration, type: 'bg' },
      { start: 0, end: 3600, type: 'kinetic', params: { text: 'REAL RESULTS' } },
      { start: 2800, end: 8200, type: 'quote', params: { quote: p.quote.text, author: p.quote.author } },
      { start: 7200, end: 14000, type: 'bars' },
      { start: 12000, end: 20000, type: 'metric', params: { label: p.metrics[0], target: 67 } },
      { start: 17800, end: 24800, type: 'card', params: { label: p.features[2] ?? 'Team View' } },
      { start: 23200, end: duration, type: 'logo', params: { tagline: p.tagline } },
      { start: 26200, end: duration, type: 'cta', params: { label: p.cta } },
    ];
  } else {
    scenes = [
      { start: 0, end: duration, type: 'bg' },
      { start: 0, end: 5000, type: 'kinetic', params: { text: 'HOW IT WORKS' } },
      { start: 4000, end: 8800, type: 'sidebar' },
      { start: 7200, end: 15200, type: 'card', params: { label: `Step 1 — ${p.features[0]}` } },
      { start: 12800, end: 21000, type: 'progress' },
      { start: 18800, end: 28000, type: 'card', params: { label: `Step 2 — ${p.features[1]}` } },
      { start: 24800, end: 34000, type: 'metric', params: { label: p.metrics[0], target: 85 } },
      { start: 31000, end: 39000, type: 'quote', params: { quote: p.quote.text, author: p.quote.author } },
      { start: 36800, end: duration, type: 'logo', params: { tagline: p.tagline } },
      { start: 40800, end: duration, type: 'cta', params: { label: p.cta } },
    ];
  }

  scenes = finalizeScenesWithEndCard(scenes, duration, endCardStyle);

  if (controls) {
    return applyControlsToScenes(scenes, controls, duration);
  }
  return scenes;
}

/** Build the full scene timeline (base + keyframe weave) for tests and diagnostics. */
export function buildRenderScenes(
  templateId: TemplateId | undefined,
  goal: string,
  brand: ProjectBrand,
  controls: VideoControls,
  keyframeCount = 0,
): Scene[] {
  const durationMs = resolveLengthMs(controls);
  const base = getScenesForTemplateOrGoal(templateId, goal, brand, 0, controls);
  const hasFirstLast = !!(
    controls.firstLastFrameRefs.start ||
    controls.firstLastFrameRefs.end
  );
  return weaveKeyframeScenes(base, keyframeCount, durationMs, controls, hasFirstLast);
}

export function getScenesForTemplateOrGoal(
  templateId: TemplateId | undefined,
  goal: string,
  brand: ProjectBrand,
  _keyframeCount = 0,
  controls?: VideoControls,
): Scene[] {
  const duration = controls
    ? resolveLengthMs(controls)
    : templateId
      ? TEMPLATE_DURATIONS[templateId]
      : 30000;

  let base: Scene[];

  if (controls?.videoStyle && controls.videoStyle !== 'custom') {
    base = getScenesForVideoStyle(controls.videoStyle, brand, controls, duration);
  } else if (templateId && TEMPLATE_LABELS[templateId]) {
    base = getTemplateScenes(templateId, brand, controls);
  } else {
    const p = defaultBrandParams(brand);
    const hook = goal.slice(0, 18).toUpperCase() || p.kinetic;
    base = [
      { start: 0, end: duration, type: 'bg' },
      { start: 0, end: 4600, type: 'kinetic', params: { text: hook } },
      { start: 3800, end: 6800, type: 'sidebar' },
      { start: 5800, end: 13200, type: 'card', params: { label: p.features[0] } },
      { start: 10800, end: 16800, type: 'progress' },
      { start: 14800, end: 20800, type: 'metric', params: { label: p.metrics[0], target: 72 } },
      { start: 19200, end: 25200, type: 'quote', params: { quote: p.quote.text, author: p.quote.author } },
      { start: 23800, end: duration, type: 'logo', params: { tagline: p.tagline } },
      { start: 26800, end: duration, type: 'cta', params: { label: p.cta } },
    ];
    if (controls) {
      base = applyControlsToScenes(base, controls, duration);
    }
  }

  return base;
}

export function createHyperframesRenderer(
  container: HTMLElement,
  brand: ProjectBrand,
  scenesOrTemplate: Scene[] | TemplateId,
  opts: RenderOptions = {},
) {
  const renderCtx = resolveRenderContext(opts);
  const dims = opts.controls
    ? getCanvasDimensions(opts.controls.aspectRatio, opts.controls.customAspect)
    : { width: opts.width ?? DEFAULT_WIDTH, height: opts.height ?? DEFAULT_HEIGHT };

  const width = opts.width ?? dims.width;
  const height = opts.height ?? dims.height;
  const fps = opts.fps ?? renderCtx.rendererParams.fps ?? DEFAULT_FPS;
  const durationMs = opts.durationMs
    ?? (opts.controls ? resolveLengthMs(opts.controls) : (opts.templateId ? TEMPLATE_DURATIONS[opts.templateId] : 30000));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  container.innerHTML = '';
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d', { alpha: false })!;
  let animationFrame = 0;
  let startTime = 0;
  let isRunning = false;

  const keyframeImgs: HTMLImageElement[] = [];
  if (opts.keyframeImages?.length) {
    opts.keyframeImages.forEach((src, i) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = src;
      keyframeImgs[i] = img;
    });
  }

  const firstLastImgs: { start?: HTMLImageElement; end?: HTMLImageElement } = {};
  const fl = opts.controls?.firstLastFrameRefs;
  if (fl?.start && !fl.start.startsWith('__generate')) {
    const startImg = new Image();
    startImg.crossOrigin = 'anonymous';
    startImg.src = fl.start;
    firstLastImgs.start = startImg;
  }
  if (fl?.end && !fl.end.startsWith('__generate')) {
    const endImg = new Image();
    endImg.crossOrigin = 'anonymous';
    endImg.src = fl.end;
    firstLastImgs.end = endImg;
  }

  const hasFirstLast = !!(fl?.start || fl?.end);

  const baseScenes: Scene[] = Array.isArray(scenesOrTemplate)
    ? scenesOrTemplate
    : getScenesForTemplateOrGoal(scenesOrTemplate, '', brand, 0, opts.controls);

  let currentScenes = weaveKeyframeScenes(
    baseScenes,
    keyframeImgs.length,
    durationMs,
    opts.controls,
    hasFirstLast,
  );

  function draw(elapsed: number) {
    const colors = resolveBrandDrawColors(brand);
    const font = brand.fontFamily;
    const brandWeight = brandAccentWeight(renderCtx.controls.brandIntensity);
    const chromeProgress = easeOutCubic(Math.min(1, elapsed / 900));

    ctx.clearRect(0, 0, width, height);
    drawGradientBg(ctx, width, height, colors, renderCtx.controls.moodTone);

    const activeSidebar = currentScenes.find(
      (s) => s.type === 'sidebar' && elapsed >= s.start && elapsed <= s.end,
    );
    const sidebarProgress = activeSidebar
      ? sceneProgress(activeSidebar, elapsed, renderCtx.physicsWeight)
      : chromeProgress;
    drawSidebar(ctx, height, colors, brand.name, sidebarProgress, brandWeight, font);
    drawTopbar(ctx, width, brand.name, chromeProgress, colors, font);

    const motionScenes = currentScenes.filter(
      (s) => s.type !== 'bg' && s.type !== 'keyframe',
    );
    const keyframeScenes = currentScenes.filter((s) => s.type === 'keyframe');

    for (const scene of motionScenes) {
      if (scene.type === 'logo' && shouldDrawPersistentLogo(renderCtx.controls, elapsed, durationMs)) continue;
      if (elapsed >= scene.start && elapsed <= scene.end) {
        drawScene(ctx, scene, brand, elapsed, width, height, keyframeImgs, firstLastImgs, renderCtx);
      }
    }

    for (const scene of keyframeScenes) {
      if (elapsed >= scene.start && elapsed <= scene.end) {
        drawScene(ctx, scene, brand, elapsed, width, height, keyframeImgs, firstLastImgs, renderCtx);
      }
    }

    if (shouldDrawPersistentLogo(renderCtx.controls, elapsed, durationMs)) {
      const placement = renderCtx.controls.logoPlacement ?? 'bottom-right';
      const layout = getLogoPlacementLayout(placement, width, height);
      drawLogoLockup(
        ctx,
        layout.x,
        layout.y,
        brand.name,
        colors,
        brand.tagline ?? 'Make it real.',
        1,
        brandWeight,
        font,
        layout.scale,
        layout.opacity,
      );
    }

    applyLensOptics(ctx, width, height, renderCtx.controls.lensOptics, elapsed / durationMs);
  }

  function animate(now: number) {
    if (!isRunning) return;
    if (!startTime) startTime = now;
    const elapsed = now - startTime;
    draw(elapsed);
    animationFrame = requestAnimationFrame(animate);
  }

  function start() {
    isRunning = true;
    startTime = 0;
    animationFrame = requestAnimationFrame(animate);
  }

  function stop() {
    isRunning = false;
    if (animationFrame) cancelAnimationFrame(animationFrame);
  }

  function seek(ms: number) {
    draw(Math.max(0, ms));
  }

  async function record(recordDurationMs = durationMs): Promise<Blob> {
    const recordFps = fps;
    const stream = canvas.captureStream(recordFps);
    const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm';
    const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 12_000_000 });
    const chunks: Blob[] = [];

    return new Promise((resolve) => {
      recorder.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        resolve(blob);
      };

      stop();
      isRunning = false;
      if (animationFrame) cancelAnimationFrame(animationFrame);

      recorder.start(Math.max(100, Math.round(1000 / recordFps)));
      const recordStart = performance.now();
      const frameMs = 1000 / recordFps;

      const pumpFrame = () => {
        const elapsed = performance.now() - recordStart;
        if (elapsed >= recordDurationMs) {
          draw(recordDurationMs);
          const track = stream.getVideoTracks()[0] as MediaStreamTrack & { requestFrame?: () => void };
          track.requestFrame?.();
          recorder.stop();
          return;
        }
        draw(elapsed);
        const track = stream.getVideoTracks()[0] as MediaStreamTrack & { requestFrame?: () => void };
        track.requestFrame?.();
        setTimeout(pumpFrame, frameMs);
      };

      pumpFrame();
    });
  }

  start();

  return {
    canvas,
    start,
    stop,
    record,
    seek,
    getScenes: () => currentScenes,
    durationMs,
    controls: renderCtx.controls,
    width,
    height,
  };
}

function buildEndCardFilter(
  style: EndCardCTAStyle,
  brandName: string,
  tagline: string,
  accentHex: string,
  durationSec: number,
): string[] {
  const fadeOutStart = Math.max(0, durationSec - 1.2).toFixed(2);
  const filters: string[] = [
    'fade=t=in:st=0:d=0.6',
    `fade=t=out:st=${fadeOutStart}:d=1.0`,
  ];

  if (style === 'minimal') {
    filters.push(`drawtext=text='${brandName}':fontcolor=0x${accentHex}:fontsize=22:x=44:y=H-72:alpha=0.85`);
  } else if (style === 'bold') {
    filters.push(`drawtext=text='${brandName}':fontcolor=0x${accentHex}:fontsize=42:x=(w-text_w)/2:y=H-120:alpha=0.95`);
    filters.push(`drawtext=text='${tagline}':fontcolor=0xffffff:fontsize=28:x=(w-text_w)/2:y=H-70:alpha=0.9`);
  } else if (style === 'branded-slate') {
    filters.push(`drawbox=x=0:y=H-140:w=iw:h=140:color=0x060a14@0.85:t=fill`);
    filters.push(`drawtext=text='${brandName}':fontcolor=0x${accentHex}:fontsize=34:x=44:y=H-100:alpha=0.95`);
    filters.push(`drawtext=text='${tagline}':fontcolor=0xaaaaaa:fontsize=20:x=44:y=H-60:alpha=0.8`);
  } else {
    filters.push(`drawtext=text='${brandName}':fontcolor=0x${accentHex}:fontsize=30:x=44:y=H-88:alpha=0.9`);
    filters.push(`drawtext=text='${tagline}':fontcolor=0xaaaaaa:fontsize=17:x=44:y=H-52:alpha=0.75`);
  }

  return filters;
}

function buildMusicMixArgs(syncLevel: string, hasAudio: boolean): string[] {
  if (!hasAudio || syncLevel === 'none') return ['-an'];
  const volume = syncLevel === 'strong' ? 0.85 : syncLevel === 'medium' ? 0.6 : 0.35;
  return ['-filter_complex', `[1:a]volume=${volume}[aout]`, '-map', '0:v', '-map', '[aout]', '-shortest'];
}

export async function postProcessWithFFmpeg(
  inputBlob: Blob,
  opts: {
    preset: QualityPreset;
    brand: ProjectBrand;
    durationMs: number;
    width: number;
    height: number;
    controls?: VideoControls;
  },
): Promise<PostProcessResult> {
  const preset = QUALITY_PRESETS[opts.preset];
  const controls = opts.controls ?? DEFAULT_VIDEO_CONTROLS;
  const colors = resolveBrandDrawColors(opts.brand);
  const brandName = opts.brand.name.replace(/'/g, "\\'");
  const tagline = (opts.brand.tagline ?? 'Marketing preview').replace(/'/g, "\\'");
  const accentHex = (colors.primary || opts.brand.accent || '#6366f1').replace('#', '');
  const durationSec = opts.durationMs / 1000;

  try {
    const ffmpeg = await ensureFFmpeg();
    const inputName = 'input.webm';
    const outputName = 'final.mp4';
    const audioName = 'music.mp3';

    await ffmpeg.writeFile(inputName, new Uint8Array(await inputBlob.arrayBuffer()));

    const aspectFilter = `scale=${opts.width}:${opts.height}:force_original_aspect_ratio=decrease,pad=${opts.width}:${opts.height}:(ow-iw)/2:(oh-ih)/2:black`;
    const endCardFilters = buildEndCardFilter(controls.endCardCTAStyle, brandName, tagline, accentHex, durationSec);

    let textBurnFilter = '';
    if (controls.textAnimationStyle === 'bold-reveal') {
      textBurnFilter = `,drawtext=text='${brandName}':fontcolor=0xffffff:fontsize=36:x=(w-text_w)/2:y=80:enable='between(t,0.5,${Math.min(3, durationSec).toFixed(1)})':alpha=0.9`;
    } else if (controls.textAnimationStyle === 'kinetic') {
      textBurnFilter = `,drawtext=text='${brandName}':fontcolor=0x${accentHex}:fontsize=32:x=44:y=60:enable='between(t,0.3,${Math.min(2.5, durationSec).toFixed(1)})':alpha=0.85`;
    }

    const vf = [aspectFilter, ...endCardFilters].join(',') + textBurnFilter;

    const hasMusic = !!controls.musicAudioUrl && controls.musicSyncLevel !== 'none';
    const cmd: string[] = ['-i', inputName];

    if (hasMusic) {
      try {
        const audioRes = await fetch(controls.musicAudioUrl!);
        if (audioRes.ok) {
          await ffmpeg.writeFile(audioName, new Uint8Array(await audioRes.arrayBuffer()));
          cmd.push('-i', audioName);
        }
      } catch {
        // music optional — continue without
      }
    }

    const hasAudioInput = cmd.length > 2;
    cmd.push(
      '-c:v', 'libx264',
      '-crf', String(preset.crf),
      '-preset', preset.preset,
      '-r', String(preset.fps),
      '-pix_fmt', 'yuv420p',
      '-vf', vf,
    );

    if (hasAudioInput) {
      cmd.push(...buildMusicMixArgs(controls.musicSyncLevel, true));
    } else {
      cmd.push('-an');
    }

    cmd.push('-t', durationSec.toFixed(3), '-movflags', '+faststart', outputName);

    const exitCode = await ffmpeg.exec(cmd);
    if (exitCode !== 0) {
      throw new Error(`FFmpeg exited with code ${exitCode}`);
    }

    const data = await ffmpeg.readFile(outputName);
    try {
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);
      if (hasAudioInput) await ffmpeg.deleteFile(audioName);
    } catch {
      // non-fatal cleanup
    }

    const syncNote = controls.musicSyncLevel !== 'none' ? ` + music ${controls.musicSyncLevel}` : '';
    const aspectNote = controls.aspectRatio !== '16:9' ? ` ${controls.aspectRatio}` : '';

    return {
      blob: new Blob([data as BlobPart], { type: 'video/mp4' }),
      usedFFmpeg: true,
      format: 'mp4',
      note: `Local Hyperframes + FFmpeg (${preset.label}${aspectNote}${syncNote})`,
    };
  } catch (err) {
    console.warn('FFmpeg post-process failed, using raw WebM', err);
    return {
      blob: inputBlob,
      usedFFmpeg: false,
      format: 'webm',
      note: `Local Hyperframes (raw WebM ${preset.label}) — FFmpeg unavailable: ${err instanceof Error ? err.message.slice(0, 80) : 'unknown error'}`,
    };
  }
}

export async function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function createSaaSAnimationCanvas(
  container: HTMLElement,
  project: {
    name: string;
    colors: string;
    uiElements?: string;
    tone?: string;
    kineticHook?: string;
    featureLabels?: string[];
    metricLabels?: string[];
    quote?: { text: string; author: string };
    cta?: string;
    tagline?: string;
    brandPalette?: import('./videoControls').BrandPalette;
    fontFamily?: string;
  },
  goal: string,
  opts: RenderOptions = {},
) {
  const controls = opts.controls ?? DEFAULT_VIDEO_CONTROLS;
  const resolvedPalette =
    project.brandPalette
    ?? controls.brandPalette
    ?? resolveBrandPalette(controls, project.colors);
  const accent =
    resolvedPalette.accent
    ?? project.colors?.match(/#[0-9A-Fa-f]{6}/)?.[0]
    ?? project.colors
    ?? '#6366f1';
  const brand: ProjectBrand = {
    name: project.name,
    accent,
    tone: project.tone,
    uiElements: project.uiElements,
    kineticHook: project.kineticHook,
    featureLabels: project.featureLabels,
    metricLabels: project.metricLabels,
    quote: project.quote,
    cta: project.cta,
    tagline: project.tagline,
    brandPalette: resolvedPalette,
    fontFamily: project.fontFamily ?? controls.fontFamily,
  };
  const rendererParams = mapToRenderer(controls, opts.fps);
  const durationMs = opts.durationMs ?? rendererParams.durationMs;

  const scenes = getScenesForTemplateOrGoal(
    opts.templateId,
    goal,
    brand,
    opts.keyframeImages?.length ?? 0,
    controls,
  );

  return createHyperframesRenderer(container, brand, scenes, {
    ...opts,
    controls,
    width: opts.width ?? rendererParams.width,
    height: opts.height ?? rendererParams.height,
    durationMs,
    fps: opts.fps ?? rendererParams.fps,
    keyframeImages: opts.keyframeImages,
  });
}

// Re-export controls helpers for convenience
export {
  DEFAULT_VIDEO_CONTROLS,
  loadPremiumPreset,
  listPremiumPresets,
  getCanvasDimensions,
  mapToRenderer,
  scaleTimingsForLength,
  injectControlsToPrompt,
} from './videoControls';
export type { VideoControls, PremiumPresetBundle } from './videoControls';