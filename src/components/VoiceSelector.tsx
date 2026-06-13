import { useState } from 'react';
import { Mic, Play, Loader2, ChevronDown } from 'lucide-react';
import { getVoicesForModel, getModelByValue } from '../lib/constants';
import { cn } from '../lib/utils';
import { Badge, Button } from './ui';

interface VoiceSelectorProps {
  voiceModel: string;
  voiceId: string;
  onVoiceChange: (voiceId: string) => void;
  onPreview?: (voiceId: string) => Promise<void>;
  previewLoading?: boolean;
  compact?: boolean;
  className?: string;
}

export function VoiceSelector({
  voiceModel,
  voiceId,
  onVoiceChange,
  onPreview,
  previewLoading = false,
  compact = false,
  className,
}: VoiceSelectorProps) {
  const [open, setOpen] = useState(false);
  const voices = getVoicesForModel(voiceModel);
  const modelMeta = getModelByValue(voiceModel);
  const selected = voices.find(v => v.id === voiceId) ?? voices[0];

  if (compact) {
    return (
      <div className={cn('space-y-2', className)}>
        <label className="forge-label block">Voice</label>
        <div className="flex gap-2">
          <select
            value={selected?.id ?? voiceId}
            onChange={e => onVoiceChange(e.target.value)}
            className="flex-1 bg-[#0c1222] border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          >
            {voices.map(v => (
              <option key={v.id} value={v.id}>{v.label}{v.description ? ` — ${v.description}` : ''}</option>
            ))}
          </select>
          {onPreview && (
            <Button
              variant="secondary"
              size="sm"
              icon={previewLoading ? Loader2 : Play}
              onClick={() => onPreview(selected?.id ?? voiceId)}
              disabled={previewLoading}
              className={previewLoading ? '[&_svg]:animate-spin' : ''}
            >
              Preview
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[#0c1222] border border-white/10 rounded-xl hover:border-violet-500/30 transition-all"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
            <Mic className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-left min-w-0">
            <p className="text-xs text-slate-500">Voice — {modelMeta?.label ?? voiceModel}</p>
            <p className="text-sm font-medium text-white truncate">{selected?.label ?? 'Select voice'}</p>
            {selected?.description && (
              <p className="text-[10px] text-slate-600 truncate">{selected.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {onPreview && (
            <Button
              variant="ghost"
              size="sm"
              icon={previewLoading ? Loader2 : Play}
              onClick={e => { e.stopPropagation(); onPreview(selected?.id ?? voiceId); }}
              disabled={previewLoading}
              className={previewLoading ? '[&_svg]:animate-spin' : ''}
            />
          )}
          <ChevronDown className={cn('w-4 h-4 text-slate-500 transition-transform', open && 'rotate-180')} />
        </div>
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 py-1 bg-[#0e1528] border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden max-h-64 overflow-y-auto">
          {voices.map(voice => (
            <button
              key={voice.id}
              type="button"
              onClick={() => { onVoiceChange(voice.id); setOpen(false); }}
              className={cn(
                'w-full flex items-start gap-3 px-4 py-2.5 text-left text-sm transition-colors',
                voiceId === voice.id ? 'bg-violet-500/10 text-white' : 'text-slate-400 hover:bg-white/5'
              )}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{voice.label}</span>
                  {voiceId === voice.id && <Badge variant="accent">Active</Badge>}
                </div>
                {voice.description && (
                  <p className="text-[10px] text-slate-600 mt-0.5">{voice.description}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}