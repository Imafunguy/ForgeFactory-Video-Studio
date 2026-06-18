import { FlaskConical, Wallet, Sparkles, AlertCircle, RefreshCw, Clock, Info, Download, FileText } from 'lucide-react';
import { ModelLabGrid } from '../ModelSelector';
import { VoiceSelector } from '../VoiceSelector';
import { Button, Card, CostBadge } from '../ui';
import { ModelPrice } from '../ModelPrice';
import {
  DEFAULT_IMAGE_MODEL,
  DEFAULT_REASONING_MODEL,
  DEFAULT_VIDEO_MODEL,
  DEFAULT_VOICE_MODEL,
  FORGE_FACTORY_MODEL_COUNT,
  FORGE_FACTORY_MODELS_DOC,
  getModelByValue,
  generatePricingMarkdown,
  listForgeFactoryPresets,
  type PipelinePresetId,
} from '../../lib/constants';
import { useModelPricing } from '../../context/ModelPricingContext';
import { toast } from 'sonner';

interface ModelLabProps {
  planningModel: string;
  imageModel: string;
  videoModel: string;
  voiceModel: string;
  maximizeLocal: boolean;
  qualityBoost: boolean;
  onPlanningChange: (v: string) => void;
  onImageChange: (v: string) => void;
  onVideoChange: (v: string) => void;
  onVoiceChange: (v: string) => void;
  voiceId: string;
  onVoiceIdChange: (v: string) => void;
  onVoicePreview?: (voiceId: string) => Promise<void>;
  voicePreviewLoading?: boolean;
  onMaximizeLocalChange: (v: boolean) => void;
  onApplyPreset: (presetId: PipelinePresetId) => void;
}

export function ModelLab({
  planningModel,
  imageModel,
  videoModel,
  voiceModel,
  maximizeLocal,
  qualityBoost,
  onPlanningChange,
  onImageChange,
  onVideoChange,
  onVoiceChange,
  voiceId,
  onVoiceIdChange,
  onVoicePreview,
  voicePreviewLoading,
  onMaximizeLocalChange,
  onApplyPreset,
}: ModelLabProps) {
  const forgeFactoryPresets = listForgeFactoryPresets();
  const {
    getPrice,
    isLoading,
    error,
    lastFetched,
    fromCache,
    lastUpdatedLabel,
    pricingMap,
    refreshPricing,
  } = useModelPricing();
  const reasoning = getModelByValue(planningModel);
  const image = getModelByValue(imageModel);
  const video = getModelByValue(videoModel);
  const voice = getModelByValue(voiceModel);
  const reasoningPrice = getPrice(planningModel);
  const imagePrice = getPrice(imageModel);
  const videoPrice = getPrice(videoModel);
  const voicePrice = getPrice(voiceModel);
  const usingValueDefaults =
    planningModel === DEFAULT_REASONING_MODEL &&
    imageModel === DEFAULT_IMAGE_MODEL &&
    videoModel === DEFAULT_VIDEO_MODEL &&
    voiceModel === DEFAULT_VOICE_MODEL;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Card className="p-6 border-indigo-500/10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
              <FlaskConical className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-white">Model Lab</h2>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                {FORGE_FACTORY_MODEL_COUNT} curated models from {FORGE_FACTORY_MODELS_DOC}. Live OpenRouter
                prices shown next to each model. Video and Voice selections apply to Video Studio and Agentic Pipeline.
              </p>
              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                Free / near-free · Good value (daily) · Medium · Premium (high-end)
              </p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              loading={isLoading}
              onClick={() => refreshPricing(true)}
            >
              Refresh Prices
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={Download}
              onClick={() => {
                const md = generatePricingMarkdown(pricingMap, lastFetched);
                navigator.clipboard
                  .writeText(md)
                  .then(() => {
                    toast.success('Pricing markdown copied', {
                      description: 'Paste into docs/models.md (replaces snapshot or updates tables).',
                    });
                  })
                  .catch(() => toast.error('Clipboard copy failed'));
              }}
              title="Export current live prices as Markdown for docs/models.md"
            >
              Export MD
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-white/[0.06] text-[10px] text-slate-600">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            Updated: {lastUpdatedLabel}
            {fromCache && lastFetched && ' (cached)'}
          </span>
          {error && <span className="text-amber-400">{error}</span>}
        </div>
      </Card>

      <Card className="p-5 border-indigo-500/10 bg-indigo-500/[0.02]">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-indigo-200 mb-1">Live pricing from OpenRouter</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Prices are fetched live from OpenRouter and may change. Cached for 8 hours to reduce API calls.
              Grok models are billed to your <span className="text-slate-400">OpenRouter balance</span>, not your
              direct xAI subscription.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-5 border-amber-500/15 bg-amber-500/[0.03]">
        <div className="flex items-start gap-3">
          <Wallet className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-amber-200 mb-1">OpenRouter billing</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every model charges your OpenRouter balance per use. Use the Best Value preset for daily work.
              Premium models cost more per generation.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4 border-emerald-500/15 space-y-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={maximizeLocal}
            onChange={e => onMaximizeLocalChange(e.target.checked)}
            className="mt-1"
          />
          <div>
            <p className="text-sm font-semibold text-emerald-200">Maximize Local Render</p>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              When enabled, the pipeline biases planning toward Hyperframes + FFmpeg (free local render).
              When disabled, cloud video generation is attempted with your selected video model before falling back locally.
            </p>
          </div>
        </label>
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={qualityBoost} readOnly className="mt-1 opacity-70" />
          <div>
            <p className="text-sm font-semibold text-emerald-200">Quality Boost</p>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {qualityBoost
                ? 'ON — planning uses Grok 4.20, keyframes use Gemini 3 Pro Image (toggle in Video Studio / Agentic Pipeline).'
                : 'OFF — uses your selected Reasoning + Image models. Enable in Video Studio for hero renders.'}
            </p>
          </div>
        </label>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: 'Active Reasoning Model', meta: reasoning, price: reasoningPrice },
          { label: 'Active Image Model', meta: image, price: imagePrice },
          { label: 'Active Video Model', meta: video, price: videoPrice },
          { label: 'Active Voice Model', meta: voice, price: voicePrice },
        ].map(({ label, meta, price }) => (
          <Card key={label} className="p-4">
            <p className="forge-label mb-2">{label}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-white">{meta?.label || 'Unknown'}</span>
              {meta && <CostBadge tier={meta.costTier} label={meta.costLabel} />}
            </div>
            <div className="mt-2">
              <ModelPrice pricing={price} size="sm" />
            </div>
            {meta?.note && <p className="text-[10px] text-slate-600 mt-2">{meta.note}</p>}
          </Card>
        ))}
      </div>

      <Card className="p-5 border-indigo-500/15">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="font-semibold text-white">ForgeFactoryModels.md Presets</h3>
            <p className="text-xs text-slate-500 mt-1">
              One-click stacks from the production model guide — {FORGE_FACTORY_MODEL_COUNT} models total.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            icon={FileText}
            onClick={() => onApplyPreset('best-value-promo')}
          >
            Load from ForgeFactoryModels.md
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {forgeFactoryPresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onApplyPreset(preset.id)}
              className="text-left p-4 rounded-xl border border-white/[0.08] hover:border-indigo-500/30 hover:bg-indigo-500/[0.04] transition-all"
            >
              <p className="text-sm font-semibold text-white">{preset.label}</p>
              <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{preset.description}</p>
              <p className="text-[10px] text-indigo-300/80 mt-2 font-mono leading-relaxed">
                {preset.models.reasoning.split('/').pop()} · {preset.models.image.split('/').pop()} ·{' '}
                {preset.models.video.split('/').pop()} · {preset.models.voice.split('/').pop()}
              </p>
            </button>
          ))}
        </div>
      </Card>

      {usingValueDefaults && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <p className="text-xs text-emerald-400/90">
            Using Best Value defaults — Qwen3.6 Plus, Gemini 2.5 Flash Image, Hailuo 2.3, GPT Audio Mini.
          </p>
        </div>
      )}

      {(reasoning?.costTier === 'premium' || image?.costTier === 'premium' || video?.costTier === 'premium') && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-violet-500/5 border border-violet-500/15">
          <AlertCircle className="w-4 h-4 text-violet-400 shrink-0" />
          <p className="text-xs text-violet-300/90">
            Premium models selected — expect higher OpenRouter costs per generation. Ideal for hero videos and final renders.
          </p>
        </div>
      )}

      <Card className="p-5">
        <h3 className="font-semibold text-white mb-3">Voice Selection</h3>
        <p className="text-xs text-slate-500 mb-4">
          Choose a voice for your selected voice model. Preview plays a short sample via OpenRouter TTS.
        </p>
        <VoiceSelector
          voiceModel={voiceModel}
          voiceId={voiceId}
          onVoiceChange={onVoiceIdChange}
          onPreview={onVoicePreview}
          previewLoading={voicePreviewLoading}
        />
      </Card>

      <ModelLabGrid
        planningModel={planningModel}
        imageModel={imageModel}
        videoModel={videoModel}
        voiceModel={voiceModel}
        onPlanningChange={onPlanningChange}
        onImageChange={onImageChange}
        onVideoChange={onVideoChange}
        onVoiceChange={onVoiceChange}
      />

      <p className="text-[10px] text-slate-600 text-center leading-relaxed px-4">
        All four model selections apply to Video Studio and Agentic Pipeline immediately.
        {maximizeLocal
          ? ' Maximize Local is ON — cloud video is skipped; Hyperframes render is free.'
          : ' Maximize Local is OFF — cloud video will be attempted with your selected video model.'}
      </p>
    </div>
  );
}