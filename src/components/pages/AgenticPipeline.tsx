import { Bot, Pause, Play, Square, RotateCcw } from 'lucide-react';
import { STUDIO_PIPELINE_STEPS, computeProgress, type AgenticState } from '../../lib/pipeline';
import { ModelSelector } from '../ModelSelector';
import { VoiceSelector } from '../VoiceSelector';
import { useModelPricing } from '../../context/ModelPricingContext';
import {
  PipelineStepTracker,
  ModelCostBanner,
  RenderModeBanner,
  VoicePreview,
  ScriptPreview,
  AssetPreviewGrid,
  HyperframesWorkspace,
  VideoOutputPlayer,
  ToolCallTimeline,
  GenerationSkeleton,
  PremiumGatesPanel,
  VariantResultsPanel,
  WorkflowStagesPanel,
  PremiumControlsSummary,
  PremiumPresetBar,
} from '../generation/PipelineUI';
import { Button, Card, Textarea, Label, ProgressBar, Badge } from '../ui';
import { MotionBrushPanel } from '../ui/MotionBrushPanel';
import { NodeGraphEditor } from '../ui/NodeGraphEditor';
import { LOCAL_VIDEO_TEMPLATES } from '../../lib/localVideoTemplates';
import type { QualityPreset, TemplateId } from '../../lib/videoRenderer';
import type { VideoControls } from '../../lib/videoControls';
import type { WorkflowStageResult } from '../../lib/premiumOrchestrator';

interface AgenticPipelineProps {
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
  agenticGoal: string;
  onGoalChange: (v: string) => void;
  agenticState: AgenticState;
  isBusy: boolean;
  isRendering: boolean;
  videoUrl: string | null;
  projectName?: string;
  projectAccent: string;
  onRun: () => void;
  onRerunStep: (step: string) => void;
  onRender: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onReedit: () => void;
  onVariation: () => void;
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
  workflowStages?: WorkflowStageResult[];
  comfyNote?: string;
}

export function AgenticPipeline({
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
  agenticGoal,
  onGoalChange,
  agenticState,
  isBusy,
  isRendering,
  videoUrl,
  projectName,
  projectAccent,
  onRun,
  onRerunStep,
  onRender,
  onPause,
  onResume,
  onStop,
  onReedit,
  onVariation,
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
  workflowStages,
  comfyNote,
}: AgenticPipelineProps) {
  const { getPrice } = useModelPricing();
  const hasStarted = agenticState.toolCalls.length > 0 || agenticState.script.length > 0;
  const progress = computeProgress(agenticState.stepStatuses);
  const showAssets = agenticState.script || agenticState.keyframes.length > 0;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Control column */}
        <div className="lg:col-span-2 space-y-5">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bot className="w-5 h-5 text-violet-400" />
              <h2 className="text-lg font-bold text-white">Agentic Pipeline</h2>
            </div>
            <p className="text-sm text-slate-500 mb-5 leading-relaxed">
              Autonomous multi-step agent with visible tool calls. Pause anytime, re-run individual steps.
            </p>

            {projectName && <Badge variant="accent" className="mb-4">Project: {projectName}</Badge>}

            <Label>Pipeline Goal</Label>
            <Textarea
              value={agenticGoal}
              onChange={e => onGoalChange(e.target.value)}
              placeholder="High-converting 30s ClubCensus demo — live polls, animated results, community feed..."
              className="h-24 mb-4"
              disabled={isBusy && !agenticState.paused}
            />

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
              compact
            />

            <VoiceSelector
              className="mt-4 mb-3"
              voiceModel={voiceModel}
              voiceId={voiceId}
              onVoiceChange={onVoiceIdChange}
              onPreview={onVoicePreview}
              previewLoading={voicePreviewLoading}
              compact
            />

            <ModelCostBanner
              className="mt-4 mb-3"
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
              className="mb-4"
              maximizeLocal={maximizeLocal}
              videoModel={videoModel}
              renderNote={cloudVideoStatus ?? agenticState.renderNote}
            />

            {/* Maximize Local + Quality + Template (all options) */}
            <div className="p-3 rounded-xl border border-violet-500/20 bg-violet-500/5 text-sm mb-3">
              <label className="flex items-center gap-2 mb-2 text-xs">
                <input type="checkbox" checked={maximizeLocal} onChange={e => onMaximizeLocalChange(e.target.checked)} />
                Maximize Local (Hyperframes + FFmpeg)
              </label>
              <label className="flex items-center gap-2 mb-2 text-xs">
                <input type="checkbox" checked={qualityBoost} onChange={e => onQualityBoostChange(e.target.checked)} />
                Quality Boost (Grok Heavy + Flux Pro)
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <select value={qualityPreset} onChange={e => onQualityPresetChange(e.target.value as any)} className="bg-[#0c1222] border border-white/10 rounded px-2 py-1">
                  <option value="fast">Fast</option>
                  <option value="balanced">Balanced</option>
                  <option value="high">High (1080p60)</option>
                </select>
                <select value={selectedTemplate ?? ''} onChange={e => onTemplateChange((e.target.value || null) as any)} className="bg-[#0c1222] border border-white/10 rounded px-2 py-1">
                  <option value="">Custom</option>
                  {LOCAL_VIDEO_TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </div>

              <div className="mt-3 pt-3 border-t border-violet-500/15">
                <PremiumPresetBar
                  activePresetId={activePresetId}
                  onLoadPreset={onLoadPreset}
                  disabled={isBusy}
                />
                <PremiumControlsSummary
                  className="mt-2"
                  controls={videoControls}
                  activePresetId={activePresetId}
                  comfyNote={comfyNote}
                />
                <MotionBrushPanel
                  className="mt-2"
                  controls={videoControls}
                  onChange={onControlsChange}
                  compact
                />
                <NodeGraphEditor
                  className="mt-2"
                  controls={videoControls}
                  onChange={onControlsChange}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1"
                size="lg"
                onClick={onRun}
                loading={isBusy && !agenticState.paused}
                icon={Bot}
                disabled={!agenticGoal.trim()}
              >
                {hasStarted ? 'Re-run Pipeline' : 'Start Agentic Run'}
              </Button>
            </div>

            {isBusy && (
              <div className="flex gap-2 mt-3">
                {agenticState.paused ? (
                  <Button variant="secondary" className="flex-1" icon={Play} onClick={onResume}>
                    Resume
                  </Button>
                ) : (
                  <Button variant="secondary" className="flex-1" icon={Pause} onClick={onPause}>
                    Pause
                  </Button>
                )}
                <Button variant="danger" icon={Square} onClick={onStop}>
                  Stop
                </Button>
              </div>
            )}

            {agenticState.readyToRender && !videoUrl && (
              <Button
                className="w-full mt-3"
                variant="success"
                size="lg"
                onClick={onRender}
                loading={isRendering}
              >
                Render Final Video
              </Button>
            )}
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="forge-label">Agent Progress</p>
              <span className="text-xs font-mono text-violet-400">{progress}%</span>
            </div>
            <ProgressBar value={progress} className="mb-2" />
            {agenticState.paused && (
              <Badge variant="warning" className="mt-2">Paused</Badge>
            )}
          </Card>

          <PipelineStepTracker
            steps={STUDIO_PIPELINE_STEPS}
            stepStatuses={agenticState.stepStatuses}
            currentStepId={agenticState.currentStepId}
            etaSeconds={0}
          />

          {hasStarted && (
            <Card className="p-4">
              <p className="forge-label mb-2">Re-run Step</p>
              <div className="flex flex-wrap gap-2">
                {STUDIO_PIPELINE_STEPS.map(step => (
                  <Button
                    key={step.id}
                    variant="ghost"
                    size="sm"
                    icon={RotateCcw}
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

        {/* Workspace column */}
        <div className="lg:col-span-3 space-y-5">
          {!hasStarted ? (
            <Card className="min-h-[520px] flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <Bot className="w-14 h-14 text-slate-700 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Agent Workspace</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  The agent will plan your script, generate keyframe prompts, assemble Hyperframes locally,
                  and wait for your approval before rendering.
                </p>
              </div>
            </Card>
          ) : (
            <>
              <ToolCallTimeline calls={agenticState.toolCalls} />

              {isBusy && !agenticState.script && <GenerationSkeleton />}

              {agenticState.script && (
                <ScriptPreview script={agenticState.script} />
              )}

              <WorkflowStagesPanel stages={workflowStages} />

              <PremiumGatesPanel
                gates={agenticState.premiumGates}
              />

              <VariantResultsPanel variants={agenticState.variantResults} />

              <VoicePreview audioUrl={agenticState.voiceAudioUrl} />

              {(agenticState.keyframes.length > 0 || (isBusy && agenticState.currentStepId === 'keyframes')) && (
                <AssetPreviewGrid
                  keyframes={agenticState.keyframes}
                  accent={projectAccent}
                  loading={isBusy && agenticState.currentStepId === 'keyframes' && !keyframesGenerating}
                  generatingImages={keyframesGenerating || (isBusy && agenticState.currentStepId === 'keyframes')}
                />
              )}

              {(agenticState.readyToRender || agenticState.hyperDesc) && (
                <HyperframesWorkspace
                  previewHostId="agentic-preview-host"
                  ready={agenticState.readyToRender}
                />
              )}

              <VideoOutputPlayer
                videoUrl={videoUrl}
                onDownload={() => videoUrl && window.open(videoUrl, '_blank')}
                onReedit={onReedit}
                onVariation={onVariation}
                loading={isRendering}
              />

              {agenticState.readyToRender && !videoUrl && !isRendering && showAssets && (
                <Card className="p-5 border-violet-500/15 bg-violet-500/[0.03]">
                  <p className="text-sm font-semibold text-violet-200 mb-1">Review complete</p>
                  <p className="text-xs text-slate-500">
                    All agent steps finished. Export when ready — local render is free.
                  </p>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}