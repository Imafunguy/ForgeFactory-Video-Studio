import { useState } from 'react';
import { Brain, Image, Video, Mic, ChevronDown, Check, Star } from 'lucide-react';
import { MODEL_GROUPS, type CostTier, type ModelOption } from '../lib/constants';
import { cn } from '../lib/utils';
import { Badge, CostBadge } from './ui';
import { ModelPrice } from './ModelPrice';
import { useModelPricing } from '../context/ModelPricingContext';
import type { ModelPricingInfo } from '../lib/modelPricing';

const GROUP_ICONS = {
  reasoning: Brain,
  image: Image,
  video: Video,
  voice: Mic,
};

const GROUP_KEYS = ['reasoning', 'image', 'video', 'voice'] as const;
type GroupKey = typeof GROUP_KEYS[number];

const TIER_SORT_ORDER: Record<CostTier, number> = {
  value: 0,
  medium: 1,
  premium: 2,
};

/** Model Lab: surface free/value picks first for cost-conscious testing. */
export function sortModelsForCostTesting(models: ModelOption[]): ModelOption[] {
  return [...models].sort((a, b) => {
    const tierDiff = TIER_SORT_ORDER[a.costTier] - TIER_SORT_ORDER[b.costTier];
    if (tierDiff !== 0) return tierDiff;
    if (a.costLabel === 'Free' && b.costLabel !== 'Free') return -1;
    if (b.costLabel === 'Free' && a.costLabel !== 'Free') return 1;
    if (a.isDefault && !b.isDefault) return -1;
    if (b.isDefault && !a.isDefault) return 1;
    return a.label.localeCompare(b.label);
  });
}

function countBudgetFriendlyModels(models: ModelOption[]): number {
  return models.filter(m => m.costTier === 'value').length;
}

interface ModelSelectorProps {
  planningModel: string;
  imageModel: string;
  videoModel: string;
  voiceModel: string;
  onPlanningChange: (value: string) => void;
  onImageChange: (value: string) => void;
  onVideoChange: (value: string) => void;
  onVoiceChange: (value: string) => void;
  compact?: boolean;
  /** When set, only show these groups (default: all four) */
  groups?: GroupKey[];
}

function ModelOptionRow({
  model,
  isSelected,
  onSelect,
  selectable = true,
  pricing,
}: {
  model: ModelOption;
  isSelected: boolean;
  onSelect?: () => void;
  selectable?: boolean;
  pricing: ModelPricingInfo;
}) {
  return (
    <button
      type="button"
      disabled={!selectable}
      onClick={onSelect}
      className={cn(
        'w-full flex items-start justify-between gap-3 p-3 rounded-xl text-sm transition-all border text-left',
        isSelected
          ? 'bg-indigo-500/10 border-indigo-500/30 text-white'
          : selectable
            ? 'border-transparent hover:bg-white/5 hover:border-white/10 text-slate-400'
            : 'border-transparent text-slate-600 cursor-default opacity-75'
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
          <span className="font-medium text-slate-200">{model.label}</span>
          <span className="text-[10px] text-slate-600">{model.provider}</span>
          {model.isDefault && (
            <Badge variant="accent">
              <Star className="w-2.5 h-2.5 mr-0.5 inline" />Default
            </Badge>
          )}
          <CostBadge tier={model.costTier} label={model.costLabel} />
        </div>
        <div className="mt-1">
          <ModelPrice pricing={pricing} />
        </div>
        {model.note && (
          <p className="text-[10px] text-slate-600 leading-relaxed mt-1.5 line-clamp-2">{model.note}</p>
        )}
      </div>
      {isSelected && <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />}
    </button>
  );
}

function getGroupValue(
  groupKey: GroupKey,
  props: ModelSelectorProps
): string {
  switch (groupKey) {
    case 'reasoning': return props.planningModel;
    case 'image': return props.imageModel;
    case 'video': return props.videoModel;
    case 'voice': return props.voiceModel;
  }
}

function getGroupOnChange(
  groupKey: GroupKey,
  props: ModelSelectorProps
): (v: string) => void {
  switch (groupKey) {
    case 'reasoning': return props.onPlanningChange;
    case 'image': return props.onImageChange;
    case 'video': return props.onVideoChange;
    case 'voice': return props.onVoiceChange;
  }
}

export function ModelSelector({
  planningModel,
  imageModel,
  videoModel,
  voiceModel,
  onPlanningChange,
  onImageChange,
  onVideoChange,
  onVoiceChange,
  compact = false,
  groups = [...GROUP_KEYS],
}: ModelSelectorProps) {
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const { getPrice } = useModelPricing();
  const props = { planningModel, imageModel, videoModel, voiceModel, onPlanningChange, onImageChange, onVideoChange, onVoiceChange };

  const getSelectedModel = (groupKey: GroupKey, value: string) => {
    const group = MODEL_GROUPS[groupKey];
    return group.models.find(m => m.value === value);
  };

  if (compact) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {groups.map(groupKey => {
          const group = MODEL_GROUPS[groupKey];
          const value = getGroupValue(groupKey, props);
          const onChange = getGroupOnChange(groupKey, props);
          const selected = getSelectedModel(groupKey, value);
          const price = getPrice(value);
          return (
            <div key={groupKey}>
              <label className="forge-label mb-1.5 block">{group.label}</label>
              <select
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full bg-[#0c1222] border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              >
                {group.models.map(m => {
                  const p = getPrice(m.value);
                  return (
                    <option key={m.value} value={m.value}>
                      {m.label} — {p.isFree ? 'Free' : p.displayPrice}
                    </option>
                  );
                })}
              </select>
              <div className="flex items-center justify-between mt-1 gap-2">
                {selected && <CostBadge tier={selected.costTier} label={selected.costLabel} />}
                <ModelPrice pricing={price} className="ml-auto" />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {groups.map(groupKey => {
        const group = MODEL_GROUPS[groupKey];
        const Icon = GROUP_ICONS[groupKey];
        const currentValue = getGroupValue(groupKey, props);
        const onChange = getGroupOnChange(groupKey, props);
        const isOpen = openGroup === groupKey;
        const selected = getSelectedModel(groupKey, currentValue);
        const selectedPrice = getPrice(currentValue);

        return (
          <div key={groupKey} className="relative">
            <button
              type="button"
              onClick={() => setOpenGroup(isOpen ? null : groupKey)}
              className="w-full flex items-center justify-between px-4 py-3 bg-[#0c1222] border border-white/10 rounded-xl hover:border-indigo-500/30 transition-all group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-xs text-slate-500">{group.label}</p>
                  <p className="text-sm font-medium text-white truncate">{selected?.label || 'Select model'}</p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                    {selected && <CostBadge tier={selected.costTier} label={selected.costLabel} />}
                    <ModelPrice pricing={selectedPrice} />
                  </div>
                </div>
              </div>
              <ChevronDown className={cn('w-4 h-4 text-slate-500 transition-transform shrink-0', isOpen && 'rotate-180')} />
            </button>

            {isOpen && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 py-1 bg-[#0e1528] border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden max-h-80 overflow-y-auto">
                <p className="px-4 py-2 text-[10px] text-slate-600 uppercase tracking-wider">{group.description}</p>
                {group.models.map(model => (
                  <div key={model.value} className="px-1">
                    <ModelOptionRow
                      model={model}
                      isSelected={currentValue === model.value}
                      pricing={getPrice(model.value)}
                      onSelect={() => { onChange(model.value); setOpenGroup(null); }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function ModelLabGrid({
  planningModel,
  imageModel,
  videoModel,
  voiceModel,
  onPlanningChange,
  onImageChange,
  onVideoChange,
  onVoiceChange,
}: ModelSelectorProps) {
  const { getPrice } = useModelPricing();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {GROUP_KEYS.map(key => {
        const group = MODEL_GROUPS[key];
        const Icon = GROUP_ICONS[key];
        const currentValue = getGroupValue(key, {
          planningModel, imageModel, videoModel, voiceModel,
          onPlanningChange, onImageChange, onVideoChange, onVoiceChange,
        });
        const onChange = getGroupOnChange(key, {
          planningModel, imageModel, videoModel, voiceModel,
          onPlanningChange, onImageChange, onVideoChange, onVoiceChange,
        });

        const sortedModels = sortModelsForCostTesting(group.models);
        const budgetCount = countBudgetFriendlyModels(group.models);

        return (
          <div key={key} className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Icon className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">{group.label}</h3>
                <p className="text-xs text-slate-500">{group.description}</p>
                {budgetCount > 0 && (
                  <p className="text-[10px] text-emerald-400/80 mt-1">
                    {budgetCount} free/value option{budgetCount === 1 ? '' : 's'} — sorted cheapest first for testing
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              {sortedModels.map(model => (
                <ModelOptionRow
                  key={model.value}
                  model={model}
                  isSelected={currentValue === model.value}
                  selectable
                  pricing={getPrice(model.value)}
                  onSelect={() => onChange(model.value)}
                />
              ))}
            </div>

            {group.costNote && (
              <p className="text-[10px] text-amber-400/80 mt-3 leading-relaxed border-t border-white/[0.06] pt-3">
                {group.costNote}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}