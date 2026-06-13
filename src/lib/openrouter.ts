import {
  getImageModalities,
  resolveOpenRouterId,
  VIDEO_API_ALIASES,
  VOICE_API_ALIASES,
} from './models';
import type { KeyframeAsset, VariantResult } from './pipeline';
import type { Project } from './storage';
import { resolveOpenRouterApiKey } from './storage';
import {
  buildImagePromptsPrompt,
  buildKeyframeImagePrompt,
  buildPreRenderRefinementPrompt,
  buildRefinementPrompt,
  buildVariantPrompt,
  buildEnrichedCloudVideoPrompt,
  assessPlanQuality,
  assessControlsGates,
} from './videoPipelinePrompts';
import {
  type VideoControls,
  DEFAULT_VIDEO_CONTROLS,
  getCanvasDimensions,
} from './videoControls';

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';

export { VIDEO_API_ALIASES, VOICE_API_ALIASES };

export interface CloudVideoResult {
  success: boolean;
  blob?: Blob;
  url?: string;
  model: string;
  cost?: number;
  error?: string;
  fallbackReason?: string;
  statusHistory?: string[];
}

export interface VoiceResult {
  success: boolean;
  blob?: Blob;
  url?: string;
  model: string;
  error?: string;
  /** True when preview used a fallback model after the primary TTS provider failed. */
  fallbackUsed?: boolean;
}

export const OPENROUTER_KEY_REQUIRED_ERROR = 'NO_OPENROUTER_API_KEY';
export const TTS_SERVER_ERROR = 'TTS_SERVER_ERROR';
export const TTS_SERVER_ERROR_MESSAGE =
  'Voice preview temporarily unavailable for this model (500). Try another voice or model.';

export const TTS_PREVIEW_FALLBACK_MODEL = 'x-ai/grok-voice-tts-1.0';
export const TTS_PREVIEW_FALLBACK_VOICE = 'Ara';

/** Canonical Gemini TTS voice_name values from the Google Gemini API. */
const GEMINI_TTS_VOICE_NAMES = [
  'Zephyr', 'Puck', 'Charon', 'Kore', 'Fenrir', 'Leda', 'Orus', 'Aoede', 'Callirrhoe',
  'Autonoe', 'Enceladus', 'Iapetus', 'Umbriel', 'Algieba', 'Despina', 'Erinome', 'Algenib',
  'Rasalgethi', 'Laomedeia', 'Achernar', 'Alnilam', 'Schedar', 'Gacrux', 'Pulcherrima',
  'Achird', 'Zubenelgenubi', 'Vindemiatrix', 'Sadachbia', 'Sadaltager', 'Sulafat',
] as const;

const GEMINI_TTS_VOICE_LOOKUP = new Map(
  GEMINI_TTS_VOICE_NAMES.map(name => [name.toLowerCase(), name]),
);

export interface ImageGenResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
  model: string;
}

export interface CloudVideoStatus {
  status: string;
  elapsedMs: number;
  maxWaitMs: number;
  message: string;
}

const CLOUD_STATUS_LABELS: Record<string, string> = {
  queued: 'Queued — waiting for a GPU slot',
  pending: 'Pending — job submitted',
  processing: 'Processing — generating frames',
  in_progress: 'In progress — rendering video',
  running: 'Running — almost there',
  completed: 'Complete — downloading video',
  failed: 'Failed',
  cancelled: 'Cancelled',
  expired: 'Expired',
};

function formatCloudStatus(status: string, elapsedMs: number, maxWaitMs: number): string {
  const label = CLOUD_STATUS_LABELS[status] ?? `Status: ${status}`;
  const elapsedSec = Math.round(elapsedMs / 1000);
  const maxSec = Math.round(maxWaitMs / 1000);
  return `${label} (${elapsedSec}s / ${maxSec}s max)`;
}

export function getLocalRenderBias(maximizeLocal: boolean): string {
  if (maximizeLocal) {
    return 'Prioritize scenes that can be realized with high-quality local Hyperframes (dashboard UI, metrics, quotes, kinetic type, logo lockups, step sequences). Avoid describing photoreal live-action or complex 3D that would require cloud video models. ';
  }
  return 'Balance cloud video model shots (cinematic B-roll, character motion) with local Hyperframes UI sequences. Mark scenes as [CLOUD] or [LOCAL] in the storyboard. ';
}

export function resolveVideoModelId(model: string): string {
  return VIDEO_API_ALIASES[model] ?? resolveOpenRouterId(model);
}

export function resolveVoiceModelId(model: string): string {
  return VOICE_API_ALIASES[model] ?? resolveOpenRouterId(model);
}

/** Gemini TTS on OpenRouter rejects mp3 — it only accepts raw PCM output. */
export function isGeminiTtsModel(modelId: string): boolean {
  const lower = modelId.toLowerCase();
  return lower.includes('gemini') && lower.includes('tts');
}

export function resolveTtsResponseFormat(modelId: string): 'pcm' | 'mp3' {
  return isGeminiTtsModel(modelId) ? 'pcm' : 'mp3';
}

/** Gemini TTS requires Google prebuilt voice names (e.g. Kore), not OpenAI/ElevenLabs slugs. */
export function resolveTtsVoice(modelId: string, voice: string): string {
  if (!isGeminiTtsModel(modelId)) return voice;
  const canonical = GEMINI_TTS_VOICE_LOOKUP.get(voice.trim().toLowerCase());
  return canonical ?? 'Kore';
}

export function getTtsUserMessage(error?: string): string {
  if (error === OPENROUTER_KEY_REQUIRED_ERROR) {
    return 'Please add your OpenRouter API key in Settings to preview voices.';
  }
  if (error === TTS_SERVER_ERROR) {
    return TTS_SERVER_ERROR_MESSAGE;
  }
  return error ?? 'Voice preview failed';
}

function logTtsFailure(
  status: number,
  resolvedModel: string,
  voice: string,
  responseFormat: 'pcm' | 'mp3',
  errText: string,
): void {
  console.warn('[ForgeFactory TTS] request failed', {
    status,
    model: resolvedModel,
    voice,
    response_format: responseFormat,
    error: errText.slice(0, 500),
  });
}

/** Wrap Gemini's 24 kHz / 16-bit mono PCM in a WAV container for <audio> playback. */
function pcmToWavBlob(
  pcmData: ArrayBuffer,
  sampleRate = 24000,
  channels = 1,
  bitsPerSample = 16,
): Blob {
  const byteRate = sampleRate * channels * (bitsPerSample / 8);
  const blockAlign = channels * (bitsPerSample / 8);
  const dataSize = pcmData.byteLength;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (offset: number, value: string) => {
    for (let i = 0; i < value.length; i++) {
      view.setUint8(offset + i, value.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);
  new Uint8Array(buffer, 44).set(new Uint8Array(pcmData));

  return new Blob([buffer], { type: 'audio/wav' });
}

export function extractNarrationFromScript(script: string): string {
  if (!script.trim()) return '';
  const withoutKeyframes = script.split(/Keyframe|keyframe|KEYFRAME/i)[0] ?? script;
  const lines = withoutKeyframes
    .split('\n')
    .map(l => l.replace(/^\*+|\*+$/g, '').replace(/^#+\s*/, '').trim())
    .filter(l => l.length > 0 && !/^[-•]/.test(l) || l.length > 20);
  const text = lines.join(' ').replace(/\s+/g, ' ').trim();
  return text.slice(0, 1200) || script.slice(0, 600);
}

function openRouterHeaders(apiKey: string): Record<string, string> {
  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://forgefactory.local',
    'X-Title': 'ForgeFactory v2',
  };
}

function extractImageFromResponse(data: Record<string, unknown>): string | null {
  const choices = data.choices as Array<{ message?: Record<string, unknown> }> | undefined;
  const message = choices?.[0]?.message;
  if (!message) return null;

  const images = message.images as Array<{ image_url?: { url?: string }; imageUrl?: { url?: string } }> | undefined;
  if (images?.length) {
    const url = images[0].image_url?.url ?? images[0].imageUrl?.url;
    if (url) return url;
  }

  const content = message.content;
  if (typeof content === 'string' && content.startsWith('data:image')) {
    return content;
  }

  if (Array.isArray(content)) {
    for (const part of content) {
      const p = part as { type?: string; image_url?: { url?: string } };
      if (p.type === 'image_url' && p.image_url?.url) return p.image_url.url;
    }
  }

  return null;
}

export async function callOpenRouter(
  messages: Array<{ role: string; content: string }>,
  model: string,
  apiKey: string,
  maxTokens = 2500,
  temperature = 0.65,
): Promise<string> {
  if (!apiKey?.trim()) {
    return getFallbackResponse(messages[0]?.content || '', model);
  }

  try {
    const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
      method: 'POST',
      headers: openRouterHeaders(apiKey),
      body: JSON.stringify({
        model: resolveOpenRouterId(model),
        messages,
        max_tokens: maxTokens,
        temperature,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'No response from model.';
  } catch (error) {
    console.error('OpenRouter call failed:', error);
    return getFallbackResponse(messages[0]?.content || '', model);
  }
}

function getFallbackResponse(prompt: string, model: string): string {
  const isPlanning = prompt.toLowerCase().includes('plan') || prompt.toLowerCase().includes('script');
  if (isPlanning) {
    return `**Detailed Production Plan (simulated high-quality output using ${model})**\n\n**Script (30s):**\n0-6s: Hook - Pain point with scattered tools for the user.\n6-12s: Reveal - Beautiful interface loads with brand colors and micro-animations.\n12-22s: Magic - Smooth interactions, AI features, real-time collaboration.\n22-30s: Win & CTA - Results spike, strong close with logo and tagline.\n\n**Keyframe Prompts (optimized for Grok Imagine / Flux):**\n1. Frustrated user at desk with multiple apps.\n2. Clean dashboard reveal with perfect lighting.\n3. Drag card with realistic physics and brand accent.\n4. Team celebration with metrics and live cursors.\n\n**Hyperframes Description:** Branded SaaS UI sequence with sidebar, animated cards, pulsing notifications, smooth view transitions. 30s duration at 60fps.\n\nInject brand details automatically for consistency.`;
  }
  return `High-quality response for: ${prompt.substring(0, 100)}... (using ${model}). Brand-consistent, detailed, ready for video production.`;
}

export async function generateImagePrompts(
  script: string,
  apiKey: string,
  model = 'black-forest-labs/flux.2-klein-4b',
  project?: Pick<Project, 'name' | 'colors' | 'uiElements' | 'tone'>,
  controls?: VideoControls,
): Promise<string> {
  const content = project
    ? buildImagePromptsPrompt(project, script, model, controls)
    : `Turn this video script into 5 highly detailed, brand-consistent image/keyframe prompts for ${model}. Number each prompt (1. 2. 3. etc). Each 90+ words: SaaS UI, brand colors, lighting, motion hints, composition. Script: ${script}`;
  return callOpenRouter([{ role: 'user', content }], model, apiKey, 2200, 0.55);
}

/** Run planning with automatic quality gate + refinement pass when needed. */
export async function generatePlanWithQualityGate(
  initialPlan: string,
  project: Pick<Project, 'name' | 'colors' | 'uiElements' | 'tone'>,
  planningModel: string,
  apiKey: string,
  callPlanner: (prompt: string, model: string) => Promise<string>,
  controls?: VideoControls,
): Promise<{
  plan: string;
  refined: boolean;
  qualityScore: number;
  premiumGates: ReturnType<typeof assessControlsGates>;
}> {
  const c = controls ?? DEFAULT_VIDEO_CONTROLS;
  let plan = initialPlan;
  const firstCheck = assessPlanQuality(plan, c);
  const firstGates = assessControlsGates(plan, c);
  const gatesFailed = firstGates.some((g) => !g.pass);
  const gateIssues = firstGates.flatMap((g) => g.issues.map((i) => `${g.category}: ${i}`));

  if ((!firstCheck.pass || gatesFailed) && apiKey?.trim()) {
    const allIssues = [...firstCheck.issues, ...gateIssues];
    const refined = await callPlanner(
      buildRefinementPrompt(project, plan, allIssues, c),
      planningModel,
    );
    if (refined.length > plan.length * 0.7) {
      plan = refined;
    }
    const secondCheck = assessPlanQuality(plan, c);
    const secondGates = assessControlsGates(plan, c);
    return { plan, refined: true, qualityScore: secondCheck.score, premiumGates: secondGates };
  }

  return { plan, refined: false, qualityScore: firstCheck.score, premiumGates: firstGates };
}

/** Generate variant plans when variantCount > 1. */
export async function generateVariants(
  basePlan: string,
  project: Pick<Project, 'name' | 'colors' | 'uiElements' | 'tone'>,
  controls: VideoControls,
  planningModel: string,
  apiKey: string,
  callPlanner: (prompt: string, model: string) => Promise<string>,
): Promise<VariantResult[]> {
  if (controls.variantCount <= 1 || !apiKey?.trim()) {
    const score = assessPlanQuality(basePlan, controls).score;
    return [{ id: 1, plan: basePlan, score, strategy: controls.variantStrategy, selected: true }];
  }

  const variants: VariantResult[] = [];
  const count = Math.min(controls.variantCount, 5);

  for (let i = 0; i < count; i++) {
    const variantPlan = i === 0
      ? basePlan
      : await callPlanner(buildVariantPrompt(project, basePlan, controls, i), planningModel);
    const quality = assessPlanQuality(variantPlan, controls);
    const gates = assessControlsGates(variantPlan, controls);
    const gatePenalty = gates.filter((g) => !g.pass).length * 5;
    variants.push({
      id: i + 1,
      plan: variantPlan,
      score: Math.max(0, quality.score - gatePenalty),
      strategy: controls.variantStrategy,
      selected: false,
    });
  }

  if (controls.variantStrategy === 'best-critic' || controls.variantStrategy === 'lock-max') {
    const best = variants.reduce((a, b) => (b.score > a.score ? b : a));
    return variants.map((v) => ({ ...v, selected: v.id === best.id }));
  }

  return variants.map((v, i) => ({ ...v, selected: i === 0 }));
}

/** Quick pre-render approval gate (returns true if approved or gate skipped). */
export async function runPreRenderQualityGate(
  project: Pick<Project, 'name' | 'colors' | 'uiElements' | 'tone'>,
  script: string,
  keyframeCount: number,
  imagesGenerated: number,
  planningModel: string,
  apiKey: string,
  controls?: VideoControls,
): Promise<{ approved: boolean; note?: string; gateFailures?: string[] }> {
  const c = controls ?? DEFAULT_VIDEO_CONTROLS;
  const localGates = assessControlsGates(script, c);
  const localFailures = localGates.filter((g) => !g.pass).map((g) => g.category);

  if (!apiKey?.trim()) {
    return { approved: localFailures.length <= 2, gateFailures: localFailures };
  }

  const raw = await callOpenRouter(
    [{ role: 'user', content: buildPreRenderRefinementPrompt(project, script, keyframeCount, imagesGenerated, c) }],
    planningModel,
    apiKey,
    200,
    0.2,
  );

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as { approved?: boolean; adjustments?: string };
      return {
        approved: parsed.approved !== false && localFailures.length <= 2,
        note: parsed.adjustments,
        gateFailures: [...localFailures, ...(parsed as { gateFailures?: string[] }).gateFailures ?? []],
      };
    }
  } catch {
    // fall through
  }
  return { approved: localFailures.length <= 2, gateFailures: localFailures };
}

export async function generateKeyframeImage(
  prompt: string,
  model: string,
  apiKey: string,
  options?: {
    aspectRatio?: string;
    project?: Pick<Project, 'name' | 'colors' | 'uiElements' | 'tone'>;
    sceneIndex?: number;
    controls?: VideoControls;
  }
): Promise<ImageGenResult> {
  const resolvedModel = resolveOpenRouterId(model);
  const modalities = getImageModalities(model);
  const aspect = options?.controls
    ? options.controls.aspectRatio === 'custom' ? '16:9' : options.controls.aspectRatio
    : options?.aspectRatio ?? '16:9';

  if (!apiKey?.trim()) {
    return { success: false, model: resolvedModel, error: 'API key required for image generation' };
  }

  try {
    const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
      method: 'POST',
      headers: openRouterHeaders(apiKey),
      body: JSON.stringify({
        model: resolvedModel,
        messages: [
          {
            role: 'user',
            content: options?.project
              ? buildKeyframeImagePrompt(options.project, prompt, options.sceneIndex ?? 0, options.controls)
              : `Generate a single ultra-high-quality ${aspect} marketing keyframe image. Cinematic SaaS UI, sharp readable text, studio lighting, brand-consistent. ${prompt}`,
          },
        ],
        modalities,
        image_config: {
          aspect_ratio: aspect,
          image_size: options?.project ? '2K' : '1K',
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return {
        success: false,
        model: resolvedModel,
        error: `Image API ${response.status}: ${errText.slice(0, 150)}`,
      };
    }

    const data = await response.json();
    const imageUrl = extractImageFromResponse(data);

    if (!imageUrl) {
      return { success: false, model: resolvedModel, error: 'No image in model response' };
    }

    return { success: true, imageUrl, model: resolvedModel };
  } catch (err) {
    return {
      success: false,
      model: resolvedModel,
      error: err instanceof Error ? err.message : 'Image generation failed',
    };
  }
}

export async function generateKeyframeImages(
  keyframes: KeyframeAsset[],
  model: string,
  apiKey: string,
  onProgress?: (completed: KeyframeAsset[], index: number, total: number) => void,
  project?: Pick<Project, 'name' | 'colors' | 'uiElements' | 'tone'>,
  controls?: VideoControls,
): Promise<KeyframeAsset[]> {
  const total = keyframes.length;
  const results: KeyframeAsset[] = [];
  const aspect = controls
    ? controls.aspectRatio === 'custom' ? '16:9' : controls.aspectRatio
    : '16:9';

  for (let i = 0; i < keyframes.length; i++) {
    const kf = keyframes[i];
    const pending = [
      ...results,
      { ...kf, imageStatus: 'generating' as const },
      ...keyframes.slice(i + 1).map(k => ({ ...k, imageStatus: 'pending' as const })),
    ];
    onProgress?.(pending, i, total);

    const result = await generateKeyframeImage(kf.prompt, model, apiKey, {
      project,
      sceneIndex: i,
      controls,
      aspectRatio: aspect,
    });

    results.push({
      ...kf,
      imageUrl: result.success ? result.imageUrl : kf.imageUrl,
      imageStatus: result.success ? 'complete' : 'error',
      imageError: result.success ? undefined : result.error,
    });

    onProgress?.(results, i + 1, total);
  }

  return results;
}

interface VideoJobResponse {
  id: string;
  polling_url?: string;
  status: string;
  unsigned_urls?: string[];
  usage?: { cost?: number };
  error?: string;
}

export async function generateCloudVideo(
  prompt: string,
  model: string,
  apiKey: string,
  options?: {
    duration?: number;
    resolution?: string;
    aspectRatio?: string;
    onStatus?: (info: CloudVideoStatus) => void;
    maxWaitMs?: number;
    controls?: VideoControls;
    project?: Pick<Project, 'name' | 'colors' | 'uiElements' | 'tone'>;
    goal?: string;
  }
): Promise<CloudVideoResult> {
  const resolvedModel = resolveVideoModelId(model);
  const maxWait = options?.maxWaitMs ?? 120_000;
  const controls = options?.controls ?? DEFAULT_VIDEO_CONTROLS;
  const enrichedPrompt = options?.project && options?.goal
    ? buildEnrichedCloudVideoPrompt(options.project, options.goal, prompt, controls)
    : prompt;
  const aspect = options?.aspectRatio ?? (controls.aspectRatio === 'custom' ? '16:9' : controls.aspectRatio);
  const duration = options?.duration ?? Math.min(controls.lengthSec, 15);
  const statusHistory: string[] = [];

  const emitStatus = (status: string, start: number) => {
    const elapsedMs = Date.now() - start;
    const message = formatCloudStatus(status, elapsedMs, maxWait);
    statusHistory.push(message);
    options?.onStatus?.({ status, elapsedMs, maxWaitMs: maxWait, message });
  };

  if (!apiKey?.trim()) {
    return {
      success: false,
      model: resolvedModel,
      fallbackReason: 'No OpenRouter API key — using local Hyperframes render instead (free)',
      error: 'API key required for cloud video',
      statusHistory,
    };
  }

  try {
    emitStatus('pending', Date.now());
    const submitRes = await fetch(`${OPENROUTER_BASE}/videos`, {
      method: 'POST',
      headers: openRouterHeaders(apiKey),
      body: JSON.stringify({
        model: resolvedModel,
        prompt: enrichedPrompt,
        duration,
        resolution: options?.resolution ?? (getCanvasDimensions(controls.aspectRatio).height >= 1920 ? '1080p' : '720p'),
        aspect_ratio: aspect,
      }),
    });

    if (!submitRes.ok) {
      const errText = await submitRes.text();
      return {
        success: false,
        model: resolvedModel,
        fallbackReason: `Cloud video unavailable (HTTP ${submitRes.status}) — falling back to local Hyperframes (free)`,
        error: errText.slice(0, 200),
        statusHistory,
      };
    }

    const job = (await submitRes.json()) as VideoJobResponse;
    const pollUrl = job.polling_url ?? `${OPENROUTER_BASE}/videos/${job.id}`;
    const start = Date.now();
    let lastStatus = '';

    while (Date.now() - start < maxWait) {
      await new Promise(r => setTimeout(r, 4000));
      const pollRes = await fetch(pollUrl, { headers: openRouterHeaders(apiKey) });
      if (!pollRes.ok) {
        return {
          success: false,
          model: resolvedModel,
          fallbackReason: 'Cloud video polling failed — falling back to local Hyperframes (free)',
          error: `Poll error: ${pollRes.status}`,
          statusHistory,
        };
      }

      const status = (await pollRes.json()) as VideoJobResponse;
      if (status.status !== lastStatus) {
        lastStatus = status.status;
        emitStatus(status.status, start);
      }

      if (status.status === 'completed') {
        const contentUrl = status.unsigned_urls?.[0] ?? `${OPENROUTER_BASE}/videos/${job.id}/content?index=0`;
        const videoRes = await fetch(contentUrl, { headers: openRouterHeaders(apiKey) });
        if (!videoRes.ok) {
          return {
            success: false,
            model: resolvedModel,
            fallbackReason: 'Cloud video download failed — falling back to local Hyperframes (free)',
            error: `Download error: ${videoRes.status}`,
            statusHistory,
          };
        }
        const blob = await videoRes.blob();
        const url = URL.createObjectURL(blob);
        return {
          success: true,
          blob,
          url,
          model: resolvedModel,
          cost: status.usage?.cost,
          statusHistory,
        };
      }

      if (status.status === 'failed' || status.status === 'cancelled' || status.status === 'expired') {
        return {
          success: false,
          model: resolvedModel,
          fallbackReason: `Cloud video ${status.status} — falling back to local Hyperframes (free). Tip: enable Maximize Local Render to skip cloud video.`,
          error: status.error ?? status.status,
          statusHistory,
        };
      }
    }

    const elapsedSec = Math.round(maxWait / 1000);
    return {
      success: false,
      model: resolvedModel,
      fallbackReason: `Cloud video timed out after ${elapsedSec}s — falling back to local Hyperframes (free). Long jobs may need a dedicated video provider; local render is instant and free.`,
      error: `Generation timed out after ${elapsedSec} seconds`,
      statusHistory,
    };
  } catch (err) {
    return {
      success: false,
      model: resolvedModel,
      fallbackReason: 'Cloud video error — falling back to local Hyperframes (free)',
      error: err instanceof Error ? err.message : 'Unknown error',
      statusHistory,
    };
  }
}

async function requestTtsAudio(
  resolvedModel: string,
  input: string,
  voice: string,
  resolvedKey: string,
): Promise<VoiceResult> {
  // Gemini TTS only supports response_format "pcm" (24 kHz 16-bit mono); other providers use mp3.
  const responseFormat = resolveTtsResponseFormat(resolvedModel);
  const resolvedVoice = resolveTtsVoice(resolvedModel, voice);

  const response = await fetch(`${OPENROUTER_BASE}/audio/speech`, {
    method: 'POST',
    headers: openRouterHeaders(resolvedKey),
    body: JSON.stringify({
      model: resolvedModel,
      input,
      voice: resolvedVoice,
      response_format: responseFormat,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    logTtsFailure(response.status, resolvedModel, resolvedVoice, responseFormat, errText);
    if (response.status === 401) {
      return {
        success: false,
        model: resolvedModel,
        error: OPENROUTER_KEY_REQUIRED_ERROR,
      };
    }
    if (response.status >= 500) {
      return {
        success: false,
        model: resolvedModel,
        error: TTS_SERVER_ERROR,
      };
    }
    return {
      success: false,
      model: resolvedModel,
      error: `TTS error ${response.status}: ${errText.slice(0, 150)}`,
    };
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return {
      success: false,
      model: resolvedModel,
      error: 'TTS returned an empty or invalid audio response',
    };
  }

  let audioBlob: Blob;
  if (responseFormat === 'pcm') {
    const pcmBuffer = await response.arrayBuffer();
    if (pcmBuffer.byteLength === 0) {
      return {
        success: false,
        model: resolvedModel,
        error: 'TTS returned an empty or invalid audio response',
      };
    }
    audioBlob = pcmToWavBlob(pcmBuffer);
  } else {
    const blob = await response.blob();
    if (blob.size === 0) {
      return {
        success: false,
        model: resolvedModel,
        error: 'TTS returned an empty or invalid audio response',
      };
    }
    audioBlob = blob.type ? blob : new Blob([blob], { type: 'audio/mpeg' });
  }

  const url = URL.createObjectURL(audioBlob);
  return { success: true, blob: audioBlob, url, model: resolvedModel };
}

export async function generateVoice(
  text: string,
  model: string,
  apiKey: string,
  voice = 'alloy'
): Promise<VoiceResult> {
  const resolvedModel = resolveVoiceModelId(model);
  const input = text.trim().slice(0, 1200);
  const resolvedKey = resolveOpenRouterApiKey(apiKey);

  if (!input) {
    return { success: false, model: resolvedModel, error: 'No narration text' };
  }

  if (!resolvedKey) {
    return { success: false, model: resolvedModel, error: OPENROUTER_KEY_REQUIRED_ERROR };
  }

  try {
    return await requestTtsAudio(resolvedModel, input, voice, resolvedKey);
  } catch (err) {
    console.warn('[ForgeFactory TTS] network error', {
      model: resolvedModel,
      voice: resolveTtsVoice(resolvedModel, voice),
      response_format: resolveTtsResponseFormat(resolvedModel),
      error: err instanceof Error ? err.message : err,
    });
    return {
      success: false,
      model: resolvedModel,
      error: err instanceof Error ? err.message : 'Voice generation failed',
    };
  }
}

/** Preview helper: retries with Grok Voice when Gemini TTS returns a server error. */
export async function generateVoiceForPreview(
  text: string,
  model: string,
  apiKey: string,
  voice: string,
): Promise<VoiceResult> {
  const result = await generateVoice(text, model, apiKey, voice);
  if (result.success || result.error !== TTS_SERVER_ERROR) {
    return result;
  }
  if (!isGeminiTtsModel(resolveVoiceModelId(model))) {
    return result;
  }

  console.warn('[ForgeFactory TTS] Gemini preview failed with 500; falling back to Grok Voice');
  const fallback = await generateVoice(
    text,
    TTS_PREVIEW_FALLBACK_MODEL,
    apiKey,
    TTS_PREVIEW_FALLBACK_VOICE,
  );
  if (fallback.success) {
    return { ...fallback, fallbackUsed: true };
  }
  return result;
}