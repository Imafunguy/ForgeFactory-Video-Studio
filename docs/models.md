# ForgeFactory v2 — Comprehensive Model Registry & Documentation

**Single source of truth:** Edit ONLY `src/lib/models.ts` (the `MODEL_REGISTRY` array).  
All UI (Model Lab, ModelSelector in Video Studio + Agentic Pipeline, pricing, API routing, persistence) automatically reflects the registry. No other files need changes for new models.

**Live dynamic pricing:** On launch (and via "Refresh Prices"), the app fetches current pricing from `https://openrouter.ai/api/v1/models` (with endpoint details for image/video where base pricing is zero). Results are cached in localStorage (8h TTL) with graceful stale fallback on errors or no key. 

Prices appear globally next to models (selectors, active banners in Studio/Agentic, Model Lab grids, cost summaries). Use the **"Export Current Prices to Markdown"** button in Model Lab or Settings to generate a fresh snapshot you can copy-paste into this document (never auto-written at runtime).

Prices can (and do) change — always refresh in-app for production decisions. Grok/xAI models are billed to your OpenRouter balance only.

**Date of this research snapshot:** June 2026 (based on OpenRouter rankings, collections, real-usage leaderboards, Reddit creator comparisons, and pricing data).

---

## Cost Tiers (used throughout the app)

| Tier     | Meaning                          | When to use                                      | Typical pricing guidance                  |
|----------|----------------------------------|--------------------------------------------------|-------------------------------------------|
| **value**    | Lowest cost, strong daily results | Drafts, iterations, high-volume work, testing   | Free or <$1–3 per typical 30s video asset set |
| **medium**   | Balanced quality vs cost        | Client deliverables, multilingual, most final renders | $3–12 range for full asset generation     |
| **premium**  | Highest quality, highest cost   | Hero shots, cinematic finals, brand-critical work | $12–60+ for premium cloud video + assets  |

**Golden rule for cost-conscious video production (the primary use case):**  
Keep **Maximize Local Render** ON at all times. Local Hyperframes + FFmpeg is free, instant, and often sufficient for SaaS UI, dashboards, kinetic typography, metrics, and step sequences. Use cloud video models (Kling, Veo, Seedance, etc.) sparingly and only for difficult live-action B-roll, complex character motion, or when the shot cannot be realized locally.

---

## Recommendation Tables (June 2026)

### Reasoning (script / storyboard / planning)
**Best Performance (Premium):** Claude Opus 4.8, Gemini 3 Pro, GPT-5.5, DeepSeek V4 Pro  
**Best Value (daily):** Kimi K2 (default), Gemini 3 Flash, DeepSeek V4 Flash, Qwen3.6 MoE  
**Best Free / Very Low-Cost:** Qwen3 Coder :free, NVIDIA Nemotron 3 Ultra (often low or free tier), Gemini Flash variants

### Image / Keyframe generation
**Best Performance:** Flux Pro, Riverflow V2.5 Pro (with high reasoning effort), Imagen 3, Recraft V3  
**Best Value:** Flux Schnell/Klein (default), Riverflow V2.5 Fast, Gemini Flash Image, SD 3.5 Large  
**Best Free/Low:** Many Flux/Riverflow fast routes + free-tier diffusion models when available on OR

### Video generation (cloud only — use sparingly)
**Best Performance:** Google Veo 3.1 (often + native audio), Kling 3.0 Pro/Omni  
**Best Value:** Seedance 2.0 Fast (default), Hailuo/MiniMax 2.3, Seedance 2.0, Kling 3.0 Standard  
**Best Free/Low:** Almost none truly free at production quality. Seedance Fast tier is the lowest-cost reliable option. Local render is the real "free" path.

**Real user/creator feedback summary (from 2026 comparisons):**  
- Veo 3.1 frequently wins on photorealism, lighting, prompt adherence, and native audio sync.  
- Kling 3.x excels at character consistency, realistic human motion, and longer controllable clips.  
- Seedance 2.0 (esp. Fast) wins on price/performance and speed; great for volume B-roll and product shots.  
- Most creators report 2–3 variants per shot + heavy editing. All cloud video is "expensive" relative to local; 8–15s clips common. Physics/hands/text consistency still require iteration or post.

### Voice / TTS
**Best Performance:** ElevenLabs v3 / Multilingual v3, Rime 1  
**Best Value:** Grok Voice TTS 1.0 (default), PlayHT 3.0, Gemini Flash TTS  
**Best Free/Low:** Gemini preview routes and some PlayHT/Grok low tiers

---

## Reasoning Models (12 total)

Used for planning scripts, breaking down scenes, generating detailed keyframe prompts, and creative direction in Video Studio and the Agentic Pipeline.

| Display Name                  | OpenRouter ID                        | Cost Tier | Approx. Pricing (live)      | Strengths                                      | Weaknesses / Limitations                     | Best Use Cases                              | OR / Grok Notes |
|-------------------------------|--------------------------------------|-----------|-----------------------------|------------------------------------------------|----------------------------------------------|---------------------------------------------|-----------------|
| **Kimi K2** (default)        | `moonshotai/kimi-k2`                | value    | Very low / excellent value | Long context, agentic reliability, structured output, fast iterations | Can be slightly less "creative" than Claude | Everyday scripts, storyboards, planning    | Top daily recommendation. |
| Gemini 3 Flash               | `google/gemini-3-flash`             | value    | Ultra low                  | Speed, cheap, multimodal (text/image/video input) | Shorter "deep creative" depth than Pro/Opus  | Quick outlines, simple scripts, high volume | Great with image context. |
| DeepSeek V4 Flash            | `deepseek/deepseek-v4-flash`        | value    | Very low                   | MoE efficiency, strong reasoning + coding, 1M context | Occasional over-refusal on edgy creative     | Technical storyboards, tool-use planning   | Outstanding value. |
| Qwen3 Coder (:free)          | `qwen/qwen3-coder:free`             | value    | Free (rate limited)        | Surprisingly capable coding/agent model        | Rate limits, occasional lower consistency    | Draft planning when budget is zero         | Use :free suffix on OR. |
| NVIDIA Nemotron 3 Ultra      | `nvidia/nemotron-3-ultra`           | value    | Low / free-ish tier often  | Frontier open MoE, 1M context, orchestration   | Newer — variable provider routing            | Complex multi-step agentic pipelines       | Strong for autonomous flows. |
| Claude Sonnet 4.6            | `anthropic/claude-sonnet-4.6`       | medium   | ~$3/$15                    | Nuanced writing, careful structure, safety     | Slower & more expensive than value tier      | Polished client scripts, brand voice       | Gold standard for quality writing. |
| Qwen3.6 35B MoE              | `qwen/qwen3.6-35b-a3b`              | medium   | Low–medium                 | Strong open multimodal reasoning               | Less "personality" than Claude               | Balanced production planning               | Excellent open-weight choice. |
| Gemini 3 Pro                 | `google/gemini-3-pro`               | medium   | Medium                     | 1M context, tool calling, multimodal           | Can be verbose                               | Large campaign planning, research synthesis| Great long-context work. |
| Claude Opus 4.8              | `anthropic/claude-opus-4.8`         | premium  | High (~$15+ /M)            | Maximum intelligence & careful reasoning       | Very expensive, slower                       | Flagship creative direction, difficult briefs | Use only when quality justifies cost. |
| GPT-5.5                      | `openai/gpt-5.5`                    | premium  | High                       | Frontier agentic + long context                | Cost, occasional style drift                 | Complex interactive storyboards            | Strong for refinement loops. |
| DeepSeek V4 Pro              | `deepseek/deepseek-v4-pro`          | premium  | Medium–high                | Massive MoE scale, top benchmarks              | Provider variance                            | Hardest reasoning / research tasks         | Often beats closed models on price/perf. |
| Grok Heavy                   | `x-ai/grok-4.20`                    | premium  | Premium (OR balance)       | Strong reasoning + real-time knowledge flavor  | Billed only via OpenRouter (not xAI sub)     | Maximum quality hero campaigns             | Remember: always hits your OR credits. |

**Top daily recommendation:** Kimi K2 or Gemini 3 Flash. Escalate to Claude Sonnet 4.6 or Opus only for paid client work.

---

## Image / Keyframe Models (11 total)

Used via OpenRouter chat completions with `modalities: ["image"]` (or image_config) for keyframe generation. Some (Riverflow) have powerful built-in reasoning + multi-image edit + typography features.

| Display Name                  | OpenRouter ID                          | Cost Tier | Pricing (typical)              | Strengths                                           | Weaknesses                              | Best Use Cases                              | OR / Grok Notes |
|-------------------------------|----------------------------------------|-----------|--------------------------------|-----------------------------------------------------|-----------------------------------------|---------------------------------------------|-----------------|
| **Flux Schnell / Klein** (default) | `black-forest-labs/flux.2-klein-4b` | value    | Lowest per MP (~$0.001–0.003) | Fastest, cheapest, reliable 16:9 marketing frames  | Lower detail than Pro                   | Pipeline iterations, 80% of keyframes      | Default for a reason. |
| Riverflow V2.5 Fast           | `sourceful/riverflow-v2.5-fast`        | value    | Low + dynamic (effort-based)  | Built-in reasoning, typography, multi-edit, brand control | Dynamic cost can surprise if high effort| High-volume marketing visuals, UI, text-heavy | Strongly recommended value pick. Pass URLs not base64 (size limit). |
| Gemini 3 Flash Image          | `google/gemini-3-flash-image`          | value    | Very low                       | Multimodal (understands prior images/text), captions | Less "artistic" control than BFL       | Quick concepts with text overlays           | Excellent with script context. |
| Flux Dev / Flex               | `black-forest-labs/flux.2-flex`        | value    | Low                            | Balanced quality/speed for everyday use            | Not quite Pro level                     | Most non-hero keyframes                     | Reliable workhorse. |
| SD 3.5 Large                  | `stability-ai/sd3.5-large`             | value    | Low                            | Open, stylistic variety, good prompt adherence     | Can need more prompt engineering        | Variety, artistic or fallback keyframes     | Good diversity source. |
| Riverflow V2.5 Pro            | `sourceful/riverflow-v2.5-pro`         | medium   | Medium–higher (xhigh effort)  | Maximum steerability, 4K, custom fonts, strict judging | Higher & less predictable cost         | Hero assets, brand systems, complex edits  | Set reasoning="high" or "xhigh" via image_config when needed. |
| Ideogram 2.0                  | `ideogram/ideogram-2.0`                | medium   | Medium                         | Best-in-class typography & text rendering          | Less photoreal than Flux                | Titles, UI mockups, marketing text overlays| Must-have for text-heavy work. |
| **Flux Pro**                  | `black-forest-labs/flux.2-pro`         | premium  | Higher per MP                  | Frontier visual fidelity, lighting, composition    | Cost                                    | Hero keyframes, final polished sets        | Use for the 10–20% that really matter. |
| Recraft V3                    | `recraft/recraft-v3`                   | premium  | Premium                        | Vector-friendly, production illustration quality   | Niche style                             | Clean brand illustrations, icon systems    | Great for design-system consistent assets. |
| Leonardo Premium              | `leonardo/leonardo-premium`            | premium  | Premium                        | Artistic control, motion-ready, styles             | Can be over-stylized                    | Cinematic or stylized hero frames          | Good when you need a specific look. |
| Google Imagen 3               | `google/imagen-3`                      | premium  | Premium                        | Photoreal product & scene fidelity                 | Availability / routing on OR            | Photoreal product shots, lifestyle B-roll keys | Excellent prompt following. |

**Recommendation:** Flux Schnell + Riverflow Fast for 90% of work. Escalate to Riverflow Pro or Flux Pro for hero sets. Ideogram when text/typography is critical.

---

## Video Models (11 total)

**Critical:** These are only attempted when **Maximize Local Render** is OFF (or a specific step forces cloud). The app always falls back gracefully to free local Hyperframes + FFmpeg. All cloud video is billed to your OpenRouter balance and is the dominant cost driver for non-local work.

| Display Name                  | OpenRouter ID                    | Cost Tier | Pricing (approx, Jun 2026)     | Strengths (from creator reports)                     | Weaknesses / Limitations                     | Best Use Cases                              | OR / Grok Notes |
|-------------------------------|----------------------------------|-----------|--------------------------------|------------------------------------------------------|----------------------------------------------|---------------------------------------------|-----------------|
| **Seedance 2.0 Fast** (default) | `bytedance/seedance-2.0-fast`  | value    | Lowest reliable (~$0.018–0.05/s) | Speed, price, decent motion & product fidelity     | Lower consistency than Pro tiers            | High-volume B-roll, product explainers, drafts | Best "value cloud" choice. Use sparingly. |
| Hailuo 2.3 (MiniMax)          | `minimax/hailuo-2.3`             | value    | Low–medium                     | Strong facial expressions, social-friendly output  | Slower generation in some reports           | Talking-head style, product emotion         | Good complement to Seedance. |
| Seedance 2.0                  | `bytedance/seedance-2.0`         | medium   | Competitive                    | Better motion/character consistency than Fast      | Still not top-tier cinematic                | Most practical cloud shots for cost         | Sweet spot for many teams. |
| Kling 3.0 Standard            | `kwaivgi/kling-v3.0-std`         | medium   | ~$0.08–0.12/s                  | Outstanding character consistency & realistic motion | Can be slower, availability varies          | Character-driven scenes, multi-shot         | Frequently praised in 2026 head-to-heads. |
| Luma Ray 3                    | `luma/ray-3`                     | medium   | Medium                         | Dreamy/cinematic extensions, strong I2V            | Less reliable prompt adherence              | Stylized or atmospheric sequences           | Good for extensions & transitions. |
| Kling 3.0 Pro / Omni          | `kwaivgi/kling-v3.0-pro`         | premium  | ~$0.095–0.15+/s                | Highest Kling fidelity, audio options, longer clips| Expensive                                   | Hero character work, complex motion         | Top consistency pick for many creators. |
| Google Veo 3.1 Fast           | `google/veo-3.1-fast`            | premium  | Medium–high                    | Excellent lighting, prompt following + native audio| Still premium pricing                       | High-quality B-roll with sound              | Audio is a huge differentiator. |
| Google Veo 3.1                | `google/veo-3.1`                 | premium  | Highest (~$0.20/s)             | Frequently ranked #1 cinematic + audio quality     | Cost, shorter typical duration (8–10s)      | Flagship hero shots                         | Use for the shots that justify the cost. |
| Runway Gen-4.5                | `runway/gen-4.5`                 | premium  | High                           | Cinematic polish, creative tools, control          | Expensive, shorter clips                    | Client ad-quality finals                    | Reserve for paid deliverables. |
| Sora 2                        | `openai/sora-2`                  | premium  | High / variable                | Strong realism & physics                           | Availability fluctuates on OR               | Photoreal narrative clips                   | Test availability per project. |
| Wan 2.7                       | `wan/wan-2.7`                    | medium   | Good value                     | Multi-shot / strong reference-to-video             | Less known in Western comparisons           | Extended story sequences, reference heavy   | Underrated value option in 2026 data. |

**Strong recommendation for cost-conscious daily production:** Maximize Local = ON 95%+ of the time. Use Seedance Fast or Hailuo only for the 1–2 shots per video that truly need external motion. Kling Pro or Veo only for the highest-stakes hero content.

---

## Voice / TTS Models (10 total)

Narration is generated via OpenRouter `/audio/speech`. Each model surfaces its own voice list in the VoiceSelector. Preview samples use the model's `previewText`.

| Display Name                  | OpenRouter ID                          | Cost Tier | Pricing (typical)       | Strengths                                | Weaknesses                          | Voices (examples)                     | Best Use Cases                     | OR / Grok Notes |
|-------------------------------|----------------------------------------|-----------|-------------------------|------------------------------------------|-------------------------------------|---------------------------------------|------------------------------------|-----------------|
| **Grok Voice TTS 1.0** (default) | `x-ai/grok-voice-tts-1.0`            | value    | Low                    | Natural intonation, multilingual, reliable | Slightly less "polished" than Eleven for some ears | Ara, Rex, Sal, Eve, Leo              | Everyday narration, product demos  | Recommended default. Billed to OR. |
| PlayHT 3.0                    | `playht/playht-3.0`                    | value    | Low                    | Cheap, consistent, fast                  | Can sound more "synthetic"          | Alloy, Echo, Nova (and more)         | High-volume drafts                 | Solid budget workhorse. |
| Gemini 3.1 Flash TTS Preview  | `google/gemini-3.1-flash-tts-preview`  | value    | Very low               | Surprisingly good for price, fast        | Preview quality / feature set       | Google natural set (mapped)          | Quick checks & low-stakes          | Use for speed in iteration. |
| ElevenLabs v3                 | `elevenlabs/eleven-v3`                 | medium   | Medium                 | Expressive, emotional, excellent prosody | Cost for heavy use                  | Rachel, Drew, Clyde, Bella, Antoni   | Client voiceovers, storytelling    | Gold standard for many. |
| OpenAI TTS                    | `openai/tts-1`                         | medium   | Medium                 | Clean, neutral, consistent               | Less character than Eleven          | Alloy, Echo, Fable, Onyx, Nova, Shimmer | Neutral explainers                 | Safe middle choice. |
| Cartesia Sonic 2              | `cartesia/sonic-2`                     | medium   | Medium                 | Low latency, high clarity, modern tone   | Smaller voice catalog               | Carla, Jason                         | Fast modern product narration      | Great clarity. |
| OpenAI TTS HD                 | `openai/tts-1-hd`                      | premium  | Higher                 | Highest OpenAI fidelity                  | Cost                                | Same OpenAI set                      | Final polished narration           | Use when budget allows. |
| ElevenLabs Multilingual v3    | `elevenlabs/eleven-multilingual-v3`    | premium  | Premium                | Best accents + emotional range           | Highest TTS cost                    | Full Eleven set                      | International / brand voice work   | Worth it for global clients. |
| Rime 1                        | `rime/rime-1`                          | premium  | Premium                | Broadcast / professional quality         | Price, less "conversational"        | Mist, Bravo                          | High-end marketing voiceovers      | Studio-grade. |
| Mistral Voxtral TTS           | `mistral/voxtral-tts`                  | medium   | Medium                 | Strong European languages, natural       | Routing/availability                | OpenAI-style set                     | EU-focused or multilingual         | Good alternative voice color. |

**Recommendation:** Start with Grok Voice (Ara/Rex) or PlayHT for 90% of work. Escalate to ElevenLabs v3 for client-facing or emotional delivery. Always preview the exact voice + text before final render.

---

## Adding / Maintaining Models

1. Edit `src/lib/models.ts` → add to `MODEL_REGISTRY`.
2. Provide accurate `value` (stable UI identifier), `openRouterId` (the exact string sent to OR for that capability), `category`, `costTier`, `costLabel`, `note`.
3. For image models that need the chat+modalities path: set `imageModalities`.
4. For voice: attach a `voices: VoiceOption[]` array (reuse or extend the const lists at top of file).
5. Update this `docs/models.md` with a short entry + refresh the recommendation tables.
6. `npm run build` (TypeScript will catch most issues).
7. Test in Model Lab, Studio, and Agentic Pipeline. Verify pricing fetch and (if possible) a real generation.

No other source files should hardcode model lists.

## Billing, Limits & Practical Notes (June 2026)

- **Everything** (except pure local Hyperframes render) bills your **OpenRouter credit balance**.
- Grok / xAI models on OR do **not** consume a direct xAI or Grok subscription.
- Video is by far the largest cost vector. A single 8–10s premium clip can cost more than 100–1000 reasoning + image generations combined.
- Some models (Riverflow dynamic, certain video providers) have variable final pricing — the in-app price display is a best-effort estimate.
- OpenRouter free-tier models (`:free`) are rate-limited and great for experimentation/drafts but not production SLAs.
- Always keep a small OpenRouter balance; the app degrades gracefully to local-only when key or credits are missing.
- Image generation uses the chat/completions + modalities path for most listed models. Video uses the dedicated `/videos` endpoint. Voice uses `/audio/speech`.
- Provider routing and uptime on OR can vary by region/time — the app already has fallbacks.

## Keeping This Documentation in Sync with Live Prices

Prices shown in the app (and the "Approx. Pricing (live)" notes throughout this doc) are **fetched live** at runtime from OpenRouter and cached locally. They are never baked into source at build time.

**To refresh the pricing data in this document:**
1. Launch the app and ensure your OpenRouter key is saved (Settings).
2. Go to **Model Lab** or the **Model Pricing** section in **Settings**.
3. (Optional) Click **Refresh Prices**.
4. Click **Export Current Prices to Markdown** (or "Export MD").
5. Copy the output.
6. Paste the snapshot / tables into the appropriate sections here (e.g. replace or extend the per-category pricing tables and the Live Pricing Snapshot if present).
7. Update the "as of" timestamp and save/commit.

The app provides the **Export Current Prices to Markdown** feature specifically so documentation can stay reasonably accurate without any browser-side file writes (which are unreliable and undesirable for this project).

---

**This document + `src/lib/models.ts` together constitute the professional-grade, maintainable model system for ForgeFactory v2.** Research was performed using current OpenRouter collections, leaderboards, pricing pages, and widespread 2026 creator discussions (Reddit, comparisons, etc.) to prioritize real-world quality, reliability, speed, and cost for daily video production work.