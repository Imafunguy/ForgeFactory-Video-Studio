export interface Project {
  id: string;
  name: string;
  colors: string;
  uiElements: string;
  tone: string;
  characterRef?: string;
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
  if (saved) return JSON.parse(saved);
  const defaults: Project[] = [
    { id: 'p_stratabody', name: 'StrataBody', colors: '#4F46E5', uiElements: 'dashboard, AI coach cards, progress rings, live tracking', tone: 'motivational, clean, scientific' },
    { id: 'p_speedmend', name: 'SpeedMend', colors: '#0EA47A', uiElements: 'kanban, quick actions, repair timeline, team handoff', tone: 'fast, practical, trustworthy' },
    { id: 'p_clubcensus', name: 'ClubCensus', colors: '#C026D3', uiElements: 'polls, live results, community feed, member avatars', tone: 'engaging, community-focused, fun' },
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
