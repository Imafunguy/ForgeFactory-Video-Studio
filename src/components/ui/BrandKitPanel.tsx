import { useState } from 'react';
import { Palette, Type, Film, Clock, Image, Lock, RefreshCw, Save, Download, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { BrandPalette, LogoPlacement, VideoControls, VideoStyle } from '../../lib/videoControls';
import {
  FONT_FAMILY_OPTIONS,
  LOGO_PLACEMENT_OPTIONS,
  LENGTH_PRESETS,
  listVideoStyles,
  getDefaultControlsForStyle,
  brandPaletteFromArray,
  deriveBrandPaletteFromAccent,
  resolveBrandPalette,
  getClubCensusControlsPatch,
} from '../../lib/videoControls';
import type { SavedBrandKit } from '../../lib/storage';

interface BrandKitPanelProps {
  controls: VideoControls;
  onChange: (patch: Partial<VideoControls>) => void;
  projectAccent?: string;
  projectPalette?: string[];
  projectId?: string;
  projectName?: string;
  onSaveProjectDefault?: (palette: BrandPalette, fontFamily: string) => void;
  onSaveCustomKit?: (name: string, palette: BrandPalette, fontFamily: string) => void;
  customKits?: SavedBrandKit[];
  onLoadCustomKit?: (kit: SavedBrandKit) => void;
  compact?: boolean;
}

type PaletteKey = keyof Required<Pick<BrandPalette, 'primary' | 'accent' | 'secondary' | 'neutral' | 'surface' | 'text'>>;

const PALETTE_SWATCHES: Array<{ key: PaletteKey; label: string; hint: string }> = [
  { key: 'primary', label: 'Primary', hint: 'Deep green — buttons, CTAs' },
  { key: 'accent', label: 'Accent', hint: 'Gold — highlights, active states' },
  { key: 'secondary', label: 'Secondary', hint: 'Olive — badges, charts' },
  { key: 'neutral', label: 'Neutral', hint: 'Charcoal — backgrounds' },
  { key: 'surface', label: 'Surface', hint: 'Light stone — cards' },
  { key: 'text', label: 'Text', hint: 'Warm white — copy' },
];

const LENGTH_QUICK_PRESETS = [5, 10, 15, 30, 45, 60] as const;

function normalizeHex(value: string): string {
  const match = value.match(/#[0-9A-Fa-f]{6}/);
  return match ? match[0].toUpperCase() : value;
}

export function BrandKitPanel({
  controls,
  onChange,
  projectAccent,
  projectPalette,
  projectId,
  projectName,
  onSaveProjectDefault,
  onSaveCustomKit,
  customKits = [],
  onLoadCustomKit,
  compact,
}: BrandKitPanelProps) {
  const videoStyles = listVideoStyles();
  const palette = resolveBrandPalette(controls, projectPalette ?? projectAccent);
  const activeStyle = videoStyles.find((s) => s.id === controls.videoStyle);
  const [customKitName, setCustomKitName] = useState('');

  const patchPalette = (key: PaletteKey, value: string) => {
    const hex = value.startsWith('#') ? value : `#${value}`;
    onChange({
      brandPalette: { ...palette, [key]: hex },
    });
  };

  const loadFromProject = () => {
    const projectColors = projectPalette ?? projectAccent;
    if (!projectColors) return;
    const nextPalette = Array.isArray(projectColors)
      ? brandPaletteFromArray(projectColors)
      : deriveBrandPaletteFromAccent(projectColors);
    onChange({
      brandPalette: nextPalette,
      accentLock: true,
    });
  };

  const loadClubCensusKit = () => {
    onChange(getClubCensusControlsPatch());
  };

  const resetToProject = () => {
    loadFromProject();
  };

  const autoDeriveAccents = () => {
    const base = palette.primary || projectAccent || '#6366f1';
    const derived = deriveBrandPaletteFromAccent(base);
    onChange({
      brandPalette: { ...palette, accent: derived.accent, secondary: derived.secondary },
    });
  };

  const handleStyleChange = (style: VideoStyle) => {
    const accentForPalette =
      controls.accentLock !== false ? (palette.accent || projectAccent) : undefined;
    const suggestions = getDefaultControlsForStyle(style, accentForPalette);
    if (controls.accentLock === false && suggestions.brandPalette) {
      delete suggestions.brandPalette;
    }
    onChange(suggestions);
  };

  const handleLengthPreset = (sec: number) => {
    const preset = LENGTH_PRESETS.includes(sec as (typeof LENGTH_PRESETS)[number])
      ? (sec as (typeof LENGTH_PRESETS)[number])
      : 'custom';
    onChange({ lengthSec: sec, lengthPreset: preset });
  };

  const handleSaveProjectDefault = () => {
    onSaveProjectDefault?.(palette, controls.fontFamily ?? 'Inter');
  };

  const handleSaveCustomKit = () => {
    const name = customKitName.trim() || `${projectName ?? 'Custom'} Kit`;
    onSaveCustomKit?.(name, palette, controls.fontFamily ?? 'Inter');
    setCustomKitName('');
  };

  const scaledSceneEstimate = Math.max(3, Math.min(12, Math.round(controls.lengthSec / 5)));

  return (
    <div className={cn('space-y-3', compact && 'space-y-2')}>
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
          <Palette className="w-3.5 h-3.5" /> Project Brand Kit
        </span>
        {projectName && (
          <span className="text-[9px] text-slate-500 truncate max-w-[120px]">{projectName}</span>
        )}
      </div>

      {/* Quick kit loaders */}
      <div className="flex flex-wrap gap-1">
        <button
          type="button"
          onClick={loadClubCensusKit}
          className="flex items-center gap-1 text-[9px] px-2 py-1 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20"
        >
          <Sparkles className="w-3 h-3" /> Load ClubCensus Kit
        </button>
        <button
          type="button"
          onClick={loadFromProject}
          className="flex items-center gap-1 text-[9px] px-2 py-1 rounded border border-white/10 text-slate-400 hover:text-emerald-200 hover:border-emerald-500/25"
        >
          <RefreshCw className="w-3 h-3" /> Load from Project
        </button>
      </div>

      {/* Palette */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-medium text-slate-400">Brand palette</p>
        <div className="grid grid-cols-2 gap-1.5">
          {PALETTE_SWATCHES.map(({ key, label, hint }) => (
            <div
              key={key}
              className="flex items-center gap-1.5 p-1.5 rounded-lg border border-white/10 bg-[#0c1222]/60"
              title={hint}
            >
              <label className="relative shrink-0 cursor-pointer" title={`Pick ${label}`}>
                <input
                  type="color"
                  value={palette[key] ?? '#6366f1'}
                  onChange={(e) => patchPalette(key, e.target.value)}
                  className="sr-only"
                />
                <span
                  className="block w-6 h-6 rounded border border-white/20"
                  style={{ backgroundColor: palette[key] ?? '#6366f1' }}
                />
              </label>
              <div className="flex-1 min-w-0">
                <span className="text-[9px] text-slate-500 block">{label}</span>
                <input
                  type="text"
                  value={palette[key] ?? ''}
                  onChange={(e) => patchPalette(key, e.target.value)}
                  onBlur={(e) => {
                    const normalized = normalizeHex(e.target.value);
                    if (normalized.startsWith('#')) patchPalette(key, normalized);
                  }}
                  className="w-full bg-transparent border-b border-white/10 text-[10px] text-emerald-100 py-0.5 font-mono"
                  placeholder="#000000"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Palette preview strip */}
        <div className="flex h-3 rounded overflow-hidden border border-white/10">
          {PALETTE_SWATCHES.map(({ key }) => (
            <div
              key={key}
              className="flex-1"
              style={{ backgroundColor: palette[key] ?? '#6366f1' }}
              title={palette[key]}
            />
          ))}
        </div>

        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            onClick={resetToProject}
            className="text-[9px] px-2 py-0.5 rounded border border-white/10 text-slate-400 hover:text-emerald-200 hover:border-emerald-500/25"
          >
            Reset to project
          </button>
          <button
            type="button"
            onClick={autoDeriveAccents}
            className="text-[9px] px-2 py-0.5 rounded border border-white/10 text-slate-400 hover:text-emerald-200 hover:border-emerald-500/25"
          >
            Auto derive accents
          </button>
        </div>

        {/* Save actions */}
        <div className="flex flex-wrap gap-1 pt-1">
          {onSaveProjectDefault && projectId && (
            <button
              type="button"
              onClick={handleSaveProjectDefault}
              className="flex items-center gap-1 text-[9px] px-2 py-1 rounded border border-emerald-500/25 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20"
            >
              <Save className="w-3 h-3" /> Save as Project Default
            </button>
          )}
        </div>
        {onSaveCustomKit && (
          <div className="flex gap-1">
            <input
              type="text"
              value={customKitName}
              onChange={(e) => setCustomKitName(e.target.value)}
              placeholder="Custom kit name…"
              className="flex-1 bg-[#0c1222] border border-white/10 rounded px-2 py-1 text-[10px] text-emerald-100"
            />
            <button
              type="button"
              onClick={handleSaveCustomKit}
              className="flex items-center gap-1 text-[9px] px-2 py-1 rounded border border-white/10 text-slate-400 hover:text-emerald-200 hover:border-emerald-500/25 shrink-0"
            >
              <Download className="w-3 h-3" /> Save Custom Kit
            </button>
          </div>
        )}

        {/* Saved custom kits */}
        {customKits.length > 0 && onLoadCustomKit && (
          <div className="space-y-1">
            <p className="text-[9px] text-slate-500">Saved kits</p>
            <div className="flex flex-wrap gap-1">
              {customKits.map((kit) => (
                <button
                  key={kit.id}
                  type="button"
                  onClick={() => onLoadCustomKit(kit)}
                  className="flex items-center gap-1 text-[9px] px-2 py-0.5 rounded border border-white/10 text-slate-400 hover:text-emerald-200 hover:border-emerald-500/25"
                  title={kit.palette.join(', ')}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: kit.palette[0] }}
                  />
                  {kit.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <label className="flex items-center gap-2 text-[10px] text-slate-400">
          <input
            type="checkbox"
            checked={controls.accentLock ?? true}
            onChange={(e) => onChange({ accentLock: e.target.checked })}
          />
          <Lock className="w-3 h-3 text-emerald-400" />
          Lock accent to project default
        </label>
      </div>

      {/* Logo */}
      <div className="space-y-1.5 pt-1 border-t border-emerald-500/10">
        <p className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
          <Image className="w-3 h-3" /> Logo
        </p>
        <label className="flex items-center gap-2 text-[10px] text-slate-400">
          <input
            type="checkbox"
            checked={controls.logoLock ?? false}
            onChange={(e) => onChange({ logoLock: e.target.checked })}
          />
          Logo lock enabled
        </label>
        <select
          value={controls.logoPlacement ?? 'bottom-right'}
          onChange={(e) => onChange({ logoPlacement: e.target.value as LogoPlacement })}
          className="w-full bg-[#0c1222] border border-white/10 rounded-lg px-2 py-1 text-[10px] text-emerald-100"
        >
          {LOGO_PLACEMENT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Font */}
      <div className="space-y-1.5 pt-1 border-t border-emerald-500/10">
        <p className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
          <Type className="w-3 h-3" /> Font family
        </p>
        <select
          value={controls.fontFamily ?? 'Inter'}
          onChange={(e) => onChange({ fontFamily: e.target.value })}
          className="w-full bg-[#0c1222] border border-white/10 rounded-lg px-2 py-1 text-[10px] text-emerald-100"
        >
          {FONT_FAMILY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <p
          className="text-[10px] text-slate-500 truncate"
          style={{ fontFamily: controls.fontFamily ?? 'Inter' }}
        >
          The quick brown fox jumps over the lazy dog
        </p>
      </div>

      {/* Video style */}
      <div className="space-y-1.5 pt-1 border-t border-emerald-500/10">
        <p className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
          <Film className="w-3 h-3" /> Video style
        </p>
        {!compact && (
          <div className="flex flex-wrap gap-1">
            {videoStyles.filter((s) => s.id !== 'custom').map((style) => (
              <button
                key={style.id}
                type="button"
                onClick={() => handleStyleChange(style.id)}
                title={`${style.description} (${style.lengthHint})`}
                className={cn(
                  'px-2 py-1 rounded text-[9px] font-medium border transition-all',
                  controls.videoStyle === style.id
                    ? 'bg-emerald-500/25 border-emerald-500/40 text-emerald-100'
                    : 'bg-[#0c1222] border-white/10 text-slate-400 hover:text-emerald-200 hover:border-emerald-500/25',
                )}
              >
                {style.label}
              </button>
            ))}
          </div>
        )}
        <select
          value={controls.videoStyle}
          onChange={(e) => handleStyleChange(e.target.value as VideoStyle)}
          className="w-full bg-[#0c1222] border border-white/10 rounded-lg px-2 py-1 text-[10px] text-emerald-100"
        >
          {videoStyles.map((style) => (
            <option key={style.id} value={style.id}>
              {style.label} — {style.lengthHint}
            </option>
          ))}
        </select>
        {activeStyle && (
          <p className="text-[9px] text-emerald-400/70">{activeStyle.description}</p>
        )}
      </div>

      {/* Length */}
      <div className="space-y-1.5 pt-1 border-t border-emerald-500/10">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
            <Clock className="w-3 h-3" /> Length
          </p>
          <span className="text-[10px] font-mono text-emerald-300">{controls.lengthSec}s</span>
        </div>
        <input
          type="range"
          min={1}
          max={120}
          step={1}
          value={controls.lengthSec}
          onChange={(e) => handleLengthPreset(Number(e.target.value))}
          className="w-full accent-emerald-500"
        />
        <div className="flex flex-wrap gap-1">
          {LENGTH_QUICK_PRESETS.map((sec) => (
            <button
              key={sec}
              type="button"
              onClick={() => handleLengthPreset(sec)}
              className={cn(
                'px-2 py-0.5 rounded text-[9px] font-medium border transition-all',
                controls.lengthSec === sec
                  ? 'bg-emerald-500/25 border-emerald-500/40 text-emerald-100'
                  : 'bg-[#0c1222] border-white/10 text-slate-400 hover:text-emerald-200',
              )}
            >
              {sec}s
            </button>
          ))}
        </div>
        <p className="text-[9px] text-slate-600">Scaled scenes: ~{scaledSceneEstimate}</p>
      </div>
    </div>
  );
}