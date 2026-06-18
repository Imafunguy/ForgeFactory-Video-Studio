import { useState, useRef, useCallback } from 'react';
import { Toaster, toast } from 'sonner';
import {
  loadProjects, saveProjects, loadGenerations, saveGenerations,
  loadCurrentProjectId, saveCurrentProjectId, loadApiKey, saveApiKey,
  resolveOpenRouterApiKey,
  loadModelPreferences, saveModelPreferences,
  loadCustomBrandKits, saveCustomBrandKit,
  loadBrandReferences, saveBrandReferences,
  migrateProject,
} from './lib/storage';
import type { Project, Generation, SavedBrandKit } from './lib/storage';
import {
  callOpenRouter,
  generateImagePrompts,
  generateKeyframeImages,
  generateCloudVideo,
  generateVoice,
  generateVoiceForPreview,
  getTtsUserMessage,
  OPENROUTER_KEY_REQUIRED_ERROR,
  resolveTtsVoice,
  resolveVoiceModelId,
  extractNarrationFromScript,
  getLocalRenderBias,
  generateVariants,
  runPreRenderQualityGate,
} from './lib/openrouter';
import {
  saveVideoBlob,
  captureVideoThumbnail,
  saveThumbnail,
  deleteMediaForGeneration,
  loadVideoBlob,
} from './lib/mediaStorage';
import {
  createSaaSAnimationCanvas,
  downloadBlob,
  type QualityPreset,
  type TemplateId,
  postProcessWithFFmpeg,
} from './lib/videoRenderer';

import {
  buildPlanningPrompt,
  buildBrandContext,
  buildRefinementPrompt,
  extractHyperframesDesc,
  extractKeyframeSection,
  getBrandVideoProfile,
  resolveEffectiveModels,
} from './lib/videoPipelinePrompts';
import {
  runPremiumOrchestrator,
  type WorkflowStageResult,
} from './lib/premiumOrchestrator';
import { buildComfyPayload } from './lib/comfyAdvancedBridge';
import {
  type VideoControls,
  type BrandPalette,
  DEFAULT_VIDEO_CONTROLS,
  loadPremiumPreset,
  mergeControls,
  mapToRenderer,
  injectControlsToPrompt,
  getControlsFromProject,
  resolveBrandPalette,
  brandPaletteFromArray,
} from './lib/videoControls';
import { deriveBrandPaletteFromColor } from './lib/storage';
import {
  generateBrandedKeyframes,
  runGrokImagineBrandLockTest,
  brandKitFromProject,
  GROK_IMAGINE_IMAGE_MODEL,
} from './lib/grokImagineHarness';
import type { BrandReferenceAsset } from './lib/videoControls';
import {
  DEFAULT_IMAGE_MODEL,
  DEFAULT_REASONING_MODEL,
  DEFAULT_VIDEO_MODEL,
  DEFAULT_VOICE_MODEL,
  applyForgeFactoryPreset,
  getModelByValue,
  getDefaultVoiceForModel,
  getVoicesForModel,
  type PipelinePresetId,
} from './lib/constants';
import {
  STUDIO_PIPELINE_STEPS,
  createInitialStepStatuses,
  createInitialAgenticState,
  parseKeyframes,
  estimateRemainingSeconds,
  type StudioOutput,
  type AgenticState,
  type StepStatus,
  type AgenticToolCall,
} from './lib/pipeline';
import { AppShell } from './components/layout/AppShell';
import { Dashboard } from './components/pages/Dashboard';
import { VideoStudio } from './components/pages/VideoStudio';
import { AgenticPipeline } from './components/pages/AgenticPipeline';
import { ModelLab } from './components/pages/ModelLab';
import { Hyperframes } from './components/pages/Hyperframes';
import { Library } from './components/pages/Library';
import { Settings } from './components/pages/Settings';
import { ModelPricingProvider } from './context/ModelPricingContext';

const getTimestamp = () => Date.now();

type StudioMode = 'guided' | 'oneclick';

function App() {
  const initialPrefs = loadModelPreferences();

  const [currentTab, setCurrentTab] = useState('dashboard');
  const [projects, setProjects] = useState<Project[]>(() => loadProjects());
  const [currentProjectId, setCurrentProjectId] = useState<string>(() => {
    const loaded = loadProjects();
    return loadCurrentProjectId() || loaded[0]?.id || '';
  });
  const [generations, setGenerations] = useState<Generation[]>(() => loadGenerations());
  const [apiKey, setApiKey] = useState<string>(() => loadApiKey());
  const [currentAnimation, setCurrentAnimation] = useState<null | { record: (durationMs?: number) => Promise<Blob> }>(null);

  // Studio state
  const [studioGoal, setStudioGoal] = useState('');
  const [selectedPlanningModel, setSelectedPlanningModel] = useState(initialPrefs.planningModel || DEFAULT_REASONING_MODEL);
  const [selectedImageModel, setSelectedImageModel] = useState(initialPrefs.imageModel || DEFAULT_IMAGE_MODEL);
  const [selectedVideoModel, setSelectedVideoModel] = useState(initialPrefs.videoModel || DEFAULT_VIDEO_MODEL);
  const [selectedVoiceModel, setSelectedVoiceModel] = useState(initialPrefs.voiceModel || DEFAULT_VOICE_MODEL);
  const [selectedVoiceId, setSelectedVoiceId] = useState(() => {
    const voiceModel = initialPrefs.voiceModel || DEFAULT_VOICE_MODEL;
    const rawVoice =
      initialPrefs.voiceSelections?.[voiceModel]
      ?? initialPrefs.voiceId
      ?? getDefaultVoiceForModel(voiceModel);
    return resolveTtsVoice(resolveVoiceModelId(voiceModel), rawVoice);
  });
  const [voicePreviewLoading, setVoicePreviewLoading] = useState(false);
  const [keyframesGenerating, setKeyframesGenerating] = useState(false);
  const [cloudVideoStatus, setCloudVideoStatus] = useState<string | null>(null);
  const [studioMode, setStudioMode] = useState<StudioMode>('oneclick');
  const [studioOutput, setStudioOutput] = useState<StudioOutput | null>(null);
  const [studioStepStatuses, setStudioStepStatuses] = useState(createInitialStepStatuses);
  const [studioCurrentStep, setStudioCurrentStep] = useState<string | null>(null);
  const [studioBusy, setStudioBusy] = useState(false);
  const [studioRendering, setStudioRendering] = useState(false);
  const [studioVideoUrl, setStudioVideoUrl] = useState<string | null>(null);

  // Agentic state
  const [agenticGoal, setAgenticGoal] = useState('');
  const [agenticState, setAgenticState] = useState<AgenticState>(createInitialAgenticState);
  const [agenticBusy, setAgenticBusy] = useState(false);
  const [agenticRendering, setAgenticRendering] = useState(false);
  const [agenticVideoUrl, setAgenticVideoUrl] = useState<string | null>(null);
  const agenticPausedRef = useRef(false);
  const agenticAbortRef = useRef(false);
  const voicePreviewAudioRef = useRef<HTMLAudioElement | null>(null);
  const voicePreviewUrlRef = useRef<string | null>(null);

  // Hyperframes tab
  const [hyperDesc, setHyperDesc] = useState('');
  const [hasHyperPreview, setHasHyperPreview] = useState(false);

  const [settingsKey, setSettingsKey] = useState<string>(() => loadApiKey());
  const [showKey, setShowKey] = useState(false);
  const [ffmpegPath, setFfmpegPath] = useState('ffmpeg');
  const [newProject, setNewProject] = useState({ name: '', colors: '', uiElements: '', tone: '' });

  // Local render controls (persisted via Model Lab)
  const [maximizeLocal, setMaximizeLocal] = useState(initialPrefs.maximizeLocal ?? true);
  const [qualityBoost, setQualityBoost] = useState(initialPrefs.qualityBoost ?? false);
  const [qualityPreset, setQualityPreset] = useState<QualityPreset>(initialPrefs.qualityPreset ?? 'balanced');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId | null>(initialPrefs.selectedTemplate ?? null);
  const [targetRes] = useState({ width: 1920, height: 1080, fps: 60 });
  const [videoControls, setVideoControls] = useState<VideoControls>(() => {
    const loaded = loadProjects();
    const id = loadCurrentProjectId() || loaded[0]?.id;
    const project = loaded.find((p) => p.id === id) || loaded[0];
    if (!project) return DEFAULT_VIDEO_CONTROLS;
    const savedRefs = loadBrandReferences(project.id);
    return mergeControls({
      ...getControlsFromProject(project),
      ...(savedRefs.length
        ? { brandKitLock: { enabled: false, lockStrength: 70, brandReferences: savedRefs } }
        : {}),
    });
  });
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [workflowStages, setWorkflowStages] = useState<WorkflowStageResult[]>([]);
  const [customBrandKits, setCustomBrandKits] = useState<SavedBrandKit[]>(() => loadCustomBrandKits());
  const comfyNote = buildComfyPayload(videoControls, '', studioGoal || agenticGoal).exportNote;

  const currentProject = projects.find(p => p.id === currentProjectId) || projects[0];

  const applyProjectBrandToControls = useCallback((project: Project) => {
    const savedRefs = loadBrandReferences(project.id);
    setVideoControls((prev) => {
      const brandPatch = getControlsFromProject(project);
      const refPatch = savedRefs.length
        ? { brandKitLock: { ...prev.brandKitLock, brandReferences: savedRefs } }
        : {};
      if (prev.accentLock === false) {
        return mergeControls({ ...prev, fontFamily: brandPatch.fontFamily, ...refPatch });
      }
      return mergeControls({ ...prev, ...brandPatch, ...refPatch });
    });
  }, []);

  const switchProject = (id: string) => {
    setCurrentProjectId(id);
    saveCurrentProjectId(id);
    const proj = projects.find((p) => p.id === id);
    if (proj) applyProjectBrandToControls(proj);
    toast.success(`Switched to ${proj?.name}`);
  };

  const updateProjects = (newProjects: Project[]) => {
    const migrated = newProjects.map(migrateProject);
    setProjects(migrated);
    saveProjects(migrated);
  };

  const handleSaveProjectBrandDefault = useCallback((palette: BrandPalette, fontFamily: string) => {
    if (!currentProject) return;
    const paletteArray = [
      palette.primary,
      palette.accent,
      palette.secondary,
      palette.neutral,
      palette.surface,
      palette.text,
    ].filter((c): c is string => !!c);
    const updated = projects.map((p) =>
      p.id === currentProject.id
        ? {
            ...p,
            colors: palette.primary,
            brandPalette: paletteArray,
            defaultFont: fontFamily,
          }
        : p,
    );
    updateProjects(updated);
    toast.success(`Saved brand kit as default for ${currentProject.name}`);
  }, [currentProject, projects]);

  const handleSaveCustomBrandKit = useCallback((name: string, palette: BrandPalette, fontFamily: string) => {
    const paletteArray = [
      palette.primary,
      palette.accent,
      palette.secondary,
      palette.neutral,
      palette.surface,
      palette.text,
    ].filter((c): c is string => !!c);
    const kit: SavedBrandKit = {
      id: 'kit_' + getTimestamp(),
      name,
      palette: paletteArray,
      defaultFont: fontFamily,
      createdAt: getTimestamp(),
    };
    const next = saveCustomBrandKit(kit);
    setCustomBrandKits(next);
    toast.success(`Custom kit "${name}" saved`);
  }, []);

  const handleLoadCustomBrandKit = useCallback((kit: SavedBrandKit) => {
    setVideoControls((prev) =>
      mergeControls({
        ...prev,
        brandPalette: brandPaletteFromArray(kit.palette),
        fontFamily: kit.defaultFont,
        accentLock: true,
      }),
    );
    toast.success(`Loaded kit "${kit.name}"`);
  }, []);

  const handleSaveBrandReferences = useCallback((refs: BrandReferenceAsset[]) => {
    if (!currentProject) return;
    saveBrandReferences(currentProject.id, refs);
    toast.success(`Saved ${refs.length} brand reference${refs.length === 1 ? '' : 's'} for ${currentProject.name}`);
  }, [currentProject]);

  const appendGeneration = (gen: Generation) => {
    setGenerations(prev => {
      const next = [gen, ...prev];
      saveGenerations(next);
      return next;
    });
  };

  const updateGenerations = (newGens: Generation[]) => {
    setGenerations(newGens);
    saveGenerations(newGens);
  };

  const persistModelChoice = (patch: Parameters<typeof saveModelPreferences>[0]) => {
    saveModelPreferences(patch);
  };

  const handlePlanningChange = (v: string) => {
    setSelectedPlanningModel(v);
    persistModelChoice({ planningModel: v });
  };

  const handleImageChange = (v: string) => {
    setSelectedImageModel(v);
    persistModelChoice({ imageModel: v });
  };

  const handleVideoChange = (v: string) => {
    setSelectedVideoModel(v);
    persistModelChoice({ videoModel: v });
  };

  const handleVoiceChange = (v: string) => {
    setSelectedVoiceModel(v);
    const savedVoice = loadModelPreferences().voiceSelections?.[v];
    const rawVoice = savedVoice ?? getDefaultVoiceForModel(v);
    const voiceId = resolveTtsVoice(resolveVoiceModelId(v), rawVoice);
    setSelectedVoiceId(voiceId);
    persistModelChoice({ voiceModel: v, voiceId });
  };

  const handleVoiceIdChange = (voiceId: string) => {
    setSelectedVoiceId(voiceId);
    const prefs = loadModelPreferences();
    persistModelChoice({
      voiceId,
      voiceSelections: { ...prefs.voiceSelections, [selectedVoiceModel]: voiceId },
    });
  };

  const handleMaximizeLocalChange = (v: boolean) => {
    setMaximizeLocal(v);
    persistModelChoice({ maximizeLocal: v });
  };

  const handleQualityBoostChange = (v: boolean) => {
    setQualityBoost(v);
    persistModelChoice({ qualityBoost: v });
  };

  const handleApplyModelPreset = useCallback((presetId: PipelinePresetId) => {
    const stack = applyForgeFactoryPreset(presetId);
    setSelectedPlanningModel(stack.planningModel);
    setSelectedImageModel(stack.imageModel);
    setSelectedVideoModel(stack.videoModel);
    setSelectedVoiceModel(stack.voiceModel);
    const voiceId = resolveTtsVoice(
      resolveVoiceModelId(stack.voiceModel),
      getDefaultVoiceForModel(stack.voiceModel),
    );
    setSelectedVoiceId(voiceId);
    persistModelChoice({
      planningModel: stack.planningModel,
      imageModel: stack.imageModel,
      videoModel: stack.videoModel,
      voiceModel: stack.voiceModel,
      voiceId,
    });
    toast.success('Loaded preset from ForgeFactoryModels.md', {
      description: `${stack.planningModel.split('/').pop()} · ${stack.imageModel.split('/').pop()} · ${stack.videoModel.split('/').pop()} · ${stack.voiceModel.split('/').pop()}`,
    });
  }, []);

  const getEffectiveModels = useCallback(() => {
    return resolveEffectiveModels(qualityBoost, selectedPlanningModel, selectedImageModel);
  }, [qualityBoost, selectedPlanningModel, selectedImageModel]);

  const getTemplateDurationMs = useCallback((_templateId?: TemplateId | null) => {
    return videoControls.lengthSec * 1000;
  }, [videoControls.lengthSec]);

  const handleControlsChange = useCallback((patch: Partial<VideoControls>) => {
    setVideoControls((prev) => mergeControls({ ...prev, ...patch }));
  }, []);

  const handleLoadPreset = useCallback((presetId: string) => {
    try {
      const bundle = loadPremiumPreset(presetId);
      setVideoControls(bundle.controls);
      setStudioGoal(bundle.goal);
      setAgenticGoal(bundle.goal);
      setActivePresetId(presetId);
      const styleLabel = bundle.controls.videoStyle?.replace(/-/g, ' ') ?? 'custom';
      toast.success(
        `Loaded ${bundle.label} — ${bundle.controls.lengthSec}s ${bundle.controls.aspectRatio} (${styleLabel})`,
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load preset');
    }
  }, []);

  const handleQualityPresetChange = (v: QualityPreset) => {
    setQualityPreset(v);
    persistModelChoice({ qualityPreset: v });
  };

  const handleTemplateChange = (v: TemplateId | null) => {
    setSelectedTemplate(v);
    persistModelChoice({ selectedTemplate: v });
  };

  const saveApiKeyLocal = (newKey: string) => {
    setApiKey(newKey);
    saveApiKey(newKey);
    toast.success('API key saved securely in localStorage');
  };

  const callModel = useCallback(async (prompt: string, model: string, maxTokens = 2800) => {
    const brandContext = currentProject ? buildBrandContext(currentProject) : '';
    return callOpenRouter(
      [{ role: 'user', content: brandContext ? `${brandContext}\n\n${prompt}` : prompt }],
      model,
      apiKey,
      maxTokens,
    );
  }, [currentProject, apiKey]);

  const runOrchestratorPlanning = useCallback(async (goal: string) => {
    if (!currentProject) throw new Error('No project selected');
    const { planning: effectivePlanning } = getEffectiveModels();

    const result = await runPremiumOrchestrator(
      {
        goal,
        project: currentProject,
        controls: videoControls,
        maximizeLocal,
        templateId: selectedTemplate,
        presetId: activePresetId,
        videoModel: selectedVideoModel,
      },
      {
        planningModel: effectivePlanning,
        callPlanner: (prompt, model, maxTokens) => callModel(prompt, model, maxTokens),
        callImagePrompts: (script) =>
          generateImagePrompts(script, apiKey, getEffectiveModels().image, currentProject, videoControls),
        generateVariants: videoControls.variantCount > 1
          ? (basePlan) =>
              generateVariants(
                basePlan,
                currentProject,
                videoControls,
                effectivePlanning,
                apiKey,
                (prompt, model) => callModel(prompt, model, 3200),
              )
          : undefined,
        refinePlan: apiKey?.trim()
          ? (plan, issues) =>
              callModel(buildRefinementPrompt(currentProject, plan, issues, videoControls), effectivePlanning, 3200)
          : undefined,
      },
    );

    setWorkflowStages(result.stages);
    return result;
  }, [
    currentProject,
    videoControls,
    maximizeLocal,
    selectedTemplate,
    activePresetId,
    selectedVideoModel,
    apiKey,
    getEffectiveModels,
    callModel,
  ]);

  const setStudioStep = (stepId: string, status: StepStatus) => {
    setStudioStepStatuses(prev => ({ ...prev, [stepId]: status }));
  };

  const generateHyperframesPreview = useCallback((
    desc: string,
    hostId: string,
    templateId?: TemplateId | null,
    keyframeImages?: string[]
  ) => {
    const container = document.createElement('div');
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.background = '#060a14';
    container.style.borderRadius = '12px';
    container.style.overflow = 'hidden';

    const profile = currentProject ? getBrandVideoProfile(currentProject) : null;
    const resolvedPalette = resolveBrandPalette(
      videoControls,
      currentProject?.brandPalette ?? currentProject?.colors,
    );
    const brand = currentProject
      ? {
          name: currentProject.name,
          colors: resolvedPalette.accent || currentProject.colors,
          tone: currentProject.tone,
          uiElements: currentProject.uiElements,
          kineticHook: profile?.kineticHook,
          featureLabels: profile?.featureLabels,
          metricLabels: profile?.metricLabels,
          quote: profile?.quote,
          cta: profile?.cta,
          tagline: profile?.tagline,
          brandPalette: resolvedPalette,
          fontFamily: videoControls.fontFamily,
        }
      : { name: 'SaaS', colors: resolvedPalette.accent, brandPalette: resolvedPalette };

    const effectiveTemplate = templateId ?? selectedTemplate;
    const rendererParams = mapToRenderer(videoControls, targetRes.fps);
    const durationMs = rendererParams.durationMs;

    const animation = createSaaSAnimationCanvas(
      container,
      brand,
      desc,
      {
        width: rendererParams.width,
        height: rendererParams.height,
        fps: rendererParams.fps,
        templateId: effectiveTemplate ?? undefined,
        qualityPreset,
        durationMs,
        keyframeImages,
        controls: videoControls,
      }
    );
    setCurrentAnimation(animation);
    setHasHyperPreview(true);

    const previewArea = document.getElementById(hostId);
    if (previewArea) {
      previewArea.innerHTML = '';
      previewArea.appendChild(container);
    }
  }, [currentProject, selectedTemplate, qualityPreset, targetRes, videoControls]);

  const applyGrokKeyframesToStudio = useCallback((keyframes: ReturnType<typeof parseKeyframes>, hyperDesc?: string) => {
    const imagePrompts = keyframes.map((k) => `${k.id}. ${k.prompt}`).join('\n');
    const resolvedHyper = hyperDesc
      ?? (currentProject
        ? extractHyperframesDesc(imagePrompts, currentProject, selectedTemplate, videoControls)
        : '');
    setStudioOutput((prev) => ({
      goal: prev?.goal ?? studioGoal,
      script: prev?.script ?? '',
      imagePrompts,
      hyperDesc: resolvedHyper,
      keyframes,
      timestamp: getTimestamp(),
    }));
    setAgenticState((prev) => ({ ...prev, keyframes, imagePrompts }));
    const kfImages = keyframes.map((k) => k.imageUrl).filter((u): u is string => !!u);
    if (kfImages.length > 0) {
      generateHyperframesPreview(resolvedHyper, 'studio-preview-host', selectedTemplate, kfImages);
    }
  }, [studioGoal, currentProject, selectedTemplate, videoControls, generateHyperframesPreview]);

  const handleGenerateGrokKeyframes = useCallback(async () => {
    if (!currentProject) { toast.error('Select a project first'); return; }
    if (!apiKey?.trim()) { toast.error('OpenRouter API key required'); return; }

    const goal = studioGoal.trim() || `Branded ${currentProject.name} marketing keyframes`;
    setKeyframesGenerating(true);
    toast.info('Generating keyframes with Grok Imagine + full brand lock…');

    try {
      const grokControls = mergeControls({
        ...videoControls,
        brandKitLock: {
          ...videoControls.brandKitLock,
          enabled: true,
          strictBrandLock: videoControls.brandKitLock.strictBrandLock ?? true,
        },
      });
      const brandKit = brandKitFromProject(currentProject, grokControls);
      const model = selectedImageModel.includes('grok-imagine-image')
        ? selectedImageModel
        : GROK_IMAGINE_IMAGE_MODEL;
      const keyframes = await generateBrandedKeyframes(
        grokControls,
        brandKit,
        goal,
        5,
        apiKey,
        {
          model,
          onProgress: (completed) => {
            setStudioOutput((prev) => prev ? { ...prev, keyframes: completed } : prev);
          },
        },
      );
      applyGrokKeyframesToStudio(keyframes);
      const ok = keyframes.filter((k) => k.imageUrl).length;
      if (ok > 0) {
        toast.success(`${ok}/${keyframes.length} Grok Imagine keyframes generated`);
        setStudioStepStatuses((prev) => ({ ...prev, keyframes: 'complete', assembly: 'complete' }));
      } else {
        toast.warning('Grok Imagine keyframe generation failed — check API key and model');
      }
    } finally {
      setKeyframesGenerating(false);
    }
  }, [currentProject, apiKey, studioGoal, videoControls, selectedImageModel, applyGrokKeyframesToStudio]);

  const handleGrokBrandLockTest = useCallback(async () => {
    if (!currentProject) { toast.error('Select a project first'); return; }
    if (!apiKey?.trim()) { toast.error('OpenRouter API key required'); return; }

    setKeyframesGenerating(true);
    toast.info(`Running Grok Imagine Brand Lock Test for ${currentProject.name}…`);

    try {
      const keyframes = await runGrokImagineBrandLockTest(currentProject, videoControls, apiKey, {
        onProgress: (completed) => {
          setStudioOutput((prev) => prev ? { ...prev, keyframes: completed } : prev);
        },
      });
      applyGrokKeyframesToStudio(keyframes);
      const ok = keyframes.filter((k) => k.imageUrl).length;
      if (ok === 4) {
        toast.success('Brand Lock Test passed — 4 consistent keyframes generated');
      } else if (ok > 0) {
        toast.warning(`Brand Lock Test partial — ${ok}/4 keyframes generated`);
      } else {
        toast.error('Brand Lock Test failed — no keyframes generated');
      }
      setStudioStepStatuses((prev) => ({ ...prev, keyframes: ok > 0 ? 'complete' : 'error', assembly: ok > 0 ? 'complete' : prev.assembly }));
    } finally {
      setKeyframesGenerating(false);
    }
  }, [currentProject, apiKey, videoControls, applyGrokKeyframesToStudio]);

  const renderVideo = async (
    _source: 'studio' | 'agentic' | 'hyperframes' | 'library',
    goal: string,
    options?: {
      cloudVideoUrl?: string;
      cloudBlob?: Blob;
      renderNote?: string;
      onStart?: () => void;
      onEnd?: () => void;
    }
  ): Promise<string | null> => {
    const onStart = options?.onStart;
    const onEnd = options?.onEnd;

    // Use cloud video if already generated successfully
    if (options?.cloudVideoUrl && options?.cloudBlob) {
      onStart?.();
      try {
        const ts = getTimestamp();
        const genId = 'vid_' + ts;
        const ext = options.cloudBlob.type.includes('mp4') ? 'mp4' : 'webm';
        const filename = `${(currentProject?.name || 'video').replace(/\s+/g, '')}_cloud_${ts}.${ext}`;
        await downloadBlob(options.cloudBlob, filename);
        await saveVideoBlob(genId, options.cloudBlob);
        const thumb = await captureVideoThumbnail(options.cloudBlob);
        if (thumb) await saveThumbnail(genId, thumb);
        appendGeneration({
          id: genId,
          projectId: currentProject?.id || 'unknown',
          projectName: currentProject?.name || 'SaaS',
          goal,
          timestamp: ts,
          videoName: filename,
          note: options.renderNote ?? `Cloud video (${getModelByValue(selectedVideoModel)?.label ?? selectedVideoModel})`,
          hasStoredVideo: true,
          hasThumbnail: !!thumb,
          durationSec: 8,
        });
        toast.success(`Cloud video saved: ${filename}`);
        return options.cloudVideoUrl;
      } catch (error) {
        toast.error('Cloud video export failed.');
        console.error(error);
        return null;
      } finally {
        onEnd?.();
      }
    }

    if (!currentAnimation) {
      toast.error('Generate the animation preview first');
      return null;
    }

    onStart?.();
    const preset = qualityPreset;
    toast.info(`Rendering local ${preset} video…`);

    try {
      const rendererParams = mapToRenderer(videoControls, targetRes.fps);
      const recordDuration = rendererParams.durationMs;
      const rawBlob = await currentAnimation.record(recordDuration);

      let finalBlob = rawBlob;
      let note = options?.renderNote ?? `Local Hyperframes (${preset})`;

      const resolvedPalette = resolveBrandPalette(
        videoControls,
        currentProject?.brandPalette ?? currentProject?.colors,
      );
      const brand = currentProject
        ? {
            name: currentProject.name,
            accent: resolvedPalette.accent || currentProject.colors,
            tagline: getBrandVideoProfile(currentProject).tagline,
            brandPalette: resolvedPalette,
            fontFamily: videoControls.fontFamily,
          }
        : {
            name: 'ForgeFactory',
            accent: resolvedPalette.accent,
            tagline: 'Marketing preview',
            brandPalette: resolvedPalette,
            fontFamily: videoControls.fontFamily,
          };

      const postResult = await postProcessWithFFmpeg(rawBlob, {
        preset,
        brand,
        durationMs: recordDuration,
        width: rendererParams.width,
        height: rendererParams.height,
        controls: videoControls,
      });
      finalBlob = postResult.blob;
      note = options?.renderNote ?? postResult.note;
      if (!postResult.usedFFmpeg) {
        toast.warning('FFmpeg unavailable — saved as raw WebM (still playable in browsers)');
      }

      const url = URL.createObjectURL(finalBlob);
      const ts = getTimestamp();
      const genId = 'vid_' + ts;
      const ext = postResult.format === 'mp4' ? 'mp4' : 'webm';
      const filename = `${(currentProject?.name || 'video').replace(/\s+/g, '')}_${ts}.${ext}`;
      await downloadBlob(finalBlob, filename);

      await saveVideoBlob(genId, finalBlob);
      const thumb = await captureVideoThumbnail(finalBlob);
      if (thumb) await saveThumbnail(genId, thumb);

      appendGeneration({
        id: genId,
        projectId: currentProject?.id || 'unknown',
        projectName: currentProject?.name || 'SaaS',
        goal,
        timestamp: ts,
        videoName: filename,
        note,
        hasStoredVideo: true,
        hasThumbnail: !!thumb,
        durationSec: Math.round(recordDuration / 1000),
      });

      toast.success(`Video created: ${filename}`);
      return url;
    } catch (error) {
      toast.error('Video render failed. Try again.');
      console.error(error);
      return null;
    } finally {
      onEnd?.();
    }
  };

  const generateVoiceover = async (script: string, voiceId = selectedVoiceId) => {
    const narration = extractNarrationFromScript(script);
    if (!narration) return null;
    const voiceMeta = getModelByValue(selectedVoiceModel);
    const voiceLabel = getVoicesForModel(selectedVoiceModel).find(v => v.id === voiceId)?.label ?? voiceId;
    toast.info(`Generating voiceover with ${voiceMeta?.label ?? 'voice model'} (${voiceLabel})…`);
    const result = await generateVoice(narration, selectedVoiceModel, apiKey, voiceId);
    if (result.success && result.url) {
      toast.success('Voiceover generated');
      return result.url;
    }
    if (result.error) {
      toast.warning(`Voice skipped: ${result.error}`);
    }
    return null;
  };

  const previewVoice = async (voiceId: string) => {
    setVoicePreviewLoading(true);
    const resolvedKey = resolveOpenRouterApiKey(apiKey);
    if (!resolvedKey) {
      toast.error('Please add your OpenRouter API key in Settings to preview voices.');
      setVoicePreviewLoading(false);
      return;
    }
    if (resolvedKey !== apiKey) {
      setApiKey(resolvedKey);
    }

    const voice = getVoicesForModel(selectedVoiceModel).find(v => v.id === voiceId);
    const sample = voice?.previewText ?? 'This is a preview of your selected voice.';

    if (voicePreviewAudioRef.current) {
      voicePreviewAudioRef.current.pause();
      voicePreviewAudioRef.current = null;
    }
    if (voicePreviewUrlRef.current) {
      URL.revokeObjectURL(voicePreviewUrlRef.current);
      voicePreviewUrlRef.current = null;
    }

    try {
      const result = await generateVoiceForPreview(sample, selectedVoiceModel, resolvedKey, voiceId);
      if (result.success && result.url) {
        const audio = new Audio(result.url);
        voicePreviewAudioRef.current = audio;
        voicePreviewUrlRef.current = result.url;
        await audio.play();
        if (result.fallbackUsed) {
          toast.info('Selected TTS route unavailable - played Grok Voice sample instead.');
        } else {
          toast.success(`Playing ${voice?.label ?? voiceId} preview`);
        }
      } else if (result.error === OPENROUTER_KEY_REQUIRED_ERROR) {
        toast.error(getTtsUserMessage(result.error));
      } else {
        toast.warning(getTtsUserMessage(result.error));
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        toast.warning('Browser blocked autoplay — click Preview again.');
      } else {
        toast.warning(err instanceof Error ? err.message : 'Voice preview failed');
      }
    } finally {
      setVoicePreviewLoading(false);
    }
  };

  const generateKeyframesWithImages = async (imagePrompts: string, script: string, imageModel?: string) => {
    const effectiveImage = imageModel ?? getEffectiveModels().image;
    let keyframes = parseKeyframes(imagePrompts);
    if (keyframes.length === 0 && script) {
      keyframes = parseKeyframes(extractKeyframeSection(script));
    }
    if (keyframes.length === 0 || !apiKey?.trim()) {
      return keyframes.map(k => ({ ...k, imageStatus: 'pending' as const }));
    }

    setKeyframesGenerating(true);
    const imageMeta = getModelByValue(effectiveImage);
    const boostNote = qualityBoost ? ' (Quality Boost)' : '';
    toast.info(`Generating ${keyframes.length} keyframe images with ${imageMeta?.label ?? effectiveImage}${boostNote}…`);

    try {
      const withImages = await generateKeyframeImages(
        keyframes.map(k => ({ ...k, imageStatus: 'pending' as const })),
        effectiveImage,
        apiKey,
        (completed) => {
          setStudioOutput(prev => prev ? { ...prev, keyframes: completed } : prev);
          setAgenticState(prev => ({ ...prev, keyframes: completed }));
        },
        currentProject ?? undefined,
        videoControls,
      );

      const successCount = withImages.filter(k => k.imageUrl).length;
      if (successCount > 0) {
        toast.success(`${successCount}/${withImages.length} keyframe images generated`);
      } else {
        toast.warning('Keyframe image generation failed — prompts still available for local render');
      }
      return withImages;
    } finally {
      setKeyframesGenerating(false);
    }
  };

  const runStudioPipeline = async (mode: StudioMode, fromStep?: string) => {
    if (!studioGoal.trim()) { toast.error('Please enter a video goal'); return; }
    if (!currentProject) { toast.error('Please select or add a project'); return; }

    const goal = studioGoal.trim();
    const runRender = mode === 'oneclick' || fromStep === 'render';
    const startFrom = fromStep ?? 'planning';

    setStudioBusy(true);
    setStudioVideoUrl(null);
    if (startFrom === 'planning') {
      setStudioStepStatuses(createInitialStepStatuses());
      setStudioOutput(null);
    }

    const stepOrder = ['planning', 'keyframes', 'assembly', 'render'] as const;
    const startIdx = stepOrder.indexOf(startFrom as typeof stepOrder[number]);
    const stepsToRun = stepOrder.slice(startIdx >= 0 ? startIdx : 0);

    let script = studioOutput?.script ?? '';
    let imagePrompts = studioOutput?.imagePrompts ?? '';
    let hyperDescLocal = studioOutput?.hyperDesc ?? '';
    let keyframes = studioOutput?.keyframes ?? [];

    let activeStep: string | null = null;
    try {
      for (const stepId of stepsToRun) {
        if (stepId === 'render' && !runRender) break;

        activeStep = stepId;
        setStudioCurrentStep(stepId);
        setStudioStep(stepId, 'active');

        if (stepId === 'planning') {
          const { planning: effectivePlanning } = getEffectiveModels();
          const planningMeta = getModelByValue(effectivePlanning);
          const orchestrated = await runOrchestratorPlanning(goal);
          script = orchestrated.script;
          imagePrompts = orchestrated.imagePrompts;
          hyperDescLocal = orchestrated.hyperDesc;

          if (orchestrated.variantResults.length > 1) {
            toast.info(`Generated ${orchestrated.variantResults.length} variants (${videoControls.variantStrategy})`);
          }
          if (orchestrated.planRefined) {
            toast.info(`Plan refined (quality score ${orchestrated.qualityScore})`);
          }
          const gatesPassed = orchestrated.premiumGates.filter((g) => g.pass).length;
          toast.info(`Premium gates: ${gatesPassed}/${orchestrated.premiumGates.length} passed`);
          if (orchestrated.comfyPayload.enabled) {
            toast.info(orchestrated.comfyPayload.exportNote);
          }
          if (qualityBoost) {
            toast.info(`Quality Boost: planning via ${planningMeta?.label ?? effectivePlanning}`);
          }
          const voiceAudioUrl = await generateVoiceover(script);
          setStudioOutput(prev => ({
            goal,
            script,
            imagePrompts,
            hyperDesc: hyperDescLocal,
            keyframes: prev?.keyframes ?? [],
            timestamp: prev?.timestamp ?? getTimestamp(),
            voiceAudioUrl: voiceAudioUrl ?? prev?.voiceAudioUrl,
            videoModel: selectedVideoModel,
            voiceModel: selectedVoiceModel,
            controlsSnapshot: orchestrated.controlsSnapshot,
            activePresetId: orchestrated.activePresetId,
            qualityScore: orchestrated.qualityScore,
            planRefined: orchestrated.planRefined,
            premiumGates: orchestrated.premiumGates,
            variantResults: orchestrated.variantResults,
            storyboard: orchestrated.storyboardJson,
            evaluationReport: orchestrated.evaluationReport,
            renderQueue: orchestrated.renderQueue,
            renderNote: maximizeLocal
              ? `Local render mode — ${orchestrated.comfyPayload.exportNote}`
              : `Cloud video will use ${getModelByValue(selectedVideoModel)?.label ?? selectedVideoModel}`,
          }));
        }

        if (stepId === 'keyframes') {
          const { planning: effectivePlanning, image: effectiveImage } = getEffectiveModels();
          if (!script) {
            script = await callModel(
              buildPlanningPrompt(currentProject, goal, {
                maximizeLocal,
                templateId: selectedTemplate,
                durationSec: videoControls.lengthSec,
                localBias: getLocalRenderBias(maximizeLocal),
                controls: videoControls,
              }),
              effectivePlanning,
            );
          }
          imagePrompts = await generateImagePrompts(script, apiKey, effectiveImage, currentProject, videoControls);
          keyframes = parseKeyframes(imagePrompts);
          if (keyframes.length < 3) {
            keyframes = parseKeyframes(extractKeyframeSection(script));
          }
          setStudioOutput(prev => ({
            ...prev,
            goal,
            script: prev?.script || script,
            imagePrompts,
            hyperDesc: prev?.hyperDesc ?? '',
            keyframes,
            timestamp: prev?.timestamp ?? getTimestamp(),
          }));
          keyframes = await generateKeyframesWithImages(imagePrompts, script, effectiveImage);
          setStudioOutput(prev => ({
            ...prev,
            goal,
            script: prev?.script || script,
            imagePrompts,
            hyperDesc: prev?.hyperDesc ?? '',
            keyframes,
            timestamp: prev?.timestamp ?? getTimestamp(),
          }));
        }

        if (stepId === 'assembly') {
          const tpl = selectedTemplate;
          hyperDescLocal = extractHyperframesDesc(script, currentProject, tpl, videoControls);

          // When Maximize Local is on, the planner already got the bias — here we just render the rich template
          const kfImages = keyframes
            .map(k => k.imageUrl)
            .filter((u): u is string => !!u);
          generateHyperframesPreview(hyperDescLocal, 'studio-preview-host', tpl, kfImages);
          setStudioOutput(prev => ({
            ...prev,
            goal,
            script: prev?.script || script,
            imagePrompts: prev?.imagePrompts || imagePrompts,
            hyperDesc: hyperDescLocal,
            keyframes: prev?.keyframes.length ? prev.keyframes : keyframes,
            timestamp: prev?.timestamp ?? getTimestamp(),
          }));
        }

        if (stepId === 'render') {
          const gate = await runPreRenderQualityGate(
            currentProject,
            script,
            keyframes.length,
            keyframes.filter(k => k.imageUrl).length,
            getEffectiveModels().planning,
            apiKey,
            videoControls,
          );
          if (!gate.approved) {
            toast.warning(`Quality gate: ${gate.note ?? 'refining assembly'} — re-running keyframes`);
            imagePrompts = await generateImagePrompts(script, apiKey, getEffectiveModels().image, currentProject, videoControls);
            keyframes = await generateKeyframesWithImages(imagePrompts, script);
            hyperDescLocal = extractHyperframesDesc(script, currentProject, selectedTemplate, videoControls);
            generateHyperframesPreview(
              hyperDescLocal,
              'studio-preview-host',
              selectedTemplate,
              keyframes.map(k => k.imageUrl).filter((u): u is string => !!u),
            );
          }

          setStudioRendering(true);
          let cloudVideoUrl: string | undefined;
          let cloudBlob: Blob | undefined;
          let renderNote = maximizeLocal
            ? 'Local Hyperframes + FFmpeg'
            : undefined;

          if (!maximizeLocal) {
            const videoMeta = getModelByValue(selectedVideoModel);
            const cloudPrompt = injectControlsToPrompt(
              `${currentProject.name} SaaS marketing video: ${goal}. ${script.slice(0, 400)}`,
              videoControls,
            );
            toast.info(`Attempting cloud video with ${videoMeta?.label ?? selectedVideoModel}…`);
            setCloudVideoStatus('Submitting cloud video job…');
            const cloudResult = await generateCloudVideo(
              cloudPrompt,
              selectedVideoModel,
              apiKey,
              {
                controls: videoControls,
                project: currentProject,
                goal,
                duration: Math.min(videoControls.lengthSec, 15),
                aspectRatio: videoControls.aspectRatio === 'custom' ? '16:9' : videoControls.aspectRatio,
                onStatus: (info) => {
                  setCloudVideoStatus(info.message);
                  toast.info(info.message, { id: 'cloud-video-status' });
                },
              }
            );
            setCloudVideoStatus(null);
            if (cloudResult.success && cloudResult.url && cloudResult.blob) {
              cloudVideoUrl = cloudResult.url;
              cloudBlob = cloudResult.blob;
              renderNote = `Cloud video (${videoMeta?.label ?? selectedVideoModel})${cloudResult.cost ? ` — $${cloudResult.cost.toFixed(2)}` : ''}`;
              setStudioOutput(prev => prev ? {
                ...prev,
                cloudVideoUrl,
                renderSource: 'cloud',
                renderNote,
              } : prev);
            } else if (cloudResult.fallbackReason) {
              toast.warning(cloudResult.fallbackReason);
              renderNote = cloudResult.fallbackReason;
              setStudioOutput(prev => prev ? {
                ...prev,
                renderSource: 'cloud-fallback',
                renderNote,
              } : prev);
            }
          }

          const url = await renderVideo('studio', goal, {
            cloudVideoUrl,
            cloudBlob,
            renderNote,
            onEnd: () => setStudioRendering(false),
          });
          if (url) setStudioVideoUrl(url);
          setStudioRendering(false);
        }

        setStudioStep(stepId, 'complete');
      }

      const ts = getTimestamp();
      if (!studioOutput?.timestamp) {
        appendGeneration({
          id: 'gen_' + ts,
          projectId: currentProject.id,
          projectName: currentProject.name,
          goal,
          timestamp: ts,
          script: script.substring(0, 200) + '...',
          note: maximizeLocal ? 'One-Prompt Studio (local)' : 'One-Prompt Studio (cloud+local)',
        });
      }

      if (!runRender) {
        toast.success('Assets ready — review script & keyframes, then click Render Video.');
      } else {
        toast.success('Full video pipeline complete!');
      }
    } catch (err) {
      if (activeStep) setStudioStep(activeStep, 'error');
      toast.error('Pipeline step failed. Try again or re-run the step.');
      console.error(err);
    } finally {
      setStudioBusy(false);
      setStudioRendering(false);
      setStudioCurrentStep(null);
    }
  };

  const runStudioRenderOnly = async () => {
    setStudioCurrentStep('render');
    setStudioStep('render', 'active');
    setStudioRendering(true);

    let cloudVideoUrl = studioOutput?.cloudVideoUrl;
    let cloudBlob: Blob | undefined;
    let renderNote = studioOutput?.renderNote;

    if (!maximizeLocal && !cloudVideoUrl && studioOutput?.script) {
      const videoMeta = getModelByValue(selectedVideoModel);
      toast.info(`Attempting cloud video with ${videoMeta?.label ?? selectedVideoModel}…`);
      const cloudResult = await generateCloudVideo(
        `${currentProject?.name} SaaS video: ${studioGoal}. ${studioOutput.script.slice(0, 400)}`,
        selectedVideoModel,
        apiKey,
      );
      if (cloudResult.success && cloudResult.url && cloudResult.blob) {
        cloudVideoUrl = cloudResult.url;
        cloudBlob = cloudResult.blob;
        renderNote = `Cloud video (${videoMeta?.label ?? selectedVideoModel})`;
      } else if (cloudResult.fallbackReason) {
        toast.warning(cloudResult.fallbackReason);
        renderNote = cloudResult.fallbackReason;
      }
    }

    const url = await renderVideo('studio', studioGoal, {
      cloudVideoUrl,
      cloudBlob,
      renderNote,
      onEnd: () => setStudioRendering(false),
    });
    if (url) {
      setStudioVideoUrl(url);
      setStudioStep('render', 'complete');
    } else {
      setStudioStep('render', 'error');
    }
    setStudioRendering(false);
    setStudioCurrentStep(null);
  };

  const rerunStudioStep = (stepId: string) => {
    runStudioPipeline(studioMode, stepId);
  };

  const waitIfPaused = async () => {
    while (agenticPausedRef.current && !agenticAbortRef.current) {
      await new Promise(r => setTimeout(r, 200));
    }
    return !agenticAbortRef.current;
  };

  const addAgenticToolCall = (call: AgenticToolCall) => {
    setAgenticState(prev => ({ ...prev, toolCalls: [...prev.toolCalls, call] }));
  };

  const updateAgenticToolCall = (id: string, patch: Partial<AgenticToolCall>) => {
    setAgenticState(prev => ({
      ...prev,
      toolCalls: prev.toolCalls.map(c => c.id === id ? { ...c, ...patch } : c),
    }));
  };

  const setAgenticStep = (stepId: string, status: StepStatus) => {
    setAgenticState(prev => ({
      ...prev,
      stepStatuses: { ...prev.stepStatuses, [stepId]: status },
      currentStepId: status === 'active' ? stepId : prev.currentStepId,
    }));
  };

  const runAgenticStep = async (stepId: string, goal: string, existing?: AgenticState) => {
    const state = existing ?? agenticState;
    const makeCall = (tool: string, model: string, modelLabel: string, tier?: string) => {
      const id = `call_${getTimestamp()}_${Math.random().toString(36).slice(2, 6)}`;
      addAgenticToolCall({
        id,
        stepId,
        tool,
        model,
        modelLabel,
        costTier: tier,
        status: 'active',
        message: `Calling ${modelLabel}…`,
        startedAt: Date.now(),
      });
      return id;
    };

    setAgenticStep(stepId, 'active');

    if (stepId === 'planning') {
      const { planning: effectivePlanning } = getEffectiveModels();
      const effectivePlanningMeta = getModelByValue(effectivePlanning);
      const callId = makeCall('co_director', effectivePlanning, effectivePlanningMeta?.label ?? 'Reasoning', effectivePlanningMeta?.costTier);
      const orchestrated = await runOrchestratorPlanning(goal);
      const plan = orchestrated.script;
      updateAgenticToolCall(callId, {
        status: 'complete',
        message: `Co-director workflow: ${orchestrated.stages.filter((s) => s.status === 'complete').length} stages · gates ${orchestrated.premiumGates.filter((g) => g.pass).length}/${orchestrated.premiumGates.length}`,
        endedAt: Date.now(),
      });

      const voiceMeta = getModelByValue(selectedVoiceModel);
      const voiceCallId = makeCall('generate_voice', selectedVoiceModel, voiceMeta?.label ?? 'Voice', voiceMeta?.costTier);
      const voiceAudioUrl = await generateVoiceover(plan);
      updateAgenticToolCall(voiceCallId, {
        status: voiceAudioUrl ? 'complete' : 'error',
        message: voiceAudioUrl ? 'Voiceover generated' : 'Voice generation skipped',
        endedAt: Date.now(),
      });

      const renderNote = maximizeLocal
        ? `Local render — ${orchestrated.comfyPayload.exportNote}`
        : `Cloud video will use ${getModelByValue(selectedVideoModel)?.label ?? selectedVideoModel}`;

      setAgenticState(prev => ({
        ...prev,
        script: plan,
        imagePrompts: orchestrated.imagePrompts,
        hyperDesc: orchestrated.hyperDesc,
        voiceAudioUrl: voiceAudioUrl ?? undefined,
        renderNote,
        controlsSnapshot: orchestrated.controlsSnapshot,
        activePresetId: orchestrated.activePresetId,
        premiumGates: orchestrated.premiumGates,
        variantResults: orchestrated.variantResults,
        storyboard: orchestrated.storyboardJson,
        evaluationReport: orchestrated.evaluationReport,
        renderQueue: orchestrated.renderQueue,
      }));
      return {
        ...state,
        script: plan,
        imagePrompts: orchestrated.imagePrompts,
        hyperDesc: orchestrated.hyperDesc,
        voiceAudioUrl: voiceAudioUrl ?? undefined,
        renderNote,
        controlsSnapshot: orchestrated.controlsSnapshot,
        activePresetId: orchestrated.activePresetId,
        premiumGates: orchestrated.premiumGates,
        variantResults: orchestrated.variantResults,
        storyboard: orchestrated.storyboardJson,
        evaluationReport: orchestrated.evaluationReport,
        renderQueue: orchestrated.renderQueue,
      };
    }

    if (stepId === 'keyframes') {
      const { planning: effectivePlanning, image: effectiveImage } = getEffectiveModels();
      const effectiveImageMeta = getModelByValue(effectiveImage);
      const script = state.script || await callModel(
        buildPlanningPrompt(currentProject!, goal, {
          maximizeLocal,
          templateId: selectedTemplate,
          durationSec: Math.round(getTemplateDurationMs(selectedTemplate) / 1000),
          localBias: getLocalRenderBias(maximizeLocal),
        }),
        effectivePlanning,
      );
      const callId = makeCall('generate_keyframes', effectiveImage, effectiveImageMeta?.label ?? 'Image', effectiveImageMeta?.costTier);
      const prompts = await generateImagePrompts(script, apiKey, effectiveImage, currentProject ?? undefined, videoControls);
      let keyframes = parseKeyframes(prompts);
      if (keyframes.length < 3) keyframes = parseKeyframes(extractKeyframeSection(script));
      updateAgenticToolCall(callId, { status: 'active', message: `${keyframes.length} prompts — generating images…` });
      keyframes = await generateKeyframesWithImages(prompts, script, effectiveImage);
      const imgCount = keyframes.filter(k => k.imageUrl).length;
      updateAgenticToolCall(callId, {
        status: imgCount > 0 ? 'complete' : 'error',
        message: `${imgCount}/${keyframes.length} keyframe images generated`,
        endedAt: Date.now(),
      });
      setAgenticState(prev => ({ ...prev, script, imagePrompts: prompts, keyframes }));
      return { ...state, script, imagePrompts: prompts, keyframes };
    }

    if (stepId === 'assembly') {
      const hyperDescLocal = extractHyperframesDesc(state.script, currentProject!, selectedTemplate, videoControls);
      const callId = makeCall('hyperframes_build', 'local', 'Hyperframes (local)', undefined);
      const kfImages = state.keyframes.map(k => k.imageUrl).filter((u): u is string => !!u);
      generateHyperframesPreview(hyperDescLocal, 'agentic-preview-host', selectedTemplate, kfImages);
      updateAgenticToolCall(callId, { status: 'complete', message: 'Canvas animation assembled locally', endedAt: Date.now() });
      setAgenticState(prev => ({ ...prev, hyperDesc: hyperDescLocal }));
      return { ...state, hyperDesc: hyperDescLocal };
    }

    if (stepId === 'render') {
      setAgenticRendering(true);
      let cloudVideoUrl = state.cloudVideoUrl;
      let cloudBlob: Blob | undefined;
      let renderNote = state.renderNote;

      if (!maximizeLocal && !cloudVideoUrl) {
        const videoMeta = getModelByValue(selectedVideoModel);
        const videoCallId = makeCall('cloud_video', selectedVideoModel, videoMeta?.label ?? 'Video', videoMeta?.costTier);
        toast.info(`Attempting cloud video with ${videoMeta?.label ?? selectedVideoModel}…`);
        setCloudVideoStatus('Submitting cloud video job…');
        const cloudResult = await generateCloudVideo(
          `${currentProject!.name} SaaS video: ${goal}. ${(state.script || '').slice(0, 400)}`,
          selectedVideoModel,
          apiKey,
          {
            onStatus: (info) => {
              setCloudVideoStatus(info.message);
              toast.info(info.message, { id: 'cloud-video-status' });
            },
          }
        );
        setCloudVideoStatus(null);
        if (cloudResult.success && cloudResult.url && cloudResult.blob) {
          cloudVideoUrl = cloudResult.url;
          cloudBlob = cloudResult.blob;
          renderNote = `Cloud video (${videoMeta?.label ?? selectedVideoModel})`;
          updateAgenticToolCall(videoCallId, { status: 'complete', message: 'Cloud video generated', endedAt: Date.now() });
        } else {
          updateAgenticToolCall(videoCallId, {
            status: 'error',
            message: cloudResult.fallbackReason ?? 'Cloud video failed — using local',
            endedAt: Date.now(),
          });
          if (cloudResult.fallbackReason) toast.warning(cloudResult.fallbackReason);
          renderNote = cloudResult.fallbackReason;
        }
      }

      const renderCallId = makeCall(
        maximizeLocal || !cloudVideoUrl ? 'local_render' : 'cloud_export',
        maximizeLocal || !cloudVideoUrl ? 'local' : selectedVideoModel,
        maximizeLocal || !cloudVideoUrl ? 'Hyperframes Recorder' : (getModelByValue(selectedVideoModel)?.label ?? 'Cloud Video'),
        undefined
      );
      const url = await renderVideo('agentic', goal, {
        cloudVideoUrl,
        cloudBlob,
        renderNote,
        onEnd: () => setAgenticRendering(false),
      });
      updateAgenticToolCall(renderCallId, {
        status: url ? 'complete' : 'error',
        message: url ? (cloudVideoUrl ? 'Cloud video exported' : 'Video exported locally') : 'Render failed',
        endedAt: Date.now(),
      });
      if (url) setAgenticVideoUrl(url);
      setAgenticState(prev => ({ ...prev, cloudVideoUrl, renderNote, renderSource: cloudVideoUrl ? 'cloud' : 'local' }));
      return { ...state, cloudVideoUrl, renderNote };
    }

    return state;
  };

  const runAgentic = async (fromStep?: string) => {
    if (!agenticGoal.trim() || !currentProject) {
      toast.error('Enter a goal and select a project');
      return;
    }

    agenticAbortRef.current = false;
    agenticPausedRef.current = false;
    setAgenticBusy(true);

    const goal = agenticGoal.trim();
    const stepOrder = ['planning', 'keyframes', 'assembly'] as const;
    const startIdx = fromStep ? stepOrder.indexOf(fromStep as typeof stepOrder[number]) : 0;

    if (!fromStep) {
      setAgenticState({ ...createInitialAgenticState(), goal, timestamp: getTimestamp() });
      setAgenticVideoUrl(null);
    }

    let workingState: AgenticState = { ...agenticState, goal };

    try {
      for (let i = startIdx >= 0 ? startIdx : 0; i < stepOrder.length; i++) {
        const stepId = stepOrder[i];
        if (!(await waitIfPaused())) break;

        workingState = await runAgenticStep(stepId, goal, workingState);
        setAgenticStep(stepId, 'complete');
      }

      setAgenticState(prev => ({ ...prev, readyToRender: true }));

      const ts = getTimestamp();
      appendGeneration({
        id: 'agent_' + ts,
        projectId: currentProject.id,
        projectName: currentProject.name,
        goal,
        timestamp: ts,
        script: workingState.script?.substring(0, 150) + '...',
        note: maximizeLocal ? 'Agentic Pipeline (local)' : 'Agentic Pipeline (cloud+local)',
      });

      toast.success('Agent ready — review assets and render when satisfied.');
    } catch (err) {
      toast.error('Agent step failed.');
      console.error(err);
    } finally {
      setAgenticBusy(false);
      setAgenticState(prev => ({ ...prev, currentStepId: null, paused: false }));
    }
  };

  const pauseAgentic = () => {
    agenticPausedRef.current = true;
    setAgenticState(prev => ({ ...prev, paused: true }));
    toast.info('Pipeline paused');
  };

  const resumeAgentic = () => {
    agenticPausedRef.current = false;
    setAgenticState(prev => ({ ...prev, paused: false }));
    toast.info('Pipeline resumed');
  };

  const stopAgentic = () => {
    agenticAbortRef.current = true;
    agenticPausedRef.current = false;
    setAgenticBusy(false);
    setAgenticState(prev => ({ ...prev, paused: false, currentStepId: null }));
    toast.info('Pipeline stopped');
  };

  const addProject = () => {
    if (!newProject.name) return;
    const primaryColor = newProject.colors || '#6366f1';
    const proj: Project = {
      id: 'p_' + getTimestamp(),
      name: newProject.name,
      colors: primaryColor,
      brandPalette: deriveBrandPaletteFromColor(primaryColor),
      defaultFont: 'Inter',
      uiElements: newProject.uiElements || 'dashboard, cards',
      tone: newProject.tone || 'premium',
    };
    updateProjects([...projects, proj]);
    setCurrentProjectId(proj.id);
    saveCurrentProjectId(proj.id);
    applyProjectBrandToControls(proj);
    setNewProject({ name: '', colors: '', uiElements: '', tone: '' });
    toast.success('Project added');
  };

  const deleteProject = (id: string) => {
    if (projects.length <= 1) { toast.error('Keep at least one project'); return; }
    const updated = projects.filter(p => p.id !== id);
    updateProjects(updated);
    if (currentProjectId === id) {
      setCurrentProjectId(updated[0].id);
      saveCurrentProjectId(updated[0].id);
    }
    toast.success('Project deleted');
  };

  const deleteGeneration = async (id: string) => {
    await deleteMediaForGeneration(id);
    updateGenerations(generations.filter(g => g.id !== id));
    toast.success('Video removed from library');
  };

  const studioEta = estimateRemainingSeconds(STUDIO_PIPELINE_STEPS, studioStepStatuses, studioCurrentStep);
  const assetsReady = studioStepStatuses.assembly === 'complete' || (studioOutput && studioStepStatuses.keyframes === 'complete');
  const projectAccent =
    currentProject?.brandPalette?.[0]
    ?? currentProject?.colors?.match(/#[0-9A-Fa-f]{6}/)?.[0]
    ?? '#6366f1';
  const projectPalette = currentProject?.brandPalette;

  const renderTabContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <Dashboard
            projects={projects}
            generations={generations}
            onNavigate={setCurrentTab}
            onSelectProject={switchProject}
          />
        );
      case 'studio':
        return (
          <VideoStudio
            studioGoal={studioGoal}
            onGoalChange={setStudioGoal}
            planningModel={selectedPlanningModel}
            imageModel={selectedImageModel}
            videoModel={selectedVideoModel}
            voiceModel={selectedVoiceModel}
            onPlanningChange={handlePlanningChange}
            onImageChange={handleImageChange}
            onVideoChange={handleVideoChange}
            onVoiceChange={handleVoiceChange}
            voiceId={selectedVoiceId}
            onVoiceIdChange={handleVoiceIdChange}
            onVoicePreview={previewVoice}
            voicePreviewLoading={voicePreviewLoading}
            keyframesGenerating={keyframesGenerating}
            cloudVideoStatus={cloudVideoStatus}
            studioMode={studioMode}
            onModeChange={setStudioMode}
            studioOutput={studioOutput}
            stepStatuses={studioStepStatuses}
            currentStep={studioCurrentStep}
            etaSeconds={studioEta}
            isBusy={studioBusy}
            isRendering={studioRendering}
            assetsReady={!!assetsReady}
            videoUrl={studioVideoUrl}
            projectName={currentProject?.name}
            projectId={currentProject?.id}
            projectAccent={projectAccent}
            projectPalette={projectPalette}
            customBrandKits={customBrandKits}
            onSaveProjectBrandDefault={handleSaveProjectBrandDefault}
            onSaveCustomBrandKit={handleSaveCustomBrandKit}
            onLoadCustomBrandKit={handleLoadCustomBrandKit}
            onSaveBrandReferences={handleSaveBrandReferences}
            onGenerateGrokKeyframes={handleGenerateGrokKeyframes}
            onGrokBrandLockTest={handleGrokBrandLockTest}
            onGenerateFull={() => runStudioPipeline('oneclick')}
            onGenerateGuided={() => runStudioPipeline('guided')}
            onRenderVideo={runStudioRenderOnly}
            onRerunStep={rerunStudioStep}
            onRefreshPreview={() => studioOutput && generateHyperframesPreview(
              studioOutput.hyperDesc,
              'studio-preview-host',
              selectedTemplate,
              studioOutput.keyframes.map(k => k.imageUrl).filter((u): u is string => !!u)
            )}
            onReedit={() => { setStudioVideoUrl(null); setStudioStep('render', 'pending'); }}
            onVariation={() => { setStudioVideoUrl(null); runStudioPipeline(studioMode, 'keyframes'); }}
            onDownload={() => studioVideoUrl && toast.success('Video already downloaded during render')}
            // New local render controls (all options selected)
            maximizeLocal={maximizeLocal}
            onMaximizeLocalChange={handleMaximizeLocalChange}
            qualityBoost={qualityBoost}
            onQualityBoostChange={handleQualityBoostChange}
            qualityPreset={qualityPreset}
            onQualityPresetChange={handleQualityPresetChange}
            selectedTemplate={selectedTemplate}
            onTemplateChange={handleTemplateChange}
            videoControls={videoControls}
            onControlsChange={handleControlsChange}
            onLoadPreset={handleLoadPreset}
            activePresetId={activePresetId}
            workflowStages={workflowStages}
          />
        );
      case 'agentic':
        return (
          <AgenticPipeline
            planningModel={selectedPlanningModel}
            imageModel={selectedImageModel}
            videoModel={selectedVideoModel}
            voiceModel={selectedVoiceModel}
            onPlanningChange={handlePlanningChange}
            onImageChange={handleImageChange}
            onVideoChange={handleVideoChange}
            onVoiceChange={handleVoiceChange}
            voiceId={selectedVoiceId}
            onVoiceIdChange={handleVoiceIdChange}
            onVoicePreview={previewVoice}
            voicePreviewLoading={voicePreviewLoading}
            keyframesGenerating={keyframesGenerating}
            cloudVideoStatus={cloudVideoStatus}
            agenticGoal={agenticGoal}
            onGoalChange={setAgenticGoal}
            agenticState={agenticState}
            isBusy={agenticBusy}
            isRendering={agenticRendering}
            videoUrl={agenticVideoUrl}
            projectName={currentProject?.name}
            projectAccent={projectAccent}
            onRun={() => runAgentic()}
            onRerunStep={(step) => {
              if (step === 'render') {
                setAgenticStep('render', 'active');
                runAgenticStep('render', agenticGoal).then(() => setAgenticStep('render', 'complete'));
              } else {
                runAgentic(step);
              }
            }}
            onRender={async () => {
              setAgenticStep('render', 'active');
              await runAgenticStep('render', agenticGoal);
              setAgenticStep('render', 'complete');
            }}
            onPause={pauseAgentic}
            onResume={resumeAgentic}
            onStop={stopAgentic}
            onReedit={() => { setAgenticVideoUrl(null); setAgenticState(prev => ({ ...prev, readyToRender: true })); }}
            onVariation={() => runAgentic('keyframes')}
            // New local render controls (all options selected)
            maximizeLocal={maximizeLocal}
            onMaximizeLocalChange={handleMaximizeLocalChange}
            qualityBoost={qualityBoost}
            onQualityBoostChange={handleQualityBoostChange}
            qualityPreset={qualityPreset}
            onQualityPresetChange={handleQualityPresetChange}
            selectedTemplate={selectedTemplate}
            onTemplateChange={handleTemplateChange}
            videoControls={videoControls}
            onControlsChange={handleControlsChange}
            onLoadPreset={handleLoadPreset}
            activePresetId={activePresetId}
            workflowStages={workflowStages}
            comfyNote={comfyNote}
          />
        );
      case 'models':
        return (
          <ModelLab
            planningModel={selectedPlanningModel}
            imageModel={selectedImageModel}
            videoModel={selectedVideoModel}
            voiceModel={selectedVoiceModel}
            maximizeLocal={maximizeLocal}
            qualityBoost={qualityBoost}
            onPlanningChange={handlePlanningChange}
            onImageChange={handleImageChange}
            onVideoChange={handleVideoChange}
            onVoiceChange={handleVoiceChange}
            voiceId={selectedVoiceId}
            onVoiceIdChange={handleVoiceIdChange}
            onVoicePreview={previewVoice}
            voicePreviewLoading={voicePreviewLoading}
            onMaximizeLocalChange={handleMaximizeLocalChange}
            onApplyPreset={handleApplyModelPreset}
          />
        );
      case 'hyperframes':
        return (
          <Hyperframes
            hyperDesc={hyperDesc}
            onDescChange={setHyperDesc}
            hasPreview={hasHyperPreview}
            hasAnimation={!!currentAnimation}
            isLoading={studioRendering}
            projectName={currentProject?.name}
            onGenerate={() => generateHyperframesPreview(hyperDesc, 'hyper-preview-host', selectedTemplate)}
            onRender={async () => {
              setStudioRendering(true);
              await renderVideo('hyperframes', hyperDesc, { onEnd: () => setStudioRendering(false) });
            }}
            // New controls
            selectedTemplate={selectedTemplate}
            onTemplateChange={handleTemplateChange}
            qualityPreset={qualityPreset}
            onQualityPresetChange={handleQualityPresetChange}
            maximizeLocal={maximizeLocal}
            onMaximizeLocalChange={handleMaximizeLocalChange}
            videoControls={videoControls}
            onControlsChange={handleControlsChange}
            onLoadPreset={handleLoadPreset}
            activePresetId={activePresetId}
            comfyNote={comfyNote}
          />
        );
      case 'library':
        return (
          <Library
            generations={generations}
            projects={projects}
            onPlay={async (gen) => {
              if (gen.hasStoredVideo) {
                const url = await loadVideoBlob(gen.id);
                if (url) {
                  setStudioVideoUrl(url);
                  setStudioGoal(gen.goal);
                  switchProject(gen.projectId);
                  setCurrentTab('studio');
                  toast.success(`Playing "${gen.goal}" from library`);
                  return;
                }
              }
              setStudioGoal(gen.goal);
              switchProject(gen.projectId);
              setCurrentTab('studio');
              toast.info(gen.videoName ? `Loaded "${gen.goal}" — re-render in Studio to preview` : 'Loaded generation — run pipeline to preview');
            }}
            onReedit={(gen) => {
              setStudioGoal(gen.goal);
              switchProject(gen.projectId);
              setCurrentTab('studio');
            }}
            onExport={() => toast.info('Re-render in Studio or Hyperframes to export again')}
            onDelete={deleteGeneration}
          />
        );
      case 'settings':
        return (
          <Settings
            settingsKey={settingsKey}
            onKeyChange={setSettingsKey}
            showKey={showKey}
            onToggleShowKey={() => setShowKey(!showKey)}
            onSaveKey={() => settingsKey.trim() && saveApiKeyLocal(settingsKey.trim())}
            hasApiKey={!!apiKey}
            projects={projects}
            onSwitchProject={switchProject}
            onDeleteProject={deleteProject}
            onAddProject={addProject}
            newProject={newProject}
            onNewProjectChange={setNewProject}
            ffmpegPath={ffmpegPath}
            onFfmpegChange={setFfmpegPath}
            onExportBackup={() => {
              const blob = new Blob([JSON.stringify({ projects, generations, apiKey }, null, 2)], { type: 'application/json' });
              downloadBlob(blob, 'forgefactory_v2_backup.json');
            }}
            onWipeData={() => { if (confirm('Wipe all data?')) { localStorage.clear(); location.reload(); } }}
            onNavigateStudio={() => setCurrentTab('studio')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ModelPricingProvider apiKey={apiKey} activeTab={currentTab}>
      <Toaster position="top-right" richColors closeButton theme="dark" />
      <AppShell
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        projects={projects}
        currentProjectId={currentProjectId}
        onProjectChange={switchProject}
      >
        {renderTabContent()}
      </AppShell>
    </ModelPricingProvider>
  );
}

export default App;
