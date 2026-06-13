import {
  CLUBCENSUS_BRAND_KIT,
  isLegacyClubCensusPalette,
  type FullBrandKit,
} from './brandKits';

export interface Project {
  id: string;
  name: string;
  colors: string;
  uiElements: string;
  tone: string;
  characterRef?: string;
  /** Multi-swatch brand palette (primary, accent, secondary, neutral, surface, text) */
  brandPalette?: string[];
  logoUrl?: string;
  defaultFont?: string;
  logoDescription?: string;
  brandVoice?: string;
  personality?: string;
  values?: string;
}

export interface SavedBrandKit {
  id: string;
  name: string;
  palette: string[];
  defaultFont: string;
  logoDescription?: string;
  brandVoice?: string;
  personality?: string;
  values?: string;
  createdAt: number;
}

const CUSTOM_BRAND_KITS_KEY = 'ff_v2_custom_brand_kits';

const DEFAULT_PROJECT_PALETTES: Record<string, string[]> = {
  p_stratabody: ['#4F46E5', '#6366F1', '#818CF8', '#0F172A', '#1E293B', '#E2E8F0'],
  p_speedmend: ['#0EA47A', '#10B981', '#34D399', '#0C1F17', '#134E3A', '#D1FAE5'],
  p_clubcensus: CLUBCENSUS_BRAND_KIT.paletteArray,
};

function applyFullBrandKitToProject(project: Project, kit: FullBrandKit): Project {
  return {
    ...project,
    colors: kit.primaryColor,
    brandPalette: [...kit.paletteArray],
    defaultFont: kit.defaultFont,
    uiElements: kit.uiElements,
    tone: kit.tone,
    logoDescription: kit.logoDescription,
    brandVoice: kit.brandVoice,
    personality: kit.personality,
    values: kit.values,
  };
}

/** Derive a 4-color palette from a single accent hex (legacy projects). */
export function deriveBrandPaletteFromColor(color: string): string[] {
  const primary = color.match(/#[0-9A-Fa-f]{6}/)?.[0] ?? '#6366f1';
  return [primary, primary, '#1E293B', '#E2E8F0'];
}

export function migrateProject(project: Project): Project {
  let migrated = { ...project };
  if (!migrated.brandPalette?.length) {
    migrated.brandPalette =
      DEFAULT_PROJECT_PALETTES[migrated.id] ?? deriveBrandPaletteFromColor(migrated.colors);
  }
  if (!migrated.defaultFont) {
    migrated.defaultFont = 'Inter';
  }
  if (
    migrated.id === 'p_clubcensus' &&
    (isLegacyClubCensusPalette(migrated.colors, migrated.brandPalette) || !migrated.brandVoice)
  ) {
    migrated = applyFullBrandKitToProject(migrated, CLUBCENSUS_BRAND_KIT);
  }
  return migrated;
}

export function projectFromBrandKit(kit: FullBrandKit, base?: Partial<Project>): Project {
  return applyFullBrandKitToProject(
    {
      id: base?.id ?? `p_${kit.id}`,
      name: base?.name ?? kit.name,
      colors: kit.primaryColor,
      uiElements: kit.uiElements,
      tone: kit.tone,
      ...base,
    },
    kit,
  );
}

export function loadCustomBrandKits(): SavedBrandKit[] {
  try {
    const saved = localStorage.getItem(CUSTOM_BRAND_KITS_KEY);
    return saved ? (JSON.parse(saved) as SavedBrandKit[]) : [];
  } catch {
    return [];
  }
}

export function saveCustomBrandKit(kit: SavedBrandKit): SavedBrandKit[] {
  const existing = loadCustomBrandKits();
  const idx = existing.findIndex((k) => k.id === kit.id);
  const next = idx >= 0
    ? existing.map((k, i) => (i === idx ? kit : k))
    : [kit, ...existing];
  localStorage.setItem(CUSTOM_BRAND_KITS_KEY, JSON.stringify(next));
  return next;
}

export function deleteCustomBrandKit(id: string): SavedBrandKit[] {
  const next = loadCustomBrandKits().filter((k) => k.id !== id);
  localStorage.setItem(CUSTOM_BRAND_KITS_KEY, JSON.stringify(next));
  return next;
}

function migrateProjects(projects: Project[]): Project[] {
  return projects.map(migrateProject);
}

export interface Generation {
  id: string;
  projectId: string;
  projectName: string;
  goal: string;
  timestamp: number;
  script?: string;
  videoName?: string;
  note?: string;
  /** True when video blob is stored in IndexedDB for Library replay */
  hasStoredVideo?: boolean;
  /** True when thumbnail is stored in IndexedDB */
  hasThumbnail?: boolean;
  durationSec?: number;
}

import {
  DEFAULT_IMAGE_MODEL,
  DEFAULT_REASONING_MODEL,
  DEFAULT_VIDEO_MODEL,
  DEFAULT_VOICE_MODEL,
  getDefaultVoiceForModel,
} from './constants';
import type { QualityPreset, TemplateId } from './videoRenderer';

const PROJECTS_KEY = 'ff_v2_projects';
const GENERATIONS_KEY = 'ff_v2_generations';
const CURRENT_PROJECT_KEY = 'ff_v2_current_project';
const API_KEY_KEY = 'ff_v2_openrouter_key';
const MODEL_PREFS_KEY = 'ff_v2_model_prefs';

export interface ModelPreferences {
  planningModel: string;
  imageModel: string;
  videoModel: string;
  voiceModel: string;
  /** Selected voice ID for the active voice model */
  voiceId: string;
  /** Per-model voice selections (model value → voice id) */
  voiceSelections: Record<string, string>;
  maximizeLocal: boolean;
  qualityBoost: boolean;
  qualityPreset: QualityPreset;
  selectedTemplate: TemplateId | null;
}

const DEFAULT_MODEL_PREFS: ModelPreferences = {
  planningModel: DEFAULT_REASONING_MODEL,
  imageModel: DEFAULT_IMAGE_MODEL,
  videoModel: DEFAULT_VIDEO_MODEL,
  voiceModel: DEFAULT_VOICE_MODEL,
  voiceId: getDefaultVoiceForModel(DEFAULT_VOICE_MODEL),
  voiceSelections: {},
  maximizeLocal: true,
  qualityBoost: false,
  qualityPreset: 'balanced',
  selectedTemplate: null,
};

export function loadModelPreferences(): ModelPreferences {
  try {
    const saved = localStorage.getItem(MODEL_PREFS_KEY);
    if (!saved) return { ...DEFAULT_MODEL_PREFS };
    const parsed = JSON.parse(saved) as Partial<ModelPreferences>;
    const merged = { ...DEFAULT_MODEL_PREFS, ...parsed };
    if (!merged.voiceSelections) merged.voiceSelections = {};
    if (!merged.voiceId) {
      merged.voiceId = merged.voiceSelections[merged.voiceModel] ?? getDefaultVoiceForModel(merged.voiceModel);
    }
    return merged;
  } catch {
    return { ...DEFAULT_MODEL_PREFS };
  }
}

export function saveModelPreferences(prefs: Partial<ModelPreferences>): ModelPreferences {
  const merged = { ...loadModelPreferences(), ...prefs };
  localStorage.setItem(MODEL_PREFS_KEY, JSON.stringify(merged));
  return merged;
}

export function loadProjects(): Project[] {
  const saved = localStorage.getItem(PROJECTS_KEY);
  if (saved) {
    const parsed = JSON.parse(saved) as Project[];
    const migrated = migrateProjects(parsed);
    if (JSON.stringify(parsed) !== JSON.stringify(migrated)) {
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(migrated));
    }
    return migrated;
  }
  const defaults: Project[] = [
    {
      id: 'p_stratabody',
      name: 'StrataBody',
      colors: '#4F46E5',
      brandPalette: DEFAULT_PROJECT_PALETTES.p_stratabody,
      defaultFont: 'Inter',
      uiElements: 'dashboard, AI coach cards, progress rings, live tracking',
      tone: 'motivational, clean, scientific',
    },
    {
      id: 'p_speedmend',
      name: 'SpeedMend',
      colors: '#0EA47A',
      brandPalette: DEFAULT_PROJECT_PALETTES.p_speedmend,
      defaultFont: 'Inter',
      uiElements: 'kanban, quick actions, repair timeline, team handoff',
      tone: 'fast, practical, trustworthy',
    },
    projectFromBrandKit(CLUBCENSUS_BRAND_KIT, { id: 'p_clubcensus', name: 'ClubCensus' }),
  ];
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(defaults));
  return defaults;
}

export function saveProjects(projects: Project[]) {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

export function loadGenerations(): Generation[] {
  const saved = localStorage.getItem(GENERATIONS_KEY);
  return saved ? JSON.parse(saved) : [];
}

export function saveGenerations(generations: Generation[]) {
  localStorage.setItem(GENERATIONS_KEY, JSON.stringify(generations));
}

export function loadCurrentProjectId(): string | null {
  return localStorage.getItem(CURRENT_PROJECT_KEY);
}

export function saveCurrentProjectId(id: string) {
  localStorage.setItem(CURRENT_PROJECT_KEY, id);
}

export function loadApiKey(): string {
  return localStorage.getItem(API_KEY_KEY) || '';
}

/** Prefer the persisted key; fall back to in-memory state when provided. */
export function resolveOpenRouterApiKey(fallback?: string): string {
  const stored = loadApiKey().trim();
  if (stored) return stored;
  return (fallback ?? '').trim();
}

export function saveApiKey(key: string) {
  localStorage.setItem(API_KEY_KEY, key);
}
