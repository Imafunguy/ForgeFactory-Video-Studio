/**
 * ForgeFactoryModels.md catalog — preset stacks and import helpers.
 * Source: docs/ForgeFactoryModels.md
 */

import type { PipelinePresetId } from './modelRouting';
import { MODEL_REGISTRY } from './models';

export const FORGE_FACTORY_MODELS_DOC = 'docs/ForgeFactoryModels.md';
export const FORGE_FACTORY_MODEL_COUNT = 36;

export interface ForgeFactoryPresetStack {
  id: PipelinePresetId;
  label: string;
  description: string;
  models: {
    reasoning: string;
    image: string;
    video: string;
    voice: string;
  };
}

/** Preset stacks from the Final recommendation section of ForgeFactoryModels.md */
export const FORGE_FACTORY_PRESETS: Record<PipelinePresetId, ForgeFactoryPresetStack> = {
  'premium-final-render': {
    id: 'premium-final-render',
    label: 'Best High-End',
    description: 'Maximum quality final output — Grok 4.20, Nano Banana Pro, Veo 3.1, Gemini TTS.',
    models: {
      reasoning: 'x-ai/grok-4.20',
      image: 'google/gemini-3-pro-image-preview',
      video: 'google/veo-3.1',
      voice: 'google/gemini-3.1-flash-tts-preview',
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
  'cheap-test-render': {
    id: 'cheap-test-render',
    label: 'Cheapest Useful',
    description: 'High-volume testing, prototypes, and budget-tier users.',
    models: {
      reasoning: 'qwen/qwen3.5-flash',
      image: 'google/gemini-2.5-flash-image-preview:free',
      video: 'x-ai/grok-imagine-video',
      voice: 'hexgrad/kokoro-82m',
    },
  },
};

export function listForgeFactoryPresets(): ForgeFactoryPresetStack[] {
  return Object.values(FORGE_FACTORY_PRESETS);
}

export function getForgeFactoryPreset(id: PipelinePresetId): ForgeFactoryPresetStack {
  return FORGE_FACTORY_PRESETS[id];
}

/** Validate that every model referenced in the catalog exists in MODEL_REGISTRY. */
export function validateForgeFactoryCatalog(): { ok: boolean; missing: string[] } {
  const registered = new Set(MODEL_REGISTRY.map(m => m.value));
  const missing = new Set<string>();

  for (const preset of listForgeFactoryPresets()) {
    for (const id of Object.values(preset.models)) {
      if (!registered.has(id)) missing.add(id);
    }
  }

  return { ok: missing.size === 0, missing: [...missing] };
}

export interface ForgeFactoryModelStackSelection {
  planningModel: string;
  imageModel: string;
  videoModel: string;
  voiceModel: string;
}

export function applyForgeFactoryPreset(id: PipelinePresetId): ForgeFactoryModelStackSelection {
  const preset = getForgeFactoryPreset(id);
  return {
    planningModel: preset.models.reasoning,
    imageModel: preset.models.image,
    videoModel: preset.models.video,
    voiceModel: preset.models.voice,
  };
}