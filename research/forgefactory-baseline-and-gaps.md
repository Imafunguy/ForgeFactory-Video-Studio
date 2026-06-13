# ForgeFactory Current State (v2, June 2026) + Gaps vs Higgsfield-Level - Baseline for Roadmap

**From direct code inspection + recent docs (2026-06-13 hyperframes-ffmpeg-upgrade spec/plan) + models.md + lib sources.**

## Current Strengths (Already Ahead of Most "AI Video" Toys)
- **Hybrid Philosophy + Maximize Local**: Explicit "Golden rule": Local Hyperframes + FFmpeg primary (free, instant, controllable for SaaS UI/metrics/typography). Cloud video (Kling/Veo/Seedance via OpenRouter) only for hard shots. Cost banners, local coverage indicators, "Maximize Local" toggle already in UI (from recent upgrade).
- **Structured Agentic-ish Pipeline** (existing, not random): 
  - Planning (script + storyboard with [LOCAL]/[CLOUD] + timed narration).
  - Keyframes (5 structured prompts with brand accent, motion hints, scene roles).
  - Assembly (Hyperframes desc).
  - Local Render.
  - Quality gates: assessPlanQuality (length, sections, markers, CTA) + refinement prompt; runPreRenderQualityGate (JSON approve/adjust).
- **Brand System**: Per-project profiles (StrataBody, SpeedMend, ClubCensus + generic) with hookLine, kineticHook, painPoint, featureLabels, metrics, quote, cta, tagline, visualStyle, motionHints, uiFocus. buildBrandContext, getBrandVideoProfile. Strong on-brand application.
- **Local Hyperframes Renderer (videoRenderer.ts - advanced post recent upgrade)**:
  - Canvas 2D at 1080p60 target, quality presets (fast/balanced/high with crf/preset/fps).
  - Rich SaaS primitives: DashboardCard (lift, shadow, accent bar, mini charts), ProgressRing/Linear, MetricCounter (animated numbers + delta), Sidebar/Topbar (slide reveals), TestimonialQuote, KineticText (per-letter bounce + underline), LogoLockup, CtaButton (pulse), Bars, KeyframePanel (with vignette, lower-third, simulated camera: zoom-in / pan-left/right / parallax).
  - Timed Scene graph: {start, end, type, params}.
  - weaveKeyframeScenes: inserts keyframe image panels (with motion) into timeline.
  - getScenesForTemplateOrGoal + 4 high-quality templates (product-explainer-30s, feature-deep-dive, customer-story, how-it-works-45s) — brand-aware, specific beats.
  - FFmpeg post: ensureFFmpeg (CDN fallbacks), postProcessWithFFmpeg (fades in/out, drawtext brand name + tagline in accent, crf/preset, mp4 output, note on source).
  - Keyframe image support: passed as URLs, loaded, composited with motion.
  - createSaaSAnimationCanvas wrapper for project -> brand -> scenes.
- **Prompt Engineering (videoPipelinePrompts.ts)**: Already professional. Detailed planning prompt with exact output sections, localBias injection, 5 keyframe prompts (90-150w with composition, lighting, motion hint, role tags), Hyperframes scenes list, assess + refine, image-specific prompts, pre-render gate, extractors. QUALITY_BOOST swaps to Grok-4 + Flux Pro.
- **Model Registry (models.md + lib/models.ts)**: Live OpenRouter pricing fetch/cache, tiers (value/medium/premium), recommendations per use (planning: Kimi/Gemini/Claude; image: Flux/Riverflow/Ideogram; video: Seedance/Kling/Veo sparingly). Good cost awareness.
- **UI/Orchestration**: VideoStudio (guided/oneclick modes, model selects, template picker, maximizeLocal/qualityBoost/preset/template controls, pipeline steps tracker, previews for script/assets/hyper, render). AgenticPipeline (tool call timeline for transparency). Hyperframes dedicated page. PipelineUI components. State in App + localStorage persistence. OpenRouter integration with quality-gate wrappers.
- **Recent Upgrade (spec/plan dated 2026-06-13)**: Precisely the primitives + templates + FFmpeg + hybrid UI + renderOptions that this methodology will extend. "Core SaaS UI Primitives + Timeline".

**Overall**: Already has the skeleton of a "professional local-first SaaS video studio with agentic planning and quality gates". Far beyond naive "prompt a video model". The hyperframes system is a genuine local "Canvas/Cinema Studio analog" for the SaaS marketing niche.

## Gaps vs Higgsfield-Level (Cinematic, Consistent, Controllable, "Feels Directed")
1. **Elements / Reusable Consistency Layer (Soul ID equivalent)**: No persistent "Brand Elements" or reference sheets per project. Keyframes are generated fresh each time (some brand hints in prompt, but no locked canonical style/UI sheet passed as strong ref across videos or even within a long video). Character/UI "locking" is prompt-only + post-weave, not first-class asset.
2. **Canvas/Node Orchestration**: Hyperframes scenes are flat timed list (good but not graph). No visual node editor, no explicit chaining of assets/refs/motion nodes, no reusable sub-graphs for common beats (e.g. "metric proof block"). No live collaboration analog (local only).
3. **Cinematic Director / Optics / Precise Motion Control**: Prompts have "motion hint" but limited vocabulary. Renderer has basic camera sim on keyframes only. No named camera presets (dolly, rack, crane equivalents), no lens/aperture simulation, no genre-driven pacing/motion energy, no full "AI co-director" that decomposes and enforces cinematic logic. Physics is 2D easing only (no fabric/collision sim).
4. **Agentic Depth & Structured Multi-Specialist + Gates**: Current flow is mostly monolithic LLM calls (plan, then images, then render) with 1-2 gates. Missing true orchestrator + parallel specialists (e.g. dedicated Visual Director for ref sheets, Motion Designer, Brand Guardian critic). Refinement is single-pass. No deep "Fable-style" long-running multi-agent with checkpoints between every stage. Tool calls in AgenticPipeline are logged but not full specialist delegation.
5. **Reference Conditioning Strength**: Keyframe images are generated then fed as panels, but no upstream "style reference sheet" generation + heavy conditioning (multi-image where supported, or locked description + seed-like). Cloud video calls (when used) have weak or no ref image passing for brand/character lock.
6. **Quality Gates & Iteration Rigor**: assessPlanQuality and pre-render JSON are good starts but narrow (mostly presence of sections). No multi-criteria cinematic rubric (composition, lighting intent, motion elegance, brand fidelity, text legibility, hook strength, consistency). No automated critic on final video (via desc or future vision). No "best-of-n" or parallel variants with selection. Refinement loops not systematic or bounded with evidence.
7. **Hybrid Decision Intelligence**: "Maximize Local" is a blunt toggle + prompt prefix. No per-shot smart classifier (content type + cost + quality prediction), no "why this shot is local/cloud" explanation with alternatives, no Elements-aware routing.
8. **Advanced Local Boost Path**: No bridge to ComfyUI-level control (IPAdapter-style ref conditioning + AnimateDiff motion modules + ControlNet + interp) for shots that need more than canvas primitives but still want to stay local/cheap. Hyperframes is excellent for what it is (UI/metrics), but for "cinematic B-roll" or subtle performance it hits a ceiling.
9. **Asset Orchestration & Campaign Continuity**: Generations are somewhat siloed. No project-level "style bible" or accumulated refs from prior successful videos that auto-apply to new ones. Limited cross-video brand memory.
10. **Testing/Measurement**: No formal rubric, side-by-side protocol, or success metrics beyond "it looks good in preview". "Random fixes" risk remains without systematic eval harness.

## How the v1.0 Plan Closes the Gaps (Without Losing Local/Cheap/Core)
- Formal **ForgeFactory Video Studio Methodology** codifies the full directed process (brief+Elements → cinematic plan with MCSLA/camera/genre → structured artifacts → ref-locked keyframes/sheets → scene graph/Hyperframes → smart hybrid exec → post → gated critic + bounded refine).
- **Target Architecture**: True orchestrator + specialists (inspired by Fable multi-agent + Higgs AI co-director), persistent Elements, quality gates at every boundary (expand existing), hybrid policy.
- **Implementation**: Build on the excellent recent hyperframes foundation + prompts (don't rewrite, extend). Add Elements registry, richer cinematic language + camera primitives, node/graph or advanced scene builder, critic/refine loops, ref conditioning everywhere, optional Comfy bridge, UI for visibility/control.
- **Result**: 15-60s branded SaaS videos that feel "directed" (precise timing, elegant motion, locked brand, cinematic composition) at or above what most people get from Higgsfield for this niche — while 70-95% local (near-zero cost) and fully controllable/auditable.

Current ForgeFactory is ~60-70% of the way to "professional local SaaS video tool". This plan takes it the rest of the way to "Higgsfield-level or better for its use case".
