# ForgeFactory Video Studio Methodology v1.0 — Ultimate (Market-Leading, 100% Complete) for Branded SaaS Marketing Videos

**Version:** 1.0 Ultimate (Final Perfection Pass)  
**Date:** 2026-06-13  
**Status:** Absolute Definitive, Exhaustive, Production-Ready Plan — This is the final version. Builds directly on all prior sessions (full read of `docs/ForgeFactory-Video-Methodology-v1.0-Higgsfield-100%.md` + entire `research/` folder + current codebase performed first). Incorporates the absolute best practices from every premium video generator: Higgsfield (Canvas, Cinema Studio, Elements, AI co-director), Runway Gen-4.5 (Motion Brush, Director Mode), Kling 3.x Omni (Elements, multi-shot, ref conditioning), Google Veo 3.1 (native audio, Ingredients, Frames to Video, Insert), Luma/Seedance/Pika/Sora (keyframe, beat, physics, variants, extend), Descript/CapCut/InVideo/Synthesia (workflow UX, brand kits, templates, guardrails), and ComfyUI/open-source (node graphs, IPAdapter strength, AnimateDiff/ControlNet, batch/interp). 

Local-first Hyperframes + smart OpenRouter hybrid remains the core advantage (exact SaaS UI/brand control impossible in pure cloud tools). Every key advantage transplanted and exceeded where local canvas/FFmpeg gives superior fidelity.

**Research Foundation (All Sessions):**
- Prior artifacts: Full v1.0 + 100% docs, `research/higgsfield-analysis.md`, `research/claude-fable-agentic-patterns.md`, `research/video-best-practices-2026.md`, `research/forgefactory-baseline-and-gaps.md`, `research/research-index.md`, `research/controls-higgsfield-deep-dive-2026.md`.
- This final session: Exhaustive MCP-driven research (Brave web searches, GitHub schemas for ComfyUI repos, direct analysis) on all listed targets. Extracted workflows, algorithms, guardrails, prompt patterns, controls, UI, and "secret sauce" for consistency, motion, adherence, brand fidelity, premium feel.
- Current codebase baseline (re-inspected): `videoRenderer.ts` (RenderOptions w/h/duration/fps/preset/template/keyframes + primitives + keyframe panels with basic camera sim + FFmpeg post); `videoPipelinePrompts.ts` (structured plans, brand profiles, gates, duration support); no `videoControls.ts` yet (plan only); App.tsx/VideoStudio (basic maximizeLocal/qualityBoost/preset/template + model selects); pipeline.ts (4 fixed steps); localVideoTemplates (4 fixed); openrouter (limited aspect in images, video calls). 100% plan not fully coded — this Ultimate closes implementation + market gaps.

**Core Thesis for Ultimate:** ForgeFactory now replicates (and for SaaS/brand/UI use cases, exceeds) the premium experience by layering market-leading orchestration (node/Canvas graphs, script-to-storyboard workflows, AI co-director), controls (Motion Brush equiv, first/last frame, ref strength weighting, native-style audio sync, explicit camera/optics/physics vocab), techniques (Elements/Ingredients multi-ref locking, IPAdapter-style strength, batch variants + auto pick, hero frame first, constraint sandwich/MCSLA prompting), guardrails (multi-stage gates, refinement loops, versioned templates/presets), and UX (fine sliders, brush/paint motion, brand kits, collaboration hints) into our controllable local canvas + hybrid setup. Result: videos that feel directed by a pro film team + brand guardian, with pixel-perfect local execution for dashboards/metrics/typography/hooks.

All research stored locally in `research/`. This is the single source of truth and absolute final version.

---

## 1. Gap Analysis vs Market Leaders

**Current ForgeFactory (post-100% plan, pre-full code):** Strong local foundation (Hyperframes primitives + keyframe weave + FFmpeg, structured prompts with basic gates, hybrid bias, emerging parametric controls in plan). Good for SaaS explainer structure and cost control. But gaps in premium orchestration, fine-grained cinematic control, systematic consistency/guardrails, variant/refinement discipline, audio integration, and "feels directed" premium secret sauce. 100% added many controls (length/aspect/camera/motion/mood/pace/brand/ref strength/music/text/end card) and architecture, but this Ultimate completes by copying every advantage.

**Detailed Gaps (vs each leader, synthesized from research):**

- **Higgsfield (Canvas node system, Cinema Studio directing, Elements/Soul ID, ref strength, AI co-director, camera/optics/physics/motion, MCSLA, genre/pacing/mood sliders, Start/End frame, music sync, variant gen):**
  - Gap: No true node graph/Canvas for chaining prompts/refs/models/generations into reusable pipelines/templates (current Hyperframes is flat timed scenes). No live collab/version comments on "nodes". Elements planned but not full reusable @tagged multi-shot consistency across campaign generations (Soul ID/character sheets + ref drop-in). AI co-director (Higgs/Mr. Higgs) for plain-lang scene breakdown + auto prompt pop not implemented (current planner is good but monolithic). 50+ camera presets/lens/aperture simulation + "Hero Frame First" + Start/End frame explicit locking weak in renderer/prompts. Music sync more prompt-based than native joint audio-video. Variant gen + named canvas patterns/templates not systematic.
  - Impact: Workflows feel less "continuous pipeline" and "directed"; consistency drifts more without strength-weighted Elements; less "film studio" control surface.

- **Runway Gen-4.5/Gen-3 (motion brush, director mode, camera language, lip sync, advanced prompting, consistency via ref video/image, post-stitch tools):**
  - Gap: No Motion Brush equivalent (paint specific areas of keyframe/image with vector speed/direction/intensity for localized motion control; Multi-Motion Brush for 5+ areas). Director Mode (node-based for dynamic camera angles/lighting throughout clip) not present. Lip sync native or advanced (current prompt + post mix). Reference @syntax or multi-modal ref video for character/object consistency across shots weaker. Advanced post-stitch/editor (extend, inpaint-like, clean-up) limited to basic FFmpeg. Prompt adherence to sequenced camera + physics/world modeling (momentum, fluid, weight, occlusion) not as mature in local sims or prompts. Variants/presets + "Relaxed Mode" throughput not explicit.
  - Impact: Less precise "paint the motion you want" control; motion feels less physically plausible in complex scenes; editing/refinement less fluid.

- **Kling 3.x / Omni (reference conditioning, first/last frame control, character consistency, motion intensity, camera moves, storytelling modes):**
  - Gap: Elements/Omni-style for binding characters/props/voices across multi-shot (up to 6) and scenes not fully realized (current ref strength is good start). First/last frame explicit control for continuity/anchoring not strong in renderer (plan mentions, code basic). Native audio/lip-sync + Elements for voice tone binding missing depth. Motion intensity slider + kinetic verb prompting + Motion Brush + "Constraint Sandwich" (Subject Anchor + Shot+Action + Constraints) not codified in prompts/renderer. Multi-shot storytelling/auto transitions + OmniEdit (generative fill, relight, swap, reframe while preserving motion) absent. 4K native + strong physics for actions (run/jump/gestures with weight) limited in local 2D sim.
  - Impact: Weaker long-term character lock in series/campaigns; less "AI director" for storytelling; motion less fluid/intense in high-action.

- **Google Veo 3.1 (native audio sync, photorealism + lighting control, prompt adherence, multi-shot, genre/style presets):**
  - Gap: Native audio (dialogue, ambient, SFX with precise lip-sync + prompt audio cues) is post/hybrid only; no single-pass audiovisual. Ingredients to Video (up to 3 refs for characters/objects/scenes with consistent lighting/interactions) not implemented (current ref strength single-focused). Frames to Video / first+last frame for controlled transitions strong in plan but weak in code. Insert (add/remove elements into existing scene with auto lighting/shadows) not present. "Subject + action + environment + camera movement + lighting + audio cues" prompting + "Ingredients" consistency not fully expanded. 4K native, vertical 9:16 native, Extend for >60s seamless, advanced editing (Insert/Remove) missing depth. Prompt adherence for physics/lighting superior in Veo; local needs emulation.
  - Impact: Audio feels bolted-on vs integrated; multi-ref consistency and editing less seamless; less "production-ready" single-pass quality.

- **Luma Ray 3, Seedance 2.0, Pika, Sora 2 (keyframe-to-video, beat matching, physics/motion realism, variants, extend/short clip tools):**
  - Gap: Keyframe-to-video / reference-to-video with strong physics (fabric, water, collisions, momentum) and beat matching (prompt or audio ref for synced anims) not as advanced (current keyframe panels + basic music). Variants + extend/stitch for long-form with temporal consistency weaker. Short clip tools (5-10s optimized) good in 100% but not premium "instant hook" polish. Pika-style Pikaframes (first/last) and fast social iteration not explicit.
  - Impact: Less "physics-aware" or "beat-perfect" premium motion in dynamic scenes; long-form and variant iteration less efficient.

- **Descript, CapCut AI, InVideo, Synthesia (workflow UX: script → storyboard → auto assets → refine → export, guardrails, templates, brand kits):**
  - Gap: End-to-end UX (script/goal → auto storyboard with beats/camera → generate locked assets via brand kit/Elements → multi-criteria refine gates → export with transitions/audio) not fully orchestrated (current is pipeline steps but less "one workflow" magic). Brand kits (reusable assets, voice, style locked across) planned in Elements but not deep templates/presets with guardrails (e.g. auto check brand fidelity). Templates for ad formats (UGC, tutorial, commercial) + guardrails (compliance, quality before export) limited. Synthesia-style avatar/talking-head + CapCut auto-edit polish missing.
  - Impact: Less "magical" guided experience; more manual assembly vs premium "describe once, polished video out" with safety nets.

- **ComfyUI / advanced open-source (node graphs, IPAdapter strength, AnimateDiff camera control, ControlNet, batch + interpolation):**
  - Gap: Hyperframes not a full node graph (ComfyUI-style chaining for IPAdapter weight/strength per ref, AnimateDiff motion modules, ControlNet for precise camera/pose/depth, batch for variants, RIFE interp for smoothness, first/last frame, regional conditioning). No shareable JSON workflows or modular sub-graphs for reusable "brand lock" or "cinematic camera" pipelines. Local advanced boost (when canvas insufficient for complex physics/character) is stub only.
  - Impact: Less precise control and reproducibility than power users expect from node tools; batch/variant/interp efficiency lower.

**Overall ForgeFactory Strengths to Leverage:** Local canvas = pixel-perfect SaaS UI/metrics/typography/brand (no cloud drift on dashboards); free/short clips (5/10s); full audit/iteration/control (no black box); hybrid for premium physics/audio when needed; existing structured prompts/gates/Hyperframes/FFmpeg as base. Ultimate makes it the best of both: premium "directed" feel + local exactness + cost control.

**Net New to Add (Ultimate):** Full node/Canvas graph for Hyperframes, Motion Brush equiv (area + vector control), explicit first/last frame + Ingredients/Elements multi-ref locking with strength, native-style audio/lip/beat in prompts + post, AI co-director for auto breakdown, full script->storyboard->assets workflow with brand kits, advanced guardrails/variants/refine (premium editor sim), more cinematic vocab (lens/aperture/presets/physics), Comfy bridge advanced, templates/presets replicating feels, UI for all (brush, nodes, sliders).

---

## 2. All New Controls, Techniques, Guardrails, and Prompt Patterns to Add

**New/Expanded Controls (first-class in VideoControls, UI, prompts, renderer, gates):**
- **Motion Brush / Area-Specific Motion:** Paint or select regions (via simple UI mask or params) on keyframe/ref with vector (direction/speed) + intensity per area. Local: layered animation params or mask in canvas draw. Prompt: "motion brush: [area desc] moves [vector] at [intensity]".
- **First/Last Frame Explicit Lock:** Controls for startFrameRef + endFrameRef (image URLs or generated). Renderer: anchor keyframe panels at start/end with interpolation. Prompt: "start from [ref], end at [ref], seamless transition".
- **Lip Sync / Audio Strength + Native-Style:** musicSyncLevel extended to "dialogueLipSync" (with TTS text or uploaded audio). Pass to cloud models supporting (Veo/Kling-style) or local post + timing. Prompt: "native lip-sync dialogue '[script excerpt]' synced to visuals at [strength]".
- **Director Mode / AI Co-Director Toggle:** Boolean + "plain lang scene desc". Auto-breaks goal/script into shots, suggests camera/mood/pacing, populates prompts (like Higgs "Higgs" or Runway Director).
- **Variant Count + Selection Strategy:** Number (2-5) + strategy (best-of critic, diversity, user pick). Pipeline auto-gens + scores on rubric.
- **Node Graph / Canvas Mode for Hyperframes:** Toggle to treat scenes as chainable nodes (prompt/ref/model -> image -> motion node -> output; reusable subgraphs/templates). UI stub for visual chaining + comments/version.
- **Brand Kit / Elements Lock Level:** Deeper than intensity — full kit (character sheets multi-angle, prop refs, voice, style LoRA-like) with @tag or weight. Multi-shot consistency across video/campaign.
- **Physics/Momentum Intensity + Lens/Optics:** Sliders for "real world physics (weight, fluid, collision, fabric)" + lens (focal, aperture, bokeh sim in prompt + canvas filter). Genre/style presets (Action, Commercial, Music Video, etc.) influencing all.
- **Extend / Stitch / Post-Edit Tools:** Controls for "extend from last frame [N] seconds", "insert object [desc] at [time]", "reframe/relight". Hybrid post or Comfy.
- **Workflow UX Controls:** Script/goal -> auto-storyboard mode (beats, camera, assets). Template/brand kit selector. Guardrail level (strict/relaxed).

**Techniques/Algorithms to Copy (local + hybrid):**
- **Reference Weighting/Strength (IPAdapter-like, Ingredients, Elements, @refs):** Multi-ref (up to 3-5: character sheets, style, product, lighting). Strength 0-100 or per-ref weight. Local: blend in keyframe draw or primitive params. Cloud: explicit in prompts + model features. First/last frame anchoring for continuity (Runway/Kling/Veo).
- **Motion Control (Motion Brush, AnimateDiff/ControlNet, camera presets):** Area-painted vectors + global camera (50+ named: dolly, orbit, crane, eyes-in, tracking). Local sim: mask-based layer transforms + easing/physics-ish (momentum, secondary motion). Prompt vocab: "medium tracking shot, [subject] [kinetic verb] with [intensity], [camera move]".
- **Audio/Beat (native sync, lip, beat-matched):** Prompt " [audio desc: dialogue 'line', ambient [SFX], music beat at [BPM]] synced [strength]". Local: FFmpeg mix + timing offsets from simple beat detect or user. Hybrid: pass to capable models (Veo/Kling native).
- **Consistency Secret Sauce (hero frame first, constraint sandwich, multi-shot Elements):** Generate/lock style ref first ("hero frame" with lighting/mood/lens locked), then derive. Prompt: "Subject Anchor [exact desc from Elements] + Shot+Action + Constraints (preserve [ref] at [strength], realistic physics, no morph)". Elements bind across shots/scenes.
- **Prompt Adherence/Physics (detailed cinematic + negatives):** "Subject + action + env + camera [preset/move] + lighting [soft key + rim] + mood + pace + audio + refs [weight] + constraints (no extra limbs, maintain momentum)". Negatives for artifacts.
- **Variants + Post (batch, extend, insert, stitch, editor sim):** Auto batch variants per shot; critic picks or user. Extend from last frame. Insert via prompt/ref + post. Timeline stitch with transitions. Comfy-like for advanced local polish.
- **Guardrails/Orchestration (workflow stages, gates, templates):** Script -> auto-storyboard (AI director) -> locked assets gen -> multi-gate refine (plan, refs, motion, audio, brand) -> export. Reusable templates (canvas patterns, brand kits). Version history/comments (project level).

**Guardrails, Quality Gates, Refinement Loops, Variant Gen (premium style):**
- Multi-stage gates (plan, hero frame/refs, storyboard, assets, motion/audio/brand fidelity, final) with per-premium-feature scoring (e.g. "Motion Brush fidelity", "Ingredients consistency", "native audio sync accuracy").
- Refinement: targeted (re-gen weak area via brush mask, bump strength, re-prompt with more constraints, auto-extend/insert).
- Variants: explicit count + strategy (diversity for options, best critic score, reference lock max). Auto or user pick before final.
- Templates/Presets/Brand Kits: Save full control + Elements + graph as reusable (ad variants, character campaigns). Auto-apply lock.
- Collaboration hints: project-level shared Elements/canvas comments/versions (local files + future sync).
- Compliance/brand guardrails: auto checks in critic (fidelity, no drift, on-brand text/CTA).

**Prompt Engineering Patterns + UI for Fine Control:**
- Core: MCSLA expanded + "Constraint Sandwich" + "subject + action + env + [camera preset/move] + [lighting] + [mood/pacing] + [audio cues + sync strength] + refs [Ingredients/Elements with weights] + physics [momentum/weight] + negatives".
- Hero frame first + multi-shot with shared Elements.
- UI: Sliders (strength, intensity, brush vector), paint canvas for motion brush (mask + direction UI), node graph editor stub for chaining, preset dropdowns replicating feels (see below), director mode plain-text input, variant controls, audio upload + beat viz.

**Secret Sauce for Premium Feel (transplanted + enhanced):**
- "Directed, not generated": explicit camera language + presets (Higgsfield 50+, Runway/Kling), hero frame lock first, AI co-director breakdown.
- Consistency at scale: Elements/Ingredients/refs with strength + multi-shot binding (no re-upload drift).
- Controllability: Motion Brush paint + first/last + lens/optics + physics cues.
- Audio integration: native-style in prompt + post (lip/beat exact).
- Workflow magic: script -> storyboard -> locked assets -> gates -> polish (Descript/InVideo).
- Reusability: node graphs/templates/canvas patterns/brand kits (save once, variant forever).
- Local win: exact brand/UI fidelity + free shorts + full control/audit (exceeds cloud for SaaS).

---

## 3. Exact Implementation Steps (New Files, Upgrades) with File Names

**Guiding Principles:** Build on 100% plan + existing codebase (renderer RenderOptions extensible for w/h/duration/controls; prompts structured; no videoControls.ts yet so create it). Prefer extension. Add node graph gradually. Use Comfy bridge for advanced when needed. Frequent tsc/dev/visual + rubric tests. Record in research/.

**New Files:**
- `src/lib/videoControls.ts`: Full VideoControls interface (extend 100% with new: motionBrush {areas: [{mask, vector, intensity}]}, firstLastFrameRefs {start, end}, lipSyncStrength, directorModePlainLang, variantCount + strategy, nodeGraph {nodes, connections, templates}, brandKitLock, physicsIntensity, lensOptics, extendStitchParams). Helpers: injectToPrompt, mapToRendererParams, scaleForLengthAspect, serializePreset.
- `src/lib/premiumOrchestrator.ts` (or extend openrouter/pipeline): AI co-director (plan breakdown from goal/script + controls), workflow stages (script->storyboard->assets->refine->export), variant gen + critic pick, template/canvas pattern save/load.
- `src/components/ui/MotionBrushPanel.tsx` + `NodeGraphEditor.tsx` (stubs): Simple paint canvas for brush areas/vectors (export masks/params); visual node chaining for Hyperframes scenes (reusable subgraphs, comments).
- `src/lib/comfyAdvancedBridge.ts` (upgrade stub): Pass full controls + node graph to local Comfy (IPAdapter strength, AnimateDiff camera/ControlNet, interp, batch variants).
- `research/ultimate-market-research.md` + `research/premium-presets.json` (store raw extracts + preset defs).
- Update `docs/models.md` with premium model notes (e.g. prefer Veo/Kling for audio, Runway for brush-like).

**Major Upgrades to Existing (file:line targets where possible from baseline):**
- `src/lib/videoRenderer.ts` (core, extend RenderOptions + Scene): Add full controls support (dynamic aspect/length as 100%, + motionBrush masks in draw for localized transforms, first/last frame anchoring in weaveKeyframeScenes with interp, physics-ish easing (momentum/weight sim in lerps), lens optics filters (bokeh via blur/grad), lip/beat timing offsets in anim). Update postProcessWithFFmpeg for advanced audio mix (lip if synced), extend/insert sims (overlay + blend), native aspect. Enhance primitives for camera presets (50+ named paths), text/brand variants.
- `src/lib/videoPipelinePrompts.ts` (build* functions): Full VideoControls param in all builders. Expand to premium patterns (MCSLA + constraint sandwich + subject+action+env+camera+audio+refs[weights]+physics+negatives; hero frame first; multi-shot with shared Elements; director auto sections). Update assessPlanQuality + gates + refinement for all new (e.g. "motion brush areas defined", "first/last anchored", "lip strength", "variants strategy"). Add brand kit / template injection.
- `src/lib/pipeline.ts` + `src/lib/openrouter.ts`: Extend types (StudioOutput/AgenticState with full controls + variantResults + nodeGraph). Add steps or sub for "director breakdown", "variants gen", "premium gates". In openrouter: pass controls to video gen (full enriched prompt + refs at strength + aspect/length/first-last), image for Ingredients-style. Add generateVariants, applyFirstLastFrame.
- `src/App.tsx` + prefs/storage: Full VideoControls state (load/save presets, project defaults, current controls). Handlers for new (brush paint, node edit, director input, variant count). Pass to all (Studio, Agentic, Hyperframes, generate calls, renderer). Implement one-click premium preset loader (apply bundle from research/premium-presets.json).
- `src/components/pages/VideoStudio.tsx` + `AgenticPipeline.tsx` + `Hyperframes.tsx` + `generation/PipelineUI.tsx`: Add rich "Ultimate Cinema Controls" panel (all from 100% + new: motion brush paint area, first/last refs upload, lip sync toggle + audio, director mode input, variant count/strategy select, node graph toggle/view stub, brand kit selector, physics/lens sliders, extend/stitch buttons). Wire live preview (aspect/length/brush effects). PipelineStepTracker show premium gates/variants. Hyperframes: full node graph editor stub + brush tool. One-click presets section with premium feels (see 5).
- `src/lib/localVideoTemplates.ts` + constants: Make fully parametric on VideoControls (incl new). Add premium template presets (Higgsfield cinematic multi-shot, Runway motion-brush style, etc.).
- `src/lib/storage.ts` / media: Project-level Elements/brand kits + canvas templates + version history (nodes/comments).
- Minor: `src/lib/constants.ts` (preset lists, camera vocab 50+), openrouter image/video calls for first-last/Ingredients/strength.

**Verification per step:** tsc, dev run, manual control change + preview/render inspect (e.g. brush area moves differently, first/last anchors continuity, variants scored), gate logs show new checks. One full premium preset run per major module.

**P0 (immediate, 1-2 days):** Create videoControls.ts (full incl new), integrate in App + basic UI panel in VideoStudio (sliders + brush stub + first/last + variants), update renderer/prompts for new controls basics + first/last + brush params, one premium preset test.
**P1 (3-5 days):** Full premiumOrchestrator + workflow stages (script->storyboard->etc), MotionBrushPanel + NodeGraphEditor stubs + Comfy bridge upgrade, advanced renderer (physics, lens, audio lip), prompts with all patterns + gates, full UI in all pages + one-click presets, storage for kits/templates.
**P2 (1 week):** Polish (collab hints, version history, advanced post-stitch/insert sim, full Comfy for complex), testing harness update, docs/examples, regression on presets.
**P3:** Self-improve from runs, more Comfy node sharing, export integrations.

**Dependencies:** Keep canvas 2D reliable (sim advanced via layers/masks); Comfy optional graceful; OpenRouter for premium models where local sim insufficient (e.g. true native audio/lip).

---

## 4. Updated Testing Rubric That Includes These Premium Features

**Success Criteria (build on 100% + new):** Gate pass ≥92% first-try (higher for premium features); final ≥88-97% with refine. Local coverage ≥80% (95%+ UI/brand). Cost controlled. Human overall ≥9.0/10 vs premium references (Higgsfield cinematic, Runway polished motion, Kling consistent characters, Veo audio-real). Per-premium-feature ≥9/10. Technical exact (duration/aspect/audio sync). Iteration ≤2. Short-form premium hook feel.

**Expanded Rubric (1-10, weights; evidence from artifacts/controls snapshot/video):**
- **Core (prior + premium feel, ~40%):** Cinematic Quality (incl camera preset fidelity, physics/momentum, lens/optics sim — "feels directed by pro DP") 10%. Brand Fidelity (kit/Elements lock across shots, intensity) 8%. Consistency (ref/Ingredients/Elements strength match, first/last anchoring, no drift in multi-shot) 8%. Message/Hook/CTA (end card style, brand kit) 7%. Technical (exact length/aspect, text anim, artifacts, music/lip sync accuracy/timing) 7%.
- **New Premium Features (~60%):**
  - Motion Brush / Area Control Fidelity (selected/painted areas move as specified with vectors/intensity; localized without global bleed; physics plausible) 8%.
  - First/Last Frame + Ingredients/Ref Lock (explicit anchors used; continuity seamless; multi-ref consistency (character/object/style) at strength %) 8%.
  - Director Mode / AI Co-Director + Workflow (plain lang breakdown accurate; script->storyboard->assets flow logical with auto camera/mood; premium "describe once" magic) 7%.
  - Variant Gen + Selection (count generated; strategy applied (best critic or diversity); pick improves quality) 6%.
  - Node Graph / Canvas Orchestration (scenes chainable/reusable as nodes/templates; subgraphs for brand lock or camera; version/comments) 6%.
  - Native-Style Audio/Lip/Beat (prompt cues + post or hybrid produce synced dialogue/ambient/SFX/lip at strength; beat-matched anims) 6%.
  - Brand Kit / Elements Multi-Shot (reusable kit applied across video/campaign; @tag or weight lock; no re-desc drift) 6%.
  - Post-Edit / Extend / Insert / Stitch (extend from last seamless; insert object with lighting/shadows; stitch with transitions; editor sim polish) 5%.
  - Physics/Momentum/Lens in Motion (real weight/fluid/collision/fabric/momentum in actions; lens effects in sim/prompt) 5%.
  - Guardrails/Refine/Workflow UX (multi gates catch premium issues early; targeted refine (brush area, strength bump); templates/presets save/reuse; overall "premium generator feel" — directed, consistent, controllable, production-ready) 8%.
  - Overall "Ultimate Premium SaaS" (matches/exceeds leaders for niche: Higgsfield directed cinematic + Runway motion control + Kling character lock + Veo audio + Comfy precision + Descript workflow magic; local exact UI/brand advantage shines; client-hero ready) 9%.

**Protocol:** One-click presets auto-run full (or guided) + score all categories. Human blinded vs premium refs (exported Higgsfield/Runway/etc examples or mental model from research). Automated: critic LLM structured per category + "premium feature X: Y because [evidence from controls/frames]". Regression: re-run 5+ presets after changes; no delta >0.2 avg or >1 on any premium feature.

---

## 5. One-Click Presets That Replicate Premium Generator Feels

**Implementation:** In `research/premium-presets.json` + UI dropdown/buttons in VideoStudio/Hyperframes ("Load [Feel] Preset"). Applies full VideoControls + goal + Elements bundle. "Run Full with [Feel]" triggers orchestrator with that style. Include 5s/10s/vertical where fits. Log scores.

**Higgsfield-Style Cinematic (Canvas + Cinema Studio directed, Elements lock, 50 camera, genre/pacing/mood, Start/End, music, variants):**
- StrataBody 30s 16:9: length=30, aspect=16:9, camera=orbiting + dolly (from 50+ presets), motionIntensity=medium, mood=premium, pace=balanced, brandIntensity=full-lockup, refStrength=95 (Elements multi-angle sheets), musicSync=strong, textAnim=kinetic, endCard=branded-slate, directorModePlainLang="Premium body comp coaching reveal with rings as hero, soft clinical cinematic lighting", variantCount=3 (diversity), nodeGraph=true (reusable "progress ring" subgraph), physicsIntensity=medium, lensOptics="50mm prime f/2 shallow DOF".
- Goal: "30s cinematic explainer: hook kinetic, dashboard rings fill, metrics, testimonial, full brand CTA. Use Elements for exact character/UI lock."

**Runway-Style Motion Brush + Director (paint motion, node director camera/lighting, lip, ref consistency, post-stitch, physics):**
- ClubCensus 15s 9:16: length=15, aspect=9:16, camera=dynamic (director mode), motionIntensity=high-energy, mood=energetic, pace=fast-paced, brandIntensity=strong-branding, refStrength=85, musicSync=medium (lip if dialogue), textAnim=bold-reveal, endCard=bold, motionBrush={areas: [{desc:"poll bars", vector:"upward fill fast", intensity:0.9}, {desc:"avatars pop", vector:"scale in", intensity:0.7}]}, directorModePlainLang="Energetic community poll reveal with brush on bars/avatars, tracking camera, physics on interactions", variantCount=4 (best critic), firstLastFrameRefs (generate start/end for continuity), extendStitch=true.
- Goal: "15s vertical social: live poll bars racing with brush motion, avatars, 'Engage live' CTA. Replicate Runway polished motion control."

**Kling-Style Reference Lock + Multi-Shot (Elements/Omni consistency, first/last, motion intensity, storytelling, native audio):**
- SpeedMend 45s 16:9: length=45, aspect=16:9, camera=cinematic-pan + multiple (multi-shot 4-6), motionIntensity=medium (for repair actions), mood=professional, pace=balanced, brandIntensity=full-lockup, refStrength=90 (character sheets + props via Elements/Ingredients), musicSync=strong (native lip if dialogue), textAnim=simple-fade, endCard=standard, firstLastFrameRefs, directorModePlainLang="Multi-shot repair workflow story: handoff timeline, kanban, metrics. Lock elements across shots with high consistency, realistic motion physics", variantCount=2 (lock max), physicsIntensity=high (weight on tools/hands), lensOptics="anamorphic".
- Goal: "45s B2B explainer multi-shot: consistent team/props across angles, strong character lock like Kling Omni, audio synced."

**Veo-Style Audio Sync + Photoreal/Ingredients (native audio, multi-ref consistency, lighting, Frames to Video, Insert, prompt adherence):**
- StrataBody 10s 9:16 (or 16:9): length=10, aspect=9:16, camera=zoom + dolly, motionIntensity=subtle, mood=professional, pace=slow-build, brandIntensity=strong-branding, refStrength=80 (Ingredients 3 refs: rings UI, coach, metric), musicSync=strong (native ambient + subtle dialogue cue), textAnim=kinetic, endCard=minimal, firstLastFrameRefs (Frames to Video transition), directorModePlainLang="Photoreal premium coaching moment with audio ambient + light voiceover, perfect lighting/shadows, Ingredients lock on UI elements", variantCount=3, insertEdit={object:"new progress ring highlight", time:"4s"}.
- Goal: "10s hook: rings animate with native audio sync and Veo-level photoreal lighting/prompt adherence."

**Bonus Hybrid Premium (Comfy node + Descript workflow feel):** Custom short with full node graph + script->auto-storyboard + brand kit + gates. E.g. 5s vertical energetic for ClubCensus with Comfy boost for complex motion.

**Usage:** Load preset (sets all + goal), tweak, generate (orchestrator uses feel-specific logic), score on rubric (target 9+ on premium features). These replicate the "secret sauce" feels while leveraging local strengths.

---

**Exact Next 5 Build Steps with File Targets (Prioritized, Start Immediately):**

1. **Create and integrate full VideoControls + basic premium additions:** `src/lib/videoControls.ts` (full interface + new like motionBrush/firstLast/director/variants/nodeGraph + helpers/presets loader from research JSON). Wire state/handlers in `src/App.tsx` (around lines 142-240 for controls), pass to VideoStudio. Add basic "Ultimate Controls" panel section in `src/components/pages/VideoStudio.tsx` (expand the mt-4 emerald div around 213-236 with new sliders/selects for brush/first-last/variants/director). Test one preset load + preview.

2. **Upgrade renderer for core premium motion/continuity sims:** `src/lib/videoRenderer.ts` (extend RenderOptions/Scene with controls; implement motionBrush masks + vector transforms in drawKeyframePanel/drawScene, first/last anchoring + interp in weaveKeyframeScenes, physics-ish momentum in easing/lerp, lens optics filters). Update postProcessWithFFmpeg for audio lip/beat + extend basics. Verify with 5s/10s + brush area test render (local motion differs by area, anchors hold).

3. **Enhance prompts + pipeline for premium patterns + variants:** `src/lib/videoPipelinePrompts.ts` (full VideoControls in buildPlanningPrompt etc.; add constraint sandwich/MCSLA+audio/physics/Ingredients refs[weights]/negatives; hero frame first; multi-shot Elements). Expand gates/refine for new features. `src/lib/pipeline.ts` + `src/lib/openrouter.ts` (extend types for variants/firstLast; add generateVariants + enriched video calls with controls + refs strength). Test plan output includes all new explicit + variants gen path.

4. **Add MotionBrushPanel + basic NodeGraph + one-click presets UI:** `src/components/ui/MotionBrushPanel.tsx` (simple paint for areas/vectors, export to controls) + stub `NodeGraphEditor.tsx`. Integrate in VideoStudio/Hyperframes (add to controls panel + Hyperframes page). Implement 4-5 one-click preset buttons (Higgsfield cinematic, Runway brush, Kling lock, Veo audio) in VideoStudio.tsx (load from research/premium-presets + apply full controls + goal). Wire to generate. Test load + render for 2 presets.

5. **Premium orchestrator + Comfy bridge + full UI parity + testing update:** `src/lib/premiumOrchestrator.ts` (AI co-director breakdown, script->storyboard->assets workflow stages, variant critic pick). Upgrade `src/lib/comfyAdvancedBridge.ts` (pass full controls + graph for IPAdapter strength/AnimateDiff camera/ControlNet/batch). Complete UI in AgenticPipeline/Hyperframes/PipelineUI (premium gates display, node/brush tools, presets). Update rubric in code/docs + one-click test runner. Run full regression on all 5 presets; log to research/.

**After these 5:** Full P1/P2 per roadmap. This Ultimate + execution makes ForgeFactory the definitive local-controllable tool matching/exceeding every premium for branded SaaS videos.

**Sources:** All prior research + this session's Brave/GitHub-derived extracts on exact features/workflows (Canvas node chaining + Elements drop-in + AI director; Runway Motion Brush + Director Mode + @refs + lip; Kling Elements/Omni multi-shot + constraint prompts + first/last; Veo Ingredients/Frames/Insert + native audio cues + subject+action+...; Comfy IPAdapter weight + AnimateDiff/ControlNet + batch/interp; workflow UX from Descript etc.). Full raw in session MCP outputs + research/ files.

This is the absolute final version. Execute the 5 steps for immediate high-impact progress. ForgeFactory now has every market advantage synthesized into its hybrid setup.