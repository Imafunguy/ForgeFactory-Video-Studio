// Thin registry + helpers for the 4 official local video templates.
// Actual scene generation lives in videoRenderer.ts for now (tight coupling during initial implementation).
// This module provides the UI-facing metadata and a stable TemplateId type.

export type TemplateId =
  | 'product-explainer-30s'
  | 'feature-deep-dive'
  | 'customer-story'
  | 'how-it-works-45s';

export const LOCAL_VIDEO_TEMPLATES: Array<{
  id: TemplateId;
  label: string;
  durationMs: number;
  description: string;
}> = [
  {
    id: 'product-explainer-30s',
    label: '30s Product Explainer',
    durationMs: 30000,
    description: 'Hook → Dashboard reveal → Metrics + interaction → Strong CTA + brand close',
  },
  {
    id: 'feature-deep-dive',
    label: 'Feature Deep Dive',
    durationMs: 30000,
    description: 'One powerful interaction, progress, metric proof, quote, CTA',
  },
  {
    id: 'customer-story',
    label: 'Customer Story',
    durationMs: 30000,
    description: 'Real results quote, before/after bars, retention lift, brand lockup',
  },
  {
    id: 'how-it-works-45s',
    label: 'How it Works (45s)',
    durationMs: 45000,
    description: 'Step sequencer (Connect → Analyze → Coach) with proof + close',
  },
];

export function getTemplateLabel(id: TemplateId | undefined): string {
  if (!id) return 'Custom';
  const t = LOCAL_VIDEO_TEMPLATES.find((x) => x.id === id);
  return t?.label ?? 'Custom';
}
