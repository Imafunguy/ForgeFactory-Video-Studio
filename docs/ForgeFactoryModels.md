1. Reasoning models

Script planning, storyboards, shot lists, creative direction

Score is /50 for video-app usefulness: creative planning, structure, multimodal understanding, reliability, and value.

Tier	Rank	Model	OpenRouter price	Context	Score /50	Best use
High-end	1	x-ai/grok-4.20	$1.25/M in / $2.50/M out	2M	47	Best overall planning model: fast, huge context, good factual discipline
High-end	2	google/gemini-3.1-pro-preview	$2/M in / $12/M out	1.05M	46	Best multimodal creative director; good for analysing images/video/audio inputs
High-end	3	anthropic/claude-sonnet-4.6	$3/M in / $15/M out	1M	45	Best writing polish, scripts, tone, narrative structure
Mid value	4	qwen/qwen3.6-plus	$0.325/M in / $1.95/M out	1M	44	Best value for storyboard generation and app-scale automation
Mid value	5	z-ai/glm-5.1	$0.98/M in / $3.08/M out	203K	43	Strong autonomous planning, agentic workflows, structured project tasks
Mid value	6	google/gemini-3-flash-preview	$0.50/M in / $3/M out	1.05M	42	Good fast planning with multimodal inputs
Free / near-free	7	z-ai/glm-5.1:free	Free	203K	40	Best free serious planner if available/rate-limit allows
Free / near-free	8	minimax/minimax-m2.5:free	Free	204K	39	Great free office/agent-style planning model
Free / near-free	9	qwen/qwen3.5-flash	$0.065/M in / $0.26/M out	1M	38	Cheap bulk script variants, summaries, shot-list drafts

Grok 4.20 is attractive because OpenRouter lists it as a 2M-context reasoning model at $1.25/$2.50 with agentic tool calling and strong prompt adherence. Gemini 3.1 Pro Preview is more expensive but gives you a 1M-context multimodal model for text, image, video, audio, and code. Claude Sonnet 4.6 is expensive but strong for polished writing and project-level work.

For value, Qwen3.6 Plus is excellent: OpenRouter lists it at $0.325/$1.95 with 1M context and strong agentic coding/front-end/repository problem-solving capability, which transfers well to structured app pipelines. GLM-5.1 is listed at $0.98/$3.08 and is positioned for long-horizon autonomous work.

2. Image models

Keyframe, style frame, thumbnail, character and asset generation

Tier	Rank	Model	OpenRouter price	Context	Score /50	Best use
High-end	1	google/gemini-3-pro-image-preview / Nano Banana Pro	$2/M in / $12/M out + image pricing shown as $120/M tokens	66K	47	Best pro design, text in images, product/storyboard quality
High-end	2	openai/gpt-5-image	$10/M in / $10/M out + image pricing shown as $40/M tokens	400K	45	Premium instruction-following and image editing
High-end	3	black-forest-labs/flux.2-max	MP pricing: $0.07 first output MP + $0.03 extra MP	47K	44	High-quality stills, cinematic frames, polished assets
Mid value	4	google/gemini-3.1-flash-image-preview	$0.50/M in / $3/M out	131K	45	Best value pro-style keyframes
Mid value	5	google/gemini-2.5-flash-image	$0.30/M in / $2.50/M out	33K	43	Cheap, reliable keyframes and editing
Mid value	6	x-ai/grok-imagine-image-quality	from $0.05/image	66K	42	Posters, photorealistic assets, social graphics
Free / near-free	7	google/gemini-2.5-flash-image-preview:free	Free	33K	39	Best free image test route
Free / near-free	8	sourceful/riverflow-v2-fast	$0.02 per 1K image / $0.04 per 2K image	8K	38	Cheap production image generation
Free / near-free	9	black-forest-labs/flux.2-klein-4b	$0.014 first MP + $0.001 extra MP	41K	37	Very cheap bulk keyframes

OpenRouter's image collection lists Nano Banana 2 at $0.50/$3, Nano Banana Pro at $2/$12, GPT-5 Image at $10/$10, GPT-5 Image Mini at $2.50/$2, Grok Imagine Image Quality from xAI, FLUX.2 Pro/Klein/Max, and Riverflow V2 Fast pricing.

For your app, I would use:

Default image model: google/gemini-2.5-flash-image
Premium image model: google/gemini-3-pro-image-preview
Cheap image model:   google/gemini-2.5-flash-image-preview:free
3. Video models

External cloud video generation

Video pricing is usually per second, not per token.

Tier	Rank	Model	OpenRouter price	Capabilities	Score /50	Best use
High-end	1	google/veo-3.1	from $0.40/sec	1080p, native synchronized audio, scene extension, 4K upscaling	48	Final production clips
High-end	2	kwaivgi/kling-v3.0-pro	from $0.168/sec	T2V/I2V, first/last-frame control, native audio option	46	Cinematic controlled clips
High-end	3	bytedance/seedance-2.0	Pricing tokenized by resolution/duration	Strong reference-to-video, character consistency, camera movement	44	Character/style consistency
Mid value	4	google/veo-3.1-fast	from $0.10/sec	Text/image prompts, native synchronized audio, first/last frame	44	Best quality/speed balance
Mid value	5	alibaba/wan-2.7	$0.10/sec	Text-to-video, image-to-video, reference-to-video	42	Reliable mid-price video
Mid value	6	minimax/hailuo-2.3	$0.0817/sec	Text/reference image to video, cinematic/character animation	41	Good value creative clips
Free / near-free	7	kwaivgi/kling-v3.0-pro:free	Free	Premium Kling route, free limits likely	38	Testing and demos
Free / near-free	8	x-ai/grok-imagine-video	from $0.05/sec	1–15 sec, 24fps, 480p/720p, T2V/I2V/reference-to-video	40	Best cheap experimental video model
Free / near-free	9	google/veo-3.1-lite	from $0.05/sec	720p/1080p, 4–8 sec clips, native audio	39	Cheap short-form generation

OpenRouter's video collection says it supports video generation through a unified async API and lists Grok Imagine Video, Kling 3.0 Pro/Standard, Veo 3.1 Fast/Lite, Hailuo 2.3, Seedance 2.0/Fast, and Wan 2.7. Grok Imagine Video is listed from $0.05/sec, with 480p at $0.05/sec and 720p at $0.07/sec plus $0.002/image for image input. Veo 3.1 Fast is from $0.10/sec, Veo 3.1 Lite from $0.05/sec, Hailuo 2.3 is $0.0817/sec, Wan 2.7 is $0.10/sec, and Kling v3.0 Pro is from $0.168/sec.

For your app, I'd use:

Default video:  x-ai/grok-imagine-video
Better value:   minimax/hailuo-2.3
Premium output: google/veo-3.1 or kwaivgi/kling-v3.0-pro
4. Voice models

Narration and voiceover

OpenRouter TTS models are mostly priced per million characters, though some audio-capable models use token pricing. OpenRouter's TTS docs state that TTS models are discoverable via output_modalities=speech, and pricing varies by model/provider.

Tier	Rank	Model	OpenRouter price	Context	Score /50	Best use
High-end	1	google/gemini-3.1-flash-tts-preview	$1/M in / $20/M out	8K	46	Best expressive narration, 70+ languages, inline audio tags
High-end	2	x-ai/grok-voice-tts-1.0	$15/M characters	15K	44	Strong voice control, tags, 20+ languages, MP3/WAV/PCM
High-end	3	mistralai/voxtral-mini-tts-2603	$16/M characters	4K	42	Voice cloning / multilingual experiments
Mid value	4	openai/gpt-audio-mini	$0.60/M in / $2.40/M out	128K	43	Best cheap OpenAI-style audio/narration model
Mid value	5	canopylabs/orpheus-3b-0.1-ft	$7/M characters	4K	40	Natural English narration, 7 preset voices
Mid value	6	sesame/csm-1b	$7/M characters	4K	39	Conversational speech / dialogue voice assistant
Free / near-free	7	hexgrad/kokoro-82m	$0.62/M characters	4K	38	Cheapest practical TTS option
Free / near-free	8	zyphra/zonos-v0.1-transformer	$7/M characters	4K	36	Budget English voice variety
Free / near-free	9	zyphra/zonos-v0.1-hybrid	$7/M characters	4K	36	Budget English voices, hybrid architecture

Gemini 3.1 Flash TTS Preview supports 70+ languages, 200+ inline audio tags, up to two speakers, and outputs PCM audio at 24kHz mono; OpenRouter lists it at $1/$20 per 1M tokens. Grok Voice TTS supports 20+ languages, five built-in voices, inline speech tags, MP3/WAV/PCM/μ-law/A-law outputs, and is listed at $15/M characters. The TTS model collection also lists Kokoro 82M at $0.62/M, Orpheus/CSM/Zonos at $7/M characters, and Voxtral Mini TTS at $16/M characters.

For your app, I'd use:

Default voice:  openai/gpt-audio-mini
Expressive:     google/gemini-3.1-flash-tts-preview
Cheapest:       hexgrad/kokoro-82m

There do not appear to be many truly free TTS options on OpenRouter right now, so "free/close-to-free" for voice mostly means very cheap paid models.

Final recommendation for your local app
Best high-end preset
Reasoning: x-ai/grok-4.20
Image:     google/gemini-3-pro-image-preview
Video:     google/veo-3.1
Voice:     google/gemini-3.1-flash-tts-preview

Use this for the best final output, but it will cost more.

Best value preset
Reasoning: qwen/qwen3.6-plus
Image:     google/gemini-2.5-flash-image
Video:     minimax/hailuo-2.3
Voice:     openai/gpt-audio-mini

This is the one I'd build into the app as the default.

Cheapest useful preset
Reasoning: qwen/qwen3.5-flash
Image:     google/gemini-2.5-flash-image-preview:free
Video:     x-ai/grok-imagine-video
Voice:     hexgrad/kokoro-82m

Use this for high-volume testing, prototypes, and users on a cheap tier.