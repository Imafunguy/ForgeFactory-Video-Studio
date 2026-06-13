import { getModelByValue, MODEL_GROUPS, PRICING_ID_ALIASES, type ModelCategory } from './models';

export { PRICING_ID_ALIASES };

const OPENROUTER_MODELS_URL = 'https://openrouter.ai/api/v1/models?output_modalities=all';
const OPENROUTER_VIDEOS_MODELS_URL = 'https://openrouter.ai/api/v1/videos/models';
const CACHE_KEY = 'ff_v2_model_pricing_cache_v2';
const CACHE_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours
const MP_IMAGE_FACTOR = 4096;
/** 480p (854×480) video tokens per second — used to convert per-token video rates to per-second display. */
const VIDEO_TOKENS_PER_SEC_480P = (854 * 480 * 24) / 1024;

export interface OpenRouterPricing {
  prompt?: string;
  completion?: string;
  image?: string;
  image_output?: string;
  request?: string;
  audio?: string;
  audio_output?: string;
}

export interface OpenRouterModelData {
  id: string;
  name?: string;
  description?: string;
  pricing: OpenRouterPricing;
  architecture?: {
    output_modalities?: string[];
    modality?: string;
  };
}

export interface ModelPricingInfo {
  modelId: string;
  displayPrice: string;
  isFree: boolean;
  unavailable: boolean;
}

interface PricingCache {
  fetchedAt: number;
  models: Record<string, ModelPricingInfo>;
}

function parseNum(v: string | number | undefined | null): number {
  if (v === undefined || v === null || v === '' || v === '-1') return 0;
  const n = typeof v === 'number' ? v : parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

function fmt(amount: number): string {
  if (amount === 0) return '0.00';
  if (amount >= 1) return amount.toFixed(2);
  if (amount >= 0.01) return amount.toFixed(3);
  return amount.toFixed(4);
}

function perMillion(perToken: number): number {
  return perToken * 1_000_000;
}

const PRICE_NUM = String.raw`([0-9]+(?:\.[0-9]+)?)`;

function formatPerSecondRate(amount: number, prefix = ''): string {
  return `${prefix}$${fmt(amount)} per second`;
}

/** True when a pricing_skus key represents a per-second video rate. */
function isPerSecondSkuKey(key: string): boolean {
  const k = key.toLowerCase();
  if (/cents_per_.*second/.test(k) || /cents_per_video_output_second/.test(k)) return true;
  if (/per[-_]?video[-_]?second/.test(k)) return true;
  if (/duration_seconds/.test(k)) return true;
  if (/_seconds(?:_|$)/.test(k)) return true;
  return false;
}

function skuValueToUsdPerSecond(key: string, raw: string): number | null {
  const n = parseFloat(raw);
  if (!Number.isFinite(n) || n <= 0) return null;
  const k = key.toLowerCase();
  if (/cents_per_/.test(k)) return n / 100;
  return n;
}

/** Extract per-second USD rates from OpenRouter /videos/models pricing_skus. */
function parsePricingSkus(pricingSkus?: Record<string, string> | null): string | null {
  if (!pricingSkus) return null;

  const perSecondRates: number[] = [];

  for (const [key, raw] of Object.entries(pricingSkus)) {
    if (!isPerSecondSkuKey(key)) continue;
    const usd = skuValueToUsdPerSecond(key, raw);
    if (usd !== null) perSecondRates.push(usd);
  }

  if (perSecondRates.length > 0) {
    const min = Math.min(...perSecondRates);
    const max = Math.max(...perSecondRates);
    if (Math.abs(min - max) < 0.00001) return formatPerSecondRate(min);
    return formatPerSecondRate(min, 'from ');
  }

  const tokenRate = parseFloat(
    pricingSkus.video_tokens_without_audio ?? pricingSkus.video_tokens ?? ''
  );
  if (tokenRate > 0) {
    return formatPerSecondRate(tokenRate * VIDEO_TOKENS_PER_SEC_480P, 'from ');
  }

  return null;
}

function parseDescriptionPricing(description?: string): string | null {
  if (!description) return null;

  const text = description.replace(/\u00a0/g, ' ');

  // Video per-second patterns (OpenRouter descriptions + model pages)
  // e.g. "$0.042 per second", "from $0.0538/second", "0.05 / sec of video", "approx 0.14 per second"
  const videoPatterns: Array<{ re: RegExp; format: (n: number, m: RegExpMatchArray) => string }> = [
    {
      re: new RegExp(String.raw`from\s+\$${PRICE_NUM}\s*/\s*second`, 'i'),
      format: (n) => formatPerSecondRate(n, 'from '),
    },
    {
      re: new RegExp(String.raw`\$${PRICE_NUM}\s*/\s*(?:sec(?:ond)?s?)(?:\s+of\s+(?:video|generation|clip))?`, 'i'),
      format: (n) => formatPerSecondRate(n),
    },
    {
      re: new RegExp(String.raw`\$${PRICE_NUM}\s*(?:per|\/)\s*(?:second|sec)(?:\s+of\s+(?:video|generation|video gen|clip|gen))?`, 'i'),
      format: (n) => formatPerSecondRate(n),
    },
    {
      re: new RegExp(String.raw`(?:approx\.?|approximately|about|~)\s*\$?${PRICE_NUM}[^\d$]{0,25}?(?:per|\/)\s*(?:second|sec)`, 'i'),
      format: (n) => formatPerSecondRate(n, '~'),
    },
    {
      re: new RegExp(String.raw`\$${PRICE_NUM}[^\$]{0,50}?(?:per|\/)\s*second`, 'i'),
      format: (n) => formatPerSecondRate(n),
    },
    {
      re: new RegExp(String.raw`(?:^|[^\d.])${PRICE_NUM}\s*(?:USD\s*)?(?:per|\/)\s*(?:second|sec)(?:\s+of\s+video)?`, 'i'),
      format: (n) => formatPerSecondRate(n),
    },
    {
      re: new RegExp(String.raw`\$${PRICE_NUM}\s*(?:per|\/)\s*s(?:econds?)?`, 'i'),
      format: (n) => formatPerSecondRate(n),
    },
  ];

  for (const { re, format } of videoPatterns) {
    const match = text.match(re);
    if (match) return format(parseFloat(match[1]), match);
  }
  const perMp = description.match(/\$([0-9]+(?:\.[0-9]+)?)\s*(?:\/|per)\s*megapixel/i);
  if (perMp) return `$${fmt(parseFloat(perMp[1]))} per megapixel`;
  const chargedMp = description.match(/megapixel is charged \$([0-9]+(?:\.[0-9]+)?)/i);
  if (chargedMp) return `$${fmt(parseFloat(chargedMp[1]))} per megapixel`;
  const perImage = description.match(/\$([0-9]+(?:\.[0-9]+)?)\s*(?:\/|per)\s*image/i);
  if (perImage) return `$${fmt(parseFloat(perImage[1]))} per image`;
  const per1kChar = description.match(/\$([0-9]+(?:\.[0-9]+)?)\s*(?:per|\/)\s*(?:1k|1000)?\s*char(?:s|acters)?/i);
  if (per1kChar) return `$${fmt(parseFloat(per1kChar[1]))} per 1k characters`;
  const perMChar = description.match(/\$([0-9]+(?:\.[0-9]+)?)\s*(?:per|\/)\s*(?:M|million)?\s*char/i);
  if (perMChar) return `$${fmt(parseFloat(perMChar[1]))} per 1M characters`;
  return null;
}

interface VideoModelPricingData {
  pricing_skus?: Record<string, string> | null;
  description?: string;
}

interface EndpointPricingBundle {
  description?: string;
  pricing: OpenRouterPricing;
  texts: string[];
}

function mergePricingObjects(...sources: Array<OpenRouterPricing | undefined>): OpenRouterPricing {
  const merged: Record<string, number> = {};
  for (const src of sources) {
    if (!src) continue;
    for (const [key, raw] of Object.entries(src)) {
      if (key === 'discount') continue;
      const n = parseNum(raw as string | number);
      if (n > 0) merged[key] = Math.max(merged[key] ?? 0, n);
    }
  }
  const out: OpenRouterPricing = {};
  for (const [key, n] of Object.entries(merged)) {
    out[key as keyof OpenRouterPricing] = String(n);
  }
  return out;
}

function normalizeEndpointData(endpointData?: unknown): EndpointPricingBundle {
  if (!endpointData || typeof endpointData !== 'object') {
    return { pricing: {}, texts: [] };
  }

  const data = endpointData as Record<string, unknown>;
  const texts: string[] = [];
  const pricingSources: OpenRouterPricing[] = [];

  const parentDescription =
    (typeof data.description === 'string' && data.description) ||
    (typeof (data.model as { description?: string } | undefined)?.description === 'string'
      ? (data.model as { description: string }).description
      : '');
  if (parentDescription) texts.push(parentDescription);

  if (Array.isArray(data.endpoints)) {
    for (const ep of data.endpoints) {
      if (!ep || typeof ep !== 'object') continue;
      const endpoint = ep as Record<string, unknown>;
      if (typeof endpoint.description === 'string') texts.push(endpoint.description);
      if (typeof endpoint.model_name === 'string') texts.push(endpoint.model_name);
      if (endpoint.pricing && typeof endpoint.pricing === 'object') {
        pricingSources.push(endpoint.pricing as OpenRouterPricing);
      }
    }
  }

  if (data.pricing && typeof data.pricing === 'object' && !Array.isArray(data.endpoints)) {
    pricingSources.push(data.pricing as OpenRouterPricing);
  } else if (
    !Array.isArray(data.endpoints) &&
    !data.description &&
    Object.keys(data).some(k => ['prompt', 'completion', 'request', 'image', 'image_output', 'audio'].includes(k))
  ) {
    pricingSources.push(data as OpenRouterPricing);
  }

  return {
    description: parentDescription || undefined,
    pricing: mergePricingObjects(...pricingSources),
    texts,
  };
}

function firstDescriptionPrice(...sources: Array<string | undefined | null>): string | null {
  for (const text of sources) {
    const parsed = parseDescriptionPricing(text ?? undefined);
    if (parsed) return parsed;
  }
  return null;
}

const VIDEO_FALLBACK_PRICE = 'See OpenRouter pricing';
const VIDEO_USAGE_FALLBACK = 'Usage-based (per second)';

function videoFallbackLabel(hasOpenRouterListing: boolean): string {
  return hasOpenRouterListing ? VIDEO_USAGE_FALLBACK : VIDEO_FALLBACK_PRICE;
}

export function formatModelPricing(
  model: OpenRouterModelData | undefined,
  endpointData?: unknown,
  videoModelData?: VideoModelPricingData,
  registryId?: string
): ModelPricingInfo {
  const registryModel = registryId ? getModelByValue(registryId) : undefined;
  const modelId = registryId ?? model?.id ?? 'unknown';

  const endpointBundle = normalizeEndpointData(endpointData);
  const endpointTexts = endpointBundle.texts;

  // Merge pricing from main list + any endpoints data (endpoints often provide the real per-use prices for media models)
  const pricing = mergePricingObjects(model?.pricing, endpointBundle.pricing);
  const outputs = model?.architecture?.output_modalities ?? [];
  const modality = model?.architecture?.modality ?? '';

  const prompt = parseNum(pricing.prompt);
  const completion = parseNum(pricing.completion);
  const imageOutput = parseNum(pricing.image_output);
  const image = parseNum(pricing.image);
  const request = parseNum(pricing.request);
  const audio = parseNum(pricing.audio);

  const lowerId = modelId.toLowerCase();
  const isVideoLike = registryModel?.category === 'video' ||
    outputs.includes('video') || modality.includes('->video') ||
    /video|kling|veo|seedance|runway|luma|sora|wan|hailuo|minimax/.test(lowerId);
  const isImageLike = registryModel?.category === 'image' ||
    (outputs.includes('image') && !outputs.includes('text')) || modality.includes('->image') ||
    /flux|riverflow|ideogram|sd3|recraft|leonardo|imagen|image/.test(lowerId);
  const isVoiceLike = registryModel?.category === 'voice' ||
    outputs.includes('speech') || outputs.includes('audio') ||
    /tts|voice|playht|eleven|grok-voice|cartesia|rime|voxtral/.test(lowerId);

  // Image / megapixel models (relaxed for name match to catch more via endpoints)
  if (isImageLike) {
    if (imageOutput > 0) {
      const perMp = imageOutput * MP_IMAGE_FACTOR;
      return {
        modelId,
        displayPrice: `$${fmt(perMp)} per megapixel`,
        isFree: perMp === 0,
        unavailable: false,
      };
    }
    if (image > 0) {
      const perMp = image * MP_IMAGE_FACTOR;
      return {
        modelId,
        displayPrice: `$${fmt(perMp)} per megapixel`,
        isFree: false,
        unavailable: false,
      };
    }
    const fromDesc = parseDescriptionPricing(model?.description);
    if (fromDesc) {
      return { modelId, displayPrice: fromDesc, isFree: false, unavailable: false };
    }
  }

  // Video models — prioritize /videos/models pricing_skus (authoritative per-second rates)
  if (isVideoLike) {
    const fromSkus = parsePricingSkus(videoModelData?.pricing_skus);
    if (fromSkus) {
      return { modelId, displayPrice: fromSkus, isFree: false, unavailable: false };
    }
    const fromDesc = firstDescriptionPrice(
      model?.description,
      videoModelData?.description,
      endpointBundle.description,
      ...endpointTexts
    );
    if (fromDesc) {
      return { modelId, displayPrice: fromDesc, isFree: false, unavailable: false };
    }
    if (request > 0) {
      return {
        modelId,
        displayPrice: `$${fmt(request)} per second`,
        isFree: false,
        unavailable: false,
      };
    }
    if (completion > 0) {
      return {
        modelId,
        displayPrice: `$${fmt(perMillion(completion))} per 1M video tokens`,
        isFree: false,
        unavailable: false,
      };
    }
    return {
      modelId,
      displayPrice: videoFallbackLabel(Boolean(model || videoModelData)),
      isFree: false,
      unavailable: false,
    };
  }

  // Speech / TTS (relaxed)
  if (isVoiceLike) {
    if (prompt > 0 && completion === 0) {
      return {
        modelId,
        displayPrice: `$${fmt(perMillion(prompt))} per 1M tokens`,
        isFree: false,
        unavailable: false,
      };
    }
    if (audio > 0) {
      return {
        modelId,
        displayPrice: `$${fmt(perMillion(audio))} per 1M audio tokens`,
        isFree: false,
        unavailable: false,
      };
    }
  }

  // Token-based (text / multimodal)
  if (prompt > 0 || completion > 0) {
    const promptM = perMillion(prompt);
    const completionM = perMillion(completion);
    const isFree = promptM === 0 && completionM === 0;

    if (isFree) {
      return { modelId, displayPrice: 'Free', isFree: true, unavailable: false };
    }

    if (Math.abs(promptM - completionM) < 0.0001 && promptM > 0) {
      return {
        modelId,
        displayPrice: `$${fmt(promptM)} per 1M tokens`,
        isFree: false,
        unavailable: false,
      };
    }

    return {
      modelId,
      displayPrice: `$${fmt(promptM)} / $${fmt(completionM)} per 1M tokens`,
      isFree: false,
      unavailable: false,
    };
  }

  const fromDesc = firstDescriptionPrice(
    model?.description,
    videoModelData?.description,
    endpointBundle.description,
    ...endpointTexts
  );
  if (fromDesc) {
    return { modelId, displayPrice: fromDesc, isFree: false, unavailable: false };
  }
  const fromSkus = parsePricingSkus(videoModelData?.pricing_skus);
  if (fromSkus && isVideoLike) {
    return { modelId, displayPrice: fromSkus, isFree: false, unavailable: false };
  }

  if (prompt === 0 && completion === 0 && imageOutput === 0 && request === 0 &&
      !isVideoLike && !isImageLike && !isVoiceLike) {
    return { modelId, displayPrice: 'Free', isFree: true, unavailable: false };
  }

  // Friendly labels + graceful handling when no exact pricing data came back from OpenRouter
  if (isVideoLike || /video|kling|veo|seedance|runway|luma|sora|wan|hailuo|minimax/.test(lowerId)) {
    return {
      modelId,
      displayPrice: videoFallbackLabel(Boolean(model || videoModelData)),
      isFree: false,
      unavailable: false,
    };
  }
  if (isImageLike || /flux|riverflow|ideogram|sd3|recraft|leonardo|imagen/.test(lowerId)) {
    return { modelId, displayPrice: 'Per-megapixel / usage-based', isFree: false, unavailable: false };
  }
  if (isVoiceLike || /tts|voice|playht|eleven|grok-voice|cartesia|rime|voxtral/.test(lowerId)) {
    return { modelId, displayPrice: 'Usage-based (TTS)', isFree: false, unavailable: false };
  }

  return { modelId, displayPrice: 'Price unavailable', isFree: false, unavailable: true };
}

function loadCache(): PricingCache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PricingCache;
    if (!parsed.fetchedAt || !parsed.models) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveCache(cache: PricingCache): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // ignore quota errors
  }
}

export function getCachedPricing(): PricingCache | null {
  const cache = loadCache();
  if (!cache) return null;
  if (Date.now() - cache.fetchedAt > CACHE_TTL_MS) return null;
  return cache;
}

export function getStaleCachedPricing(): PricingCache | null {
  return loadCache();
}

async function fetchEndpointsPricing(modelId: string, apiKey: string): Promise<EndpointPricingBundle | undefined> {
  try {
    const headers: Record<string, string> = {};
    if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
    // Do not encode slashes in model IDs (e.g. black-forest-labs/flux.2-klein-4b)
    const res = await fetch(`https://openrouter.ai/api/v1/models/${modelId}/endpoints`, { headers });
    if (!res.ok) return undefined;
    const json = await res.json();
    const data = json?.data;
    if (!data) return undefined;
    // Return parent description + all endpoint pricing rows (image/video/TTS rates often live here)
    return normalizeEndpointData(data);
  } catch {
    return undefined;
  }
}

async function fetchVideoModelsMap(
  apiKey: string
): Promise<Map<string, VideoModelPricingData>> {
  const map = new Map<string, VideoModelPricingData>();
  try {
    const headers: Record<string, string> = {};
    if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
    const res = await fetch(OPENROUTER_VIDEOS_MODELS_URL, { headers });
    if (!res.ok) return map;
    const json = await res.json();
    for (const m of json.data ?? []) {
      const entry: VideoModelPricingData = {
        pricing_skus: m.pricing_skus ?? null,
        description: m.description,
      };
      map.set(m.id, entry);
      const slug = typeof m.id === 'string' && m.id.includes('/')
        ? m.id.split('/').slice(1).join('/')
        : m.id;
      if (slug) map.set(slug, entry);
      if (typeof m.canonical_slug === 'string') {
        map.set(m.canonical_slug, entry);
        const canonSlug = m.canonical_slug.includes('/')
          ? m.canonical_slug.split('/').slice(1).join('/')
          : m.canonical_slug;
        if (canonSlug) map.set(canonSlug, entry);
      }
    }
  } catch {
    // optional enrichment — main pricing path still works without it
  }
  return map;
}

function lookupVideoModelData(
  map: Map<string, VideoModelPricingData>,
  resolved: string,
  registryId: string,
  openRouterId?: string
): VideoModelPricingData | undefined {
  const candidates = [
    resolved,
    registryId,
    openRouterId,
    resolved.split('/').slice(1).join('/'),
    registryId.split('/').slice(1).join('/'),
    openRouterId?.split('/').slice(1).join('/'),
  ].filter((k): k is string => Boolean(k));

  for (const key of candidates) {
    const hit = map.get(key);
    if (hit) return hit;
  }

  const slug = registryId.split('/').slice(1).join('/').toLowerCase();
  if (!slug) return undefined;

  for (const [key, entry] of map) {
    const keySlug = key.split('/').slice(1).join('/').toLowerCase();
    if (!keySlug) continue;
    if (keySlug === slug || keySlug.startsWith(`${slug}-`) || keySlug.startsWith(`${slug}.`)) {
      return entry;
    }
  }

  return undefined;
}

export async function fetchModelPricing(apiKey: string, force = false): Promise<{
  models: Record<string, ModelPricingInfo>;
  fetchedAt: number;
  fromCache: boolean;
}> {
  const configuredIds = Object.values(MODEL_GROUPS).flatMap(g => g.models.map(m => m.value));

  // If we have a cache but it doesn't yet cover every model in the *current* registry
  // (e.g. new models were added to src/lib/models.ts since last fetch, or old partial cache),
  // proactively do a live fetch so we attempt to obtain pricing for the full set.
  // This satisfies "comprehensive on launch + refresh for all models in the registry".
  if (!force) {
    const cached = getCachedPricing();
    if (cached) {
      const hasFullCoverage = configuredIds.every(id => id in cached.models);
      if (hasFullCoverage) {
        return {
          models: ensureCoverageForCurrent(cached.models, configuredIds),
          fetchedAt: cached.fetchedAt,
          fromCache: true,
        };
      }
      // cache is incomplete for the current registry → fall through to live fetch below
    }
  }

  const headers: Record<string, string> = {
    'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://forgefactory.local',
    'X-Title': 'ForgeFactory v2',
  };
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

  let modelList: OpenRouterModelData[] = [];
  let videoModelsMap = new Map<string, VideoModelPricingData>();
  try {
    const [modelsRes, videoModelsMapResult] = await Promise.all([
      fetch(OPENROUTER_MODELS_URL, { headers }),
      fetchVideoModelsMap(apiKey),
    ]);
    if (!modelsRes.ok) throw new Error(`OpenRouter models API: ${modelsRes.status}`);
    const json = await modelsRes.json();
    modelList = json.data ?? [];
    videoModelsMap = videoModelsMapResult;
  } catch (err) {
    const stale = getStaleCachedPricing();
    if (stale) {
      return {
        models: ensureCoverageForCurrent(stale.models, configuredIds),
        fetchedAt: stale.fetchedAt,
        fromCache: true,
      };
    }
    throw err;
  }

  const byId = new Map<string, OpenRouterModelData>();
  for (const m of modelList) byId.set(m.id, m);

  // Build list of IDs for which we want to proactively fetch /endpoints.
  // This is the key change for "comprehensive": we aggressively request endpoint pricing
  // (which often contains the real per-second / per-mp / usage pricing for video/image/TTS)
  // for *all* media models in the registry, not just a subset that happened to appear with $0 in the main list.
  const needsEndpoints: string[] = [];

  // Collect all media (image/video/voice) openRouterIds from the *current* registry.
  // We will attempt endpoints for them even if they didn't appear in the main /models response.
  const mediaIdsToTry = new Set<string>();
  Object.values(MODEL_GROUPS).forEach(group => {
    group.models.forEach(m => {
      if (m.category === 'image' || m.category === 'video' || m.category === 'voice') {
        const rid = PRICING_ID_ALIASES[m.value] ?? m.openRouterId ?? m.value;
        mediaIdsToTry.add(rid);
      }
    });
  });

  for (const id of configuredIds) {
    const resolved = PRICING_ID_ALIASES[id] ?? id;
    const m = byId.get(resolved) ?? byId.get(id);

    if (m) {
      const outputs = m.architecture?.output_modalities ?? [];
      const prompt = parseNum(m.pricing?.prompt);
      const completion = parseNum(m.pricing?.completion);
      const imageOutput = parseNum(m.pricing?.image_output);
      if ((outputs.includes('image') || outputs.includes('video')) && prompt === 0 && completion === 0 && imageOutput === 0) {
        needsEndpoints.push(m.id);
      }
      // Also try endpoints for voice models that have no obvious audio pricing in main list
      if ((outputs.includes('speech') || outputs.includes('audio') || /tts|voice/.test(resolved.toLowerCase())) &&
          parseNum(m.pricing?.audio) === 0) {
        needsEndpoints.push(m.id);
      }
    } else {
      // Model not present in main list — still try its endpoint using the ID we expect (helps many video/image/TTS)
      if (mediaIdsToTry.has(resolved)) {
        needsEndpoints.push(resolved);
      }
    }
  }

  // Always attempt endpoints for every media model known to the registry (comprehensive coverage)
  for (const mid of mediaIdsToTry) {
    if (!needsEndpoints.includes(mid)) needsEndpoints.push(mid);
  }

  const uniqueNeeds = [...new Set(needsEndpoints)].filter(Boolean);

  const endpointDataMap = new Map<string, any>();
  const batchSize = 4;
  for (let i = 0; i < uniqueNeeds.length; i += batchSize) {
    const batch = uniqueNeeds.slice(i, i + batchSize);
    const results = await Promise.all(batch.map(id => fetchEndpointsPricing(id, apiKey)));
    batch.forEach((requestedId, idx) => {
      if (results[idx]) {
        endpointDataMap.set(requestedId, results[idx]);
      }
    });
  }

  const models: Record<string, ModelPricingInfo> = {};

  for (const id of configuredIds) {
    const resolved = PRICING_ID_ALIASES[id] ?? id;
    const m = byId.get(resolved) ?? byId.get(id);
    // Prefer full endpoint data (for .pricing + possible .description/price context) fetched by the registry's intended ID
    const endpointData = endpointDataMap.get(resolved) ?? (m ? endpointDataMap.get(m.id) : undefined);
    const registryModel = getModelByValue(id);
    const videoModelData = lookupVideoModelData(
      videoModelsMap,
      resolved,
      id,
      registryModel?.openRouterId
    );
    models[id] = formatModelPricing(m, endpointData, videoModelData, id);
  }

  const finalModels = ensureCoverageForCurrent(models, configuredIds);
  const fetchedAt = Date.now();
  saveCache({ fetchedAt, models: finalModels });

  return { models: finalModels, fetchedAt, fromCache: false };
}

export function getDisplayPrice(
  pricingMap: Record<string, ModelPricingInfo>,
  modelId: string
): ModelPricingInfo {
  return pricingMap[modelId] ?? {
    modelId,
    displayPrice: 'Price unavailable',
    isFree: false,
    unavailable: true,
  };
}

/**
 * Ensure the returned pricing map has an entry for every model currently in the registry.
 * New/unseen models get a graceful "Price unavailable" so the UI always renders a price label.
 * This makes the system automatically support models added to src/lib/models.ts in the future.
 */
export function ensureCoverageForCurrent(
  priced: Record<string, ModelPricingInfo>,
  configuredIds: string[]
): Record<string, ModelPricingInfo> {
  const out: Record<string, ModelPricingInfo> = { ...priced };
  for (const id of configuredIds) {
    if (!out[id]) {
      out[id] = {
        modelId: id,
        displayPrice: 'Price unavailable',
        isFree: false,
        unavailable: true,
      };
    }
  }
  return out;
}

/** Relative "last updated" label for UX (e.g. "12m ago", "Just now"). */
export function formatLastUpdated(ts: number | null): string {
  if (!ts) return 'Never';
  const diffMs = Date.now() - ts;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/**
 * Generates clean, copy-pasteable Markdown for keeping docs/models.md in sync.
 * Does NOT write to disk (web app cannot reliably do so). User pastes the output.
 * Includes live prices (from pricingMap) + static registry metadata (tier, note summary).
 */
export function generatePricingMarkdown(
  pricingMap: Record<string, ModelPricingInfo>,
  lastFetched: number | null
): string {
  const now = new Date().toLocaleString();
  const updated = lastFetched ? new Date(lastFetched).toLocaleString() : 'unknown';

  let md = `# Live OpenRouter Pricing Snapshot

**Generated:** ${now}  
**Last fetched from OpenRouter:** ${updated} (local time)  
**Source:** ForgeFactory in-app (https://openrouter.ai/api/v1/models + /videos/models + endpoints)

> Prices are **dynamic** and cached client-side (8h TTL). Always refresh in the app before important work or doc updates.  
> Use the **"Export Current Prices to Markdown"** button in Model Lab or Settings to regenerate this.

`;

  const categoryOrder: ModelCategory[] = ['reasoning', 'image', 'video', 'voice'];
  const catLabels: Record<ModelCategory, string> = {
    reasoning: 'Reasoning Models',
    image: 'Image / Keyframe Models',
    video: 'Video Models (cloud — use sparingly)',
    voice: 'Voice / TTS Models',
  };

  for (const cat of categoryOrder) {
    const group = MODEL_GROUPS[cat];
    if (!group || !group.models?.length) continue;

    md += `## ${catLabels[cat]}\n\n`;
    md += '| Model | OpenRouter ID | Live Price | Cost Tier | Notes (short) |\n';
    md += '|-------|---------------|------------|-----------|---------------|\n';

    for (const m of group.models) {
      const p = pricingMap[m.value] ?? getDisplayPrice(pricingMap, m.value);
      const priceStr = p.isFree ? 'Free' : (p.unavailable ? 'Price unavailable' : p.displayPrice);
      const tier = `${m.costTier} (${m.costLabel})`;
      const shortNote = (m.note || '').slice(0, 90).replace(/\n/g, ' ').replace(/\|/g, '-');
      md += `| ${m.label} | \`${m.openRouterId}\` | ${priceStr} | ${tier} | ${shortNote} |\n`;
    }
    md += '\n';
  }

  md += `---

**How to use this in docs:**
1. Copy the tables above.
2. In \`docs/models.md\`, replace or augment the "Approx. Pricing (live)" columns / recommendation tables with the live values.
3. Update the snapshot header date.
4. Commit the doc update for the team.

**Reminder:** Local Hyperframes render is always free. Cloud video (Video category) is the main cost driver — keep Maximize Local ON for daily work.
`;

  return md;
}