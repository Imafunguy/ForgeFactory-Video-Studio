# ForgeFactory Video Studio Methodology v1.0 — Higgsfield-Level 100% (or Better) for Branded SaaS Marketing Videos

**Version:** 1.0 "100%" (Perfection Pass)  
**Date:** 2026-06-13  
**Status:** Definitive, Exhaustive, Production-Ready Plan — Builds directly on v1.0 research session (full read of `docs/ForgeFactory-Video-Methodology-v1.0-Higgsfield-Level.md` + entire `research/` folder completed first). All new controls added as first-class citizens. Local-first + smart OpenRouter boosts. 5s and 10s lengths explicitly supported alongside 15/30/45/60/custom.

**Core Goal (Upgraded):** ForgeFactory must produce consistently excellent, cinematic, on-brand 5–60s marketing videos that match or exceed Higgsfield AI quality for SaaS use cases — with *full professional-grade controls* (aspect, camera, motion, mood, pace, brand intensity, reference consistency strength, music sync/beat-matching, text animation, end card/CTA, etc.), while remaining mostly local/cheap, fully controllable, auditable, and systematically testable.

**Research Foundation (This Session + Previous):** 
- Previous session artifacts read and extended: `research/higgsfield-analysis.md`, `research/claude-fable-agentic-patterns.md`, `research/video-best-practices-2026.md`, `research/forgefactory-baseline-and-gaps.md`, `research/research-index.md`.
- New exhaustive pass: `research/controls-higgsfield-deep-dive-2026.md` (targeted on every new control in Higgsfield Cinema Studio/Canvas + Runway Gen-4/4.5, Kling 3.x, Veo 3.1, Seedance 2.0, Luma, ComfyUI equivalents).
- Key Higgsfield insights transplanted and exceeded: Canvas node graph for orchestration, Cinema Studio deterministic controls (50+ camera presets, lens/aperture, genre for pacing/energy/tone, Elements/Soul ID for ref consistency, Hero Frame first, Start/End Frame, AI Director, Music Video genre, joint audio-video, aspect prefs including vertical/CinemaScope, manual style overrides). "Hero frame first, lock lighting/mood/lens, then motion with physics."
- Competitor + open-source: Heavy ref weighting for consistency strength; prompt + ControlNet/IPAdapter for camera/motion/mood; frame-count exact for 5s/10s; audio features for beat sync; node graphs for all params.
- Current ForgeFactory baseline (re-inspected): Excellent foundation in `videoRenderer.ts` (RenderOptions already has width/height/durationMs/fps/qualityPreset/templateId/keyframeImages + rich primitives + keyframe weave + FFmpeg post), `videoPipelinePrompts.ts` (durationSec, localBias, structured sections, assessPlanQuality + gates, brand profiles), `pipeline.ts` (steps), `localVideoTemplates.ts`, App/VideoStudio/Agentic/Hyperframes/PipelineUI (maximizeLocal, qualityBoost, preset, template, model selects). Recent 2026-06-13 hyperframes upgrade directly enables this expansion. Gaps closed: full parametric controls, dynamic aspect/short lengths, scene graph extensibility, ref strength, music, etc.

**Thesis for 100%:** Add every Higgsfield-style (and more) control as first-class, flow them deterministically through planning → keyframes/refs (with strength) → parametric scene graph/Hyperframes (local canvas sims for camera/motion/text/brand) → hybrid router (local or cloud with full param + ref injection) → post (FFmpeg for aspect/music/endcard) → gated critic (rubric scores every control). Local canvas gives *exact* SaaS UI/brand fidelity that cloud-only tools (including Higgsfield) cannot match for dashboards/metrics/typography. 5s/10s for hooks/ads. One-click presets for instant professional results. Systematic testing eliminates randomness.

All supporting research in `research/`. This is the single source of truth.

---

## 1. Complete Expanded Methodology with All Controls

The repeatable professional process now supports **every listed control as a first-class, user-editable, auditable parameter** in One-Prompt Studio, Agentic Pipeline, *and* dedicated Hyperframes. Controls influence prompts (planning + keyframes + cloud video), local scene graph/renderer (exact canvas scaling, animation curves, text variants, brand emphasis), hybrid decisions, FFmpeg post, and quality gates.

### Full Control Set (Higgsfield + Advanced for SaaS)
- **Video Length (seconds)**: 5, 10, 15, 30, 45, 60, custom (1-120). Dynamically scales all timings, scene density, hook/CTA weight. Short lengths (5/10s) optimized for social hooks, ads, vertical.
- **Aspect Ratio**: 16:9 (default cinematic), 9:16 (vertical social), 1:1 (square), 4:5 (portrait feed), custom (w:h or px). Canvas sized exactly; all primitives/scenes scaled proportionally or with aspect-aware layouts. FFmpeg preserves native (no forced letterbox unless chosen). Cloud models receive explicit aspect instruction + resized refs.
- **Camera Style**: static, cinematic pan, zoom (in/out), dolly (push/pull), orbiting (around subject), dynamic (handheld + hybrid moves), custom free-text. Maps to: prompt camera language (MCSLA "Camera" slot) + local renderer animation paths (coordinated layer transforms, parallax depth, momentum easing for "real camera" feel).
- **Motion Intensity**: subtle (gentle lifts, slow fills), medium (standard SaaS polish), high-energy (fast bounces, strong secondary motion, dramatic reveals). Multiplier on easing speeds, amplitude of bounces/parallax, particle-like accents in canvas; prompt "high-energy dynamic motion" or "subtle elegant".
- **Mood / Tone**: professional (clean corporate), energetic (vibrant upbeat), warm (friendly inviting), futuristic (neon/tech glow), minimalist (sparse elegant), premium (rich cinematic lighting, depth). Affects: prompt visual style/lighting descriptors + brand profile injection; local renderer (gradient overlays, shadow intensity, accent glow, color temp shifts via canvas filters or post LUT hints).
- **Pace**: slow build (deliberate reveals, lingering beats), fast-paced (rapid cuts, quick counters), balanced (classic explainer rhythm). Controls scene timing density, transition speed, animation duration compression/expansion; prompt "paced for [pace] narrative".
- **Brand Intensity**: subtle accents (light logo, tint only), strong branding (prominent UI chrome, repeated accents, feature highlights), full lockup (heavy logo presence, end card emphasis, name in every key shot). Scales: accent opacity/emphasis in primitives, logo size/placement variants in logo/cta scenes, end card complexity; prompt " [intensity] brand integration".
- **Reference Image / Character Consistency Strength**: 0–100% slider (or low/medium/high). "Exact adherence to reference sheet [ID] at [strength]% — identical chrome/colors/pose/composition, no drift." Heavy prompt weighting + multi-ref if supported; in local: keyframe panel blend/priority or overlay strength; Elements auto-weighted higher.
- **Music Sync Level / Beat-Matching**: none (no audio), light (subtle timing accents), medium (key animations on beats), strong (full beat-matched kinetic + transitions + reveals). Supports audio upload (or generated bed). Prompt "perfectly beat-matched to music: [BPM/desc]". Local: FFmpeg mix + animation timing offsets from detected or user-provided beats; renderer uses for secondary motion triggers.
- **Text Animation Style**: kinetic (per-letter bounce + pop, current advanced), simple fade (elegant dissolve), bold reveal (scale + color pop + underline emphasis), glitch/tech (for futuristic), custom. Dedicated drawer variants in renderer; prompt specifies style + timing synced to script.
- **End Card / CTA Style**: minimal (logo + tagline fade), standard (logo lockup + button + tagline), bold (full screen CTA with motion accent + QR hint or strong copy), branded end slate (extended with metrics or social). Parametric in cta/logo scenes + FFmpeg overlays; prompt " [style] end card with strong CTA".

**Additional Power-User / Higgsfield+ Controls (for 100% completeness)**:
- Lighting/Optics hints (soft key, rim, studio gradient, anamorphic bokeh sim via canvas).
- Genre influence (SaaS explainer, product launch, customer story, how-it-works — maps to pace/motion defaults).
- Hero Frame priority (generate/lock style ref first, then everything derives).
- Start/End frame anchoring for continuity (esp. cloud or stitched).
- Custom free-text style overrides (injected everywhere).

All controls default to sensible SaaS values (30s 16:9, balanced camera/motion/mood/pace, strong brand, high ref strength, medium music if audio, kinetic text, standard CTA) but fully overridable.

### Expanded Step-by-Step Methodology
**Phase 0: Project Elements + Controls Setup**
- Load/create Brand Elements (as v1.0: style sheets, UI primitives, logos, motion sigs — now with consistency strength default).
- Choose or load **Video Control Preset** (or full manual): all 11+ controls above.
- One-Prompt Studio: single goal textarea + prominent "Advanced Cinema Controls" panel (or collapsible) with all selects/sliders + audio upload for music + custom fields.
- Agentic: same controls in initial state + per-step overrides.
- Hyperframes dedicated: full control surface for manual scene building/tweaking + preview at exact aspect/length.
- Success gate: Elements + controls reviewed. "This is the exact creative and brand spec."

**Phase 1: Cinematic Planning & Direction (with Full Controls Injection)**
- Input: Goal + Elements + full VideoControls (length, aspect, cameraStyle, motionIntensity, mood, pace, brandIntensity, refStrength, musicSyncLevel, textAnimStyle, endCardStyle, + audio if any).
- Director/Planner specialist (high-intel model):
  - Structured plan using **MCSLA + full control expansion**.
  - Every section enriched:
    - HOOK/SCRIPT: timings scaled to exact length; beat-matched if musicSync.
    - STORYBOARD: per-beat includes "Camera: [style] at [intensity]", "Pace contribution", "Mood lighting", "Brand [intensity] lock", "Text: [style] anim", "End card role if final", "Ref strength application".
    - KEYFRAME PROMPTS (scaled number for length, e.g. 3 for 5-10s, 7+ for 60s): "16:9 or exact [aspect] cinematic comp", " [mood] [pace] [camera] move", "exact match to Elements ref sheet at [refStrength]%", "text [style]", "brand [intensity]".
    - HYPERFRAMES / SCENE GRAPH: parametric " [camera] path with [motionIntensity] energy, [mood] tone overlays, [brandIntensity] accent emphasis, [textAnimStyle] on kinetics, [endCardStyle] CTA close. Duration factor for [length]s. Music sync [level]".
    - HYBRID: per-beat rationale using controls (e.g. complex orbiting camera + high ref strength → may lean cloud with strong refs; pure UI metrics at 5s → local).
  - Quality Gate 1 (Plan): assessPlanQuality expanded to validate *every control* appears correctly (length matches, aspect specified, camera/mood/pace/brand/refStrength/music/text/endcard explicit, [LOCAL]/[CLOUD] justified by controls). Score + issues (e.g. "5s too dense for high-energy orbiting"). Auto-refine or specialist re-plan. Max 2 passes.
- Output: Versioned full plan JSON (includes serialized controls) + human md.

**Local bias + controls rule**: "For [length]s [aspect] [mood] [pace] video with [brandIntensity] branding: Prioritize LOCAL Hyperframes for UI/metrics/brand elements (exact canvas control at target aspect/res). Escalate to cloud only for [camera] [intensity] performance or physics that exceeds local primitives, always injecting full controls + refs at [refStrength]%."

**Phase 2: Visual Design — Keyframes + Refs + Strength**
- Generate/lock style/reference sheet(s) first (premium image, strict "at [refStrength]% adherence to Elements + [mood] [tone] lighting at [aspect]").
- Generate keyframes (number/length-appropriate), **conditioned on refs at exact strength** (prompt language + multi-image where available; "identical to ref sheet, [brandIntensity]").
- Parallel variants for hero shots, critic picks best per control (esp. consistency strength, camera readiness).
- Quality Gate 2 (Keyframes/Refs): Critic scores adherence to *all controls* (aspect comp, camera support in framing, mood/lighting match, brand lock at intensity, text space for [style], ref strength fidelity, motion hint readiness). Targeted re-gen.
- Output: Locked refs + keyframes + control-enriched plan.

**Phase 3: Scene / Hyperframes Architecture (Parametric "Canvas" Graph)**
- Build executable scene graph from plan + keyframes + Elements + *every control*.
- Extend current timed scenes: full `VideoControls` + per-scene overrides.
  - Dynamic aspect: canvas sized to ratio (e.g. 1080x1920 for 9:16); all x/y/w/h normalized or scaled.
  - Duration: base scenes scaled by (targetMs / 30000); 5s/10s use compressed or sparse beats (stronger hooks).
  - Camera/Motion/Intensity/Pace: global + per-keyframe "path" (static=none, dolly=depth layer lerp, orbit=multi-layer rotate + parallax, dynamic=handheld jitter + secondary). Easing/speed = f(intensity, pace).
  - Mood/Tone: canvas gradient/filter shifts, shadow/lift intensity.
  - Brand Intensity: accent alpha, logo scale/placement variants, chrome thickness.
  - Text Anim: switch drawer (kinetic vs fade vs bold reveal).
  - Ref Strength: keyframe panel opacity/blend or priority layering.
  - Music Sync: timing offsets or trigger points for anims (if beats provided).
  - End Card/CTA: select variant scene at end.
- For advanced: export sequence + controls to Comfy (IPAdapter ref at strength + AnimateDiff motion at intensity/camera + aspect exact).
- Quality Gate 3 (Pre-Render): Validate graph implements controls (e.g. "orbiting produces layered motion at high intensity", aspect correct, length exact, music cues present if strong sync).
- Output: Scene graph + RenderOptions (now with full controls).

**Phase 4: Hybrid Render Execution**
- Router: uses controls + content (UI-heavy + high brandIntensity + subtle camera → local; high-energy orbiting + music strong sync + performance → cloud with full prompt + ref images weighted by strength + aspect + length).
- Local: createHyperframesRenderer with dynamic w/h (aspect), durationMs (5/10/15/...), full controls passed for animation params + keyframeImages (strength applied in draw).
  - Record at target fps/res.
- Cloud (if routed): video gen call with *complete* enriched prompt (all controls) + refs.
- Post (always for local, optional polish for cloud): FFmpeg at exact aspect, music mix at sync level (if provided: volume duck + beat-timed if analyzed), end card overlay per style, captions timed to textAnim, brand burn.
- Stitch multi-segment with control-aware transitions.
- Metadata: full controls snapshot + per-shot decisions + cost.
- Output: Video + rich audit.

**Phase 5: Post + Brand Polish**
- Extended FFmpeg or canvas post for music, end card variants, advanced text burn matching style, light mood grade.
- Optional user export for further.

**Phase 6: Final Quality Gate + Refinement (Control-Aware)**
- Critic (structured): full rubric scores *every control* (see Testing section) + overall.
- Evidence: plan excerpts, keyframe compliance, graph params, render notes, audio sync analysis if applicable.
- Bounded refine (1-3 iters): target weakest control(s) (e.g. "increase refStrength or re-gen keyframes with stronger lock"; "adjust camera sim in renderer for orbiting"; "re-plan 5s with sparser beats").
- Human gate for hero.
- Update Elements with successful refs (strength applied).

**Phase 7: Package + Learn**
- Save with full controls metadata, aspect-correct thumbnail, cost/local %.
- Promote winning Elements + control combos to project "style bible".
- One-click re-use of exact preset.

**Non-Negotiable Principles (100%):**
- Every control is explicit, versioned, and traceable in artifacts/gates.
- Local canvas for pixel-exact SaaS/brand (aspect, UI primitives, text styles, brand intensity) + free short clips.
- Ref strength and Elements first for consistency (Higgsfield #1 lesson).
- Full cinematic vocabulary (camera, motion, mood, pace) + physics-ish local sims.
- Gates after every phase, control-specific scoring.
- 5s/10s fully supported for modern short-form.
- Measurable + one-click testable.

---

## 2. Full Pipeline Architecture for Every Setting

**Core Extension of v1.0**: Add `VideoControls` interface as first-class throughout. Persistent per-generation + project defaults. Flows: UI/State → Prompts (planning/keyframes/cloud) → SceneGraph/RenderOptions → Execution (local renderer or openrouter with full spec + refs) → Post (FFmpeg aspect/music/end) → Critic (per-control) → Refine.

### Key Types (New/Extended)
```ts
export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:5' | 'custom';
export type CameraStyle = 'static' | 'cinematic-pan' | 'zoom' | 'dolly' | 'orbiting' | 'dynamic' | 'custom';
export type MotionIntensity = 'subtle' | 'medium' | 'high-energy';
export type MoodTone = 'professional' | 'energetic' | 'warm' | 'futuristic' | 'minimalist' | 'premium';
export type Pace = 'slow-build' | 'fast-paced' | 'balanced';
export type BrandIntensity = 'subtle-accents' | 'strong-branding' | 'full-lockup';
export type TextAnimStyle = 'kinetic' | 'simple-fade' | 'bold-reveal' | 'glitch' | 'custom';
export type EndCardCTAStyle = 'minimal' | 'standard' | 'bold' | 'branded-slate';
export type MusicSyncLevel = 'none' | 'light' | 'medium' | 'strong';

export interface VideoControls {
  lengthSec: number; // 5,10,15,30,45,60, or custom 1-120
  aspectRatio: AspectRatio;
  customAspect?: { width: number; height: number };
  cameraStyle: CameraStyle;
  motionIntensity: MotionIntensity;
  moodTone: MoodTone;
  pace: Pace;
  brandIntensity: BrandIntensity;
  refConsistencyStrength: number; // 0-100
  musicSyncLevel: MusicSyncLevel;
  musicAudioUrl?: string; // optional upload or generated
  textAnimationStyle: TextAnimStyle;
  endCardCTAStyle: EndCardCTAStyle;
  // Power extras
  lightingHints?: string;
  genre?: string;
  customStyleText?: string;
  heroFrameFirst?: boolean;
}

export interface ExtendedRenderOptions extends RenderOptions {
  controls: VideoControls;
  // ... existing + aspect-derived w/h, scaled duration, etc.
}

export interface ExtendedScene extends Scene {
  cameraPath?: { style: CameraStyle; intensity: MotionIntensity; ... };
  // mood, brand params, textVariant, etc.
}
```

**Orchestrator / Specialists (Fable + Higgs Director Inspired)**: Same as v1.0 but each specialist receives full VideoControls + applies (Director injects into MCSLA sections, Visual applies refStrength + mood, Scene Architect builds parametric graph, Router decides with controls, Critic scores per-control).

**Data Flow & Gates**:
- State (App + persisted prefs): full VideoControls + goal + models + Elements.
- Planning: buildPlanningPrompt(..., controls) → enriched sections + Gate 1 (control presence + sanity, e.g. 5s not over-dense for high-energy).
- Keyframes: build... with strength/mood/camera/aspect → Gate 2 (per-control visual compliance).
- Assembly: sceneGraphBuilder(plan, keyframes, controls, Elements) → Gate 3 (graph fidelity to controls).
- Execute: router(controls, content) → local (renderer with dynamic aspect/duration/params) or cloud (full prompt + weighted refs + aspect/length) → FFmpeg (aspect native, music at level, end card style, text style burn).
- Critic: evaluateAllControls(artifacts, controls) → structured scores + Gate 4.
- Refine: targeted (e.g. "bump refStrength + re-keyframe" or "renderer camera sim tweak for orbiting").
- Full trace + controls snapshot in output/StudioOutput/AgenticState extensions.

**Local Canvas Power (Exceeds Higgsfield for Niche)**: Exact w/h per aspect (no generation guesswork). Primitives scale perfectly for SaaS UI at any ratio. Short 5/10s trivial (no credit waste). Full param → animation curves. Music beat triggers if analyzed client-side or via prompt.

**Hybrid**: Controls bias router (high refStrength + brandIntensity + UI content → local; high-energy specific camera + music strong + performance → cloud with injected spec).

**Extensibility**: Controls serializable for presets/export. Future: visual node editor mirroring Canvas (connect "camera node" → "mood tone node" → "ref strength" etc.).

---

## 3. Concrete Implementation Steps

**Guiding**: Extend v1.0 roadmap (P0-P3). No core rewrites — leverage existing RenderOptions (w/h/duration ready), prompt structure, templates, UI control area, FFmpeg. Prioritize P0 for quick full control surface + 5/10s/aspect + basic renderer support. Frequent tsc/dev/visual checks. Record changes in research/ sidecars.

**New Files**:
- `src/lib/videoControls.ts`: Full types (above), defaults, validators, preset registry, helpers (scaleDuration, getCanvasDimensions(aspect), mapCameraToRendererParams, injectControlsToPrompt(base, controls), etc.).
- `src/lib/advancedSceneGraph.ts` (or extend videoRenderer): SceneGraph type, builder(plan, keyframes, controls, elements), parametric scene list generator.
- `src/lib/musicSync.ts` (light): Audio utils (BPM detect stub or user BPM input), beat-timed offset generator for scenes, FFmpeg mix commands for sync level.
- `src/components/ui/CinemaControlsPanel.tsx`: Reusable rich panel (all selects, sliders 0-100 for strength/intensity, audio upload, custom text, aspect visual preview, length quick buttons incl 5/10).
- `docs/ForgeFactory-Video-Methodology-v1.0-Higgsfield-100%.md` (this), plus one-click config examples as JSON in research or new `research/one-click-presets.md`.

**Major Modifies (Build on v1.0 P0/P1 items)**:
- `src/lib/videoRenderer.ts`:
  - Extend RenderOptions + ProjectBrand with controls.
  - Dynamic canvas: const {width, height} = getCanvasDimensions(controls.aspectRatio, controls.customAspect);
  - Duration: all scene timings *= (controls.lengthSec / 30) or use sparse for short.
  - New/expanded drawers: cameraPath sims (dolly = depth scale lerp + blur hint; orbit = rotating + parallax layers; dynamic = jitter + secondary); textAnim variants (switch on style: kinetic current, fade globalAlpha lerp, bold scale+pop+accent underline); mood overlays (gradient + shadow intensity + subtle color shift); brandIntensity (accent alpha, logo scale, chrome weight); refStrength (keyframe panel alpha/blend or emphasis).
  - Record/res at exact w/h/fps.
  - postProcessWithFFmpeg: accept controls; preserve aspect (no scale unless chosen); music mix if url + sync level (volume curves or timed overlays); end card per style (overlay variants); text burn timed to anim style.
  - Update createSaaSAnimationCanvas, getScenesForTemplateOrGoal (now take controls, make parametric), weaveKeyframeScenes (respect strength/camera).
  - Add 5/10s support in durations/scaling.
- `src/lib/videoPipelinePrompts.ts`:
  - Extend buildBrandContext / buildPlanningPrompt / buildImagePromptsPrompt / buildKeyframeImagePrompt to accept full VideoControls.
  - Inject detailed: length/aspect in comp, "Camera: [style] [intensity]", " [mood] [pace] tone and pacing", " [brandIntensity] branding throughout", "text animations in [style] style", "end card in [style]", "reference adherence at exactly [refStrength]%", " [musicSyncLevel] beat-matched to provided audio [BPM/desc]".
  - Expand assessPlanQuality + buildRefinementPrompt + pre-render gate to check all controls present/correct + length-appropriate density.
  - Add helpers for control-specific prompt fragments.
  - Update QUALITY_BOOST etc. if needed.
- `src/lib/pipeline.ts`:
  - Extend StudioOutput / AgenticState / KeyframeAsset etc. with controls: VideoControls, gateResults per control category.
  - Add steps if needed (e.g. "controls" or "music" phase) or keep in planning.
  - parse/enrich functions for control-aware artifacts.
  - Update createInitial... and progress/eta for dynamic length.
- `src/lib/localVideoTemplates.ts`:
  - Make parametric: getTemplateScenes(id, brand, controls) — scale timings, adjust density for length, choose end card variant, etc.
  - Add micro templates or flags for 5/10s.
  - Export more metadata for UI.
- `src/lib/openrouter.ts` (or agents layer from v1.0):
  - Extend calls: generatePlanWithQualityGate(..., controls), generateKeyframeImages with strength/mood etc., generateCloudVideo(prompt with full controls + refs at strength + aspect/length).
  - Add music-aware if audio.
- `src/App.tsx` + persist (Model Lab prefs):
  - Add full VideoControls state (with defaults, load/save via existing prefs or new project-level).
  - Handlers for each (onLengthChange, onAspectChange, ..., onMusicUpload, onRefStrengthChange).
  - Pass controls to VideoStudio/Agentic/Hyperframes props, generate calls, renderers.
  - Extend getTemplateDurationMs to use controls.lengthSec.
  - Wire one-click preset loader (apply full bundle to state + goal).
- `src/components/pages/VideoStudio.tsx` + AgenticPipeline.tsx + Hyperframes.tsx + generation/PipelineUI.tsx:
  - Add/import <CinemaControlsPanel controls={...} onChange={...} /> near existing maximize/quality/template section (or "Advanced" tab/pill).
  - Length: select or number input + quick buttons (5s,10s,15s,30s,45s,60s, custom).
  - Aspect: segmented or select + visual aspect preview (rectangle).
  - All other: selects for camera/mood/pace/brand/text/end, slider for motionIntensity/refStrength (with labels), music upload + level select + "analyze beats" button (stub).
  - Pass controls down to previews (HyperframesWorkspace must render at exact aspect + controls), ModelCostBanner (dynamic for length), render flows.
  - In Hyperframes page: full panel + "Apply to Studio" + exact-aspect preview host.
  - PipelineUI: show active controls summary in steps/output, per-shot rationale including controls.
  - One-click presets: buttons or dropdown "Load StrataBody 15s Vertical Energetic Preset" etc. that set goal + all controls.
- `src/lib/storage.ts` / constants.ts: extend prefs for controls defaults, TEMPLATE_DURATIONS make dynamic or add SHORT ones, PROJECT_DESCRIPTIONS ok.
- `src/lib/models.ts` / docs/models.md: note any new model routing (e.g. for strong ref strength prefer models with good multi-ref).
- FFmpeg / audio: enhance postProcess if music; simple client-side for sync cues.

**UI/UX Polish**:
- Controls panel: grouped (Timing & Format: length/aspect; Cinematic: camera/motion/mood/pace; Branding: brandIntensity/refStrength/endCard; Animation: textStyle/musicSync).
- Live preview updates when controls change (re-render Hyperframes preview at new aspect/length with new anims).
- Cost estimator updates with length + hybrid impact.
- "One-Click Test Configs" in dev/tools or Settings for the 3 brands (loads full + runs or just sets).

**Verification Steps (per module)**:
- tsc --noEmit on changed files.
- `npm run dev`, manual: change length to 5s → scenes compress, aspect 9:16 → tall canvas + scaled UI primitives look correct, camera "orbiting" + high intensity → convincing layered motion in preview, refStrength 90 + mood "futuristic" → locked + glowing, music strong + upload → mix + timed accents, generate full → audit shows all controls in plan/graph/metadata, final video correct res/duration, text anim per style, end card per choice.
- Gate tests: plan includes every control explicitly.
- One-click: load preset for ClubCensus 10s 9:16 high-energy warm fast-paced strong brand 80% ref medium music bold kinetic bold CTA → verify.

**P0 (1-2 days)**: videoControls.ts types + defaults + injectors; update renderer for aspect + 5/10s dynamic + basic camera/motion/text/brand/mood multipliers (use existing primitives); prompts full controls injection + expanded gates; App state + basic CinemaControlsPanel (selects/sliders for core); wire to VideoStudio + one length/aspect example + 5/10s buttons; test one full short vertical video.
**P1 (3-5 days)**: Complete panel (all controls + music), parametric templates/sceneGraph, full renderer camera/mood/pace/text variants + music cues, router/controls in hybrid, critic per-control, persist + one-click presets for 3 brands, Agentic/Hyperframes full support, end-to-end with gates.
**P2 (1 week)**: Advanced (Comfy bridge with controls, visual graph stub, audio beat analysis, custom style text full flow, FFmpeg advanced for aspect/music/end variants, mood grading), polish, expanded testing.
**P3**: Harness, self-improve from real runs, docs/examples.

**Risks/Mitigation**: Canvas 2D limits on complex 3D orbit (sim with layers + perspective — good enough for SaaS; escalate hard shots to cloud). Music analysis (user BPM or simple onset detect lib; fallback to prompt). Aspect in cloud (most OR video support via prompt or future params; fallback crop/post). Keep local reliable.

Frequent commits + visual side-by-side (old vs new controls).

---

## 4. Testing Rubric — Higgsfield-Level Quality on Branded SaaS Videos

**Goal**: Systematic measurement of *every control* + overall "feels like (or better than) Higgsfield-directed cinematic SaaS marketing video". Replace random fixes with data-driven iteration. Human + automated gates. One-click configs enable repeatable regression + A/B.

### Expanded Success Criteria (v1.0 + Controls)
- Gate pass (all phases) ≥90% first-try; final ≥85-95% with bounded refine.
- Local coverage ≥80% (90%+ for UI/brand-heavy at any length/aspect).
- Cost: 5s micro ≤$0.20, 30s typical ≤$1-3 (local free).
- Human overall ≥8.7/10 (vs Higgsfield references or prior best); no axis <7.5 for ship.
- Per-control fidelity ≥9/10 average (see rubric).
- Technical: exact duration (±200ms), exact aspect (no distortion), text 100% legible, no artifacts on brand elements.
- Iteration: ≤2 refines avg; full pipeline <12 min for local 30s.
- Short-form special: 5s/10s must feel complete hooks with strong CTA, no rushed feel.

### Full Rubric (Score 1-10 per Category; Weight for Overall)
Use for Gate 4 + human evals. Evidence from plan + frames + final video + controls snapshot. Blinded side-by-side vs Higgsfield gallery examples or internal gold.

**Core (from v1.0, 40% weight total)**:
- Cinematic Quality (motion elegance, camera *intent match to selected style*, lighting/composition per mood) — 10%.
- Brand Fidelity (colors, UI accuracy, *brandIntensity* adherence, elements lock) — 10%.
- Consistency (*refConsistencyStrength* adherence across frames/shots, no drift) — 8%.
- Message/Hook/CTA (*endCardCTAStyle* effectiveness, clarity) — 7%.
- Technical (exact length/aspect, text legibility per *textAnimStyle*, timing, artifacts, *musicSyncLevel* audio integration) — 5%.

**New Controls-Specific (60% weight)**:
- Length & Format Fidelity (5/10/15/.../custom exact; *aspectRatio* composition correct for platform/SaaS — vertical UI stacks well, 16:9 dashboard cinematic; no wasted space or crop issues) — 8%.
- Camera Style Execution (selected style visible and cinematic: e.g. "orbiting" shows multi-view parallax/depth in local or prompt adherence in cloud; "dolly" has convincing push with focus shift sim) — 8%.
- Motion Intensity (subtle = elegant restrained; high-energy = dynamic without jitter/break; matches pace) — 7%.
- Mood / Tone (visuals evoke chosen: warm inviting colors/soft light; futuristic glow/tech depth; minimalist sparse clean; premium rich cinematic) — 7%.
- Pace (slow build = deliberate lingering reveals; fast = energetic quick hits; balanced = natural explainer flow; timings feel right for length) — 6%.
- Brand Intensity (subtle = light elegant accents; strong = prominent repeated branding; full lockup = heavy integrated presence + strong end) — 6%.
- Reference / Consistency Strength (higher % = visibly tighter lock to Elements/refs; low = more creative variation but still on-brand) — 6%.
- Music Sync / Beat-Matching (if level>none: key motions, transitions, text reveals, metric fills visibly/audibly aligned to beats; strong = polished music-video feel without overpowering) — 6%.
- Text Animation Style (kinetic = lively per-letter; bold reveal = impactful scale/pop; matches mood/pace/brand; legible + on-brand) — 5%.
- End Card / CTA Style (chosen style delivers: minimal elegant close; bold strong conversion push; branded full polish; CTA prominent, copy clear, brand locked) — 5%.
- Overall "Higgsfield-Level or Better for SaaS" (feels directed by pro cinematographer + brand guardian; local exactness advantage shines; would use for client hero asset) — 8%.

**Bonus**: +1-2 if local-heavy at high quality; short-form (5/10s) feels complete and punchy.

**Automated/Semi**: Plan gate checks explicit control mentions + length/aspect sanity. Final critic LLM structured per rubric category + "control X score Y because...". Technical: duration/res from metadata, basic audio presence check. Human for subjective (mood, elegance, sync feel).

### One-Click Test Configurations (for StrataBody, ClubCensus, SpeedMend)
Use in UI (implement as preset loader buttons in VideoStudio/Hyperframes/Settings or dev panel). Run full pipeline (or guided to render) + score on rubric. Baseline for regression (re-run after any change; scores must not drop >0.3 avg without justification). Include 5s/10s + variety.

**StrataBody (Body Composition Coaching — Clean, Scientific, Progress-Focused)**:
- 5s Hook (Vertical Social): length=5, aspect=9:16, camera=zoom (tight on rings), motionIntensity=medium, mood=professional, pace=fast-paced, brandIntensity=strong-branding, refStrength=85, musicSync=light, textAnim= bold-reveal, endCard=standard. Goal: "5s vertical hook: progress ring fills dramatically, 'See real change' + logo."
- 15s Premium Vertical: length=15, aspect=9:16, camera=dolly, motionIntensity=subtle, mood=premium, pace=balanced, brandIntensity=full-lockup, refStrength=95, musicSync=medium, textAnim=kinetic, endCard=bold. Goal: "15s mobile explainer: rings, metrics, testimonial, strong CTA."
- 30s Standard 16:9: length=30, aspect=16:9, camera=cinematic-pan + orbiting for features, motionIntensity=medium, mood=professional, pace=balanced, brandIntensity=strong-branding, refStrength=80, musicSync=light, textAnim=kinetic, endCard=standard.
- 45s How-it-Works Energetic: length=45, aspect=16:9, camera=dynamic, motionIntensity=high-energy, mood=energetic, pace=fast-paced, brandIntensity=full-lockup, refStrength=75, musicSync=strong (if audio), textAnim=bold-reveal, endCard=branded-slate.

**ClubCensus (Community Polls — Vibrant, Social, Live Energy)**:
- 10s Fast Hook (Square): length=10, aspect=1:1, camera=zoom + pan, motionIntensity=high-energy, mood=energetic, pace=fast-paced, brandIntensity=strong-branding, refStrength=90, musicSync=medium, textAnim=kinetic, endCard=minimal. Goal: "10s square: poll bars racing, avatars popping, 'Engage live' + CTA."
- 30s Customer Story Warm: length=30, aspect=16:9, camera=static + subtle dolly, motionIntensity=subtle, mood=warm, pace=slow-build, brandIntensity=strong-branding, refStrength=85, musicSync=light, textAnim=simple-fade, endCard=standard.
- 60s Campaign (Vertical + 16:9 variants): length=60, aspect=9:16 or 16:9, camera=orbiting + dynamic, motionIntensity=medium, mood=vibrant/futuristic, pace=balanced, brandIntensity=full-lockup, refStrength=95, musicSync=strong, textAnim=kinetic, endCard=bold.

**SpeedMend (Repair Workflow — Practical, Fast, Trustworthy B2B)**:
- 5s Micro CTA (4:5 Portrait): length=5, aspect=4:5, camera=static + zoom on kanban, motionIntensity=medium, mood=professional, pace=fast-paced, brandIntensity=subtle-accents, refStrength=80, musicSync=none, textAnim=bold-reveal, endCard=standard. Goal: "5s punchy: timeline handoff, 'Ship faster' + try free."
- 15s Feature Deep Dive: length=15, aspect=16:9, camera=dolly + pan, motionIntensity=medium, mood=professional, pace=balanced, brandIntensity=strong-branding, refStrength=70, musicSync=light, textAnim=simple-fade, endCard=minimal.
- 45s Full Explainer High-Energy: length=45, aspect=16:9, camera=dynamic + orbiting, motionIntensity=high-energy, mood=energetic, pace=fast-paced, brandIntensity=full-lockup, refStrength=85, musicSync=medium, textAnim=kinetic, endCard=branded-slate. Goal: "45s: kanban, timeline, handoffs, metrics, quote, strong CTA."

**Usage**: "Load Preset → (optional tweak) → Generate (one-click or guided) → Score on rubric → Log to research/test-log-YYYYMMDD.md". After renderer/prompt changes: re-run 3-5 presets; require avg delta ≤0.2 and no control regression >1 point.

**Iteration Protocol**: Low score on specific control → targeted fix (e.g. "camera orbiting weak in local" → improve renderer layer rotation + add to prompt "strong orbiting parallax"). Re-test that config only first, then full suite.

---

## 5. Prioritized Next Build Steps + Summary

**Exact Next Steps (Start Immediately After This Doc)**:
1. Create `src/lib/videoControls.ts` with all types, defaults (e.g. 30s 16:9 balanced professional strong-brand 70% ref kinetic standard), getCanvasDimensions, scaleTimings, promptInjectionFragments, preset examples (the one-click JSONs above as const PRESETS).
2. Extend renderer (videoRenderer.ts): dynamic aspect canvas, duration scaling for 5/10/15/etc, basic param mappers for camera/motion/mood/brand/text (start with multipliers on existing drawers + 1-2 new variants like orbit layers). Update postProcess for aspect + stub music.
3. Update prompts (videoPipelinePrompts.ts): full controls in build* functions + expanded assess/gates. Test plan output for a 5s 9:16 high-energy futuristic StrataBody.
4. App + UI: add VideoControls state/persist/handlers in App.tsx. Add CinemaControlsPanel (start simple: length/aspect/camera/motion/mood selects + strength slider + 5/10s buttons) to VideoStudio. Wire to existing preview/render. Implement 3-4 one-click preset buttons (load full controls + goal for one StrataBody + one ClubCensus).
5. Templates + pipeline: make getScenes... / localVideoTemplates take controls; extend state types lightly.
6. Verification: dev run, change to 5s 9:16 orbiting high-energy futuristic 90% ref → preview tall + fast dynamic motion + glowing; full generate + inspect plan (all controls explicit), final video (correct short tall res, strong branding, ref lock visible).
7. Then P1: complete panel + music basic + full renderer variants + router + critic per control + Agentic/Hyperframes parity + all one-click tests + gates.
8. Run rubric on 3+ one-click configs; log results. Iterate 1-2 cycles.
9. Add to research/: test logs, any new insights.

**Timeline Suggestion**: P0 core controls + 5/10s/aspect + basic renderer/prompts/UI in 1-2 focused days (builds directly on recent hyperframes work). Full 100% functional in 5-7 days with testing.

**Success for 100%**: After P1/P2, any user (or agent) can pick brand + any control combo (incl 5s vertical high-energy orbiting with strong music sync + bold text) → one-click or agentic → output that scores 8.7+ on rubric and "feels Higgsfield-directed or better" for SaaS (with local exactness win on UI/brand). No random prompt hacking needed. Full audit trail.

This is the complete, production-grade, research-backed plan. Execute the steps above using the concrete file mappings. ForgeFactory will be the definitive local-controllable tool for Higgsfield-level (or superior) branded SaaS marketing videos with every professional control.

**Sources**: All previous `research/*` + this session's `research/controls-higgsfield-deep-dive-2026.md` + direct codebase + Higgsfield public materials (cinematic-video-generator, blog posts on 2.0/3.0/3.5, camera presets, Elements, genres, aspect, AI Director, Start/End Frame, etc.).

End of 100% Methodology.
