/**
 * ForgeFactory — canonical brand kit definitions
 * Single source of truth for project defaults, palette presets, and panel loaders.
 */

import type { BrandPalette, VideoControls } from './videoControls';

export interface FullBrandKit {
  id: string;
  name: string;
  palette: BrandPalette;
  /** Flat array: primary, accent, secondary, neutral, surface, text */
  paletteArray: string[];
  primaryColor: string;
  defaultFont: string;
  logoDescription: string;
  uiElements: string;
  tone: string;
  brandVoice: string;
  personality: string;
  values: string;
  iconSet: string[];
}

export const CLUBCENSUS_BRAND_KIT: FullBrandKit = {
  id: 'clubcensus',
  name: 'ClubCensus',
  palette: {
    primary: '#2F3D34',
    accent: '#C9A86A',
    secondary: '#5C6B5F',
    neutral: '#161816',
    surface: '#E7E4DC',
    text: '#F7F6F2',
  },
  paletteArray: ['#2F3D34', '#C9A86A', '#5C6B5F', '#161816', '#E7E4DC', '#F7F6F2'],
  primaryColor: '#2F3D34',
  defaultFont: 'Inter',
  logoDescription:
    'Green dot cluster with gold accent mark alongside CLUBCENSUS wordmark — clean, modern, trustworthy club-management identity',
  uiElements:
    'Members, Events, Tasks, Payments, Reports, Messages icons — member dashboard, event calendar, task boards, payment tracking, reports hub, messaging center; dark green primary buttons, gold accent highlights, outlined secondary actions',
  tone: 'trusted, organised, professional — empowering clubs to thrive',
  brandVoice: 'Trusted. Organised. Professional. Empowering clubs to thrive.',
  personality: 'Reliable • Collaborative • Clear • Modern',
  values: 'Integrity • Community • Simplicity • Excellence',
  iconSet: ['Members', 'Events', 'Tasks', 'Payments', 'Reports', 'Messages'],
};

/** Legacy magenta palette — used to detect stale ClubCensus projects in localStorage. */
export const CLUBCENSUS_LEGACY_PRIMARY = '#C026D3';

export function isLegacyClubCensusPalette(colors: string | undefined, palette?: string[]): boolean {
  if (colors === CLUBCENSUS_LEGACY_PRIMARY) return true;
  return palette?.[0]?.toUpperCase() === CLUBCENSUS_LEGACY_PRIMARY;
}

export function brandKitToControlsPatch(kit: FullBrandKit): Partial<VideoControls> {
  return {
    brandPalette: { ...kit.palette },
    fontFamily: kit.defaultFont,
    accentLock: true,
    moodTone: 'professional',
    brandKitLock: {
      enabled: true,
      kitName: `${kit.name} Brand Kit`,
      lockStrength: 85,
    },
  };
}

export function getClubCensusControlsPatch(): Partial<VideoControls> {
  return brandKitToControlsPatch(CLUBCENSUS_BRAND_KIT);
}