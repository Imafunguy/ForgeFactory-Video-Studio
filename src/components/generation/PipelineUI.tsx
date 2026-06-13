import { motion } from 'framer-motion';
import {
  Brain, Cpu, CheckCircle2, Circle, Loader2, AlertCircle, Pause,
  Image, FileText, Clapperboard, Download, RefreshCw, Copy, Pencil, Mic, Video,
} from 'lucide-react';
import type { KeyframeAsset, PipelineStepDef, StepStatus, AgenticToolCall } from '../../lib/pipeline';
import { cn } from '../../lib/utils';
import { Badge, Button, Card, ProgressBar, CostBadge } from '../ui';
import { ModelPrice } from '../ModelPrice';
import type { ModelPricingInfo } from '../../lib/modelPricing';
import { getModelByValue } from '../../lib/constants';
import { useModelPricing } from '../../context/ModelPricingContext';

const STATUS_ICON = {
  pending: Circle,
  active: Loader2,
  complete: CheckCircle2,
  error: AlertCircle,
  paused: Pause,
};

export function PhaseDivider({ phase }: { phase: 'intelligence' | 'local' }) {
  const isIntel = phase === 'intelligence';
  return (
    <div className="flex items-center gap-2 py-2">
      <div className={cn(
        'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border',
        isIntel ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
      )}>
        {isIntel ? <Brain className="w-3 h-3" /> : <Cpu className="w-3 h-3" />}
        {isIntel ? 'OpenRouter Intelligence' : 'Local Hyperframes Render'}
      </div>
      <div className="flex-1 h-px bg-white/[0.06]" />
    </div>
  );
}

export function PipelineStepTracker({
  steps,
  stepStatuses,
  currentStepId,
  etaSeconds,
}: {
  steps: PipelineStepDef[];
  stepStatuses: Record<string, StepStatus>;
  currentStepId: string | null;
  etaSeconds: number;
}) {
  const progress = steps.filter(s => stepStatuses[s.id] === 'complete').length;
  const pct = Math.round((progress / steps.length) * 100);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="forge-label">Pipeline Progress</p>
        <div className="flex items-center gap-3 text-xs">
          {etaSeconds > 0 && currentStepId && (
            <span className="text-slate-500">~{etaSeconds}s remaining</span>
          )}
          <span className="font-mono text-indigo-400">{pct}%</span>
        </div>
      </div>
      <ProgressBar value={pct} className="mb-5" />

      <div className="space-y-1">
        {steps.map((step, i) => {
          const status = stepStatuses[step.id] ?? 'pending';
          const Icon = STATUS_ICON[status];
          const showPhaseDivider = i === 0 || steps[i - 1].phase !== step.phase;

          return (
            <div key={step.id}>
              {showPhaseDivider && <PhaseDivider phase={step.phase} />}
              <motion.div
                layout
                className={cn(
                  'flex items-center gap-3 p-2.5 rounded-xl transition-colors',
                  status === 'active' && 'bg-indigo-500/10 border border-indigo-500/20',
                  status === 'complete' && 'opacity-80'
                )}
              >
                <Icon className={cn(
                  'w-5 h-5 shrink-0',
                  status === 'complete' && 'text-emerald-400',
                  status === 'active' && 'text-indigo-400 animate-spin',
                  status === 'pending' && 'text-slate-700',
                  status === 'paused' && 'text-amber-400',
                  status === 'error' && 'text-red-400',
                )} />
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm font-medium', status !== 'pending' ? 'text-white' : 'text-slate-600')}>
                    {step.label}
                  </p>
                  <p className="text-[10px] text-slate-600">{step.description}</p>
                </div>
                {status === 'active' && (
                  <Badge variant="accent">Running</Badge>
                )}
                {status === 'complete' && (
                  <Badge variant="success">Done</Badge>
                )}
              </motion.div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export function ModelCostBanner({
  planningModel,
  imageModel,
  videoModel,
  voiceModel,
  reasoningPrice,
  imagePrice,
  videoPrice,
  voicePrice,
  className,
}: {
  planningModel: string;
  imageModel: string;
  videoModel?: string;
  voiceModel?: string;
  reasoningPrice: ModelPricingInfo;
  imagePrice: ModelPricingInfo;
  videoPrice?: ModelPricingInfo;
  voicePrice?: ModelPricingInfo;
  className?: string;
}) {
  const reasoning = getModelByValue(planningModel);
  const image = getModelByValue(imageModel);
  const video = videoModel ? getModelByValue(videoModel) : undefined;
  const voice = voiceModel ? getModelByValue(voiceModel) : undefined;
  const isPremium = [reasoning, image, video, voice].some(m => m?.costTier === 'premium');

  const rows = [
    { label: reasoning?.label ?? planningModel, price: reasoningPrice },
    { label: image?.label ?? imageModel, price: imagePrice },
    ...(videoModel && videoPrice ? [{ label: video?.label ?? videoModel, price: videoPrice }] : []),
    ...(voiceModel && voicePrice ? [{ label: voice?.label ?? voiceModel, price: voicePrice }] : []),
  ];

  // Consume hook here for global last-updated visibility in creation UIs (no prop drilling)
  const { lastUpdatedLabel } = useModelPricing();

  return (
    <div className={cn(
      'rounded-xl border px-3 py-2.5 text-[10px]',
      isPremium ? 'bg-violet-500/5 border-violet-500/15' : 'bg-emerald-500/5 border-emerald-500/15',
      className
    )}>
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className={isPremium ? 'text-violet-300' : 'text-emerald-400'}>
          {isPremium ? 'Premium models active' : 'Value models active'}
        </span>
        {reasoning && <CostBadge tier={reasoning.costTier} label={reasoning.costLabel} />}
      </div>
      {rows.map(row => (
        <div key={row.label} className="flex justify-between text-slate-500 mt-0.5 first:mt-0">
          <span>{row.label}</span>
          <ModelPrice pricing={row.price} />
        </div>
      ))}
      <div className="text-[9px] text-slate-500/70 mt-1.5 pt-1 border-t border-white/10 flex justify-between">
        <span>Live from OpenRouter</span>
        <span>{lastUpdatedLabel}</span>
      </div>
    </div>
  );
}

export function RenderModeBanner({
  maximizeLocal,
  videoModel,
  renderNote,
  className,
}: {
  maximizeLocal: boolean;
  videoModel: string;
  renderNote?: string;
  className?: string;
}) {
  const video = getModelByValue(videoModel);
  return (
    <div className={cn(
      'rounded-xl border px-3 py-2.5 text-[10px]',
      maximizeLocal ? 'bg-emerald-500/5 border-emerald-500/15' : 'bg-amber-500/5 border-amber-500/15',
      className
    )}>
      <div className="flex items-center gap-2 mb-1">
        {maximizeLocal ? <Cpu className="w-3.5 h-3.5 text-emerald-400" /> : <Video className="w-3.5 h-3.5 text-amber-400" />}
        <span className={maximizeLocal ? 'text-emerald-300 font-medium' : 'text-amber-300 font-medium'}>
          {maximizeLocal
            ? 'Local render mode — Hyperframes + FFmpeg (free)'
            : `Cloud video enabled — ${video?.label ?? videoModel}`}
        </span>
      </div>
      {renderNote && <p className="text-slate-500 leading-relaxed">{renderNote}</p>}
    </div>
  );
}

export function VoicePreview({ audioUrl, className }: { audioUrl: string | null | undefined; className?: string }) {
  if (!audioUrl) return null;
  return (
    <Card className={cn('p-5', className)}>
      <div className="flex items-center gap-2 mb-3">
        <Mic className="w-4 h-4 text-violet-400" />
        <h3 className="font-semibold text-white">Voiceover</h3>
        <Badge variant="success" className="ml-auto">Generated</Badge>
      </div>
      <audio src={audioUrl} controls className="w-full" />
      <p className="text-[10px] text-slate-600 mt-2">Narration from your selected voice model via OpenRouter TTS.</p>
    </Card>
  );
}

export function ScriptPreview({ script, className }: { script: string; className?: string }) {
  return (
    <Card className={cn('p-5', className)}>
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-4 h-4 text-indigo-400" />
        <h3 className="font-semibold text-white">Script & Storyboard</h3>
        <Badge variant="success" className="ml-auto">Ready</Badge>
      </div>
      <div className="bg-[#0c1222] border border-white/[0.06] rounded-xl p-4 max-h-64 overflow-auto">
        <pre className="text-sm text-slate-400 whitespace-pre-wrap leading-relaxed font-mono">{script}</pre>
      </div>
    </Card>
  );
}

export function AssetPreviewGrid({
  keyframes,
  accent,
  loading,
  generatingImages,
}: {
  keyframes: KeyframeAsset[];
  accent: string;
  loading?: boolean;
  generatingImages?: boolean;
}) {
  const isGenerating = loading || generatingImages;
  const generatedCount = keyframes.filter(k => k.imageUrl).length;

  if (isGenerating && keyframes.length === 0) {
    return (
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Image className="w-4 h-4 text-violet-400" />
          <h3 className="font-semibold text-white">Asset Preview</h3>
          <Loader2 className="w-4 h-4 text-indigo-400 animate-spin ml-auto" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="aspect-video rounded-xl bg-white/5 animate-pulse border border-white/[0.06]" />
          ))}
        </div>
        <p className="text-[10px] text-slate-500 mt-3">Generating keyframe prompts…</p>
      </Card>
    );
  }

  if (keyframes.length === 0) return null;

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <Image className="w-4 h-4 text-violet-400" />
        <h3 className="font-semibold text-white">Asset Preview</h3>
        {isGenerating ? (
          <div className="flex items-center gap-1.5 ml-auto">
            <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
            <Badge variant="accent">{generatedCount}/{keyframes.length} images</Badge>
          </div>
        ) : (
          <Badge variant="accent" className="ml-auto">
            {generatedCount > 0 ? `${generatedCount} generated` : `${keyframes.length} prompts`}
          </Badge>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {keyframes.map((kf, i) => (
          <motion.div
            key={kf.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.06 }}
            className="group relative aspect-video rounded-xl overflow-hidden border border-white/[0.08] hover:border-indigo-500/30 transition-colors"
          >
            {kf.imageUrl ? (
              <img
                src={kf.imageUrl}
                alt={kf.label}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <>
                <div
                  className="absolute inset-0"
                  style={{ background: `linear-gradient(135deg, ${accent}44 0%, #0a0f1a 60%, ${accent}22 100%)` }}
                />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_40%_30%,rgba(99,102,241,0.12),transparent_70%)]" />
              </>
            )}
            {kf.imageStatus === 'generating' && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
              </div>
            )}
            {kf.imageStatus === 'error' && (
              <div className="absolute top-2 right-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
              </div>
            )}
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-sm text-[10px] font-bold text-white/80">
              {kf.label}
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-black/90 to-transparent">
              <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{kf.prompt}</p>
              {kf.imageError && (
                <p className="text-[10px] text-red-400/80 line-clamp-1 mt-0.5">{kf.imageError}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
      <p className="text-[10px] text-slate-600 mt-3">
        {generatedCount > 0
          ? 'Keyframes generated via OpenRouter image models. Stored for reuse in local render.'
          : isGenerating
            ? 'Generating images from prompts via your selected Image model…'
            : 'Keyframe prompts ready — images will generate when the keyframes step runs.'}
      </p>
    </Card>
  );
}

export function HyperframesWorkspace({
  previewHostId,
  onRefresh,
  ready,
}: {
  previewHostId: string;
  onRefresh?: () => void;
  ready: boolean;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <Clapperboard className="w-4 h-4 text-emerald-400" />
        <h3 className="font-semibold text-white">Hyperframes Workspace</h3>
        {ready ? <Badge variant="success" className="ml-auto">Ready to render</Badge> : <Badge className="ml-auto">Waiting</Badge>}
      </div>
      <div id={previewHostId} className="hyperframe-preview rounded-xl" style={{ height: 320 }} />
      {onRefresh && ready && (
        <Button variant="ghost" size="sm" icon={RefreshCw} onClick={onRefresh} className="mt-3">
          Refresh animation
        </Button>
      )}
    </Card>
  );
}

export function VideoOutputPlayer({
  videoUrl,
  filename,
  onDownload,
  onReedit,
  onVariation,
  loading,
}: {
  videoUrl: string | null;
  filename?: string;
  onDownload: () => void;
  onReedit: () => void;
  onVariation: () => void;
  loading?: boolean;
}) {
  if (!videoUrl && !loading) return null;

  return (
    <Card className="p-0 overflow-hidden border-emerald-500/20">
      <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
        <Clapperboard className="w-4 h-4 text-emerald-400" />
        <h3 className="font-semibold text-white">Final Video</h3>
        <Badge variant="success" className="ml-auto">Complete</Badge>
      </div>

      {loading ? (
        <div className="aspect-video bg-[#0c1222] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
          <p className="text-sm text-slate-400">Rendering local video… ~15s</p>
          <div className="w-48 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full w-2/3 bg-emerald-500 animate-pulse rounded-full" />
          </div>
        </div>
      ) : videoUrl ? (
        <video
          src={videoUrl}
          controls
          className="w-full aspect-video bg-black"
          playsInline
        />
      ) : null}

      <div className="p-4 flex flex-wrap gap-2 border-t border-white/[0.06]">
        <Button variant="success" icon={Download} onClick={onDownload} disabled={!videoUrl}>
          Download {filename ? `.webm` : 'Video'}
        </Button>
        <Button variant="secondary" icon={Pencil} onClick={onReedit}>
          Re-edit
        </Button>
        <Button variant="secondary" icon={Copy} onClick={onVariation}>
          Create Variation
        </Button>
      </div>
    </Card>
  );
}

export function ToolCallTimeline({ calls }: { calls: AgenticToolCall[] }) {
  if (calls.length === 0) return null;

  return (
    <Card className="p-5">
      <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
        <Brain className="w-4 h-4 text-violet-400" />
        Agent Tool Calls
      </h3>
      <div className="space-y-2">
        {calls.map(call => {
          const Icon = STATUS_ICON[call.status === 'active' ? 'active' : call.status];
          const duration = call.endedAt ? `${((call.endedAt - call.startedAt) / 1000).toFixed(1)}s` : null;
          return (
            <div
              key={call.id}
              className={cn(
                'p-3 rounded-xl border text-sm',
                call.status === 'active' && 'bg-indigo-500/10 border-indigo-500/20',
                call.status === 'complete' && 'bg-white/[0.02] border-white/[0.06]',
                call.status === 'error' && 'bg-red-500/10 border-red-500/20',
              )}
            >
              <div className="flex items-start gap-2">
                <Icon className={cn(
                  'w-4 h-4 mt-0.5 shrink-0',
                  call.status === 'complete' && 'text-emerald-400',
                  call.status === 'active' && 'text-indigo-400 animate-spin',
                )} />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    <span className="font-medium text-white">{call.tool}</span>
                    <Badge>{call.modelLabel}</Badge>
                    {call.costTier && (
                      <CostBadge
                        tier={call.costTier as 'value' | 'medium' | 'premium'}
                        label={call.costTier === 'premium' ? 'Premium' : call.costTier === 'medium' ? 'Medium' : 'Value'}
                      />
                    )}
                    {duration && <span className="text-[10px] text-slate-600 ml-auto">{duration}</span>}
                  </div>
                  <p className="text-xs text-slate-500">{call.message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export function GenerationSkeleton() {
  return (
    <Card className="p-6 space-y-4">
      <div className="h-4 w-1/3 bg-white/5 rounded animate-pulse" />
      <div className="h-32 bg-white/5 rounded-xl animate-pulse" />
      <div className="grid grid-cols-3 gap-3">
        <div className="h-20 bg-white/5 rounded-xl animate-pulse" />
        <div className="h-20 bg-white/5 rounded-xl animate-pulse" />
        <div className="h-20 bg-white/5 rounded-xl animate-pulse" />
      </div>
    </Card>
  );
}

export function StudioEmptyState({ onExample }: { onExample?: () => void }) {
  return (
    <Card className="min-h-[520px] flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-5">
          <Clapperboard className="w-10 h-10 text-indigo-400/70" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Production Workspace</h3>
        <p className="text-sm text-slate-500 leading-relaxed mb-6">
          Describe your video goal and generate a full marketing video. Planning runs on OpenRouter;
          rendering happens locally with Hyperframes — no cloud render fees.
        </p>
        {onExample && (
          <Button variant="secondary" size="sm" onClick={onExample}>
            Try example prompt
          </Button>
        )}
      </div>
    </Card>
  );
}