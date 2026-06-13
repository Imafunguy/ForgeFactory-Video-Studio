export type StepStatus = 'pending' | 'active' | 'complete' | 'error' | 'paused';

export interface PipelineStepDef {
  id: string;
  label: string;
  description: string;
  phase: 'intelligence' | 'local';
  etaSeconds: number;
}

export const STUDIO_PIPELINE_STEPS: PipelineStepDef[] = [
  { id: 'planning', label: 'Planning', description: 'Script & storyboard', phase: 'intelligence', etaSeconds: 18 },
  { id: 'keyframes', label: 'Keyframes', description: 'Asset prompts', phase: 'intelligence', etaSeconds: 14 },
  { id: 'assembly', label: 'Assembly', description: 'Hyperframes setup', phase: 'local', etaSeconds: 6 },
  { id: 'render', label: 'Local Render', description: 'Hyperframes + export', phase: 'local', etaSeconds: 16 },
];

export type KeyframeImageStatus = 'pending' | 'generating' | 'complete' | 'error';

export interface KeyframeAsset {
  id: number;
  label: string;
  prompt: string;
  imageUrl?: string;
  imageStatus?: KeyframeImageStatus;
  imageError?: string;
}

export type RenderSource = 'local' | 'cloud' | 'cloud-fallback';

export interface VariantResult {
  id: number;
  plan: string;
  score: number;
  strategy: string;
  selected: boolean;
}

export interface PremiumGateSnapshot {
  category: string;
  pass: boolean;
  score: number;
  issues: string[];
}

export interface StudioOutput {
  goal: string;
  script: string;
  imagePrompts: string;
  hyperDesc: string;
  keyframes: KeyframeAsset[];
  timestamp: number;
  voiceAudioUrl?: string;
  cloudVideoUrl?: string;
  renderSource?: RenderSource;
  renderNote?: string;
  videoModel?: string;
  voiceModel?: string;
  /** Serialized VideoControls snapshot used for this generation */
  controlsSnapshot?: string;
  activePresetId?: string;
  qualityScore?: number;
  planRefined?: boolean;
  premiumGates?: PremiumGateSnapshot[];
  variantResults?: VariantResult[];
}

export interface AgenticToolCall {
  id: string;
  stepId: string;
  tool: string;
  model: string;
  modelLabel: string;
  costTier?: string;
  status: StepStatus;
  message: string;
  startedAt: number;
  endedAt?: number;
}

export interface AgenticState {
  goal: string;
  script: string;
  imagePrompts: string;
  hyperDesc: string;
  keyframes: KeyframeAsset[];
  stepStatuses: Record<string, StepStatus>;
  toolCalls: AgenticToolCall[];
  currentStepId: string | null;
  paused: boolean;
  readyToRender: boolean;
  timestamp: number;
  voiceAudioUrl?: string;
  cloudVideoUrl?: string;
  renderSource?: RenderSource;
  renderNote?: string;
  controlsSnapshot?: string;
  activePresetId?: string;
  premiumGates?: PremiumGateSnapshot[];
  variantResults?: VariantResult[];
}

export function createInitialStepStatuses(): Record<string, StepStatus> {
  return Object.fromEntries(STUDIO_PIPELINE_STEPS.map(s => [s.id, 'pending' as StepStatus]));
}

export function createInitialAgenticState(): AgenticState {
  return {
    goal: '',
    script: '',
    imagePrompts: '',
    hyperDesc: '',
    keyframes: [],
    stepStatuses: createInitialStepStatuses(),
    toolCalls: [],
    currentStepId: null,
    paused: false,
    readyToRender: false,
    timestamp: 0,
  };
}

const KEYFRAME_ROLE_LABELS = ['Hook', 'Reveal', 'Feature', 'Proof', 'CTA'] as const;

function cleanKeyframePrompt(text: string): string {
  return text
    .replace(/^\*+|\*+$/g, '')
    .replace(/^#+\s*/, '')
    .replace(/^\d+[\.\):\-]\s*/, '')
    .replace(/^keyframe\s*\d+\s*[:.\-]?\s*/i, '')
    .replace(/^\[(hook|reveal|feature|proof|cta)\]\s*/i, '')
    .trim();
}

function labelForKeyframe(index: number, prompt: string): string {
  const roleMatch = prompt.match(/\[(HOOK|REVEAL|FEATURE|PROOF|CTA)\]/i);
  if (roleMatch) return roleMatch[1].charAt(0).toUpperCase() + roleMatch[1].slice(1).toLowerCase();
  return KEYFRAME_ROLE_LABELS[index] ?? `Keyframe ${index + 1}`;
}

export function parseKeyframes(imagePrompts: string): KeyframeAsset[] {
  if (!imagePrompts.trim()) return [];

  const keyframes: KeyframeAsset[] = [];

  // Prefer explicit numbered blocks (1. ... 2. ...)
  const numberedBlocks = imagePrompts.split(/\n(?=\d+[\.\):\-]\s)/);
  if (numberedBlocks.length >= 2) {
    numberedBlocks.forEach((block) => {
      const text = cleanKeyframePrompt(block.trim());
      if (text.length > 30) {
        keyframes.push({
          id: keyframes.length + 1,
          label: labelForKeyframe(keyframes.length, text),
          prompt: text,
        });
      }
    });
  }

  // KEYFRAME 1: style
  if (keyframes.length < 3) {
    const altBlocks = imagePrompts.split(/\n(?=KEYFRAME\s*\d+)/i);
    altBlocks.forEach((block) => {
      const text = cleanKeyframePrompt(block.trim());
      if (text.length > 30 && !keyframes.some(k => k.prompt === text)) {
        keyframes.push({
          id: keyframes.length + 1,
          label: labelForKeyframe(keyframes.length, text),
          prompt: text,
        });
      }
    });
  }

  // Line-by-line fallback
  if (keyframes.length === 0) {
    const lines = imagePrompts.split('\n').map(l => l.trim()).filter(Boolean);
    let buffer = '';

    const flush = () => {
      const text = cleanKeyframePrompt(buffer);
      if (text.length > 30) {
        keyframes.push({
          id: keyframes.length + 1,
          label: labelForKeyframe(keyframes.length, text),
          prompt: text,
        });
      }
      buffer = '';
    };

    for (const line of lines) {
      if (/^\d+[\.\):\-]\s/.test(line) && buffer) flush();
      buffer += (buffer ? ' ' : '') + line;
      if (keyframes.length >= 5 && /^\d+[\.\):\-]\s/.test(line)) break;
    }
    flush();
  }

  if (keyframes.length === 0) {
    const chunks = imagePrompts.split(/\n\n+/).filter(c => c.trim().length > 30);
    chunks.slice(0, 5).forEach((chunk) => {
      const text = cleanKeyframePrompt(chunk);
      keyframes.push({
        id: keyframes.length + 1,
        label: labelForKeyframe(keyframes.length, text),
        prompt: text,
      });
    });
  }

  if (keyframes.length === 0 && imagePrompts.trim()) {
    keyframes.push({
      id: 1,
      label: 'Hook',
      prompt: cleanKeyframePrompt(imagePrompts.trim()).slice(0, 500),
    });
  }

  return keyframes.slice(0, 6);
}

export function estimateRemainingSeconds(
  steps: PipelineStepDef[],
  stepStatuses: Record<string, StepStatus>,
  currentStepId: string | null
): number {
  let total = 0;
  let foundCurrent = !currentStepId;

  for (const step of steps) {
    const status = stepStatuses[step.id];
    if (status === 'complete') continue;
    if (step.id === currentStepId) {
      foundCurrent = true;
      total += Math.round(step.etaSeconds * 0.6);
      continue;
    }
    if (!foundCurrent) continue;
    if (status === 'pending' || status === 'active' || status === 'paused') {
      total += step.etaSeconds;
    }
  }
  return total;
}

export function computeProgress(stepStatuses: Record<string, StepStatus>): number {
  const steps = STUDIO_PIPELINE_STEPS;
  const complete = steps.filter(s => stepStatuses[s.id] === 'complete').length;
  const active = steps.some(s => stepStatuses[s.id] === 'active');
  return Math.min(100, Math.round((complete / steps.length) * 100 + (active ? 8 : 0)));
}