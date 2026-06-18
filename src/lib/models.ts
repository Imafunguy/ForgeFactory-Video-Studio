/**
 * ForgeFactory v2 — Central model registry
 * Curated from docs/ForgeFactoryModels.md (36 models across 4 categories).
 */

export type ModelCategory = 'reasoning' | 'image' | 'video' | 'voice';
export type CostTier = 'value' | 'medium' | 'premium';

export interface VoiceOption {
  id: string;
  label: string;
  description?: string;
  /** Short phrase used for voice preview samples */
  previewText?: string;
}

export interface ModelOption {
  value: string;
  /** OpenRouter API model ID (may differ from value for legacy slugs) */
  openRouterId: string;
  label: string;
  provider: string;
  category: ModelCategory;
  costTier: CostTier;
  costLabel: string;
  isDefault?: boolean;
  note?: string;
  /** Rank from ForgeFactoryModels.md (1 = best in tier group) */
  rank?: number;
  /** Score /50 from ForgeFactoryModels.md */
  score?: number;
  /** Image models: modalities for chat/completions image gen */
  imageModalities?: ('image' | 'text')[];
  /** Voice models: selectable voices */
  voices?: VoiceOption[];
}

/** Best-value stack defaults (ForgeFactoryModels.md) */
export const DEFAULT_REASONING_MODEL = 'qwen/qwen3.6-plus';
export const DEFAULT_IMAGE_MODEL = 'google/gemini-2.5-flash-image';
export const DEFAULT_VIDEO_MODEL = 'minimax/hailuo-2.3';
export const DEFAULT_VOICE_MODEL = 'openai/gpt-audio-mini';

const OPENAI_VOICES: VoiceOption[] = [
  { id: 'alloy', label: 'Alloy', description: 'Neutral, balanced', previewText: 'Welcome to your product demo.' },
  { id: 'echo', label: 'Echo', description: 'Warm, conversational', previewText: 'Here is how the dashboard works.' },
  { id: 'fable', label: 'Fable', description: 'Expressive, storytelling', previewText: 'Imagine transforming your workflow overnight.' },
  { id: 'onyx', label: 'Onyx', description: 'Deep, authoritative', previewText: 'Enterprise-grade results, delivered simply.' },
  { id: 'nova', label: 'Nova', description: 'Friendly, upbeat', previewText: 'Let us show you something exciting.' },
  { id: 'shimmer', label: 'Shimmer', description: 'Soft, polished', previewText: 'A polished experience from start to finish.' },
];

const GROK_VOICES: VoiceOption[] = [
  { id: 'ara', label: 'Ara', description: 'Friendly, warm female', previewText: 'Your AI coach is ready when you are.' },
  { id: 'rex', label: 'Rex', description: 'Clear, confident male', previewText: 'Track progress with precision.' },
  { id: 'sal', label: 'Sal', description: 'Smooth, conversational', previewText: 'Let us walk through the dashboard.' },
  { id: 'eve', label: 'Eve', description: 'Professional, clear female', previewText: 'Welcome to ForgeFactory - let us show you around.' },
  { id: 'leo', label: 'Leo', description: 'Energetic, youthful male', previewText: 'Ready to build something great today?' },
];

const KOKORO_VOICES: VoiceOption[] = [
  { id: 'af_alloy', label: 'Alloy', description: 'Neutral female voice', previewText: 'ForgeFactory brings your ideas to life.' },
  { id: 'af_aoede', label: 'Aoede', description: 'Bright female voice', previewText: 'Watch your metrics climb in real time.' },
  { id: 'af_heart', label: 'Heart', description: 'Warm female voice', previewText: 'Welcome to your product demo.' },
  { id: 'af_bella', label: 'Bella', description: 'Soft female voice', previewText: 'Your club admin, finally organised.' },
  { id: 'am_adam', label: 'Adam', description: 'Clear male voice', previewText: 'Less chasing. Better records. Easier decisions.' },
];

const ZYPHRA_VOICES: VoiceOption[] = [
  { id: 'american_female', label: 'American Female', description: 'General US female voice', previewText: 'Welcome to your product demo.' },
  { id: 'american_male', label: 'American Male', description: 'General US male voice', previewText: 'Track progress with precision.' },
  { id: 'british_female', label: 'British Female', description: 'General UK female voice', previewText: 'Your team deserves better tools.' },
  { id: 'british_male', label: 'British Male', description: 'General UK male voice', previewText: 'See how fast you can ship.' },
  { id: 'random', label: 'Random', description: 'Provider-selected voice', previewText: 'ForgeFactory brings your ideas to life.' },
];

const SESAME_VOICES: VoiceOption[] = [
  { id: 'conversational_a', label: 'Conversational A', description: 'Natural conversation voice', previewText: 'Let us walk through the dashboard.' },
  { id: 'conversational_b', label: 'Conversational B', description: 'Natural conversation voice', previewText: 'Built for coaches and creators.' },
  { id: 'read_speech_a', label: 'Read Speech A', description: 'Clear narration voice', previewText: 'Simple steps to real progress.' },
  { id: 'read_speech_b', label: 'Read Speech B', description: 'Clear narration voice', previewText: 'Precision meets simplicity.' },
];

const ORPHEUS_VOICES: VoiceOption[] = [
  { id: 'tara', label: 'Tara', description: 'Expressive female voice', previewText: 'Your club admin, finally organised.' },
  { id: 'leah', label: 'Leah', description: 'Warm female voice', previewText: 'Your team deserves better tools.' },
  { id: 'jess', label: 'Jess', description: 'Bright female voice', previewText: 'Let us show you something exciting.' },
  { id: 'leo', label: 'Leo', description: 'Clear male voice', previewText: 'Ready to build something great today?' },
  { id: 'dan', label: 'Dan', description: 'Confident male voice', previewText: 'Enterprise-grade results, delivered simply.' },
  { id: 'mia', label: 'Mia', description: 'Polished female voice', previewText: 'A polished experience from start to finish.' },
  { id: 'zac', label: 'Zac', description: 'Energetic male voice', previewText: 'Start coaching in under sixty seconds.' },
];

const VOXTRAL_VOICES: VoiceOption[] = [
  { id: 'en_paul_neutral', label: 'Paul Neutral', description: 'Neutral English male voice', previewText: 'Here is how the dashboard works.' },
  { id: 'en_paul_confident', label: 'Paul Confident', description: 'Confident English male voice', previewText: 'Enterprise-grade results, delivered simply.' },
  { id: 'en_paul_cheerful', label: 'Paul Cheerful', description: 'Cheerful English male voice', previewText: 'Let us show you something exciting.' },
  { id: 'en_paul_happy', label: 'Paul Happy', description: 'Happy English male voice', previewText: 'Ready to build something great today?' },
];

const GEMINI_VOICES: VoiceOption[] = [
  { id: 'Kore', label: 'Kore', description: 'Firm, clear delivery', previewText: 'Your team deserves better tools.' },
  { id: 'Puck', label: 'Puck', description: 'Upbeat, energetic', previewText: 'See how fast you can ship.' },
  { id: 'Charon', label: 'Charon', description: 'Informative narrator', previewText: 'Built for coaches and creators.' },
  { id: 'Zephyr', label: 'Zephyr', description: 'Bright, optimistic', previewText: 'Simple steps to real progress.' },
  { id: 'Achird', label: 'Achird', description: 'Friendly, warm', previewText: 'Precision meets simplicity.' },
  { id: 'Enceladus', label: 'Enceladus', description: 'Breathy, expressive', previewText: 'Welcome to your product demo.' },
];

/** All models from ForgeFactoryModels.md — single source of truth. */
export const MODEL_REGISTRY: ModelOption[] = [
  // ── Reasoning (9) ──
  {
    value: 'x-ai/grok-4.20',
    openRouterId: 'x-ai/grok-4.20',
    label: 'Grok 4.20',
    provider: 'xAI',
    category: 'reasoning',
    costTier: 'premium',
    costLabel: 'Premium — higher cost',
    rank: 1,
    score: 47,
    note: '$1.25/M in · $2.50/M out · 2M context. Best overall planning: fast, huge context, strong factual discipline.',
  },
  {
    value: 'google/gemini-3.1-pro-preview',
    openRouterId: 'google/gemini-3.1-pro-preview',
    label: 'Gemini 3.1 Pro Preview',
    provider: 'Google',
    category: 'reasoning',
    costTier: 'premium',
    costLabel: 'Premium — higher cost',
    rank: 2,
    score: 46,
    note: '$2/M in · $12/M out · 1.05M context. Best multimodal creative director for image/video/audio inputs.',
  },
  {
    value: 'anthropic/claude-sonnet-4.6',
    openRouterId: 'anthropic/claude-sonnet-4.6',
    label: 'Claude Sonnet 4.6',
    provider: 'Anthropic',
    category: 'reasoning',
    costTier: 'premium',
    costLabel: 'Premium — higher cost',
    rank: 3,
    score: 45,
    note: '$3/M in · $15/M out · 1M context. Best writing polish, scripts, tone, and narrative structure.',
  },
  {
    value: 'qwen/qwen3.6-plus',
    openRouterId: 'qwen/qwen3.6-plus',
    label: 'Qwen3.6 Plus',
    provider: 'Qwen',
    category: 'reasoning',
    costTier: 'value',
    costLabel: 'Good value',
    isDefault: true,
    rank: 4,
    score: 44,
    note: '$0.325/M in · $1.95/M out · 1M context. Best value for storyboards and app-scale automation.',
  },
  {
    value: 'z-ai/glm-5.1',
    openRouterId: 'z-ai/glm-5.1',
    label: 'GLM 5.1',
    provider: 'Z.AI',
    category: 'reasoning',
    costTier: 'medium',
    costLabel: 'Medium cost',
    rank: 5,
    score: 43,
    note: '$0.98/M in · $3.08/M out · 203K context. Strong autonomous planning and agentic workflows.',
  },
  {
    value: 'google/gemini-3-flash-preview',
    openRouterId: 'google/gemini-3-flash-preview',
    label: 'Gemini 3 Flash Preview',
    provider: 'Google',
    category: 'reasoning',
    costTier: 'medium',
    costLabel: 'Medium cost',
    rank: 6,
    score: 42,
    note: '$0.50/M in · $3/M out · 1.05M context. Fast planning with multimodal inputs.',
  },
  {
    value: 'z-ai/glm-5.1:free',
    openRouterId: 'z-ai/glm-5.1:free',
    label: 'GLM 5.1 (Free)',
    provider: 'Z.AI',
    category: 'reasoning',
    costTier: 'value',
    costLabel: 'Free',
    rank: 7,
    score: 40,
    note: 'Free · 203K context. Best free serious planner when rate limits allow.',
  },
  {
    value: 'minimax/minimax-m2.5:free',
    openRouterId: 'minimax/minimax-m2.5:free',
    label: 'MiniMax M2.5 (Free)',
    provider: 'MiniMax',
    category: 'reasoning',
    costTier: 'value',
    costLabel: 'Free',
    rank: 8,
    score: 39,
    note: 'Free · 204K context. Great free office/agent-style planning model.',
  },
  {
    value: 'qwen/qwen3.5-flash',
    openRouterId: 'qwen/qwen3.5-flash',
    label: 'Qwen3.5 Flash',
    provider: 'Qwen',
    category: 'reasoning',
    costTier: 'value',
    costLabel: 'Good value',
    rank: 9,
    score: 38,
    note: '$0.065/M in · $0.26/M out · 1M context. Cheap bulk script variants, summaries, shot-list drafts.',
  },

  // ── Image (9) ──
  {
    value: 'google/gemini-3-pro-image-preview',
    openRouterId: 'google/gemini-3-pro-image-preview',
    label: 'Gemini 3 Pro Image (Nano Banana Pro)',
    provider: 'Google',
    category: 'image',
    costTier: 'premium',
    costLabel: 'Premium — higher cost',
    rank: 1,
    score: 47,
    imageModalities: ['image', 'text'],
    note: '$2/M in · $12/M out + image tokens. Best pro design, text-in-image, product/storyboard quality.',
  },
  {
    value: 'openai/gpt-5-image',
    openRouterId: 'openai/gpt-5-image',
    label: 'GPT-5 Image',
    provider: 'OpenAI',
    category: 'image',
    costTier: 'premium',
    costLabel: 'Premium — higher cost',
    rank: 2,
    score: 45,
    imageModalities: ['image', 'text'],
    note: '$10/M in · $10/M out + image tokens. Premium instruction-following and image editing.',
  },
  {
    value: 'black-forest-labs/flux.2-max',
    openRouterId: 'black-forest-labs/flux.2-max',
    label: 'FLUX.2 Max',
    provider: 'BFL',
    category: 'image',
    costTier: 'premium',
    costLabel: 'Premium — higher cost',
    rank: 3,
    score: 44,
    imageModalities: ['image'],
    note: '$0.07 first MP + $0.03/extra MP. High-quality stills, cinematic frames, polished assets.',
  },
  {
    value: 'google/gemini-3.1-flash-image-preview',
    openRouterId: 'google/gemini-3.1-flash-image-preview',
    label: 'Gemini 3.1 Flash Image Preview',
    provider: 'Google',
    category: 'image',
    costTier: 'medium',
    costLabel: 'Medium cost',
    rank: 4,
    score: 45,
    imageModalities: ['image', 'text'],
    note: '$0.50/M in · $3/M out · 131K context. Best value pro-style keyframes.',
  },
  {
    value: 'google/gemini-2.5-flash-image',
    openRouterId: 'google/gemini-2.5-flash-image',
    label: 'Gemini 2.5 Flash Image',
    provider: 'Google',
    category: 'image',
    costTier: 'value',
    costLabel: 'Good value',
    isDefault: true,
    rank: 5,
    score: 43,
    imageModalities: ['image', 'text'],
    note: '$0.30/M in · $2.50/M out · 33K context. Cheap, reliable keyframes and editing.',
  },
  {
    value: 'x-ai/grok-imagine-image-quality',
    openRouterId: 'x-ai/grok-imagine-image-quality',
    label: 'Grok Imagine Image Quality',
    provider: 'xAI',
    category: 'image',
    costTier: 'medium',
    costLabel: 'Medium cost',
    rank: 6,
    score: 42,
    imageModalities: ['image'],
    note: 'From $0.05/image. Posters, photorealistic assets, social graphics.',
  },
  {
    value: 'google/gemini-2.5-flash-image-preview:free',
    openRouterId: 'google/gemini-2.5-flash-image-preview:free',
    label: 'Gemini 2.5 Flash Image (Free)',
    provider: 'Google',
    category: 'image',
    costTier: 'value',
    costLabel: 'Free',
    rank: 7,
    score: 39,
    imageModalities: ['image', 'text'],
    note: 'Free · 33K context. Best free image test route.',
  },
  {
    value: 'sourceful/riverflow-v2-fast',
    openRouterId: 'sourceful/riverflow-v2-fast',
    label: 'Riverflow V2 Fast',
    provider: 'Sourceful',
    category: 'image',
    costTier: 'value',
    costLabel: 'Good value',
    rank: 8,
    score: 38,
    imageModalities: ['image'],
    note: '$0.02/1K image · $0.04/2K image. Cheap production image generation.',
  },
  {
    value: 'black-forest-labs/flux.2-klein-4b',
    openRouterId: 'black-forest-labs/flux.2-klein-4b',
    label: 'FLUX.2 Klein 4B',
    provider: 'BFL',
    category: 'image',
    costTier: 'value',
    costLabel: 'Good value',
    rank: 9,
    score: 37,
    imageModalities: ['image'],
    note: '$0.014 first MP + $0.001/extra MP. Very cheap bulk keyframes.',
  },

  // ── Video (9) ──
  {
    value: 'google/veo-3.1',
    openRouterId: 'google/veo-3.1',
    label: 'Google Veo 3.1',
    provider: 'Google',
    category: 'video',
    costTier: 'premium',
    costLabel: 'Premium — higher cost',
    rank: 1,
    score: 48,
    note: 'From $0.40/sec · 1080p, native audio, scene extension, 4K upscaling. Final production clips.',
  },
  {
    value: 'kwaivgi/kling-v3.0-pro',
    openRouterId: 'kwaivgi/kling-v3.0-pro',
    label: 'Kling 3.0 Pro',
    provider: 'Kling (Kuaishou)',
    category: 'video',
    costTier: 'premium',
    costLabel: 'Premium — higher cost',
    rank: 2,
    score: 46,
    note: 'From $0.168/sec · T2V/I2V, first/last-frame control, native audio option. Cinematic controlled clips.',
  },
  {
    value: 'bytedance/seedance-2.0',
    openRouterId: 'bytedance/seedance-2.0',
    label: 'Seedance 2.0',
    provider: 'ByteDance',
    category: 'video',
    costTier: 'premium',
    costLabel: 'Premium — higher cost',
    rank: 3,
    score: 44,
    note: 'Tokenized by resolution/duration. Strong reference-to-video, character consistency, camera movement.',
  },
  {
    value: 'google/veo-3.1-fast',
    openRouterId: 'google/veo-3.1-fast',
    label: 'Google Veo 3.1 Fast',
    provider: 'Google',
    category: 'video',
    costTier: 'medium',
    costLabel: 'Medium cost',
    rank: 4,
    score: 44,
    note: 'From $0.10/sec · Text/image prompts, native audio, first/last frame. Best quality/speed balance.',
  },
  {
    value: 'alibaba/wan-2.7',
    openRouterId: 'alibaba/wan-2.7',
    label: 'Wan 2.7 (Alibaba)',
    provider: 'Alibaba',
    category: 'video',
    costTier: 'medium',
    costLabel: 'Medium cost',
    rank: 5,
    score: 42,
    note: '$0.10/sec · Text-to-video, image-to-video, reference-to-video. Reliable mid-price video.',
  },
  {
    value: 'minimax/hailuo-2.3',
    openRouterId: 'minimax/hailuo-2.3',
    label: 'Hailuo 2.3 (MiniMax)',
    provider: 'MiniMax',
    category: 'video',
    costTier: 'value',
    costLabel: 'Good value',
    isDefault: true,
    rank: 6,
    score: 41,
    note: '$0.0817/sec · Text/reference image to video, cinematic/character animation. Good value creative clips.',
  },
  {
    value: 'kwaivgi/kling-v3.0-pro:free',
    openRouterId: 'kwaivgi/kling-v3.0-pro:free',
    label: 'Kling 3.0 Pro (Free)',
    provider: 'Kling (Kuaishou)',
    category: 'video',
    costTier: 'value',
    costLabel: 'Free',
    rank: 7,
    score: 38,
    note: 'Free · Premium Kling route with rate limits. Testing and demos.',
  },
  {
    value: 'x-ai/grok-imagine-video',
    openRouterId: 'x-ai/grok-imagine-video',
    label: 'Grok Imagine Video',
    provider: 'xAI',
    category: 'video',
    costTier: 'value',
    costLabel: 'Good value',
    rank: 8,
    score: 40,
    note: 'From $0.05/sec · 1–15 sec, 24fps, 480p/720p, T2V/I2V/reference-to-video. Best cheap experimental video.',
  },
  {
    value: 'google/veo-3.1-lite',
    openRouterId: 'google/veo-3.1-lite',
    label: 'Google Veo 3.1 Lite',
    provider: 'Google',
    category: 'video',
    costTier: 'value',
    costLabel: 'Good value',
    rank: 9,
    score: 39,
    note: 'From $0.05/sec · 720p/1080p, 4–8 sec clips, native audio. Cheap short-form generation.',
  },

  // ── Voice (9) ──
  {
    value: 'google/gemini-3.1-flash-tts-preview',
    openRouterId: 'google/gemini-3.1-flash-tts-preview',
    label: 'Gemini 3.1 Flash TTS',
    provider: 'Google',
    category: 'voice',
    costTier: 'premium',
    costLabel: 'Premium — higher cost',
    rank: 1,
    score: 46,
    voices: GEMINI_VOICES,
    note: '$1/M in · $20/M out · 8K context. Best expressive narration, 70+ languages, inline audio tags.',
  },
  {
    value: 'x-ai/grok-voice-tts-1.0',
    openRouterId: 'x-ai/grok-voice-tts-1.0',
    label: 'Grok Voice TTS 1.0',
    provider: 'xAI',
    category: 'voice',
    costTier: 'premium',
    costLabel: 'Premium — higher cost',
    rank: 2,
    score: 44,
    voices: GROK_VOICES,
    note: '$15/M characters · 15K context. Strong voice control, tags, 20+ languages, MP3/WAV/PCM.',
  },
  {
    value: 'mistralai/voxtral-mini-tts-2603',
    openRouterId: 'mistralai/voxtral-mini-tts-2603',
    label: 'Mistral Voxtral Mini TTS',
    provider: 'Mistral',
    category: 'voice',
    costTier: 'premium',
    costLabel: 'Premium — higher cost',
    rank: 3,
    score: 42,
    voices: VOXTRAL_VOICES,
    note: '$16/M characters · 4K context. Voice cloning and multilingual experiments.',
  },
  {
    value: 'openai/gpt-audio-mini',
    openRouterId: 'openai/gpt-audio-mini',
    label: 'GPT Audio Mini',
    provider: 'OpenAI',
    category: 'voice',
    costTier: 'medium',
    costLabel: 'Medium cost',
    isDefault: true,
    rank: 4,
    score: 43,
    voices: OPENAI_VOICES,
    note: '$0.60/M in · $2.40/M out · 128K context. Best cheap OpenAI-style audio/narration model.',
  },
  {
    value: 'canopylabs/orpheus-3b-0.1-ft',
    openRouterId: 'canopylabs/orpheus-3b-0.1-ft',
    label: 'Orpheus 3B',
    provider: 'Canopy Labs',
    category: 'voice',
    costTier: 'medium',
    costLabel: 'Medium cost',
    rank: 5,
    score: 40,
    voices: ORPHEUS_VOICES,
    note: '$7/M characters · 4K context. Natural English narration, 7 preset voices.',
  },
  {
    value: 'sesame/csm-1b',
    openRouterId: 'sesame/csm-1b',
    label: 'Sesame CSM 1B',
    provider: 'Sesame',
    category: 'voice',
    costTier: 'medium',
    costLabel: 'Medium cost',
    rank: 6,
    score: 39,
    voices: SESAME_VOICES,
    note: '$7/M characters · 4K context. Conversational speech and dialogue voice assistant.',
  },
  {
    value: 'hexgrad/kokoro-82m',
    openRouterId: 'hexgrad/kokoro-82m',
    label: 'Kokoro 82M',
    provider: 'Hexgrad',
    category: 'voice',
    costTier: 'value',
    costLabel: 'Good value',
    rank: 7,
    score: 38,
    voices: KOKORO_VOICES,
    note: '$0.62/M characters · 4K context. Cheapest practical TTS option.',
  },
  {
    value: 'zyphra/zonos-v0.1-transformer',
    openRouterId: 'zyphra/zonos-v0.1-transformer',
    label: 'Zyphra Zonos Transformer',
    provider: 'Zyphra',
    category: 'voice',
    costTier: 'value',
    costLabel: 'Good value',
    rank: 8,
    score: 36,
    voices: ZYPHRA_VOICES,
    note: '$7/M characters · 4K context. Budget English voice variety.',
  },
  {
    value: 'zyphra/zonos-v0.1-hybrid',
    openRouterId: 'zyphra/zonos-v0.1-hybrid',
    label: 'Zyphra Zonos Hybrid',
    provider: 'Zyphra',
    category: 'voice',
    costTier: 'value',
    costLabel: 'Good value',
    rank: 9,
    score: 36,
    voices: ZYPHRA_VOICES,
    note: '$7/M characters · 4K context. Budget English voices, hybrid architecture.',
  },
];

export const MODEL_GROUPS: Record<ModelCategory, {
  label: string;
  description: string;
  costNote?: string;
  models: ModelOption[];
}> = {
  reasoning: {
    label: 'Reasoning',
    description: 'Script planning, storyboards & creative direction (9 models)',
    models: MODEL_REGISTRY.filter(m => m.category === 'reasoning'),
  },
  image: {
    label: 'Image',
    description: 'Keyframe & asset generation (9 models)',
    models: MODEL_REGISTRY.filter(m => m.category === 'image'),
  },
  video: {
    label: 'Video',
    description: 'External cloud video generation (9 models)',
    costNote: 'Video models are significantly more expensive than text or image (often $0.05–$0.40+/sec). Always keep "Maximize Local Render" ON for cost control. Cloud video only for specific motion B-roll when local Hyperframes + FFmpeg cannot achieve the shot.',
    models: MODEL_REGISTRY.filter(m => m.category === 'video'),
  },
  voice: {
    label: 'Voice',
    description: 'Narration & voiceover (9 models)',
    models: MODEL_REGISTRY.filter(m => m.category === 'voice'),
  },
};

/** Pricing lookup aliases (UI slug → OpenRouter ID) */
export const PRICING_ID_ALIASES: Record<string, string> = Object.fromEntries(
  MODEL_REGISTRY
    .filter(m => m.value !== m.openRouterId)
    .map(m => [m.value, m.openRouterId])
);

/** API call aliases for video/TTS */
export const VIDEO_API_ALIASES: Record<string, string> = Object.fromEntries(
  MODEL_REGISTRY.filter(m => m.category === 'video').map(m => [m.value, m.openRouterId])
);

export const VOICE_API_ALIASES: Record<string, string> = Object.fromEntries(
  MODEL_REGISTRY.filter(m => m.category === 'voice').map(m => [m.value, m.openRouterId])
);

export function getModelByValue(value: string): ModelOption | undefined {
  return MODEL_REGISTRY.find(m => m.value === value);
}

export function getModelsByCategory(category: ModelCategory): ModelOption[] {
  return MODEL_REGISTRY.filter(m => m.category === category);
}

export function getVoicesForModel(modelValue: string): VoiceOption[] {
  const model = getModelByValue(modelValue);
  return model?.voices ?? OPENAI_VOICES;
}

export function getDefaultVoiceForModel(modelValue: string): string {
  const voices = getVoicesForModel(modelValue);
  return voices[0]?.id ?? 'alloy';
}

export function resolveOpenRouterId(modelValue: string): string {
  return getModelByValue(modelValue)?.openRouterId ?? modelValue;
}

export function getImageModalities(modelValue: string): ('image' | 'text')[] {
  return getModelByValue(modelValue)?.imageModalities ?? ['image'];
}

export function getAllConfiguredModelIds(): string[] {
  const ids = new Set<string>();
  for (const m of MODEL_REGISTRY) {
    ids.add(m.value);
    if (m.openRouterId !== m.value) ids.add(m.openRouterId);
  }
  return [...ids];
}