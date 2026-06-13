/**
 * ForgeFactory v2 — Central model registry
 * Add new models here; UI components import from this file (via constants re-exports).
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
  /** Image models: modalities for chat/completions image gen */
  imageModalities?: ('image' | 'text')[];
  /** Voice models: selectable voices */
  voices?: VoiceOption[];
}

export const DEFAULT_REASONING_MODEL = 'moonshotai/kimi-k2';
export const DEFAULT_IMAGE_MODEL = 'black-forest-labs/flux.2-klein-4b';
export const DEFAULT_VIDEO_MODEL = 'bytedance/seedance-2.0-fast';
export const DEFAULT_VOICE_MODEL = 'x-ai/grok-voice-tts-1.0';

/** OpenAI-style voices (used by OpenAI TTS and compatible proxies) */
const OPENAI_VOICES: VoiceOption[] = [
  { id: 'alloy', label: 'Alloy', description: 'Neutral, balanced', previewText: 'Welcome to your product demo.' },
  { id: 'echo', label: 'Echo', description: 'Warm, conversational', previewText: 'Here is how the dashboard works.' },
  { id: 'fable', label: 'Fable', description: 'Expressive, storytelling', previewText: 'Imagine transforming your workflow overnight.' },
  { id: 'onyx', label: 'Onyx', description: 'Deep, authoritative', previewText: 'Enterprise-grade results, delivered simply.' },
  { id: 'nova', label: 'Nova', description: 'Friendly, upbeat', previewText: 'Let us show you something exciting.' },
  { id: 'shimmer', label: 'Shimmer', description: 'Soft, polished', previewText: 'A polished experience from start to finish.' },
];

const ELEVENLABS_VOICES: VoiceOption[] = [
  { id: 'rachel', label: 'Rachel', description: 'Calm, professional female', previewText: 'Your team deserves better tools.' },
  { id: 'drew', label: 'Drew', description: 'Confident male narrator', previewText: 'See how fast you can ship.' },
  { id: 'clyde', label: 'Clyde', description: 'Warm, mid-range male', previewText: 'Built for coaches and creators.' },
  { id: 'bella', label: 'Bella', description: 'Soft, approachable female', previewText: 'Simple steps to real progress.' },
  { id: 'antoni', label: 'Antoni', description: 'Crisp, articulate male', previewText: 'Precision meets simplicity.' },
];

const PLAYHT_VOICES: VoiceOption[] = [
  { id: 'alloy', label: 'Alloy', description: 'Default balanced voice', previewText: 'ForgeFactory brings your ideas to life.' },
  { id: 'echo', label: 'Echo', description: 'Warm narrator', previewText: 'Watch your metrics climb in real time.' },
  { id: 'nova', label: 'Nova', description: 'Energetic, modern', previewText: 'Start coaching in under sixty seconds.' },
];

const GROK_VOICES: VoiceOption[] = [
  { id: 'Ara', label: 'Ara', description: 'Friendly, warm female', previewText: 'Your AI coach is ready when you are.' },
  { id: 'Rex', label: 'Rex', description: 'Clear, confident male', previewText: 'Track progress with precision.' },
  { id: 'Sal', label: 'Sal', description: 'Smooth, conversational', previewText: 'Let us walk through the dashboard.' },
  { id: 'Eve', label: 'Eve', description: 'Professional, clear female', previewText: 'Welcome to ForgeFactory — let us show you around.' },
  { id: 'Leo', label: 'Leo', description: 'Energetic, youthful male', previewText: 'Ready to build something great today?' },
];

const CARTESIA_VOICES: VoiceOption[] = [
  { id: 'carla', label: 'Carla', description: 'Warm, expressive female', previewText: 'See how your metrics improve in real time.' },
  { id: 'jason', label: 'Jason', description: 'Deep, authoritative male', previewText: 'Enterprise results delivered simply and fast.' },
];

const RIME_VOICES: VoiceOption[] = [
  { id: 'mist', label: 'Mist', description: 'Soft, natural female', previewText: 'Your product demo is ready to ship.' },
  { id: 'bravo', label: 'Bravo', description: 'Confident broadcast male', previewText: 'This is the future of marketing videos.' },
];

/** Google Gemini TTS prebuilt voices (OpenRouter / Gemini API voice_name values). */
const GEMINI_VOICES: VoiceOption[] = [
  { id: 'Kore', label: 'Kore', description: 'Firm, clear delivery', previewText: 'Your team deserves better tools.' },
  { id: 'Puck', label: 'Puck', description: 'Upbeat, energetic', previewText: 'See how fast you can ship.' },
  { id: 'Charon', label: 'Charon', description: 'Informative narrator', previewText: 'Built for coaches and creators.' },
  { id: 'Zephyr', label: 'Zephyr', description: 'Bright, optimistic', previewText: 'Simple steps to real progress.' },
  { id: 'Achird', label: 'Achird', description: 'Friendly, warm', previewText: 'Precision meets simplicity.' },
  { id: 'Enceladus', label: 'Enceladus', description: 'Breathy, expressive', previewText: 'Welcome to your product demo.' },
];

/** All models in a flat, maintainable list. Single source of truth. */
export const MODEL_REGISTRY: ModelOption[] = [
  // ── Reasoning (12 models) ──
  {
    value: 'moonshotai/kimi-k2',
    openRouterId: 'moonshotai/kimi-k2',
    label: 'Kimi K2',
    provider: 'Moonshot',
    category: 'reasoning',
    costTier: 'value',
    costLabel: 'Good value',
    isDefault: true,
    note: 'Excellent long-context agentic planning and structured storyboards. Top value pick for daily production.',
  },
  {
    value: 'google/gemini-3-flash',
    openRouterId: 'google/gemini-3-flash-preview',
    label: 'Gemini 3 Flash',
    provider: 'Google',
    category: 'reasoning',
    costTier: 'value',
    costLabel: 'Good value',
    note: 'Ultra-fast, cheap (~$0.50/$3 per 1M), strong at script outlines and multimodal reasoning. Great daily driver.',
  },
  {
    value: 'deepseek/deepseek-v4-flash',
    openRouterId: 'deepseek/deepseek-v4-flash',
    label: 'DeepSeek V4 Flash',
    provider: 'DeepSeek',
    category: 'reasoning',
    costTier: 'value',
    costLabel: 'Good value',
    note: 'High-throughput MoE reasoning and coding. Excellent price/performance for iterations.',
  },
  {
    value: 'qwen/qwen3-coder:free',
    openRouterId: 'qwen/qwen3-coder:free',
    label: 'Qwen3 Coder (Free)',
    provider: 'Qwen',
    category: 'reasoning',
    costTier: 'value',
    costLabel: 'Free',
    note: 'Strong free-tier coding/agent model on OpenRouter. Rate-limited but excellent for drafts and planning.',
  },
  {
    value: 'nvidia/nemotron-3-ultra',
    openRouterId: 'nvidia/nemotron-3-ultra-550b-a55b:free',
    label: 'NVIDIA Nemotron 3 Ultra',
    provider: 'NVIDIA',
    category: 'reasoning',
    costTier: 'value',
    costLabel: 'Free',
    note: 'Open frontier MoE reasoning/orchestration model. 1M context, strong for multi-step agentic flows. Free :free route on OpenRouter (rate-limited).',
  },
  {
    value: 'anthropic/claude-sonnet-4.6',
    openRouterId: 'anthropic/claude-sonnet-4.6',
    label: 'Claude Sonnet 4.6',
    provider: 'Anthropic',
    category: 'reasoning',
    costTier: 'medium',
    costLabel: 'Medium cost',
    note: 'Nuanced creative direction, excellent long scripts, and careful storyboard structure.',
  },
  {
    value: 'qwen/qwen3.6-35b-a3b',
    openRouterId: 'qwen/qwen3.6-35b-a3b',
    label: 'Qwen3.6 35B MoE',
    provider: 'Qwen',
    category: 'reasoning',
    costTier: 'value',
    costLabel: 'Good value',
    note: 'Strong open-weight multimodal reasoning. Great balance of intelligence and speed for production planning.',
  },
  {
    value: 'google/gemini-3-pro',
    openRouterId: 'google/gemini-3-pro',
    label: 'Gemini 3 Pro',
    provider: 'Google',
    category: 'reasoning',
    costTier: 'medium',
    costLabel: 'Medium cost',
    note: 'Flagship Google reasoning with excellent tool use and 1M context for complex campaigns.',
  },
  {
    value: 'anthropic/claude-opus-4.8',
    openRouterId: 'anthropic/claude-opus-4.8',
    label: 'Claude Opus 4.8',
    provider: 'Anthropic',
    category: 'reasoning',
    costTier: 'premium',
    costLabel: 'Premium — higher cost',
    note: 'Maximum reasoning quality for hero campaigns and difficult creative briefs.',
  },
  {
    value: 'openai/gpt-5.5',
    openRouterId: 'openai/gpt-5.5',
    label: 'GPT-5.5',
    provider: 'OpenAI',
    category: 'reasoning',
    costTier: 'premium',
    costLabel: 'Premium — higher cost',
    note: 'Frontier agentic performance. Strong at detailed production plans and multi-turn refinement.',
  },
  {
    value: 'deepseek/deepseek-v4-pro',
    openRouterId: 'deepseek/deepseek-v4-pro',
    label: 'DeepSeek V4 Pro',
    provider: 'DeepSeek',
    category: 'reasoning',
    costTier: 'value',
    costLabel: 'Good value',
    note: 'Top-tier MoE reasoning (~$0.44/$0.87 per 1M) — flagship intelligence at value-tier pricing for demanding storyboards.',
  },
  {
    value: 'x-ai/grok-4',
    openRouterId: 'x-ai/grok-4.20',
    label: 'Grok Heavy',
    provider: 'xAI',
    category: 'reasoning',
    costTier: 'medium',
    costLabel: 'Medium cost',
    note: 'Maximum quality via OpenRouter. Billed to OR balance (not direct xAI sub). Great for flagship work.',
  },

  // ── Image / Keyframe (11 models) ──
  {
    value: 'black-forest-labs/flux.2-klein-4b',
    openRouterId: 'black-forest-labs/flux.2-klein-4b',
    label: 'Flux Schnell / Klein',
    provider: 'BFL',
    category: 'image',
    costTier: 'value',
    costLabel: 'Good value',
    isDefault: true,
    imageModalities: ['image'],
    note: 'Fastest, cheapest per-megapixel keyframe generation. Ideal for high-volume pipeline iterations.',
  },
  {
    value: 'sourceful/riverflow-v2.5-fast',
    openRouterId: 'sourceful/riverflow-v2.5-fast',
    label: 'Riverflow V2.5 Fast',
    provider: 'Sourceful',
    category: 'image',
    costTier: 'value',
    costLabel: 'Good value',
    imageModalities: ['image'],
    note: 'Speed-optimized with built-in reasoning for edits and typography. Dynamic pricing based on effort. Excellent daily production value.',
  },
  {
    value: 'google/gemini-3-flash-image',
    openRouterId: 'google/gemini-3-flash-image',
    label: 'Gemini 3 Flash Image',
    provider: 'Google',
    category: 'image',
    costTier: 'value',
    costLabel: 'Good value',
    imageModalities: ['image', 'text'],
    note: 'Fast multimodal (text+image) with strong captioning and brand element control.',
  },
  {
    value: 'black-forest-labs/flux.2-flex',
    openRouterId: 'black-forest-labs/flux.2-flex',
    label: 'Flux Dev / Flex',
    provider: 'BFL',
    category: 'image',
    costTier: 'medium',
    costLabel: 'Medium cost',
    imageModalities: ['image'],
    note: 'Balanced everyday quality for most marketing keyframes. Higher per-MP cost than Klein/Schnell (~$0.06/MP).',
  },
  {
    value: 'stability-ai/sd3.5-large',
    openRouterId: 'stability-ai/sd3.5-large',
    label: 'SD 3.5 Large',
    provider: 'Stability',
    category: 'image',
    costTier: 'value',
    costLabel: 'Good value',
    imageModalities: ['image'],
    note: 'Open weights high-quality diffusion. Reliable fallback / stylistic variety at low cost.',
  },
  {
    value: 'sourceful/riverflow-v2.5-pro',
    openRouterId: 'sourceful/riverflow-v2.5-pro',
    label: 'Riverflow V2.5 Pro',
    provider: 'Sourceful',
    category: 'image',
    costTier: 'premium',
    costLabel: 'Premium — higher cost',
    imageModalities: ['image'],
    note: 'Highest control + reasoning effort for complex brand visuals (~$0.13/MP). Multi-image edits, custom fonts, repeatable hero assets. Dynamic pricing.',
  },
  {
    value: 'ideogram/ideogram-2.0',
    openRouterId: 'ideogram/ideogram-2.0',
    label: 'Ideogram 2.0',
    provider: 'Ideogram',
    category: 'image',
    costTier: 'medium',
    costLabel: 'Medium cost',
    imageModalities: ['image'],
    note: 'Outstanding typography and text-in-image for marketing assets, titles, and UI mockups.',
  },
  {
    value: 'black-forest-labs/flux.2-pro',
    openRouterId: 'black-forest-labs/flux.2-pro',
    label: 'Flux Pro',
    provider: 'BFL',
    category: 'image',
    costTier: 'value',
    costLabel: 'Good value',
    imageModalities: ['image'],
    note: 'High BFL quality at ~$0.03/MP — better fidelity than Klein with still-low per-megapixel cost. Great value for polished keyframes.',
  },
  {
    value: 'recraft/recraft-v3',
    openRouterId: 'recraft/recraft-v3',
    label: 'Recraft V3',
    provider: 'Recraft',
    category: 'image',
    costTier: 'medium',
    costLabel: 'Medium cost',
    imageModalities: ['image'],
    note: 'Production-grade vector-friendly and brand-consistent illustration / UI assets (~$0.04/MP).',
  },
  {
    value: 'leonardo/leonardo-premium',
    openRouterId: 'leonardo/leonardo-premium',
    label: 'Leonardo Premium',
    provider: 'Leonardo',
    category: 'image',
    costTier: 'premium',
    costLabel: 'Premium — higher cost',
    imageModalities: ['image'],
    note: 'Strong artistic control and motion-ready keyframes for cinematic or stylized looks.',
  },
  {
    value: 'google/imagen-3',
    openRouterId: 'google/imagen-3',
    label: 'Google Imagen 3',
    provider: 'Google',
    category: 'image',
    costTier: 'premium',
    costLabel: 'Premium — higher cost',
    imageModalities: ['image'],
    note: 'High-fidelity photoreal and product-grade imagery when maximum prompt adherence matters.',
  },

  // ── Video (11 models) — cloud only when Maximize Local is OFF; always expensive vs local ──
  {
    value: 'bytedance/seedance-2.0-fast',
    openRouterId: 'bytedance/seedance-2.0-fast',
    label: 'Seedance 2.0 Fast',
    provider: 'ByteDance',
    category: 'video',
    costTier: 'value',
    costLabel: 'Good value',
    isDefault: true,
    note: 'Lowest per-second cloud video on OpenRouter (~$0.054/s). Best price/performance for B-roll drafts — paid per second, never free.',
  },
  {
    value: 'minimax/hailuo-2.3',
    openRouterId: 'minimax/hailuo-2.3',
    label: 'Hailuo 2.3 (MiniMax)',
    provider: 'MiniMax',
    category: 'video',
    costTier: 'value',
    costLabel: 'Good value',
    note: 'Strong expressions and social-friendly output (~$0.08/s). Paid cloud video — never free — but among the cheapest reliable routes after Seedance.',
  },
  {
    value: 'bytedance/seedance-2.0',
    openRouterId: 'bytedance/seedance-2.0',
    label: 'Seedance 2.0',
    provider: 'ByteDance',
    category: 'video',
    costTier: 'value',
    costLabel: 'Good value',
    note: 'Higher quality motion & consistency than Fast tier (~$0.067/s). Paid per second — still among the cheapest reliable cloud video routes.',
  },
  {
    value: 'kwaivgi/kling-v3.0-std',
    openRouterId: 'kwaivgi/kling-v3.0-std',
    label: 'Kling 3.0 Standard',
    provider: 'Kling (Kuaishou)',
    category: 'video',
    costTier: 'medium',
    costLabel: 'Medium cost',
    note: 'Excellent character consistency and realistic motion. Very popular on user comparisons. First/last frame control.',
  },
  {
    value: 'luma/ray-3',
    openRouterId: 'luma/ray-3',
    label: 'Luma Ray 3',
    provider: 'Luma',
    category: 'video',
    costTier: 'medium',
    costLabel: 'Medium cost',
    note: 'Strong image-to-video and dreamlike cinematic extensions. Good for stylized or dreamy sequences.',
  },
  {
    value: 'kwaivgi/kling-v3.0-pro',
    openRouterId: 'kwaivgi/kling-v3.0-pro',
    label: 'Kling 3.0 Pro / Omni',
    provider: 'Kling (Kuaishou)',
    category: 'video',
    costTier: 'premium',
    costLabel: 'Premium — higher cost',
    note: 'Premium Kling tier with higher fidelity, longer clips, native audio options in some routes. Top user pick for character-driven work.',
  },
  {
    value: 'google/veo-3.1-fast',
    openRouterId: 'google/veo-3.1-fast',
    label: 'Google Veo 3.1 Fast',
    provider: 'Google',
    category: 'video',
    costTier: 'medium',
    costLabel: 'Medium cost',
    note: 'Fast Veo with native audio generation (~$0.08–0.10/s). Outstanding prompt adherence and lighting. Premium quality at mid-tier video pricing.',
  },
  {
    value: 'google/veo-3.1',
    openRouterId: 'google/veo-3.1',
    label: 'Google Veo 3.1',
    provider: 'Google',
    category: 'video',
    costTier: 'premium',
    costLabel: 'Premium — higher cost',
    note: 'Highest cinematic quality + synchronized audio. Best for hero shots when budget allows. 8-10s typical.',
  },
  {
    value: 'runway/gen-4.5',
    openRouterId: 'runway/gen-4.5',
    label: 'Runway Gen-4.5',
    provider: 'Runway',
    category: 'video',
    costTier: 'premium',
    costLabel: 'Premium — higher cost',
    note: 'Cinematic polish and creative control. Paid per-second cloud video — never free. Reserve for hero client moments. Pricing varies by route.',
  },
  {
    value: 'openai/sora-2',
    openRouterId: 'openai/sora-2-pro',
    label: 'Sora 2',
    provider: 'OpenAI',
    category: 'video',
    costTier: 'premium',
    costLabel: 'Premium — higher cost',
    note: 'OpenAI video via OpenRouter (~$0.30–0.50/s). Strong realism — always paid per second, never free.',
  },
  {
    value: 'wan/wan-2.7',
    openRouterId: 'alibaba/wan-2.7',
    label: 'Wan 2.7 (Alibaba)',
    provider: 'Alibaba',
    category: 'video',
    costTier: 'medium',
    costLabel: 'Medium cost',
    note: 'Strong multi-shot / reference-to-video (~$0.10/s). Paid cloud video — good mid-tier option for extended sequences.',
  },

  // ── Voice / TTS (10 models) ──
  {
    value: 'x-ai/grok-voice-tts-1.0',
    openRouterId: 'x-ai/grok-voice-tts-1.0',
    label: 'Grok Voice TTS 1.0',
    provider: 'xAI',
    category: 'voice',
    costTier: 'value',
    costLabel: 'Good value',
    isDefault: true,
    voices: GROK_VOICES,
    note: 'Natural xAI voices (Ara, Rex, Sal, Eve, Leo). ~$15/1M tokens — reliable default with good multilingual support.',
  },
  {
    value: 'playht/playht-3.0',
    openRouterId: 'playht/playht-3.0',
    label: 'PlayHT 3.0',
    provider: 'PlayHT',
    category: 'voice',
    costTier: 'value',
    costLabel: 'Good value',
    voices: PLAYHT_VOICES,
    note: 'Reliable budget TTS. Solid for drafts and high-volume narration. Use Alloy/Echo for neutral delivery.',
  },
  {
    value: 'google/gemini-3.1-flash-tts-preview',
    openRouterId: 'google/gemini-3.1-flash-tts-preview',
    label: 'Gemini 3.1 Flash TTS',
    provider: 'Google',
    category: 'voice',
    costTier: 'value',
    costLabel: 'Free',
    voices: GEMINI_VOICES,
    note: 'Ultra-low-cost Google TTS preview (~$1/1M tokens). Best free-tier option for voice testing and drafts.',
  },
  {
    value: 'elevenlabs/eleven-v3',
    openRouterId: 'elevenlabs/eleven-v3',
    label: 'ElevenLabs v3',
    provider: 'ElevenLabs',
    category: 'voice',
    costTier: 'medium',
    costLabel: 'Medium cost',
    voices: ELEVENLABS_VOICES,
    note: 'Industry standard for expressive, emotional, multilingual voiceovers. Best quality in mid tier for most users.',
  },
  {
    value: 'openai/tts-1',
    openRouterId: 'openai/tts-1',
    label: 'OpenAI TTS',
    provider: 'OpenAI',
    category: 'voice',
    costTier: 'medium',
    costLabel: 'Medium cost',
    voices: OPENAI_VOICES,
    note: 'Clean, consistent OpenAI voices. Good middle ground between cost and polish.',
  },
  {
    value: 'cartesia/sonic-2',
    openRouterId: 'cartesia/sonic-2',
    label: 'Cartesia Sonic 2',
    provider: 'Cartesia',
    category: 'voice',
    costTier: 'medium',
    costLabel: 'Medium cost',
    voices: CARTESIA_VOICES,
    note: 'Low-latency, high-clarity voices popular for modern product explainers.',
  },
  {
    value: 'openai/tts-1-hd',
    openRouterId: 'openai/tts-1-hd',
    label: 'OpenAI TTS HD',
    provider: 'OpenAI',
    category: 'voice',
    costTier: 'premium',
    costLabel: 'Premium — higher cost',
    voices: OPENAI_VOICES,
    note: 'Highest fidelity OpenAI TTS for final polished narration.',
  },
  {
    value: 'elevenlabs/eleven-multilingual-v3',
    openRouterId: 'elevenlabs/eleven-multilingual-v3',
    label: 'ElevenLabs Multilingual v3',
    provider: 'ElevenLabs',
    category: 'voice',
    costTier: 'premium',
    costLabel: 'Premium — higher cost',
    voices: ELEVENLABS_VOICES,
    note: 'Top expressive multilingual performance. Use for client work requiring perfect prosody and accent accuracy.',
  },
  {
    value: 'rime/rime-1',
    openRouterId: 'rime/rime-1',
    label: 'Rime 1',
    provider: 'Rime',
    category: 'voice',
    costTier: 'premium',
    costLabel: 'Premium — higher cost',
    voices: RIME_VOICES,
    note: 'Broadcast-quality, highly controllable voices. Excellent for high-end marketing voiceovers.',
  },
  {
    value: 'mistral/voxtral-tts',
    openRouterId: 'mistralai/voxtral-mini-tts-2603',
    label: 'Mistral Voxtral TTS',
    provider: 'Mistral',
    category: 'voice',
    costTier: 'medium',
    costLabel: 'Medium cost',
    voices: OPENAI_VOICES,
    note: 'Strong European language support and natural timbre (~$16/1M tokens). Mid-tier multilingual alternative.',
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
    description: 'Script planning, storyboards & creative direction (12 models)',
    models: MODEL_REGISTRY.filter(m => m.category === 'reasoning'),
  },
  image: {
    label: 'Image',
    description: 'Keyframe & asset generation (11 models)',
    models: MODEL_REGISTRY.filter(m => m.category === 'image'),
  },
  video: {
    label: 'Video',
    description: 'External cloud video generation (11 models) — expensive',
    costNote: 'Video models are significantly more expensive than text or image (often $0.02–$0.20+/sec). Always keep "Maximize Local Render" ON for cost control. Cloud video (Kling, Veo, Seedance, etc.) only for specific motion B-roll when local Hyperframes + FFmpeg cannot achieve the shot. Local render is free and instant.',
    models: MODEL_REGISTRY.filter(m => m.category === 'video'),
  },
  voice: {
    label: 'Voice',
    description: 'Narration & voiceover (10 models)',
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