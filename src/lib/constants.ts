import {
  LayoutDashboard,
  Video,
  Bot,
  FlaskConical,
  Clapperboard,
  Library,
  Settings,
  type LucideIcon,
} from 'lucide-react';

// Re-export central model registry — single source of truth
export {
  type CostTier,
  type ModelCategory,
  type ModelOption,
  type VoiceOption,
  MODEL_REGISTRY,
  MODEL_GROUPS,
  DEFAULT_REASONING_MODEL,
  DEFAULT_IMAGE_MODEL,
  DEFAULT_VIDEO_MODEL,
  DEFAULT_VOICE_MODEL,
  PRICING_ID_ALIASES,
  VIDEO_API_ALIASES,
  VOICE_API_ALIASES,
  getModelByValue,
  getModelsByCategory,
  getVoicesForModel,
  getDefaultVoiceForModel,
  resolveOpenRouterId,
  getImageModalities,
  getAllConfiguredModelIds,
} from './models';

// Re-export pricing helpers (used for global live price display + docs export)
export {
  type ModelPricingInfo,
  formatLastUpdated,
  generatePricingMarkdown,
  ensureCoverageForCurrent,
} from './modelPricing';

export interface TabDef {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

export const TABS: TabDef[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Overview & quick actions' },
  { id: 'studio', label: 'Video Studio', icon: Video, description: 'One-prompt generation' },
  { id: 'agentic', label: 'Agentic Pipeline', icon: Bot, description: 'Multi-step AI workflow' },
  { id: 'models', label: 'Model Lab', icon: FlaskConical, description: 'Model preferences' },
  { id: 'hyperframes', label: 'Hyperframes', icon: Clapperboard, description: 'Local renderer' },
  { id: 'library', label: 'Library', icon: Library, description: 'Your video archive' },
  { id: 'settings', label: 'Settings', icon: Settings, description: 'API & projects' },
];

export const PROJECT_DESCRIPTIONS: Record<string, string> = {
  StrataBody: 'AI-powered body composition coaching with live tracking, progress rings, and personalized wellness insights.',
  SpeedMend: 'Fast repair workflow management with kanban boards, team handoffs, and real-time repair timelines.',
  ClubCensus: 'Community engagement platform with live polls, member feeds, and real-time census analytics.',
};

export const AGENTIC_STEPS = [
  { id: 'plan', label: 'Plan', description: 'Script & structure' },
  { id: 'keyframes', label: 'Keyframes', description: 'Image prompts' },
  { id: 'hyperframes', label: 'Hyperframes', description: 'UI animation' },
  { id: 'render', label: 'Render', description: 'Local export' },
];