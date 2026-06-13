# ForgeFactory Video Studio Methodology v1.0 — Higgsfield-Level (or Better) for Branded SaaS Marketing Videos

**Version:** 1.0  
**Date:** 2026-06-13  
**Status:** Definitive Plan — Research complete, actionable, local-first with smart OpenRouter boosts.  
**Goal:** Consistently excellent, cinematic, on-brand 15–60s marketing videos that feel as high-quality as (or exceed) Higgsfield AI outputs for SaaS use cases, while remaining mostly local/cheap and fully controllable.

**Core Thesis (from deep research):** Higgsfield does not win on a single "magic" base model. It wins via a **professional directing + orchestration layer** (Canvas node graph + Cinema Studio cinematic control + reusable Elements/Soul ID for consistency + AI co-director + quality discipline) applied on top of best-in-class models (Kling, Seedance, Veo, etc.).  

ForgeFactory already has a surprisingly strong foundation (structured prompts with quality gates, excellent local Hyperframes canvas primitives + FFmpeg post + templates + hybrid awareness from the 2026-06-13 upgrade, brand profiles). This methodology + architecture + roadmap closes the remaining gaps (reusable Elements/refs, richer cinematic/node-like control, true multi-specialist agentic with rigorous gates, smart hybrid, systematic testing) to deliver Higgsfield-equivalent (or superior for SaaS UI/brand/metrics) results.

All external research is stored in `research/` (see Sources section). This document is the single source of truth for implementation.

---

## 1. ForgeFactory Video Studio Methodology v1.0

A repeatable, step-by-step professional process for every 15–60s branded SaaS marketing video. It treats video production as **directed filmmaking**, not "generate a clip".

### Phase 0: Project Elements Capture (The Consistency Foundation — Higgsfield "Soul ID" Equivalent)
- Load or create **Brand Elements** for the active project (persistent, reusable across all videos/campaigns):
  - Canonical style/reference sheet(s): 1–3 high-fidelity keyframe images or detailed descriptions that lock UI chrome, colors (exact accent hex), typography, lighting, composition language, logo treatments, "character" style (if any illustrated elements or spokespeople).
  - Reusable assets: logo lockup variants, approved UI component library (dashboard cards, rings, metrics, etc.), color palette + tone notes, motion signature (e.g. "soft lift + subtle parallax").
  - Narrative bible: hookLine, painPoint, featureLabels, metricLabels, quote, cta, tagline, visualStyle, uiFocus (extend existing BrandVideoProfile).
- How: Dedicated Elements panel in VideoStudio/Hyperframes/Settings. Upload/generate once per project (using premium image model + strict brand prompt). Store as project-level refs (base64 or local paths + metadata). Auto-inject strongest refs + descriptive locks into *every* downstream prompt and local render.
- Success gate: Elements reviewed/approved before first video. "This is the locked visual identity."

**Why this matches/exceeds Higgsfield for SaaS:** Reusable Elements + ref nodes are the #1 consistency lever. For dashboards/metrics/typography (ForgeFactory's core), this produces pixel-level brand fidelity that generic prompt-only tools cannot match.

### Phase 1: Cinematic Planning & Direction (Higgsfield "Cinema Studio" + AI Co-Director)
- Input: Goal + active Brand Elements + duration/target (30s/45s/60s) + template preference + Maximize Local bias.
- Specialist step (orchestrator or dedicated Director agent, high-intelligence model: Grok Heavy / Claude Opus-class / Fable-equivalent via OpenRouter):
  - Produce structured production plan using **MCSLA formula** (Model · Camera · Subject · Look · Action) + genre/pacing directives + explicit camera/motion vocabulary.
  - Sections (evolved from current excellent prompts):
    - HOOK (0–X s): Kinetic + spoken punch.
    - Full timed SCRIPT (second-by-second, conversational premium, micro-pauses for beats).
    - STORYBOARD: Beat-by-beat (timestamp, [LOCAL] or [CLOUD] with confidence/rationale, shot description, on-screen text, exact UI/motion, **precise camera move** (e.g. "slow dolly push-in from 35mm equiv, rack focus to metric at 4.2s"), transition, duration.
    - KEYFRAME PROMPTS + REFERENCE STRATEGY: Exactly 5 (or more for longer) + dedicated "Style/Reference Sheet" prompts. Every prompt calls out "exact match to Project Elements reference sheet [ID/desc]" + brand accent, 16:9 cinematic comp, lighting, motion hint, role [HOOK/REVEAL/FEATURE/PROOF/CTA].
    - HYPERFRAMES / SCENE GRAPH: Timed blocks (or node-like graph desc) using primitives + camera paths + layer order + easing.
    - GENRE & PACING: e.g. "Premium product reveal, confident measured pacing, soft studio lighting energy."
    - HYBRID RATIONALE & COST ESTIMATE: Per major beat.
    - CTA CLOSE.
- Quality Gate 1 (Plan): Run `assessPlanQuality` (expand existing: check MCSLA elements, camera specificity, Elements refs, [LOCAL]/[CLOUD] with reasons, timed script, 5+ detailed keyframes, CTA). Score + issues list. If fail or score < threshold, auto-refine with `buildRefinementPrompt` (or specialist). Human review optional for hero work. Max 2 refinement passes before escalate.
- Output artifact: Versioned plan JSON + markdown (stored with generation).

**Local bias rule (enforced):** "Prioritize high-production-value LOCAL Hyperframes sequences for all UI, metrics, kinetic typography, quotes, step sequences, and brand lockups. Only recommend cloud video models for photoreal live-action B-roll, complex emotional character performance, or physics-heavy shots that cannot be realized locally at quality."

### Phase 2: Visual Design — Keyframes + Reference Sheets + Elements Locking
- From approved plan + Elements: Generate style/reference sheet(s) first (premium image model, strict lock prompts).
- Then generate the 5+ hero keyframes, **conditioning heavily on the reference sheet(s)** (prompt language + multi-image where OpenRouter model supports, e.g. Riverflow high-effort; otherwise strong descriptive anchoring + accent enforcement).
- Parallel variants (2–3) for critical keyframes (best-of-n or critic pick).
- Quality Gate 2 (Keyframes): Structured critic (LLM or rubric): brand color accuracy, text legibility (simulate), composition/cinematic value, motion-readiness (supports intended camera), consistency with reference sheet, no artifacts. Issues → targeted re-gen or prompt tweak. Evidence logged.
- Output: Keyframe images + locked reference assets + updated plan.

### Phase 3: Scene / Hyperframes Architecture (Higgsfield "Canvas" Node Equivalent)
- Build rich scene description or graph from plan + keyframes + Elements.
- Use/extend current Hyperframes timed scenes + weave, but elevate:
  - Explicit layers/order, camera path definitions (beyond current zoom/pan/parallax: add simulated dolly, rack, crane via coordinated primitive + keyframe transforms), easing curves, timing precision, physics-ish 2D interactions (overlaps, lifts with secondary motion).
  - Reference keyframe panels with locked motion.
  - Brand Elements injection (logo, accents, approved micro-animations).
- For complex shots: Option to export image sequence + refs to optional local ComfyUI (IPAdapter + AnimateDiff-style) for higher-fidelity motion while staying local.
- Quality Gate 3 (Pre-Assembly): Quick JSON gate (expand existing `runPreRenderQualityGate`): hook/CTA strong, keyframes support story, Hyperframes specific and brand-locked, local coverage high per policy. Adjustments if needed.
- Output: Executable scene graph / Hyperframes desc + render options.

### Phase 4: Hybrid Render Execution
- Smart Router (policy + per-beat rationale from plan):
  - Default: Maximize Local (current excellent Hyperframes + FFmpeg path at chosen quality preset 1080p60 high).
  - Escalate per-shot: If plan marks [CLOUD] or critic forces, call OpenRouter video model (prefer Seedance 2.0 for consistency/story, Kling 3.x for motion/physics, Veo 3.1 for photoreal/lighting) **with strong reference images + style lock + camera/motion language from plan**.
  - Always log decision + estimated vs actual cost + why.
- Execute local (canvas capture → FFmpeg post: fades, burned captions in brand accent, watermark/endcard, audio duck if present, quality encode) or cloud.
- Multiple segments stitched if needed (with crossfades via FFmpeg or editor).
- Output: Final video blob + rich metadata (resolution, preset, local %, model used per shot, cost, source plan version).

### Phase 5: Post + Brand Polish (FFmpeg + Optional)
- Extend current strong FFmpeg: more sophisticated captions (positioning, timing from script, style variants), light color grade/LUT hints if specified, logo variants, end slate, optional music bed ducking.
- Optional external polish path (export to user editor).

### Phase 6: Final Quality Gate + Refinement Loop (The Discipline)
- Multi-criteria Critic (structured output):
  - Rubric (see Testing Framework): Cinematic Quality (motion elegance, camera intent, lighting/composition), Brand Fidelity (colors, UI accuracy, elements lock, tone), Consistency (frames/shots, refs), Message/Hook/CTA strength, Technical (legibility, timing, artifacts), Overall "Higgsfield-like premium" feel.
  - Evidence: Plan excerpts + keyframe descriptions + render notes + (future: vision model or human).
- If pass (score >= threshold, no High issues): Approve + archive with Elements update (successful refs promoted).
- If fail: Bounded refinement (1–2 iters max):
  - Identify weak beats/shots.
  - Targeted re-plan or re-keyframe or re-render that segment with stronger refs/adjusted motion.
  - Re-gate.
- Human review gate for client/hero work or when auto-critic confidence low.
- Output: Approved video + full audit trail (plan vN, gates, costs, refinements).

### Phase 7: Package, Learn, Promote
- Save to Library with metadata, thumbnail, plan link, cost/local %.
- Update Project Elements with any new successful refs or learnings (auto or curator).
- Optional publish/export presets (vertical crop, captions variants, etc.).

**Methodology Principles (Non-Negotiable):**
- Directed, not generated.
- Consistency via reusable Elements + heavy ref conditioning first.
- Local bias + transparent hybrid.
- Structured artifacts + machine-readable handoffs.
- Quality gates after every major phase (no "hope it works").
- Bounded, evidence-based refinement (not infinite random tries).
- Measurable (see Testing).

This process, executed with the architecture below, produces videos that feel *crafted* at Higgsfield (or better) fidelity for SaaS marketing.

---

## 2. Target Pipeline Architecture

**High-Level:** Agentic multi-specialist system with persistent memory (Elements), explicit quality gates, hybrid execution, and full traceability. Orchestrated in the existing AgenticPipeline / App layer, with new specialist modules.

### Components
- **Orchestrator (ForgeDirector)**: Top-level state machine. Owns the run, spawns specialists, enforces sequence + gates, manages context (full plan + Elements + history), decides hybrid routing, bounds loops. Uses high-intel model for synthesis/criticism. Exposes tool calls / progress like current AgenticToolCall.
- **Specialist Agents (can be prompt modules + tool dispatch or true sub-agents in future):**
  1. **Elements Guardian**: Capture/validate/apply Brand Elements. Reference sheet generation + locking.
  2. **Cinematic Director / Planner**: Phase 1 (MCSLA + camera + genre + storyboard + Hyperframes graph). Enforces local bias.
  3. **Scriptor / Story Architect**: Timed narration + beats.
  4. **Visual Director + Keyframer**: Ref sheets + keyframe prompts + variant gen + conditioning.
  5. **Hyperframes / Scene Architect**: Scene graph or advanced timeline from plan + keyframes + Elements. (Node-like description or future visual editor.)
  6. **Render Router + Executor**: Smart per-shot decision + local (videoRenderer) or cloud (openrouter video + refs) execution + FFmpeg post.
  7. **Critic / QA**: Multi-criteria rubric evaluation (structured JSON). Evidence-based. Decides pass/refine/ escalate.
  8. **Refiner**: Targeted fixes (re-prompt specific section, stronger ref, timing tweak, re-render shot).
- **Shared State / Memory:**
  - Project Elements (persistent, versioned).
  - Current Plan + versioned artifacts (JSON + md).
  - Keyframe assets + ref images.
  - Gate results + full trace (like current toolCalls + new gate logs).
  - Cost / local% accumulator.
- **Quality Gates (hard stops):**
  - Gate 1: Plan (expand assessPlanQuality + cinematic checklist).
  - Gate 2: Keyframes + Refs (consistency, lock, readiness).
  - Gate 3: Pre-Render / Scene (expand existing JSON gate).
  - Gate 4: Final (full rubric + critic). Bounded refine loop (max 2–3 iters total per video; after that human or "good enough with notes").
- **Hybrid Policy Engine:** Content classifier (UI/metrics/brand/typography/kinetic → local high confidence; performance/physics/atmospheric B-roll → cloud with refs). Always explain + show delta. Enforce global Maximize Local unless overridden with justification.
- **Data Flow:** Goal + Elements → Orchestrator spawns Director → structured plan + Gate 1 → Visual/Keyframer (parallel variants) + Gate 2 → Scene Architect → Router/Executor (local or cloud per beat) + Post → Critic + Gate 4 → (refine or) Package + promote successful Elements.
- **Extensibility:** Specialists are swappable (different models per role). Future: true parallel sub-agents, ComfyUI specialist, vision critic.
- **Tech Notes:** Leverage existing (pipeline.ts steps/types, videoPipelinePrompts.ts prompts/gates/profiles, videoRenderer.ts renderer+FFmpeg, openrouter wrappers with quality gates). Add `src/lib/brandElements.ts`, `src/lib/cinematicDirector.ts` (or merge), `src/lib/qualityCritic.ts`, `src/lib/sceneGraph.ts` (richer than flat scenes), enhanced types in pipeline.ts. UI surfaces trace + gates + Elements library.

This is the "orchestrator + specialist agents for planning, scripting, keyframing, Hyperframes scene building, render, post" with quality gates and refinement loops, hybrid local/cloud.

**Comparison Table (Higgsfield vs Current ForgeFactory vs Target v1.0)**

| Aspect                  | Higgsfield (Cinema Studio + Canvas)                  | Current ForgeFactory (2026-06-13)                  | Target ForgeFactory v1.0 (This Plan)                          |
|-------------------------|-----------------------------------------------------|----------------------------------------------------|---------------------------------------------------------------|
| Consistency             | Soul ID Elements + nodes + ref sheets + @tags      | Prompt hints + keyframe weave (good but unlocked) | First-class persistent Brand Elements + ref sheets + heavy conditioning everywhere |
| Control Surface         | Node graph + precise camera/lens/motion + genre    | Timed scenes + basic camera sim on keyframes + templates | Rich scene graph / node-like + full cinematic camera vocab + layers + physics-ish + genre |
| Directing Layer         | Higgs AI co-director + cinematic logic pre-plan    | Structured planning prompt + 1-2 gates             | Full Orchestrator + Director specialist + MCSLA + co-director logic |
| Quality Discipline      | Strong presets + iteration in studio               | assessPlanQuality + pre-render JSON gate           | 4+ explicit gates + rubric critic + bounded multi-iter refine + trace |
| Hybrid                  | Routes to best model in workspace                  | Maximize Local toggle + bias prefix                | Smart per-shot Router + policy + cost/why explanation + Elements-aware |
| Local Strength          | Limited (platform cloud focus)                     | Excellent Hyperframes primitives + FFmpeg + templates | Same base + cinematic upgrades + optional Comfy boost for advanced local |
| SaaS/UI Focus           | General (strong marketing presets)                 | Purpose-built (cards, metrics, kinetic, brand)     | Same + Elements lock + higher cinematic polish                |
| Cost/Control            | Subscription + credits                             | Local free + transparent OR boosts                 | Same + even higher local % via smarter routing + Elements reuse |

---

## 3. Implementation Roadmap

**Guiding Principles:** Build on the excellent 2026-06-13 Hyperframes + FFmpeg foundation and existing prompts/gates (do not rewrite core renderer or planning from scratch). Prefer extension + new focused modules. Use superpowers-style bite-sized tasks with verification (tsc, dev run, visual check). Record in research/ and update this doc. Prioritize P0 for quick "Higgsfield feel" wins on consistency + cinematic language.

All changes absolute paths relative to C:\Users\fichb\Desktop\ForgeFactory\Working (or use relative in practice).

### P0 — Immediate Foundations (1–2 days, high impact, low risk)
- **Research & Docs (done in this session):**
  - Create `research/` with source files (higgsfield-analysis.md, claude-fable-agentic-patterns.md, video-best-practices-2026.md, forgefactory-baseline-and-gaps.md, and this methodology as the synthesis).
  - Write this `docs/ForgeFactory-Video-Methodology-v1.0-Higgsfield-Level.md`.
- **New: Brand Elements System (core consistency lever)**
  - Create: `src/lib/brandElements.ts`
    - Types: BrandElement (id, type: 'style-sheet'|'ui-component'|'logo'|'character'|'motion-sig', refImageUrl or data, description, lockPromptFragment, usageTags).
    - Registry: load/save per project (extend storage.ts or new media).
    - Helpers: `getElementsForPrompt(projectId)`, `injectElementsIntoPrompt(basePrompt, elements)`, `generateReferenceSheetPrompt(brand, goal)`.
  - Modify: `src/lib/storage.ts` or mediaStorage — add project elements persistence.
  - Modify: `src/lib/videoPipelinePrompts.ts` — update build*Prompts to pull and inject Elements (stronger than current profile).
  - UI: Add Elements library tab/panel in Settings or new "Brand" section in VideoStudio/Hyperframes (upload/generate/approve). Simple list + preview + "use as ref" toggle.
  - Wire: Pass active elements down to planning, keyframing, render (as keyframeImages + prompt context).
- **Cinematic Language Upgrade (prompts + renderer)**
  - Modify: `src/lib/videoPipelinePrompts.ts` — add CAMERA_PRESETS, MCSLA guidance, genre templates, explicit "exact match to Elements reference sheet [desc]" in all keyframe + planning prompts. Expand buildPlanningPrompt and buildKeyframe... with camera vocab examples (dolly push-in, rack focus to metric, slow parallax reveal, etc.).
  - Modify: `src/lib/videoRenderer.ts` — expand MOTION_CYCLE and keyframe motion handling; add more sophisticated camera sim (coordinated transforms on multiple layers, secondary motion, better easing for "cinematic" feel). Add `applyCinematicCamera(ctx, move: string, progress, ...)` dispatcher.
- **Verification:** `npm run build` or tsc clean; manual test one template with new prompt injection + a reference image; confirm plan output mentions Elements refs and specific camera moves.

### P1 — Agentic Architecture & Gates (Core Loop, 3–5 days)
- **New/Extend Orchestration & Specialists**
  - Modify: `src/lib/pipeline.ts` — extend types (AgentRole, GateResult {pass, score, issues[], evidence, timestamp}, SceneGraph or richer HyperDesc, RenderDecision).
  - Create: `src/lib/qualityCritic.ts` — rubric evaluator (expand assessPlanQuality into full cinematic/brand/consistency rubric). `evaluatePlan(plan, elements): GateResult`, `evaluateKeyframes(keyframes, refs, elements)`, `evaluateFinal(videoMetadata or desc, plan)`. Structured JSON outputs.
  - Create or merge: `src/lib/cinematicDirector.ts` — the Phase 1 specialist logic (orchestrator helper). Functions for full plan build with Fable-style structure.
  - Modify: `src/lib/openrouter.ts` (or new agents layer) — add `runAgenticVideoPipeline(goal, project, options)` that implements the full Phases with gates, specialist calls (reuse existing generatePlanWithQualityGate etc. as building blocks), parallel variant support for keyframes, bounded refine.
  - Modify: `src/App.tsx` + state — add Elements to project/generation state, new "elements" and "gateLog" fields, wire the new orchestrator for both Studio and Agentic modes. Keep existing one-click/guided as entry points into the full flow.
- **Gates & Refine Everywhere**
  - Expand existing gates in prompts + openrouter wrappers.
  - Add Gate 2 (keyframes/refs) and full final critic.
  - UI: Surface gate results + "Refine" button that triggers targeted specialist (e.g. "Re-keyframe shot 3 with stronger Elements lock").
- **Hybrid Router**
  - Create: `src/lib/renderRouter.ts` — `decideRenderStrategy(beat: StoryboardBeat, elements, policy): {source: 'local'|'cloud', model?, rationale, confidence}`.
  - Integrate into planning (suggest) and execution.
  - UI: Per-beat or global "why local/cloud" badges + override.
- **Verification:** Full end-to-end on one video (template + custom goal). All gates fire and log. Local % visible. One refine iteration works. tsc + manual visual check (scrub, export, inspect brand lock + motion elegance).

### P2 — Richer Scene/Canvas + UI Polish + Advanced Local (1 week)
- **Scene Graph / "Canvas" for Hyperframes**
  - Create: `src/lib/sceneGraph.ts` (or extend videoRenderer) — richer model (layers, cameraPath: {type, params, easing}[], elementRefs[]).
  - Modify: videoRenderer + localVideoTemplates — support graph input + more primitives/layers (parallax stacks, secondary animations, simulated lighting).
  - Optional visual editor stub in Hyperframes page (beat timeline + inspector for now; full nodes later).
- **UI/Experience Upgrades (across VideoStudio, AgenticPipeline, Hyperframes, PipelineUI)**
  - Elements picker + ref indicators in planning/keyframe previews.
  - Richer PipelineStepTracker with gate status + critic scores.
  - Per-shot/beat router visibility + cost delta.
  - Refinement history panel.
  - "Cinema Mode" preset that biases to full director flow + high quality + more variants.
  - Preview scrubber improvements + target badge (1080p60 High + Elements locked).
  - Cost savings + local coverage more prominent.
- **Optional ComfyUI Local Boost Bridge (for shots that need it)**
  - New: `src/lib/comfyBridge.ts` (stub + docs) — if local ComfyUI server detected/configured, export keyframe refs + prompt + motion spec → trigger workflow (IPAdapter + AnimateDiff-Evolved equivalent) → import result as video segment or image sequence for Hyperframes.
  - Config in Settings. Fallback to current local/cloud gracefully.
  - Research note: See research/ for ComfyUI IPAdapter/AnimateDiff workflows as starting point.
- **Models & Prompts Polish**
  - Update models.md + lib/models.ts if new video/image routing heuristics.
  - Quality Boost 2.0: Wire Fable-class or highest reasoning for Director/Critic steps.
- **Verification:** 2–3 full videos (different brands/templates). Compare before/after on rubric (see below). One using Comfy path if available. Export audit trail. `npm run dev` clean.

### P3 — Testing Harness, Polish, Campaign Features (Follow-up)
- Formal testing framework implementation (rubric UI, auto-scoring where possible, A/B prompt testing, side-by-side gallery vs "Higgsfield reference").
- Campaign memory: auto-promote successful Elements/refs across videos in project.
- Export/publish presets, vertical crops, more FFmpeg polish (LUTs, advanced captions).
- Docs: Update models.md, add usage examples to README or new guide.
- Self-improvement: After 10+ videos, post-run analysis of gate pass rates / common failure modes → prompt or primitive tweaks.

**File Change Summary (High Level)**
- **New:** research/* (multiple), docs/ForgeFactory-Video-Methodology-v1.0-Higgsfield-Level.md, src/lib/brandElements.ts, src/lib/qualityCritic.ts, src/lib/renderRouter.ts, src/lib/sceneGraph.ts (or equivalent), src/lib/comfyBridge.ts (stub), possibly src/lib/cinematicDirector.ts.
- **Major Modify:** src/lib/videoRenderer.ts (cinematic expansions), src/lib/videoPipelinePrompts.ts (MCSLA, Elements injection, expanded gates), src/lib/pipeline.ts (types + richer state), src/lib/openrouter.ts (orchestrator wrapper + new calls), src/App.tsx (state + new flow), src/components/pages/VideoStudio.tsx + AgenticPipeline.tsx + Hyperframes.tsx + generation/PipelineUI.tsx (Elements UI, gate visibility, router, refine controls, Cinema Mode).
- **Minor:** storage/media, constants (new presets), models.ts (if routing updates), existing templates/prompts (extend don't replace).

**Dependencies / Risks:** Keep @ffmpeg as-is. Canvas 2D remains reliable (no WebGL unless justified later). OpenRouter key still required for planning/images/boosts. Comfy optional (graceful). Test thoroughly on Windows (current env) for FFmpeg/CDN loads.

Frequent commits after each P0/P1 module + visual verification.

---

## 4. Testing Framework

**Goal:** Replace random "looks better?" tweaks with systematic, repeatable evaluation that drives the methodology to (and past) Higgsfield quality for SaaS marketing videos. Stop guessing.

### Success Criteria (Quantitative + Qualitative)
- **Gate Pass Rate:** ≥ 90% of videos pass Gate 1–3 on first try after initial calibration; final Gate 4 pass ≥ 85% without human intervention (or 95% with one bounded refine).
- **Local Coverage:** Average ≥ 80% of beats/shots rendered locally (target 90%+ for pure SaaS explainer templates) with no perceptible quality drop vs cloud-only.
- **Cost:** Typical 30s video ≤ $0.50–2 (mostly planning + 5–10 keyframes; cloud video < 20% of runs and < $5 even when used).
- **Human Rubric Score (primary):** Average 8.5+/10 across 5+ blinded raters (or self + 1 peer) vs internal "Higgsfield reference" mental model or exported community examples. No video below 7.5 on any axis for production use.
- **Consistency:** Brand/Elements lock score ≥ 9/10 (exact accent, chrome, typography fidelity across all frames/shots; no drift).
- **Cinematic/Engagement:** Motion elegance + camera intent + hook/CTA clarity ≥ 8/10. "Feels directed and premium, not generated."
- **Technical:** Text legibility (manual or OCR spot-check) 100% critical on-screen text. Zero major artifacts (melting, jitter on primary elements). Timing matches script within 200ms.
- **Iteration Efficiency:** ≤ 2 refinement iterations average to production-ready. Full video (plan to final export) < 10–15 min wall time on dev machine for local-heavy.

### Rubric (Use for Every Gate 4 + Human Eval; Score 1–10 per Category)
| Category              | 10 = Higgsfield+ (or Perfect for Niche)                          | 7–8 = Good (Shippable with Minor Polish) | <6 = Block / Must Refine                          | Weight |
|-----------------------|------------------------------------------------------------------|------------------------------------------|---------------------------------------------------|--------|
| **Cinematic Quality** (motion elegance, camera intent, lighting/comp, pacing) | Precise, intentional, physics-ish natural, "directed" feel      | Smooth and intentional in most beats    | Generic or jarring motion, flat lighting          | 25%   |
| **Brand Fidelity**    | Exact accent/chrome/typography/Elements lock + tone everywhere  | Strong match, minor drifts              | Colors off, UI inaccurate, brand feels tacked on  | 25%   |
| **Consistency**       | Zero drift across frames/shots; refs locked perfectly           | Minor variations acceptable             | Noticeable character/UI/style changes             | 15%   |
| **Message/Hook/CTA**  | Punchy hook, clear story beats, strong memorable CTA close      | Functional storytelling                 | Weak hook, confusing beats, CTA buried            | 15%   |
| **Technical**         | Sharp 1080p60, perfect text, clean timing/transitions, no artifacts | Minor issues in 1–2 spots               | Legibility fails, timing off, artifacts in hero elements | 10%   |
| **Overall "Premium SaaS Cinematic"** | Would proudly send to client or use as hero asset               | Good for most internal/marketing        | Looks "AI-generated" or amateur                   | 10%   |

**Local Bonus:** +1 if ≥85% local with no score penalty vs cloud-heavy version.

### Process (Systematic Iteration)
1. **Per Video:** Run full methodology. Log every gate result (score, issues, evidence, time, cost, local %).
2. **Human Eval Protocol (for calibration & final sign-off):**
   - Generate 3–5 test videos across brands/templates (mix local-heavy and one hybrid).
   - Blind or side-by-side with prior best + "reference" (describe or pull public Higgsfield marketing examples as aspirational).
   - Score independently on rubric + free notes ("motion on metric counter feels flat", "accent not locking on keyframe 3").
   - Average scores + top 3 friction points.
3. **Batch A/B Testing (for prompts/primitives/gates):**
   - Change one variable (e.g. new camera vocab in prompt, new primitive easing, critic rubric tweak).
   - Run 5–10 videos (or shots) with A vs B.
   - Compare gate pass rates, human scores, local %, common issues.
   - Keep winner; document in research/ or sidecar.
4. **Automated / Semi-Auto Where Possible:**
   - Existing plan/keyframe gates (expand with rubric).
   - Final critic always runs (LLM structured + optional lightweight vision-desc if available).
   - Simple technical checks: duration match, file size/resolution, basic text presence via future OCR or manual spot.
   - Dashboard (new or in Library/Settings): aggregate pass rates, avg scores over last N videos, top failure modes, cost trends.
5. **Refinement Loop Discipline:** After any video < threshold, perform root-cause (which gate? which beat?), make *one* targeted change, re-test that slice or full, re-score. No shotgun changes.
6. **Regression Guard:** After any renderer/prompt change, re-run the 4 official templates with fixed goals + Elements; scores must not regress >0.5 on any axis without justification.
7. **Long-Term:** After 20–50 videos, analyze patterns (e.g. "kinetic text still needs more bounce variety" → new primitive). Feed into prompt evolution or new Elements types. Periodic "Higgsfield reference bake-off".

**Tools to Build (P3 or incrementally):**
- `src/lib/qualityCritic.ts` (rubric impl + LLM wrapper).
- Simple eval UI or markdown template for human raters.
- Generation metadata store with scores (extend Library/generations).
- Script or button: "Run regression suite on templates".

**Definition of Done for v1.0:** 5+ production-grade videos produced end-to-end using the full methodology + architecture. Average human rubric ≥ 8.5. Local coverage ≥ 80%. All gates firing with evidence. No "random" prompt tweaks needed to ship. The system feels systematic and the output feels directed/cinematic/on-brand at the target level.

---

## Prioritized Next Actions

**Immediate (start today):**
1. Read the 4 research/*.md files + this doc fully.
2. Implement P0 Brand Elements (lib + basic persistence + prompt injection) + one test video using a locked reference sheet.
3. Upgrade prompts with MCSLA + explicit camera language + Elements refs; test planning output.
4. Expand one gate (e.g. final critic rubric) and run 2 videos end-to-end logging everything.
5. Visual + score baseline on current templates vs new flow.

**This Week:**
- Complete P0 + P1 core (orchestrator skeleton, gates, router, UI surfaces for Elements/gates).
- 3–5 full videos on different brands; apply rubric; fix top 2 frictions.
- Update docs/models.md with any new routing notes.

**Follow-up (Next 1–2 Weeks):**
- P2 scene graph / cinematic renderer expansions + Comfy stub if desired.
- Full testing harness + regression suite.
- Polish, docs, campaign continuity.

**Longer:** Self-improving loop (post-video analysis → prompt/primitive evolution), more Comfy integration, export/publish features, team/collaboration analogs to Canvas sharing.

---

## Sources & Further Reading (All Locally Stored)

- `research/higgsfield-analysis.md` — Full Canvas + Cinema Studio 2.x/3.x/3.5 breakdown, Elements/Soul ID, AI co-director, camera controls, physics, references. Key URLs: higgsfield.ai/canvas-intro, /blog/cinema-studio-*, GitHub OSideMedia/higgsfield-ai-prompt-skill (Claude cinematic prompts for it).
- `research/claude-fable-agentic-patterns.md` — Fable 5 multi-agent, quality gates between stages, orchestrator+specialists, structured JSON, parallel sub-agents, checkpoints, harness patterns (from Anthropic, MindStudio, community pipelines).
- `research/video-best-practices-2026.md` — Runway/Kling/Veo/Seedance/Luma comparisons, reference conditioning, camera/motion prompting (MCSLA-like, beat-matched), consistency techniques, hybrid reality, marketing specifics.
- `research/forgefactory-baseline-and-gaps.md` — Exact current code state (videoRenderer primitives + FFmpeg, pipeline steps, videoPipelinePrompts brand/profiles/gates, recent hyperframes upgrade spec/plan, models strategy) + precise gap mapping.
- Original codebase files (inspected): src/lib/videoRenderer.ts, videoPipelinePrompts.ts, pipeline.ts, localVideoTemplates.ts, App.tsx, VideoStudio.tsx + related, docs/superpowers/specs/2026-06-13-hyperframes-ffmpeg-upgrade.md and plan, docs/models.md.
- Broader: Higgsfield public site/blog (2026 features), 2026 model comparisons (Reddit, reviews), ComfyUI node workflows (IPAdapter + AnimateDiff-Evolved as local Canvas analog).

This is the definitive, research-backed plan. Execute systematically using the roadmap and testing framework. ForgeFactory will produce marketing videos that feel directed, consistent, cinematic, and on-brand at (or above) Higgsfield quality for its niche — local-first and controllable.

**End of v1.0.**
