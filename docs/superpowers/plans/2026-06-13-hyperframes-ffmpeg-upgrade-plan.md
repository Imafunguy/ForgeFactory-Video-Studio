# Hyperframes + FFmpeg Local Render Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a dramatically stronger local Hyperframes + FFmpeg pipeline in ForgeFactory v2 so that the large majority of SaaS marketing videos (using the 4 approved templates + custom) can be produced at high visual quality (1080p with good motion, timing, branding, captions, transitions) entirely locally, with clear hybrid decision support and cost transparency in the UI.

**Architecture:** 
- Core canvas 2D renderer with a small library of reusable high-quality SaaS primitives (DashboardCard, ProgressRing, MetricCounter, etc.) composed via a simple scene/timeline system.
- 4 first-class reusable local video templates that expand to scene lists and automatically apply the active Project brand.
- Real integration of the existing @ffmpeg/ffmpeg for post-processing (re-encode with quality presets, burned captions, xfade transitions, watermark/endcard, light audio handling).
- UI extensions across VideoStudio, AgenticPipeline, Hyperframes page, and PipelineUI components for template selection, quality presets, "Maximize Local Render" mode, local-vs-cloud indicators, cost savings, and rich render progress.
- Brand and options flow through existing project context + new renderOptions state.

**Tech Stack:** React 19 + TypeScript + Vite + Tailwind, framer-motion (UI only), @ffmpeg/ffmpeg + @ffmpeg/util (real usage), canvas 2D (renderer), MediaRecorder (initial capture) + FFmpeg.wasm (assembly + filters + encode), existing OpenRouter for planning/assembly prompts (augmented when maximize-local).

---

### Task 1: Project Setup & Docs Confirmation
**Files:**
- Create: `docs/superpowers/specs/2026-06-13-hyperframes-ffmpeg-upgrade.md` (already written)
- Create: `docs/superpowers/plans/2026-06-13-hyperframes-ffmpeg-upgrade-plan.md` (this file)

- [ ] **Step 1.1** Confirm directories exist and design doc is present.
```bash
ls docs/superpowers/specs/2026-06-13-hyperframes-ffmpeg-upgrade.md docs/superpowers/plans/2026-06-13-hyperframes-ffmpeg-upgrade-plan.md
```
Expected: both files listed.

- [ ] **Step 1.2** Add a short .gitignore entry for brainstorm artifacts if desired (optional, not blocking).
```bash
# .superpowers/brainstorm/ can be added to .gitignore later
```

### Task 2: Core Renderer Primitives & Scene System
**Files:**
- Modify: `src/lib/videoRenderer.ts` (major rewrite)

- [ ] **Step 2.1** Read current videoRenderer.ts to have exact original content for reference.
```bash
# Already have from exploration; proceed with replacement below.
```

- [ ] **Step 2.2** Replace the entire content of `src/lib/videoRenderer.ts` with a new high-quality implementation containing:
  - Types for Brand, Scene, RenderOptions, PrimitiveType.
  - `applyBrand(ctx, brand, time)` helper.
  - Individual primitive drawers: drawDashboardCard, drawProgressRing, drawMetricCounter, drawSidebar, drawTopbar, drawMicroCTA, drawTestimonialQuote, drawKineticText, drawLogoLockup, drawBars.
  - `drawScene(ctx, scene, brand, elapsed)` dispatcher.
  - `createHyperframesRenderer(container, project, scenesOrTemplateId, options)` that returns { canvas, start, stop, record, seek } with proper high-res support (default 1920x1080 @ 60, configurable).
  - Improved record that targets the chosen fps/res and returns a clean webm Blob.
  - Helper to get scenes for the 4 templates (will be moved to dedicated module later but stubbed here first).

```typescript
// Full implementation will be inserted in the edit step. Key signatures:
export interface ProjectBrand { name: string; accent: string; tone?: string; uiElements?: string; }
export interface RenderOptions { width?: number; height?: number; fps?: number; durationMs?: number; qualityPreset?: 'fast'|'balanced'|'high'; }
export function createHyperframesRenderer(...) { ... }
export async function renderToBlob(renderer, durationMs): Promise<Blob> { ... }
export const LOCAL_TEMPLATES = { 'product-explainer-30s': ..., ... } as const;
```

- [ ] **Step 2.3** Write the new file content using search_replace (full file replacement by using a unique old_string if needed, or multiple targeted replaces). For large change, replace large sections.
- [ ] **Step 2.4** Run TypeScript check on the file.
```bash
npx tsc --noEmit src/lib/videoRenderer.ts
```
Expected: no errors (or only unrelated).

### Task 3: Extract Local Video Templates
**Files:**
- Create: `src/lib/localVideoTemplates.ts`

- [ ] **Step 3.1** Create the new file with the 4 selected templates.
Each template returns a list of scenes using the primitives from Task 2, with brand-aware timings (30s or 45s).

```ts
export type TemplateId = 'product-explainer-30s' | 'feature-deep-dive' | 'customer-story' | 'how-it-works-45s';

export function getTemplateScenes(id: TemplateId, brand: ProjectBrand): Scene[] {
  // concrete timed arrays for each
}
```

- [ ] **Step 3.2** Export a small metadata list for UI pickers: label, duration, description.

- [ ] **Step 3.3** Import and use the template module from videoRenderer (or keep a thin bridge).

### Task 4: FFmpeg Post-Processor
**Files:**
- Create: `src/lib/ffmpegProcessor.ts`
- Modify: `src/lib/videoRenderer.ts` (to call post-process after capture when needed)

- [ ] **Step 4.1** Create `src/lib/ffmpegProcessor.ts`.
  - `ensureFFmpeg()` – lazy load @ffmpeg/ffmpeg, handle progress.
  - `postProcess(inputWebm: Blob, options: {preset, captions?, watermark?, duration, brand, hasAudio?}) : Promise<Blob>`
  - Inside: write input, run ffmpeg command using appropriate -c:v libx264 -crf X -preset Y (map presets to crf/preset values), -vf for drawtext captions or simple overlays, -c:a copy or aac for mixing.
  - Support simple text subtitles burned via drawtext (brand colored, readable size/position).
  - Watermark: generate a small canvas logo png from brand and overlay with -i + overlay filter.
  - End card: concat a short branded slate (or overlay at end).
  - For transitions inside a single capture we mostly rely on the scene system; for future multi-segment we can expose concat+xfade.
  - Return final mp4 or high-quality webm.

- [ ] **Step 4.2** Add quality preset constants in `src/lib/constants.ts` (or local to the processor):
```ts
export const QUALITY_PRESETS = {
  fast: { label: 'Fast', crf: 28, preset: 'veryfast', fps: 30, note: 'Quick drafts' },
  balanced: { label: 'Balanced', crf: 22, preset: 'medium', fps: 30, note: 'Good quality / size' },
  high: { label: 'High Quality', crf: 18, preset: 'slow', fps: 60, note: 'Best local motion' },
} as const;
```

- [ ] **Step 4.3** Wire a `renderWithFFmpeg` path in videoRenderer or a new exported function that does capture → ffmpeg post → final blob.

### Task 5: Update Core Types & Pipeline
**Files:**
- Modify: `src/lib/pipeline.ts`

- [ ] **Step 5.1** Add to interfaces:
```ts
export interface RenderOptions {
  templateId?: TemplateId;
  maximizeLocal: boolean;
  qualityPreset: 'fast' | 'balanced' | 'high';
  targetWidth: number;
  targetHeight: number;
  fps: number;
}
```
Extend StudioOutput and AgenticState with `renderOptions?: RenderOptions`.

- [ ] **Step 5.2** Update createInitial* helpers if needed.
- [ ] **Step 5.3** Add small helper `getLocalCoverage(scriptOrScenes): number` (stub for now; can be 100% when using templates).

### Task 6: App State & Wiring (Main Orchestrator)
**Files:**
- Modify: `src/App.tsx` (the big one)

- [ ] **Step 6.1** Add new top-level state:
```ts
const [maximizeLocal, setMaximizeLocal] = useState(true);
const [qualityPreset, setQualityPreset] = useState<'fast'|'balanced'|'high'>('balanced');
const [targetRes, setTargetRes] = useState({w:1920, h:1080, fps:60});
const [selectedTemplate, setSelectedTemplate] = useState<TemplateId | null>(null);
```

- [ ] **Step 6.2** In `generateHyperframesPreview` and render paths, build proper scenes using template or rich desc + current project + renderOptions.

- [ ] **Step 6.3** When calling planning models, if (maximizeLocal) prepend a strong bias instruction to the prompt.

- [ ] **Step 6.4** Pass all new props down to VideoStudio, AgenticPipeline, Hyperframes components.

- [ ] **Step 6.5** Update renderVideo to accept and use renderOptions and call the new FFmpeg-enhanced path when quality or post-processing is requested.

### Task 7: Video Studio UI Updates
**Files:**
- Modify: `src/components/pages/VideoStudio.tsx`
- Modify: `src/components/generation/PipelineUI.tsx` (HyperframesWorkspace, new components)

- [ ] **Step 7.1** Add a "Maximize Local Render" toggle (nice pill or checkbox) near the goal textarea. Default on.
- [ ] **Step 7.2** Add quality preset segmented control or Select (Fast / Balanced / High Quality) and a small "Target resolution" note (1920×1080@60 etc.).
- [ ] **Step 7.3** Add template quick-picker (dropdown or chips) that sets the template and a short description.
- [ ] **Step 7.4** In the output area, show a small "Local coverage" badge and cost-savings line when maximizeLocal is true (use useModelPricing to estimate video model cost vs ~0 for local).
- [ ] **Step 7.5** Enhance HyperframesWorkspace to accept renderOptions and show target badge. Add basic time scrubber for the preview host (store current time and call seek on renderer if available).

### Task 8: Agentic Pipeline UI Updates
**Files:**
- Modify: `src/components/pages/AgenticPipeline.tsx`
- Modify: `src/components/generation/PipelineUI.tsx`

- [ ] **Step 8.1** Mirror the toggle, preset selector, template picker from VideoStudio (keep compact).
- [ ] **Step 8.2** In ToolCallTimeline or new section, surface when a step was "Hyperframes (local)" vs would recommend video model.
- [ ] **Step 8.3** Show cost savings banner when maximizeLocal.

### Task 9: Dedicated Hyperframes Page Polish
**Files:**
- Modify: `src/components/pages/Hyperframes.tsx`

- [ ] **Step 9.1** Add prominent Template selector (the 4 options) + "Custom" mode.
- [ ] **Step 9.2** Add full render options panel: quality preset, resolution (1080p60 default, 1080p30, 4K warning), duration override.
- [ ] **Step 9.3** Make the preview host larger and add a scrubber + "Preview at final resolution" button that temporarily uses higher internal size.
- [ ] **Step 9.4** On Render, use the full new renderer + FFmpeg path and show richer progress.

### Task 10: Shared UI Components & Progress
**Files:**
- Modify: `src/components/generation/PipelineUI.tsx`
- Possibly new small component inside it.

- [ ] **Step 10.1** Create or enhance a `RenderProgress` component that shows stages: Capturing animation → Initializing FFmpeg → Encoding + filters → Finalizing (with % or spinner per stage).
- [ ] **Step 10.2** Update VideoOutputPlayer to display rich metadata (resolution, fps, preset, file size if known, "100% local — $X saved").
- [ ] **Step 10.3** Add a small CostSavingsBanner component that takes pricing + maximizeLocal and shows the comparison.

### Task 11: Vite & Runtime Reliability
**Files:**
- Modify: `vite.config.ts`

- [ ] **Step 11.1** Add server headers for cross-origin isolation so ffmpeg.wasm can use SharedArrayBuffer / threads when available:
```ts
server: {
  port: 5173,
  headers: {
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Embedder-Policy': 'require-corp',
  },
},
```
- [ ] **Step 11.2** Add a note in Settings or a toast on first FFmpeg use about possible first-load delay and https requirement for full features in deployed environments.

### Task 12: Constants & Minor Supporting Changes
**Files:**
- Modify: `src/lib/constants.ts`
- Modify: `src/lib/utils.ts` (if needed for brand helpers)
- Modify: `src/components/pages/Settings.tsx` (optional defaults)

- [ ] **Step 12.1** Add VIDEO_QUALITY_PRESETS and rough video model cost estimates for the savings calculator.
- [ ] **Step 12.2** Export TemplateId and the four template ids.

### Task 13: Integration & Bug Fixes During Implementation
- [ ] **Step 13.1** After each major module (renderer, templates, ffmpeg), do a quick `npm run build` or `npx tsc --noEmit` and fix import/type errors immediately.
- [ ] **Step 13.2** Make sure currentProject changes immediately affect live preview (brand re-application).

### Task 14: Final Verification
**Files:** all touched files

- [ ] **Step 14.1** Run the dev server and confirm it starts cleanly with no console errors on load.
```bash
npm run dev
```
- [ ] **Step 14.2** In the running app:
  - Switch to a project.
  - Go to Hyperframes tab → pick "30s Product Explainer" template → choose High Quality → toggle Maximize Local on → Generate Preview (scrub it) → Render & Download.
  - Verify a much richer animation appears (cards lifting, rings, metrics, brand color, logo at end).
  - Check that the downloaded file is produced (webm or mp4 via FFmpeg path).
- [ ] **Step 14.3** Repeat quickly in Video Studio (one-click) and Agentic with "Maximize Local" on; confirm cost savings text and local tags appear.
- [ ] **Step 14.4** Run `npm run build` successfully.
- [ ] **Step 14.5** Run `npm run lint` (fix any new issues).

### Task 15: Cleanup & Docs Touch
- [ ] **Step 15.1** Remove or comment any dead code left from the old hardcoded 960x540 canvas.
- [ ] **Step 15.2** Update the renderer specs card in Hyperframes page to reflect new capabilities (1080p60, FFmpeg post, templates).
- [ ] **Step 15.3** (Optional) Add a one-line note in README.md about the new local render power.

---

**End of Plan**

When all checkboxes above are complete and `npm run dev` + a full local render using a template produces noticeably higher quality output with the new pipeline features, the task is finished.

User instruction "pick all options, just finish the work" has been treated as full approval to implement the complete design. All four follow-up focus areas (resolution/fps, FFmpeg post, hybrid-maxlocal, preview/progress) are included.

Execute the tasks in order. Use frequent small edits + verification commands. After the plan is executed, the final step is confirming a clean `npm run dev`.