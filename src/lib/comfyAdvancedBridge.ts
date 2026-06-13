/**
 * Comfy advanced bridge — maps VideoControls + node graph to ComfyUI workflow payloads.
 * Supports IPAdapter strength, AnimateDiff camera, ControlNet, batch variants, frame interp.
 */

import {
  type VideoControls,
  type NodeGraphConfig,
  mapToRenderer,
  parseMotionVector,
  DEFAULT_VIDEO_CONTROLS,
} from './videoControls';

export interface ComfyIPAdapterNode {
  nodeId: string;
  classType: 'IPAdapterApply' | 'IPAdapterEncoder';
  weight: number;
  weightType: 'linear' | 'ease in-out' | 'strong middle';
  refs: string[];
  startAt: number;
  endAt: number;
}

export interface ComfyAnimateDiffNode {
  nodeId: string;
  classType: 'AnimateDiffLoader' | 'AnimateDiffCombine';
  motionScale: number;
  cameraMotion: string;
  fps: number;
  frameCount: number;
  betaSchedule: string;
}

export interface ComfyControlNetNode {
  nodeId: string;
  classType: 'ControlNetApply';
  controlType: 'depth' | 'canny' | 'openpose' | 'camera';
  strength: number;
  startPercent: number;
  endPercent: number;
}

export interface ComfyBatchNode {
  nodeId: string;
  classType: 'BatchPromptSchedule' | 'LatentBatch';
  variantCount: number;
  strategy: string;
  seeds: number[];
}

export interface ComfyInterpNode {
  nodeId: string;
  classType: 'RIFE VFI' | 'FILM VFI' | 'FrameInterp';
  startFrameRef?: string;
  endFrameRef?: string;
  interpFrames: number;
  multiplier: number;
}

export interface ComfyBridgePayload {
  workflowId: string;
  version: string;
  enabled: boolean;
  nodeCount: number;
  controls: VideoControls;
  graph: NodeGraphConfig;
  nodes: Record<string, unknown>;
  ipAdapter: ComfyIPAdapterNode;
  animateDiff: ComfyAnimateDiffNode;
  controlNets: ComfyControlNetNode[];
  batch: ComfyBatchNode;
  interp: ComfyInterpNode;
  motionBrushMasks: Array<{ id: string; mask: unknown; vector: unknown; intensity: number }>;
  prompt: string;
  negativePrompt: string;
  exportNote: string;
}

const CONTROLNET_BY_CAMERA: Record<string, ComfyControlNetNode['controlType']> = {
  static: 'depth',
  'cinematic-pan': 'camera',
  zoom: 'depth',
  dolly: 'depth',
  orbiting: 'camera',
  tracking: 'camera',
  crane: 'depth',
  handheld: 'openpose',
  dynamic: 'canny',
  custom: 'depth',
};

function buildNegativePrompt(controls: VideoControls): string {
  return [
    'blurry UI text', 'brand drift', 'watermark', 'morphing logos',
    'extra limbs', 'low quality', 'generic stock',
    controls.brandIntensity === 'full-lockup' ? 'wrong brand colors' : '',
  ].filter(Boolean).join(', ');
}

function graphToComfyNodes(graph: NodeGraphConfig, controls: VideoControls): Record<string, unknown> {
  const nodes: Record<string, unknown> = {};
  const renderer = mapToRenderer(controls);

  graph.nodes.forEach((node, idx) => {
    const baseId = `ff_${node.id}`;
    switch (node.type) {
      case 'prompt':
        nodes[baseId] = {
          class_type: 'CLIPTextEncode',
          inputs: { text: controls.directorModePlainLang ?? node.label },
        };
        break;
      case 'image':
        nodes[baseId] = {
          class_type: 'LoadImage',
          inputs: { image: node.params?.ref ?? 'hero_frame.png' },
        };
        break;
      case 'ref':
        nodes[baseId] = {
          class_type: 'IPAdapterApply',
          inputs: {
            weight: controls.refConsistencyStrength / 100,
            weight_type: controls.brandKitLock.enabled ? 'strong middle' : 'linear',
            reference: controls.brandKitLock.styleRef ?? 'brand_sheet.png',
          },
        };
        break;
      case 'motion':
        nodes[baseId] = {
          class_type: 'AnimateDiffLoader',
          inputs: {
            motion_scale: renderer.motionScale,
            camera: renderer.cameraMotion,
            fps: renderer.fps,
          },
        };
        break;
      case 'camera':
        nodes[baseId] = {
          class_type: 'ControlNetApply',
          inputs: {
            control_type: CONTROLNET_BY_CAMERA[controls.cameraStyle] ?? 'camera',
            strength: 0.65 + renderer.motionScale * 0.15,
          },
        };
        break;
      case 'audio':
        nodes[baseId] = {
          class_type: 'AudioScheduler',
          inputs: {
            bpm: controls.musicSync?.bpm ?? 120,
            sync_level: controls.musicSyncLevel,
            lip_strength: controls.lipSyncStrength ?? 0,
          },
        };
        break;
      case 'video':
        nodes[baseId] = {
          class_type: 'VHS_VideoCombine',
          inputs: { frame_rate: renderer.fps, format: 'webm' },
        };
        break;
      case 'output':
        nodes[baseId] = {
          class_type: 'SaveImage',
          inputs: { filename_prefix: `ff_${controls.lengthSec}s` },
        };
        break;
      default:
        nodes[baseId] = { class_type: 'Note', inputs: { text: node.label } };
    }
    nodes[`${baseId}_meta`] = { order: idx, label: node.label, type: node.type };
  });

  graph.connections.forEach((conn, i) => {
    nodes[`ff_link_${i}`] = {
      class_type: 'Reroute',
      inputs: { from: `ff_${conn.from}`, to: `ff_${conn.to}` },
    };
  });

  return nodes;
}

/** Build full Comfy bridge payload from controls + optional plan excerpt. */
export function buildComfyPayload(
  controls: VideoControls = DEFAULT_VIDEO_CONTROLS,
  planExcerpt = '',
  goal = '',
): ComfyBridgePayload {
  const renderer = mapToRenderer(controls);
  const frameCount = Math.round((renderer.durationMs / 1000) * renderer.fps);
  const graph = controls.nodeGraph;
  const enabled = graph.enabled || controls.variantCount > 1 || controls.motionBrush.areas.length > 0;

  const ipAdapter: ComfyIPAdapterNode = {
    nodeId: 'ff_ipadapter_0',
    classType: 'IPAdapterApply',
    weight: controls.refConsistencyStrength / 100,
    weightType: controls.brandKitLock.lockStrength >= 90 ? 'strong middle' : 'linear',
    refs: [
      ...(controls.brandKitLock.characterRefs ?? []),
      ...(controls.brandKitLock.propRefs ?? []),
      controls.brandKitLock.styleRef ?? '',
    ].filter(Boolean),
    startAt: 0,
    endAt: controls.brandKitLock.enabled ? 1 : 0.85,
  };

  const animateDiff: ComfyAnimateDiffNode = {
    nodeId: 'ff_animatediff_0',
    classType: 'AnimateDiffLoader',
    motionScale: renderer.motionScale,
    cameraMotion: renderer.cameraMotion,
    fps: renderer.fps,
    frameCount,
    betaSchedule: controls.physicsIntensity === 'high' ? 'sqrt_linear (AnimateDiff)' : 'linear (AnimateDiff)',
  };

  const controlNets: ComfyControlNetNode[] = [
    {
      nodeId: 'ff_controlnet_camera',
      classType: 'ControlNetApply',
      controlType: CONTROLNET_BY_CAMERA[controls.cameraStyle] ?? 'camera',
      strength: 0.55 + renderer.motionScale * 0.2,
      startPercent: 0,
      endPercent: controls.firstLastFrameRefs.end ? 0.92 : 1,
    },
  ];

  if (controls.motionBrush.areas.length > 0) {
    controlNets.push({
      nodeId: 'ff_controlnet_brush',
      classType: 'ControlNetApply',
      controlType: 'canny',
      strength: Math.min(1, 0.5 + controls.motionBrush.areas[0].intensity * 0.4),
      startPercent: 0.15,
      endPercent: 0.85,
    });
  }

  const batch: ComfyBatchNode = {
    nodeId: 'ff_batch_0',
    classType: 'LatentBatch',
    variantCount: Math.max(1, controls.variantCount),
    strategy: controls.variantStrategy,
    seeds: Array.from({ length: Math.min(controls.variantCount, 5) }, (_, i) => 42_000 + i * 137),
  };

  const hasFrameAnchors = !!(controls.firstLastFrameRefs.start || controls.firstLastFrameRefs.end);
  const interp: ComfyInterpNode = {
    nodeId: 'ff_interp_0',
    classType: hasFrameAnchors ? 'FILM VFI' : 'FrameInterp',
    startFrameRef: controls.firstLastFrameRefs.start,
    endFrameRef: controls.firstLastFrameRefs.end,
    interpFrames: hasFrameAnchors ? Math.min(24, Math.round(frameCount * 0.08)) : 0,
    multiplier: hasFrameAnchors ? 2 : 1,
  };

  const motionBrushMasks = controls.motionBrush.areas.map((area) => ({
    id: area.id ?? area.desc ?? 'brush',
    mask: area.mask ?? { x: 0.3, y: 0.3, w: 0.4, h: 0.3 },
    vector: typeof area.vector === 'string' ? parseMotionVector(area.vector) : area.vector,
    intensity: area.intensity,
  }));

  const graphNodes = graph.enabled ? graphToComfyNodes(graph, controls) : {};
  const systemNodes: Record<string, unknown> = {
    [ipAdapter.nodeId]: {
      class_type: ipAdapter.classType,
      inputs: {
        weight: ipAdapter.weight,
        weight_type: ipAdapter.weightType,
        reference_images: ipAdapter.refs,
        start_at: ipAdapter.startAt,
        end_at: ipAdapter.endAt,
      },
    },
    [animateDiff.nodeId]: {
      class_type: animateDiff.classType,
      inputs: {
        motion_scale: animateDiff.motionScale,
        camera_motion: animateDiff.cameraMotion,
        fps: animateDiff.fps,
        frame_count: animateDiff.frameCount,
        beta_schedule: animateDiff.betaSchedule,
      },
    },
    ...Object.fromEntries(
      controlNets.map((cn) => [
        cn.nodeId,
        {
          class_type: cn.classType,
          inputs: {
            control_type: cn.controlType,
            strength: cn.strength,
            start_percent: cn.startPercent,
            end_percent: cn.endPercent,
          },
        },
      ]),
    ),
    [batch.nodeId]: {
      class_type: batch.classType,
      inputs: {
        batch_size: batch.variantCount,
        strategy: batch.strategy,
        seeds: batch.seeds,
      },
    },
    [interp.nodeId]: {
      class_type: interp.classType,
      inputs: {
        start_frame: interp.startFrameRef ?? null,
        end_frame: interp.endFrameRef ?? null,
        interp_frames: interp.interpFrames,
        multiplier: interp.multiplier,
      },
    },
  };

  const allNodes = { ...systemNodes, ...graphNodes };
  const prompt = [
    goal,
    planExcerpt.slice(0, 400),
    `camera:${controls.cameraStyle}`,
    `motion:${controls.motionIntensity}`,
    `ref:${controls.refConsistencyStrength}%`,
  ].filter(Boolean).join(' | ');

  return {
    workflowId: `ff_${graph.templateName ?? 'premium'}_${controls.lengthSec}s`,
    version: '1.0-ultimate',
    enabled,
    nodeCount: Object.keys(allNodes).length,
    controls,
    graph,
    nodes: allNodes,
    ipAdapter,
    animateDiff,
    controlNets,
    batch,
    interp,
    motionBrushMasks,
    prompt,
    negativePrompt: buildNegativePrompt(controls),
    exportNote: enabled
      ? `Comfy bridge active: IPAdapter ${Math.round(ipAdapter.weight * 100)}%, AnimateDiff ${animateDiff.cameraMotion}, ${controlNets.length} ControlNet(s), batch×${batch.variantCount}`
      : 'Comfy bridge standby — enable node graph or brush for advanced path',
  };
}

/** Serialize payload for ComfyUI API POST /prompt */
export function serializeComfyWorkflow(payload: ComfyBridgePayload): string {
  return JSON.stringify(
    {
      prompt: payload.nodes,
      extra_data: {
        forgefactory: {
          workflowId: payload.workflowId,
          controls: payload.controls,
          ipAdapter: payload.ipAdapter,
          animateDiff: payload.animateDiff,
          batch: payload.batch,
          interp: payload.interp,
        },
      },
    },
    null,
    2,
  );
}

/** Check if Comfy advanced path should be used for this render. */
export function shouldUseComfyBridge(controls: VideoControls): boolean {
  return (
    controls.nodeGraph.enabled
    || controls.variantCount > 2
    || controls.motionBrush.areas.length >= 2
    || controls.refConsistencyStrength >= 90
  );
}