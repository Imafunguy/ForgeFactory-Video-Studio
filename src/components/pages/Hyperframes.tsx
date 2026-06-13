import { Clapperboard, Play, Download, RefreshCw, Monitor, Zap } from 'lucide-react';
import { Button, Card, Textarea, Label, Badge } from '../ui';
import { LOCAL_VIDEO_TEMPLATES } from '../../lib/localVideoTemplates';
import type { QualityPreset, TemplateId } from '../../lib/videoRenderer';

interface HyperframesProps {
  hyperDesc: string;
  onDescChange: (v: string) => void;
  hasPreview: boolean;
  hasAnimation: boolean;
  isLoading: boolean;
  projectName?: string;
  onGenerate: () => void;
  onRender: () => void;
  // New controls (all options selected by user)
  selectedTemplate: TemplateId | null;
  onTemplateChange: (v: TemplateId | null) => void;
  qualityPreset: QualityPreset;
  onQualityPresetChange: (v: QualityPreset) => void;
  maximizeLocal: boolean;
  onMaximizeLocalChange: (v: boolean) => void;
}

export function Hyperframes({
  hyperDesc,
  onDescChange,
  hasPreview,
  hasAnimation,
  isLoading,
  projectName,
  onGenerate,
  onRender,
  selectedTemplate,
  onTemplateChange,
  qualityPreset,
  onQualityPresetChange,
  maximizeLocal,
  onMaximizeLocalChange,
}: HyperframesProps) {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="space-y-5">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <Clapperboard className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">Hyperframes Renderer</h2>
            </div>
            <p className="text-sm text-slate-500 mb-5 leading-relaxed">
              Dedicated local animation engine. Describe your branded UI flow,
              generate a live canvas preview, and export a real video file.
            </p>

            {projectName && <Badge variant="accent" className="mb-4">Brand: {projectName}</Badge>}

            <Label>Animation Description</Label>
            <Textarea
              value={hyperDesc}
              onChange={e => onDescChange(e.target.value)}
              placeholder="StrataBody dashboard: user sees AI recommendation card, taps Start Coaching, animated progress ring fills, celebration micro-animation..."
              className="h-36 mb-5"
            />

            {/* Template + Quality + Maximize Local (all options enabled) */}
            <div className="space-y-3 mb-4">
              <Label>Local Video Template</Label>
              <select
                className="w-full bg-[#0c1222] border border-white/10 rounded-xl px-3 py-2 text-sm"
                value={selectedTemplate ?? ''}
                onChange={(e) => onTemplateChange((e.target.value || null) as TemplateId | null)}
              >
                <option value="">Custom (use description)</option>
                {LOCAL_VIDEO_TEMPLATES.map(t => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>

              <Label>Quality Preset</Label>
              <select
                className="w-full bg-[#0c1222] border border-white/10 rounded-xl px-3 py-2 text-sm"
                value={qualityPreset}
                onChange={(e) => onQualityPresetChange(e.target.value as QualityPreset)}
              >
                <option value="fast">Fast — quick drafts</option>
                <option value="balanced">Balanced — great quality/size</option>
                <option value="high">High Quality — best local motion (1080p60)</option>
              </select>

              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={maximizeLocal}
                  onChange={(e) => onMaximizeLocalChange(e.target.checked)}
                />
                Maximize Local Render (bias planner to Hyperframes + FFmpeg)
              </label>
            </div>

            <div className="space-y-3">
              <Button className="w-full" variant="secondary" icon={Play} onClick={onGenerate}>
                Generate Preview
              </Button>
              <Button
                className="w-full"
                variant="success"
                icon={Download}
                onClick={onRender}
                disabled={!hasAnimation}
                loading={isLoading}
              >
                Render & Download Video
              </Button>
            </div>
          </Card>

          <Card className="p-5">
            <p className="forge-label mb-3">Renderer Specs</p>
            <div className="space-y-3">
              {[
                { icon: Monitor, label: 'Canvas Engine', value: 'SaaS UI Animation' },
                { icon: Zap, label: 'Capture Duration', value: '15 seconds' },
                { icon: Download, label: 'Output Format', value: '.webm (VP9)' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    <item.icon className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-600 uppercase tracking-wider">{item.label}</p>
                    <p className="text-sm text-slate-300">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Preview area */}
        <div className="lg:col-span-2">
          <Card className="p-0 overflow-hidden min-h-[560px]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm font-medium text-white">Live Preview</span>
              </div>
              {hasPreview && (
                <Button variant="ghost" size="sm" icon={RefreshCw} onClick={onGenerate}>
                  Refresh
                </Button>
              )}
            </div>

            {hasPreview ? (
              <div className="p-4">
                <div
                  id="hyper-preview-host"
                  className="hyperframe-preview rounded-xl"
                  style={{ height: '480px' }}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-[500px]">
                <div className="text-center px-8">
                  <div className="w-24 h-24 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center mx-auto mb-5">
                    <Clapperboard className="w-12 h-12 text-emerald-400/40" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Renderer Canvas</h3>
                  <p className="text-sm text-slate-500 max-w-sm mx-auto mb-5">
                    Describe your UI animation and hit Generate Preview to see the branded canvas animation.
                  </p>
                  <Button icon={Play} onClick={onGenerate}>Generate Preview</Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}