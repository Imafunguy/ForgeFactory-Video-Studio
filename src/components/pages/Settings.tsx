import { Key, Eye, EyeOff, Shield, FolderOpen, Trash2, Download, Terminal, Plus, RefreshCw, DollarSign, FileText } from 'lucide-react';
import type { Project } from '../../lib/storage';
import { useModelPricing } from '../../context/ModelPricingContext';
import { Button, Card, Input, Label, Badge } from '../ui';
import { generatePricingMarkdown } from '../../lib/constants';
import { toast } from 'sonner';

interface SettingsProps {
  settingsKey: string;
  onKeyChange: (v: string) => void;
  showKey: boolean;
  onToggleShowKey: () => void;
  onSaveKey: () => void;
  hasApiKey: boolean;
  projects: Project[];
  onSwitchProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onAddProject: () => void;
  newProject: { name: string; colors: string; uiElements: string; tone: string };
  onNewProjectChange: (v: { name: string; colors: string; uiElements: string; tone: string }) => void;
  ffmpegPath: string;
  onFfmpegChange: (v: string) => void;
  onExportBackup: () => void;
  onWipeData: () => void;
  onNavigateStudio: () => void;
}

export function Settings({
  settingsKey,
  onKeyChange,
  showKey,
  onToggleShowKey,
  onSaveKey,
  hasApiKey,
  projects,
  onSwitchProject,
  onDeleteProject,
  onAddProject,
  newProject,
  onNewProjectChange,
  ffmpegPath,
  onFfmpegChange,
  onExportBackup,
  onWipeData,
  onNavigateStudio,
}: SettingsProps) {
  const { refreshPricing, isLoading, lastFetched, lastUpdatedLabel, pricingMap, fromCache } = useModelPricing();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* API Key */}
      <Card className="p-7">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Key className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">OpenRouter API Key</h2>
            <p className="text-xs text-slate-500">Stored locally in your browser only</p>
          </div>
          {hasApiKey && <Badge variant="success" className="ml-auto">Connected</Badge>}
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type={showKey ? 'text' : 'password'}
              value={settingsKey}
              onChange={e => onKeyChange(e.target.value)}
              placeholder="sk-or-v1-..."
              className="font-mono pr-10"
            />
            <button
              type="button"
              onClick={onToggleShowKey}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <Button onClick={onSaveKey} icon={Shield}>Save Key</Button>
        </div>
        <p className="text-[10px] text-slate-600 mt-3 flex items-center gap-1.5">
          <Shield className="w-3 h-3" />
          Your key never leaves this machine. Used only for direct OpenRouter API calls.
        </p>
      </Card>

      {/* Projects */}
      <Card className="p-7">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
            <FolderOpen className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Brand Projects</h2>
            <p className="text-xs text-slate-500">Manage brand profiles for video generation</p>
          </div>
        </div>

        <div className="space-y-2 mb-5">
          {projects.map(p => (
            <div key={p.id} className="flex items-center justify-between p-4 bg-[#0c1222] border border-white/[0.06] rounded-xl group hover:border-white/10 transition-colors">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: `${p.colors}33`, border: `1px solid ${p.colors}55` }}
                >
                  {p.name.slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{p.name}</p>
                  <p className="text-[10px] text-slate-600">{p.tone}</p>
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="sm" onClick={() => { onSwitchProject(p.id); onNavigateStudio(); }}>
                  Use
                </Button>
                <Button variant="danger" size="sm" icon={Trash2} onClick={() => onDeleteProject(p.id)} />
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-white/[0.06] pt-5 space-y-3">
          <Label>Add New Project</Label>
          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="Project name"
              value={newProject.name}
              onChange={e => onNewProjectChange({ ...newProject, name: e.target.value })}
            />
            <Input
              placeholder="Brand color (#hex)"
              value={newProject.colors}
              onChange={e => onNewProjectChange({ ...newProject, colors: e.target.value })}
            />
            <Input
              placeholder="UI elements"
              value={newProject.uiElements}
              onChange={e => onNewProjectChange({ ...newProject, uiElements: e.target.value })}
            />
            <Input
              placeholder="Tone"
              value={newProject.tone}
              onChange={e => onNewProjectChange({ ...newProject, tone: e.target.value })}
            />
          </div>
          <Button variant="secondary" className="w-full" icon={Plus} onClick={onAddProject}>
            Add Project
          </Button>
        </div>
      </Card>

      {/* Model pricing */}
      <Card className="p-7">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white">Model Pricing</h2>
            <p className="text-xs text-slate-500">
              Live prices from OpenRouter, cached 8 hours. Grok models bill your OpenRouter balance.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" icon={RefreshCw} loading={isLoading} onClick={() => refreshPricing(true)}>
            Refresh Prices
          </Button>
          <Button
            variant="ghost"
            icon={FileText}
            onClick={() => {
              const md = generatePricingMarkdown(pricingMap, lastFetched);
              navigator.clipboard
                .writeText(md)
                .then(() => {
                  toast.success('Pricing markdown copied to clipboard', {
                    description: 'Paste the snapshot into docs/models.md to keep the documentation in sync.',
                  });
                })
                .catch(() => toast.error('Failed to copy to clipboard'));
            }}
          >
            Export Current Prices to Markdown
          </Button>
        </div>
        <p className="text-[10px] text-slate-600 mt-2">
          Last updated: {lastUpdatedLabel}{fromCache ? ' (cached)' : ''}
        </p>
        <p className="text-[9px] text-slate-500 mt-1">Use the Export button above to generate an up-to-date snapshot you can paste into <code>docs/models.md</code>.</p>
      </Card>

      {/* Local Tools */}
      <Card className="p-7">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Terminal className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Local Tools</h2>
            <p className="text-xs text-slate-500">FFmpeg and rendering configuration</p>
          </div>
        </div>
        <Label>FFmpeg Path</Label>
        <Input
          value={ffmpegPath}
          onChange={e => onFfmpegChange(e.target.value)}
          className="font-mono mb-3"
        />
        <p className="text-[10px] text-slate-600 leading-relaxed">
          Assumes ffmpeg is in PATH by default. Hyperframes + canvas produces real .webm files directly in the browser.
          Extend videoRenderer.ts for ComfyUI integration.
        </p>
      </Card>

      {/* Data management */}
      <div className="flex gap-3">
        <Button variant="secondary" icon={Download} onClick={onExportBackup} className="flex-1">
          Export Backup
        </Button>
        <Button variant="danger" icon={Trash2} onClick={onWipeData}>
          Wipe All Data
        </Button>
      </div>
    </div>
  );
}