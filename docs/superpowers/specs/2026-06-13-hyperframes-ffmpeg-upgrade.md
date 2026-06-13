# ForgeFactory v2: Hyperframes + FFmpeg Local Render Upgrade

**Date:** 2026-06-13  
**Status:** Approved for implementation (user selected all options + "just finish the work")  
**Goal:** Make it possible to produce a much higher percentage of final marketing videos locally (cheaply and with good quality) using an improved Hyperframes + FFmpeg pipeline instead of relying on expensive cloud video models for everything.

## Requirements Summary (from user query)

1. **Strengthen Hyperframes Rendering**
   - Improve quality and flexibility of HTML/canvas templates.
   - Add better built-in components for SaaS marketing:
     - Smooth UI animations and dashboard interactions
     - Feature highlight sequences
     - Data visualization / metric animations
     - Customer testimonial / quote animations
     - Logo + branding lockups
     - Kinetic typography for key messages
   - Support high-quality 1080p (primary) and 4K local renders with good motion and timing.

2. **Improve FFmpeg Post-Processing**
   - Better encoding (quality vs file size).
   - Stylish, readable, on-brand burned subtitles/captions.
   - Audio ducking and voiceover integration.
   - Smooth transitions between clips/scenes.
   - Optional color grading / LUT support.
   - Logo watermark and end card handling.
   - User-selectable quality presets: Fast, Balanced, High Quality.

3. **Add Stronger Local Video Templates**
   - Library of high-quality, reusable templates optimized for SaaS marketing:
     - 30s Product Explainer
     - Feature Deep Dive
     - Customer Story
     - How it Works (45s)
   - Templates combine Hyperframes animations + FFmpeg assembly.
   - Minimal cloud video generation required.
   - Easy automatic application of current project's brand (colors, name, tone, uiElements).

4. **Smarter Hybrid Workflow**
   - In Video Studio and Agentic Pipeline: clear indication when a shot/scene can be done locally vs when a cloud video model is recommended.
   - "Maximize Local Render" option: bias the system to do as much as possible with Hyperframes + FFmpeg before falling back.
   - Show estimated cost savings when using more local rendering (using existing ModelPricingContext).

5. **General Polish**
   - Better preview of what the local render will look like before committing (target resolution, scrubber, higher fidelity).
   - Clearer feedback on render progress (stages: capture, encode, post-process) and final file output (name, size, duration, effective settings).
   - Keep fast and reliable on a normal developer machine.

## Chosen Design Direction (from visual brainstorming feedback)

**Core direction selected:** Core SaaS UI Primitives + Timeline

This means the Hyperframes engine will be built around a focused, high-quality set of reusable canvas-based primitives that excel at SaaS dashboard-style content:

- DashboardCard (with accent top bar, lift, content updates)
- ProgressRing + LinearProgress (smooth timed fills)
- MetricCounter (animated numbers + deltas)
- Sidebar / Topbar (reveals, active states)
- MicroCTA / Interactive buttons (press feedback)
- Simple drag / interaction zones
- TestimonialQuote cards (with avatar, soft motion)
- Kinetic typography / big message hooks
- LogoLockup + branded end cards
- Basic data viz (bars, simple line builds)

These primitives are composed into timed scenes. The planner/assembly steps (or a template engine) produce a scene list or rich description that the renderer turns into a 30s/45s sequence at the chosen resolution/fps.

**Selected templates (priority library):**
- 30s Product Explainer
- Feature Deep Dive
- Customer Story
- How it Works (45s)

All templates automatically pull brand from the active Project (colors for accents, name in chrome, tone for microcopy hints, uiElements for default layout flavor).

**All focus areas approved:**
- Resolution/fps targets + quality levels (1080p60 as high-quality target, with Balanced 1080p30 and Fast 720p options; 4K experimental).
- Full FFmpeg post-processing (re-encode, captions, transitions, watermark, audio, light grading).
- Hybrid "Maximize Local Render" toggle + indicators + cost estimator in both Studio and Agentic flows.
- Significantly improved preview + render progress UI.

## Architecture Overview

**Hyperframes Core (client-only, canvas 2D for reliability):**
- `src/lib/videoRenderer.ts` becomes the main engine.
- Scene/timeline system: array of { start, end, type: 'card' | 'progress' | 'metric' | 'quote' | 'kinetic' | 'logo' | ..., params, easing }
- Brand applicator: takes current Project + accent and applies to all drawing (fill styles, text, highlights).
- Template registry: simple JS objects that expand to scene lists for the 4 templates (with slight randomization or param overrides for variety).
- Renderer exposes:
  - `createRenderer(container, project, templateIdOrCustomDesc, options: {width, height, fps, duration})`
  - `preview(time)` for scrubbing
  - `record()` returns Blob (initially still uses captureStream for speed, but improved internal drawing loop at target fps/res)
  - Support for higher internal resolution than preview host.

**Preview & UI:**
- HyperframesWorkspace and dedicated Hyperframes page get resolution selector, quality preset selector (for final render), template picker, and a time scrubber on the stage.
- Preview renders at the final target res (scaled to fit the host for UI) when possible, or uses a high-fidelity offscreen canvas.

**FFmpeg Post-Processing:**
- Use the already-declared `@ffmpeg/ffmpeg` + `@ffmpeg/util` (previously unused).
- After the initial capture (webm from improved canvas recorder), load into FFmpeg virtual FS.
- Commands per preset:
  - Fast: lower res or lower crf tolerance, ultrafast-ish, basic concat if multi-segment.
  - Balanced: 1080p, good crf (~20-23), decent preset.
  - High: higher fps if selected, better crf (~17-19), x264 profile, two-pass feel where possible in wasm.
- Caption burning: generate a simple .srt or use drawtext filter with brand colors, readable font (load a basic font or use system). Prefer burning nice text in the canvas renderer itself for the main content + use FFmpeg for any additional lower-third or end-card overlays.
- Transitions: when a template has multiple logical clips, use xfade or concat with crossfade.
- Audio: support optional voiceover track (file upload in a future polish, or placeholder tone for now). Ducking via volume filter on music bed (if we add simple generated or uploaded bed).
- Watermark / end card: overlay a small logo png (generated from brand or static) + end slate with project name + CTA.
- Output: high-quality .webm or .mp4 (prefer mp4 for compatibility using libx264 in ffmpeg.wasm).

**Hybrid Workflow & Intelligence:**
- Add `maximizeLocal: boolean` to relevant state (Studio + Agentic).
- When true:
  - Pass a strong system prompt prefix to planning/assembly calls: "Prioritize scenes that can be realized with high-quality local Hyperframes (dashboard UI, metrics, quotes, kinetic type, logo lockups, step sequences). Avoid describing photoreal live-action, complex 3D, or cinematic B-roll that would require cloud video models."
  - In script/keyframe previews, tag segments: "Local Hyperframes (high confidence)" or "Consider cloud video model for this beat".
- Cost estimator: using existing pricing context + rough video model costs from constants, compute "Est. cost with this plan: $0.08 (all local) vs $4.20 (heavy video models)". Show delta when Maximize Local is on.
- In PipelineStepTracker and output areas, surface "Local coverage: X/Y scenes".

**Templates + Brand Application:**
- New file: `src/lib/localVideoTemplates.ts`
- Each template exports `{ id, label, durationMs, defaultFps, sceneBuilder: (project) => Scene[] }`
- In assembly step (both flows) and dedicated Hyperframes tab, offer a "Use Template" dropdown. Selecting one auto-fills a rich hyperDesc and configures the renderer.
- Brand is always pulled live from the currentProject in context/state.

**Polish & Feedback:**
- Render flow becomes multi-stage with visible progress:
  1. Capture frames / record primary video (canvas)
  2. FFmpeg init + input write
  3. Encode + filters (captions, transitions, watermark)
  4. Read output + create object URL + download
- Show final file card with: filename, duration, resolution @ fps, approx size, preset used, "100% local render".
- In preview hosts, add a small "Target: 1920x1080 @ 60fps | Preset: High Quality" badge when configured.
- Add a "Simulate / Dry-run at final settings" button that runs the animation at full target res (scaled in UI) without full recording.

**Data & State:**
- Extend StudioOutput / AgenticState with `renderOptions: { templateId?, maximizeLocal: boolean, qualityPreset: 'fast'|'balanced'|'high', targetWidth, targetHeight, fps }`
- Pass through to renderer and FFmpeg wrapper.
- Persist last-used preset in local settings if desired (lightweight).

## Files to Create / Modify (high level)

**New:**
- `docs/superpowers/specs/2026-06-13-hyperframes-ffmpeg-upgrade.md` (this doc)
- `docs/superpowers/plans/2026-06-13-hyperframes-ffmpeg-upgrade-plan.md` (detailed tasks)
- `src/lib/localVideoTemplates.ts`
- `src/lib/ffmpegProcessor.ts` (new FFmpeg wrapper)
- Possibly small font asset or base64 for captions if needed (or rely on canvas text + drawtext)

**Modify:**
- `src/lib/videoRenderer.ts` — major rewrite for primitives, templates, resolution, better recording loop, scene system.
- `src/lib/pipeline.ts` — extend types with render options, add maximizeLocal hints.
- `src/App.tsx` — wire new state (maximizeLocal, qualityPreset, targetRes, selectedTemplate), pass to components, update generate/render paths, prompt augmentation when maximizeLocal.
- `src/components/pages/Hyperframes.tsx` — add template picker, res/preset controls, better preview controls.
- `src/components/pages/VideoStudio.tsx` + `AgenticPipeline.tsx` — add "Maximize Local" toggle, cost banner, local coverage badges, pass options.
- `src/components/generation/PipelineUI.tsx` — enhance HyperframesWorkspace with res indicator + scrub if possible, VideoOutputPlayer with richer metadata, add RenderProgress component.
- `src/components/pages/Settings.tsx` — surface default quality preset + res preference (optional).
- `vite.config.ts` — add server headers for SharedArrayBuffer (COOP/COEP) to enable full multi-thread ffmpeg.wasm where possible; add note about https requirement for prod.
- `src/index.css` — minor additions for new controls/badges.
- `src/lib/constants.ts` — add quality preset defs, video model cost estimates for savings calc.
- Minor: ModelPricingContext usage for savings display.

## Non-Goals / Constraints / Trade-offs (YAGNI)

- Do not implement actual cloud video model calls in this pass (the constants already list them; the hybrid UI just makes the *recommendation* and cost comparison visible).
- Keep renderer primarily canvas 2D for predictability and dev-machine performance. We can explore DOM + html-to-canvas or framer capture later if needed.
- Audio: basic support (mix existing track or silence). Full voiceover generation/upload polish can come later.
- 4K: supported in options but with perf warning; primary targets are 1080p30/60.
- No new heavy dependencies beyond making full use of the existing @ffmpeg ones.
- FFmpeg.wasm init can be slow on first use (cache the loaded instance).
- Subtitles: beautiful burned captions done primarily in the canvas renderer (brand fonts, perfect positioning, timing). FFmpeg used for final container/encode + any extra overlays.

## Success Criteria

- User can select a template (or custom) in Hyperframes / Studio / Agentic, choose quality preset, toggle "Maximize Local", generate, see strong local preview, render a polished .webm/.mp4 with good motion, burned captions, watermark, and see clear "local only, $X saved" messaging.
- `npm run dev` starts cleanly.
- Local renders at 1080p look dramatically better than the original 960x540 hardcoded canvas.
- The 4 templates produce usable marketing video assets with minimal or zero cloud video model spend.

## Open Questions (to be validated during implementation or noted as future)

- Exact font loading strategy for captions in wasm (canvas text is reliable fallback).
- Whether to always re-encode through FFmpeg or offer "fast path" direct webm when no post-processing needed.
- Memory limits on lower-end machines for long 4K captures — graceful degradation.

This design was validated via visual companion (user selected the Core Primitives direction + all 4 templates + all 4 follow-up focus areas) and explicit instruction to pick all options and finish the work.

Implementation will follow a detailed bite-sized plan with frequent commits and verification that `npm run dev` remains clean at the end.