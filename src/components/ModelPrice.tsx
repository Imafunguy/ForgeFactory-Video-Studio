import { cn } from '../lib/utils';
import type { ModelPricingInfo } from '../lib/modelPricing';

interface ModelPriceProps {
  pricing: ModelPricingInfo;
  size?: 'xs' | 'sm';
  className?: string;
}

export function ModelPrice({ pricing, size = 'xs', className }: ModelPriceProps) {
  const sizeClass = size === 'sm' ? 'text-[11px]' : 'text-[10px]';

  return (
    <span
      className={cn(
        'font-mono tabular-nums shrink-0',
        sizeClass,
        pricing.isFree && 'text-emerald-400',
        pricing.unavailable && 'text-slate-600 italic',
        !pricing.isFree && !pricing.unavailable && 'text-slate-400',
        className
      )}
      title={pricing.unavailable ? 'Could not fetch live price from OpenRouter' : pricing.displayPrice}
    >
      {pricing.isFree ? 'Free' : pricing.displayPrice}
    </span>
  );
}

export function PipelineCostSummary({
  reasoningPrice,
  imagePrice,
  className,
}: {
  reasoningPrice: ModelPricingInfo;
  imagePrice: ModelPricingInfo;
  className?: string;
}) {
  return (
    <div className={cn('rounded-xl bg-[#0c1222] border border-white/[0.06] px-3 py-2.5 space-y-1.5', className)}>
      <p className="forge-label">OpenRouter pricing (live)</p>
      <div className="flex flex-col gap-1 text-[10px]">
        <div className="flex justify-between gap-3">
          <span className="text-slate-500">Reasoning</span>
          <ModelPrice pricing={reasoningPrice} />
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-slate-500">Image</span>
          <ModelPrice pricing={imagePrice} />
        </div>
      </div>
    </div>
  );
}