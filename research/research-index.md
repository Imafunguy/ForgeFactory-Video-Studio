# ForgeFactory Video Research Session Index — 2026-06-13

This session performed deep meta-research (Brave MCP web, exa attempts, GitHub schemas, X tools prepared, direct code inspection) on Higgsfield, Claude Fable/agentic patterns, 2026 video model best practices (Runway/Kling/Veo/Seedance etc.), ComfyUI open-source pipelines, and OpenRouter/local hybrid realities.

All raw insights, quotes, URLs, and implications stored here for durability (MCP memory read failed with parse error at ~3484; local sidecars + files used per memory-guard protocol).

## Files Created
- `research/higgsfield-analysis.md` — Detailed breakdown of Higgsfield Canvas (node graph, reusable refs for consistency without re-upload), Cinema Studio (optics/physics/camera control, AI co-director "Higgs", Elements/Soul ID/Soul Cast, genre logic, multi-shot, physics via Seedance, native audio). Prompt craft (MCSLA), hybrid model access, Marketing Studio. Direct mappings to ForgeFactory Hyperframes/Elements/prompts.
- `research/claude-fable-agentic-patterns.md` — Fable 5 as Mythos-class for agentic (structured JSON, orchestrator + parallel specialists, quality gates between every stage, checkpoints, harnesses, recovery, headless). Real production examples (content pipelines, coding). Exact patterns for video (orchestrator + Script/Visual/Scene/Critic/Refiner specialists + gates).
- `research/video-best-practices-2026.md` — Model strengths table (Seedance for consistency/story/multi-shot, Kling for motion/physics/4K/character, Veo for photoreal/lighting/audio, Runway for control/motion brush/refs/editor). Prompting (camera language, beat-matched, heavy refs over long prompts, variants). Consistency techniques. Cost/workflow realities. Direct implications for prompts, keyframing, router, testing.
- `research/forgefactory-baseline-and-gaps.md` — Precise current state from code reads (videoRenderer.ts full primitives + FFmpeg + keyframe weave + templates; pipeline.ts steps; videoPipelinePrompts.ts brand profiles + gates + planning; recent 2026-06-13 hyperframes spec/plan; models strategy; App/VideoStudio wiring). 10 specific gaps vs target (Elements, node/Canvas, cinematic director, deep agentic gates, ref conditioning, etc.). How v1.0 closes them while preserving local-first.
- `research/research-index.md` — This file.
- (Optional future) Additional sidecars or Comfy-specific if more tools run.

## Key External Sources (Cited in Main Doc)
- higgsfield.ai (/, /canvas-intro, /cinematic-video-generator, /ai-video, /blog/cinema-studio-*, /about, motion pages)
- GitHub OSideMedia/higgsfield-ai-prompt-skill (Claude cinematic prompts, MCSLA, Cinema Studio versions, Soul ID, templates)
- 2026 reviews/tutorials (vo3ai.com, beginnersinai.org, pixflow, reddit generativeAI threads, medium control articles, etc.)
- Model comparisons (Seedance/Kling/Veo/Runway leaderboards and creator reports)
- ComfyUI repos (Kosinkadink/ComfyUI-AnimateDiff-Evolved, comfyorg/comfyui-ipadapter, workflows for IPAdapter+SVD+interp+ControlNet)
- Claude Fable/Anthropic docs + MindStudio/DEV community agentic pipeline reports

## 2026-06-13 Final Ultimate Session (This Session)
This final exhaustive meta-research session closed all remaining gaps by copying the absolute best practices from every premium video generator on the market (Higgsfield Canvas/Cinema Studio/Elements, Runway Gen-4.5 Motion Brush/Director Mode, Kling 3.x Omni Elements/multi-shot/ref conditioning, Veo 3.1 native audio/Ingredients/Frames/Insert, Luma/Seedance/Pika/Sora keyframe/beat/physics/variants/extend, Descript/CapCut/InVideo/Synthesia workflow UX/brand kits/templates/guardrails, ComfyUI node graphs/IPAdapter strength/AnimateDiff/ControlNet/batch/interp).

**Method**: Mandatory first reads of `docs/ForgeFactory-Video-Methodology-v1.0-Higgsfield-100%.md` + entire `research/` + current codebase (videoRenderer.ts, videoPipelinePrompts.ts, no videoControls.ts yet, pipeline.ts, localVideoTemplates.ts, App.tsx, VideoStudio.tsx, openrouter.ts, etc. + grep for controls). Then deep MCP research (search_tool + use_tool brave_web_search on targeted queries for workflows, controls, secret sauce, guardrails, prompting, UI, consistency/motion/adherence/brand fidelity per tool) + synthesis.

**New Artifacts**:
- `docs/ForgeFactory-Video-Methodology-v1.0-Ultimate.md` (the absolute final version with 1. Gap analysis vs leaders 2. All new controls/techniques/guardrails/prompt patterns 3. Exact impl steps with file names 4. Updated rubric with premium features 5. One-click presets replicating premium feels).
- `research/ultimate-market-research.md` (raw targeted extracts, quotes, URLs, implications from this session — cross-referenced with priors).
- Updated this index.

**Key Extracts Synthesized (see ultimate-market-research.md + Ultimate doc for full)**:
- Higgsfield: Node chaining + reusable templates + live collab + Elements drop-in for campaign consistency without re-upload + AI co-director (Higgs) for plain-lang breakdown + 50+ camera presets + lens/aperture simulation + Hero Frame First + Start/End frame + genre for pacing/mood/energy + MCSLA + native audio in integrations. "Directed, not generated" via explicit controls + Elements + node continuity. Workflow free to build, pay on generate.
- Runway Gen-4.5: Motion Brush (paint areas with distinct vector speed/direction/intensity; Multi-Motion for 5+ areas) + Director Mode (node-based dynamic camera/lighting) + @ reference syntax for character/object consistency + advanced camera language + physics/world modeling (momentum/weight/fluid/occlusion) + lip sync + prompt adherence to sequenced camera + extend/stitch + post tools + variants/presets. Secret sauce: granular "paint the motion" + director nodes + refs + physics for plausible directed output.
- Kling 3.x/Omni: Elements/Omni for binding characters/props/voices once for multi-shot (up to 6) consistency across angles/scenes (4-image rule for sheets) + first/last frame + reference conditioning with strength + Motion Brush + motion intensity slider + kinetic verbs + native audio/lip-sync + "Constraint Sandwich" prompting (Subject Anchor + Shot+Action + Constraints: preserve ref/character at strength, realistic physics) + cinematic language understanding (tracking, POV, shot-reverse-shot) + OmniEdit (generative fill/relight/swap/reframe preserving motion). "Built for controlled, repeatable storytelling."
- Veo 3.1: Native audio (dialogue/ambient/SFX with precise lip-sync + prompt audio cues in single pass) + Ingredients to Video (up to 3 refs for characters/objects/scenes with consistent lighting/interactions) + Frames to Video / first+last frame for controlled transitions + Insert (add/remove elements into existing scene with auto lighting/shadows/style) + "subject + action + environment + camera movement + lighting + audio cues" prompting + strong prompt adherence/physics + 4K native + vertical 9:16 + Extend for seamless long-form + advanced editing. "Native audiovisual eliminates manual sound design."
- ComfyUI/open-source: Full node graphs (IPAdapter with per-ref weight/strength for consistency; AnimateDiff for motion modules + camera; ControlNet for precise camera/pose/depth/openpose; first/last frame; regional conditioning/masking; batch for variants; RIFE frame interpolation for smoothness/temporal; video native nodes for load/save/sequence). Shareable JSON workflows + modular sub-graphs (reusable "brand lock" or "cinematic camera" pipelines).
- Others (Luma/Seedance/Pika/Sora, Descript/CapCut/InVideo/Synthesia): Keyframe-to-video + reference-to-video with strong physics (fabric/water/collisions/momentum) + beat matching (prompt or audio ref for synced anims) + variants + extend/stitch. End-to-end workflow UX (script/goal → auto storyboard/beats/camera → generate locked assets via brand kit/Elements → multi-criteria refine/gates → export with transitions/audio). Brand kits/templates/guardrails (compliance/quality before publish) + auto-edit polish.

**Cross-Cutting Premium Secret Sauce (transplanted to Ultimate)**: Node/Canvas/graph orchestration for chaining/reuse/continuity; reference/Elements/Ingredients locking with explicit strength/weight (multi-ref, first/last, @tag or IPAdapter; hero frame first); explicit cinematic controls (50+ camera presets/language, Motion Brush paint vectors, intensity/genre sliders for pacing/mood/energy/physics); integrated audio (native lip/ambient/beat sync in prompt or single-pass); guardrails + refinement (multi-stage gates with per-feature scoring, targeted loops, variants + auto/best pick, post-edit (insert/extend/stitch/inpaint), templates/presets/brand kits); prompt patterns (MCSLA + Constraint Sandwich + "subject+action+env+camera+lighting+mood+audio+refs[weights]+physics+negatives"); workflow UX (script→storyboard→auto locked assets→gates→export; reusable kits/graphs; collab/versioning); "directed by pro film team + brand guardian" (explicit language + lock + physics + audio + control surface).

**Gaps Closed in Ultimate vs Current (post-100% plan, pre-full code)**: Current has strong local Hyperframes (primitives + keyframe panels + basic sim camera + FFmpeg) + structured prompts/gates + hybrid + emerging controls in plan, but gaps in node/Canvas graph (flat scenes), Motion Brush equiv, explicit first/last + multi-ref strength locking across shots/campaigns, native-style audio/lip/beat, AI co-director + full script->storyboard workflow, advanced guardrails/variants/refine (per-premium scoring + targeted), more cinematic (presets/lens/physics), brand kits deep, Comfy bridge advanced, UI for brush/nodes/sliders/presets, premium prompt patterns, post-stitch/edit (insert/extend), collab/version hints. Ultimate adds them all (new controls like motionBrush/firstLastFrameRefs/lipSyncStrength/directorModePlainLang/variantCount/nodeGraph/brandKitLock/physicsIntensity/lensOptics/extendStitchParams; techniques like IPAdapter strength in local + ControlNet camera + batch/interp; guardrails expanded; etc.) while preserving local-first/hybrid + SaaS exact UI/brand advantage (exceeds pure cloud for dashboards/metrics/typography).

**Implications for ForgeFactory Ultimate**: Layer all above onto local canvas (exact brand/UI win for SaaS) + hybrid (premium physics/audio when local sim ceiling). Node graph for Hyperframes (chainable scenes/refs with templates/reuse). Motion Brush + first/last + multi-ref strength in renderer/prompts. Native audio sim + pass-through. AI co-director + workflow stages. Advanced gates/variants + premium patterns/presets/UI. Comfy bridge for power when needed. Result: every market advantage synthesized + local controllability/cost/audit for branded SaaS 5-60s videos. This is the absolute final version.

## Session Notes (for Post-Run / Memory-Guard Fallback)
- Memory MCP: read_graph failed JSON parse (position 3484). No direct __ calls succeeded for full graph. Followed memory-guard: aggressive search first (done), local files as first-class durable store, sidecars for any future writes.
- No AGENTS.md or GROK-BUILD-CURRENT-STATE-AUDIT.md present in workspace root (project-conventions references them; recent superpowers specs/plans in docs/superpowers/ are the active artifacts).
- Codebase in excellent shape for this work: recent hyperframes upgrade already delivered primitives/templates/FFmpeg/hybrid UI that map 1:1 to "local Canvas/Cinema" for SaaS. Prompts already structured + gated. Roadmap is pure high-leverage extensions.
- Used: project-conventions (memory, subagent delegation, always-approve, baseline ref), autonomous-engineer (loop, multi-perspective thinking, rich context), brainstorming (explore context before creative synthesis), writing-plans principles (bite-size roadmap), memory-guard/optimizer (attempted + local fallback).
- Parallel research via tools (brave, exa, github schemas). Direct file reads for baseline. No premature code edits.
- Output: research/ sources + the exact requested `docs/ForgeFactory-Video-Methodology-v1.0-Higgsfield-Level.md` (complete with 4 sections, tables, roadmap tied to real files, testing rubric, prioritized actions).

## Post-Run Reflection (Lightweight per Post-Run-Reflector Pattern)
**What Worked Well:**
- Starting with mandatory skill reads (using-superpowers, project-conventions, autonomous-engineer, brainstorming, writing-plans, memory-*) + exploration before any synthesis.
- Liberal use of MCP discovery (search_tool for memory/brave/github/exa) + use_tool for targeted deep searches.
- Storing everything in high-quality local md (durable despite MCP flakiness).
- Direct code inspection (full reads of videoRenderer, prompts, pipeline, templates, App, VideoStudio, recent spec/plan, models) made roadmap *specific* and credible instead of generic.
- Synthesizing Higgs + Fable + model best practices into concrete ForgeFactory emulation (Elements, MCSLA, gates, router, critic) that respects "local-first + cheap boosts" and builds directly on the 2026-06-13 hyperframes work.

**Friction Points:**
- Memory MCP parse failure (handled via files).
- Some MCP (exa auth, limited github schema surface in first search) required fallback to brave + built-in web_search + direct reasoning.
- Volume of research data — condensed into tight, actionable source files + embedded in final doc.
- No X semantic/keyword results pulled in this pass (prepared but prioritized web + code); can be added in follow-up if needed for community sentiment.

**Improvement Opportunities / Feed-Forward:**
- After first P0 implementation, run a real video through the full v1.0 process + rubric and append results + any prompt tweaks to a dated sidecar in research/.
- Consider adding a `research/session-2026-06-13-summary.md` or append to a workspace health/audit file for cross-session recall.
- For future autonomous runs on this project: always load the research/ files + this methodology first via read or memory entities.
- Instinct: "For high-quality creative methodology/architecture tasks, front-load mandatory skill reads + parallel external research MCPs + direct codebase baseline read before any synthesis or writing. Store sources in research/ with index. Produce one definitive deliverable doc."

**Next (Autonomous):** User or follow-up run can invoke autonomous-engineer or task-delegator on "implement P0 Brand Elements + cinematic prompt upgrades per the v1.0 methodology" with full rich context (this doc + research files + recent hyperframes plan loaded).

All artifacts created. Session complete. Ready for implementation or review.
