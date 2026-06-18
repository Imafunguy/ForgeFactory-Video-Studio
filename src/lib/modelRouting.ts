import type { AspectRatio } from './videoControls';

export type PipelinePresetId = 'cheap-test-render' | 'best-value-promo' | 'premium-final-render';
export type PipelineStage = 'reasoning' | 'image' | 'video' | 'voice';
export type VideoGenerationMode = 'text-to-video' | 'image-to-video' | 'first-last-frame';
export type VideoQualityTarget = 'draft' | 'standard' | 'premium';
export type VideoResolution = '480p' | '720p' | '1080p' | '4K';

export interface PipelineModelStack {
  id: PipelinePresetId;
  label: string;
  description: string;
  models: Record<PipelineStage, string>;
}

export interface VideoModelJob {
  duration: number;
  aspectRatio: Extract<AspectRatio, '9:16' | '16:9' | '1:1'>;
  resolution: VideoResolution;
  mode: VideoGenerationMode;
  needsAudio: boolean;
  quality: VideoQualityTarget;
  maxCostUsd?: number;
}

export const PIPELINE_MODEL_STACKS: Record<PipelinePresetId, PipelineModelStack> = {
  'cheap-test-render': {
    id: 'cheap-test-render',
    label: 'Cheapest Useful',
    description: 'High-volume testing, prototypes, and budget-tier users (ForgeFactoryModels.md).',
    models: {
      reasoning: 'qwen/qwen3.5-flash',
      image: 'google/gemini-2.5-flash-image-preview:free',
      video: 'x-ai/grok-imagine-video',
      voice: 'hexgrad/kokoro-82m',
    },
  },
  'best-value-promo': {
    id: 'best-value-promo',
    label: 'Best Value (Default)',
    description: 'Recommended daily production stack from ForgeFactoryModels.md.',
    models: {
      reasoning: 'qwen/qwen3.6-plus',
      image: 'google/gemini-2.5-flash-image',
      video: 'minimax/hailuo-2.3',
      voice: 'openai/gpt-audio-mini',
    },
  },
  'premium-final-render': {
    id: 'premium-final-render',
    label: 'Best High-End',
    description: 'Maximum quality final output — use after draft approval (ForgeFactoryModels.md).',
    models: {
      reasoning: 'x-ai/grok-4.20',
      image: 'google/gemini-3-pro-image-preview',
      video: 'google/veo-3.1',
      voice: 'google/gemini-3.1-flash-tts-preview',
    },
  },
};

export function getPipelineStack(id: PipelinePresetId): PipelineModelStack {
  return PIPELINE_MODEL_STACKS[id];
}

export function listPipelineStacks(): PipelineModelStack[] {
  return Object.values(PIPELINE_MODEL_STACKS);
}

export function selectVideoModel(job: VideoModelJob): string {
  if (job.quality === 'draft') return 'x-ai/grok-imagine-video';
  if (job.maxCostUsd !== undefined && job.maxCostUsd <= 0.5 && job.duration <= 8) {
    return 'google/veo-3.1-lite';
  }
  if (job.mode === 'first-last-frame' && job.quality === 'standard') {
    return 'kwaivgi/kling-v3.0-pro';
  }
  if (job.quality === 'premium' && (job.resolution === '1080p' || job.resolution === '4K')) {
    return 'google/veo-3.1';
  }
  if (job.needsAudio) {
    return 'google/veo-3.1-fast';
  }
  return 'minimax/hailuo-2.3';
}
