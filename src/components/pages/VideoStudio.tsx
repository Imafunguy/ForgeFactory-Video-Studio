import { Sparkles, Clapperboard, Zap, ListOrdered, Film } from 'lucide-react';
import { ModelSelector } from '../ModelSelector';
import { VoiceSelector } from '../VoiceSelector';
import { useModelPricing } from '../../context/ModelPricingContext';
import { STUDIO_PIPELINE_STEPS, type StudioOutput, type StepStatus } from '../../lib/pipeline';
import {
  PipelineStepTracker,
  ModelCostBanner,
  RenderModeBanner,
  VoicePreview,
  ScriptPreview,
  AssetPreviewGrid,
  HyperframesWorkspace,
  VideoOutputPlayer,
  StudioEmptyState,
  GenerationSkeleton,
} from '../generation/PipelineUI';
import { Button, Card, Textarea, Label, Badge } from '../ui';
import { cn } from '../../lib/utils';
import { LOCAL_VIDEO_TEMPLATES } from '../../lib/localVideoTemplates';
import type { QualityPreset, TemplateId } from '../../lib/videoRenderer';
import type { VideoControls } from '../../lib/videoControls';
import { listPremiumPresets } from '../../lib/videoControls';
import { MotionBrushPanel } from '../ui/MotionBrushPanel';
import { NodeGraphEditor } from '../ui/NodeGraphEditor';

type StudioMode = 'guided' | 'oneclick';

interface VideoStudioProps {
  studioGoal: string;
  onGoalChange: (v: string) => void;
  planningModel: string;
  imageModel: string;
  videoModel: string;
  voiceModel: string;
  onPlanningChange: (v: string) => void;
  onImageChange: (v: string) => void;
  onVideoChange: (v: string) => void;
  onVoiceChange: (v: string) => void;
  voiceId: string;
  onVoiceIdChange: (v: string) => void;
  onVoicePreview?: (voiceId: string) => Promise<void>;
  voicePreviewLoading?: boolean;
  keyframesGenerating?: boolean;
  cloudVideoStatus?: string | null;
  studioMode: StudioMode;
  onModeChange: (m: StudioMode) => void;
  studioOutput: StudioOutput | null;
  stepStatuses: Record<string, StepStatus>;
  currentStep: string | null;
  etaSeconds: number;
  isBusy: boolean;
  isRendering: boolean;
  assetsReady: boolean;
  videoUrl: string | null;
  projectName?: string;
  projectAccent: string;
  onGenerateFull: () => void;
  onGenerateGuided: () => void;
  onRenderVideo: () => void;
  onRerunStep: (step: string) => void;
  onRefreshPreview: () => void;
  onReedit: () => void;
  onVariation: () => void;
  onDownload: () => void;
  // New local render controls (user selected all options)
  maximizeLocal: boolean;
  onMaximizeLocalChange: (v: boolean) => void;
  qualityBoost: boolean;
  onQualityBoostChange: (v: boolean) => void;
  qualityPreset: QualityPreset;
  onQualityPresetChange: (v: QualityPreset) => void;
  selectedTemplate: TemplateId | null;
  onTemplateChange: (v: TemplateId | null) => void;
  videoControls: VideoControls;
  onControlsChange: (patch: Partial<VideoControls>) => void;
  onLoadPreset: (presetId: string) => void;
  activePresetId: string | null;
}

export function VideoStudio({
  studioGoal,
  onGoalChange,
  planningModel,
  imageModel,
  videoModel,
  voiceModel,
  onPlanningChange,
  onImageChange,
  onVideoChange,
  onVoiceChange,
  voiceId,
  onVoiceIdChange,
  onVoicePreview,
  voicePreviewLoading,
  keyframesGenerating,
  cloudVideoStatus,
  studioMode,
  onModeChange,
  studioOutput,
  stepStatuses,
  currentStep,
  etaSeconds,
  isBusy,
  isRendering,
  assetsReady,
  videoUrl,
  projectName,
  projectAccent,
  onGenerateFull,
  onGenerateGuided,
  onRenderVideo,
  onRerunStep,
  onRefreshPreview,
  onReedit,
  onVariation,
  onDownload,
  maximizeLocal,
  onMaximizeLocalChange,
  qualityBoost,
  onQualityBoostChange,
  qualityPreset,
  onQualityPresetChange,
  selectedTemplate,
  onTemplateChange,
  videoControls,
  onControlsChange,
  onLoadPreset,
  activePresetId,
}: VideoStudioProps) {
  const { getPrice } = useModelPricing();
  const hasOutput = !!studioOutput;
  const showWorkspace = hasOutput || isBusy;
  const premiumPresets = listPremiumPresets();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Input column */}
        <div className="lg:col-span-2 space-y-5">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white">One-Prompt Studio</h2>
            </div>
            <p className="text-sm text-slate-500 mb-5 leading-relaxed">
              Describe your video. OpenRouter handles planning & assets; Hyperframes renders locally — free.
            </p>

            {projectName && <Badge variant="accent" className="mb-4">Project: {projectName}</Badge>}

            <Label>Video Goal</Label>
            <Textarea
              value={studioGoal}
              onChange={e => onGoalChange(e.target.value)}
              placeholder="30s explainer for StrataBody AI coaching — show dashboard, progress rings, Start Coaching CTA..."
              className="h-28 mb-4"
              disabled={isBusy}
            />

            {/* Mode toggle */}
            <div className="flex gap-2 mb-4 p-1 bg-[#0c1222] rounded-xl border border-white/[0.06]">
              <button
                type="button"
                onClick={() => onModeChange('oneclick')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all',
                  studioMode === 'oneclick' ? 'bg-indigo-500/20 text-white border border-indigo-500/30' : 'text-slate-500 hover:text-slate-300'
                )}
              >
                <Zap className="w-3.5 h-3.5" /> One-Click Full Video
              </button>
              <button
                type="button"
                onClick={() => onModeChange('guided')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all',
                  studioMode === 'guided' ? 'bg-indigo-500/20 text-white border border-indigo-500/30' : 'text-slate-500 hover:text-slate-300'
                )}
              >
                <ListOrdered className="w-3.5 h-3.5" /> Guided Steps
              </button>
            </div>

            <Label className="mb-3">Models</Label>
            <ModelSelector
              planningModel={planningModel}
              imageModel={imageModel}
              videoModel={videoModel}
              voiceModel={voiceModel}
              onPlanningChange={onPlanningChange}
              onImageChange={onImageChange}
              onVideoChange={onVideoChange}
              onVoiceChange={onVoiceChange}
            />

            <VoiceSelector
              className="mt-4"
              voiceModel={voiceModel}
              voiceId={voiceId}
              onVoiceChange={onVoiceIdChange}
              onPreview={onVoicePreview}
              previewLoading={voicePreviewLoading}
              compact
            />

            <ModelCostBanner
              className="mt-4"
              planningModel={planningModel}
              imageModel={imageModel}
              videoModel={videoModel}
              voiceModel={voiceModel}
              reasoningPrice={getPrice(planningModel)}
              imagePrice={getPrice(imageModel)}
              videoPrice={getPrice(videoModel)}
              voicePrice={getPrice(voiceModel)}
            />

            <RenderModeBanner
              className="mt-3"
              maximizeLocal={maximizeLocal}
              videoModel={videoModel}
              renderNote={cloudVideoStatus ?? studioOutput?.renderNote}
            />

            {/* Maximize Local + Quality + Template (all options enabled by user request) */}
            <div className="mt-4 p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-sm">
              <label className="flex items-center gap-2 mb-2">
                <input type="checkbox" checked={maximizeLocal} onChange={e => onMaximizeLocalChange(e.target.checked)} />
                <span>Maximize Local Render (Hyperframes + FFmpeg)</span>
              </label>
              <label className="flex items-center gap-2 mb-2">
                <input type="checkbox" checked={qualityBoost} onChange={e => onQualityBoostChange(e.target.checked)} />
                <span>Quality Boost (Grok Heavy + Flux Pro for planning & keyframes)</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <select value={qualityPreset} onChange={e => onQualityPresetChange(e.target.value as any)} className="bg-[#0c1222] border border-white/10 rounded-lg px-2 py-1 text-xs">
                  <option value="fast">Fast</option>
                  <option value="balanced">Balanced</option>
                  <option value="high">High Quality (1080p60)</option>
                </select>
                <select value={selectedTemplate ?? ''} onChange={e => onTemplateChange((e.target.value || null) as any)} className="bg-[#0c1222] border border-white/10 rounded-lg px-2 py-1 text-xs">
                  <option value="">Custom</option>
                  {LOCAL_VIDEO_TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </div>
              <div className="text-[10px] text-emerald-300 mt-1">Local render is free. Toggle on for maximum cost savings.</div>

              <div className="mt-3 pt-3 border-t border-emerald-500/15">
                <p className="text-[10px] font-semibold text-emerald-300 mb-2">Premium Feels (one-click)</p>
                <div className="flex flex-wrap gap-1">
                  {premiumPresets.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => onLoadPreset(p.id)}
                      disabled={isBusy}
                      title={p.feel}
                      className={cn(
                        'px-2 py-1 rounded text-[9px] font-medium border transition-all',
                        activePresetId === p.id
                          ? 'bg-emerald-500/25 border-emerald-500/40 text-emerald-100'
                          : 'bg-[#0c1222] border-white/10 text-slate-400 hover:text-emerald-200 hover:border-emerald-500/25',
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                {activePresetId && (
                  <p className="text-[9px] text-emerald-400/70 mt-1">
                    Active: {premiumPresets.find((p) => p.id === activePresetId)?.feel}
                  </p>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-emerald-500/15">
                <MotionBrushPanel
                  controls={videoControls}
                  onChange={onControlsChange}
                  compact={false}
                />
                <NodeGraphEditor
                  className="mt-2"
                  controls={videoControls}
                  onChange={onControlsChange}
                />
              </div>
            </div>

            {/* Primary CTA */}
            <Button
              className="w-full mt-5 py-4 text-base shadow-xl shadow-indigo-500/20"
              size="lg"
              onClick={studioMode === 'oneclick' ? onGenerateFull : onGenerateGuided}
              loading={isBusy && !isRendering}
              icon={studioMode === 'oneclick' ? Zap : Film}
              disabled={!studioGoal.trim()}
            >
              {isBusy && !isRendering
                ? `Generating… ${currentStep ? STUDIO_PIPELINE_STEPS.find(s => s.id === currentStep)?.label : ''}`
                : studioMode === 'oneclick'
                  ? 'Create Full Video'
                  : 'Generate Video'}
            </Button>

            {studioMode === 'guided' && assetsReady && !videoUrl && (
              <Button
                className="w-full mt-3"
                variant="success"
                size="lg"
                icon={Clapperboard}
                onClick={onRenderVideo}
                loading={isRendering}
              >
                Render Video
              </Button>
            )}

            <p className="text-[10px] text-slate-600 text-center mt-3">
              {studioMode === 'oneclick'
                ? 'Runs planning → keyframes → assembly → local render automatically.'
                : 'Stops after assets so you can review before rendering.'}
            </p>
          </Card>

          <PipelineStepTracker
            steps={STUDIO_PIPELINE_STEPS}
            stepStatuses={stepStatuses}
            currentStepId={currentStep}
            etaSeconds={etaSeconds}
          />

          {hasOutput && (
            <Card className="p-4">
              <p className="forge-label mb-2">Re-run Step</p>
              <div className="flex flex-wrap gap-2">
                {STUDIO_PIPELINE_STEPS.filter(s => s.id !== 'render').map(step => (
                  <Button
                    key={step.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => onRerunStep(step.id)}
                    disabled={isBusy}
                  >
                    {step.label}
                  </Button>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Output column */}
        <div className="lg:col-span-3 space-y-5">
          {!showWorkspace ? (
            <StudioEmptyState
              onExample={() => onGoalChange('30s product demo showing dashboard onboarding, key feature highlight, and strong CTA for free trial.')}
            />
          ) : (
            <>
              {isBusy && !studioOutput?.script && <GenerationSkeleton />}

              {studioOutput?.script && (
                <ScriptPreview script={studioOutput.script} />
              )}

              <VoicePreview audioUrl={studioOutput?.voiceAudioUrl} />

              {(isBusy && currentStep === 'keyframes') || studioOutput?.keyframes.length ? (
                <AssetPreviewGrid
                  keyframes={studioOutput?.keyframes ?? []}
                  accent={projectAccent}
                  loading={isBusy && currentStep === 'keyframes' && !keyframesGenerating}
                  generatingImages={keyframesGenerating || (isBusy && currentStep === 'keyframes')}
                />
              ) : null}

              {(assetsReady || isBusy && currentStep === 'assembly') && (
                <HyperframesWorkspace
                  previewHostId="studio-preview-host"
                  onRefresh={onRefreshPreview}
                  ready={assetsReady}
                />
              )}

              <VideoOutputPlayer
                videoUrl={videoUrl}
                onDownload={onDownload}
                onReedit={onReedit}
                onVariation={onVariation}
                loading={isRendering}
              />

              {assetsReady && !videoUrl && !isRendering && (
                <Card className="p-5 border-emerald-500/15 bg-emerald-500/[0.03]">
                  <div className="flex items-center gap-3">
                    <Clapperboard className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-emerald-200">Assets ready for render</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Review script and keyframes above, then render locally — no additional OpenRouter cost.
                      </p>
                    </div>
                    <Button variant="success" onClick={onRenderVideo} icon={Clapperboard}>
                      Render Video
                    </Button>
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}