import { useRef, useState, useCallback, useEffect } from 'react';
import { Paintbrush, Plus, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { MotionBrushArea, VideoControls } from '../../lib/videoControls';

interface MotionBrushPanelProps {
  controls: VideoControls;
  onChange: (patch: Partial<VideoControls>) => void;
  className?: string;
  compact?: boolean;
}

const VECTOR_PRESETS = [
  'upward fill fast',
  'downward drift',
  'scale in',
  'pan left',
  'pan right',
  'subtle parallax',
] as const;

export function MotionBrushPanel({ controls, onChange, className, compact }: MotionBrushPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [painting, setPainting] = useState(false);
  const [paintStart, setPaintStart] = useState<{ x: number; y: number } | null>(null);
  const [activeAreaId, setActiveAreaId] = useState<string | null>(null);

  const areas = controls.motionBrush.areas;

  const updateBrush = (nextAreas: MotionBrushArea[]) => {
    onChange({ motionBrush: { areas: nextAreas } });
  };

  const addArea = () => {
    const id = `area-${Date.now()}`;
    const newArea: MotionBrushArea = {
      id,
      desc: `Area ${areas.length + 1}`,
      mask: { x: 0.3, y: 0.3, w: 0.25, h: 0.25 },
      vector: 'upward fill fast',
      intensity: 0.7,
    };
    updateBrush([...areas, newArea]);
    setActiveAreaId(id);
  };

  const removeArea = (id: string) => {
    updateBrush(areas.filter((a) => a.id !== id));
    if (activeAreaId === id) setActiveAreaId(null);
  };

  const updateArea = (id: string, patch: Partial<MotionBrushArea>) => {
    updateBrush(areas.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  };

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#0c1222';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo((w / 4) * i, 0);
      ctx.lineTo((w / 4) * i, h);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, (h / 4) * i);
      ctx.lineTo(w, (h / 4) * i);
      ctx.stroke();
    }

    areas.forEach((area, i) => {
      if (!area.mask) return;
      const mx = area.mask.x * w;
      const my = area.mask.y * h;
      const mw = area.mask.w * w;
      const mh = area.mask.h * h;
      const isActive = area.id === activeAreaId;
      ctx.fillStyle = isActive ? 'rgba(16,185,129,0.35)' : `rgba(99,102,241,${0.15 + area.intensity * 0.25})`;
      ctx.fillRect(mx, my, mw, mh);
      ctx.strokeStyle = isActive ? '#10b981' : '#6366f1';
      ctx.lineWidth = isActive ? 2 : 1;
      ctx.strokeRect(mx, my, mw, mh);
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '10px system-ui';
      ctx.fillText(area.desc ?? `Area ${i + 1}`, mx + 4, my + 12);
    });
  }, [areas, activeAreaId]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleCanvasMouse = (e: React.MouseEvent<HTMLCanvasElement>, down: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas || !activeAreaId) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    if (down) {
      setPainting(true);
      setPaintStart({ x, y });
    } else if (painting && paintStart) {
      const mask = {
        x: Math.min(paintStart.x, x),
        y: Math.min(paintStart.y, y),
        w: Math.abs(x - paintStart.x),
        h: Math.abs(y - paintStart.y),
      };
      if (mask.w > 0.02 && mask.h > 0.02) {
        updateArea(activeAreaId, { mask });
      }
      setPainting(false);
      setPaintStart(null);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
          <Paintbrush className="w-3.5 h-3.5" /> Motion Brush
        </span>
        <button
          type="button"
          onClick={addArea}
          className="flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/20"
        >
          <Plus className="w-3 h-3" /> Add area
        </button>
      </div>

      {!compact && (
        <canvas
          ref={canvasRef}
          width={200}
          height={120}
          className="w-full rounded-lg border border-white/10 cursor-crosshair bg-[#0c1222]"
          onMouseDown={(e) => handleCanvasMouse(e, true)}
          onMouseUp={(e) => handleCanvasMouse(e, false)}
          onMouseLeave={() => { setPainting(false); setPaintStart(null); }}
        />
      )}

      {areas.length === 0 ? (
        <p className="text-[10px] text-slate-500">No brush areas — add one to paint localized motion.</p>
      ) : (
        <div className="space-y-1.5 max-h-32 overflow-y-auto">
          {areas.map((area) => (
            <div
              key={area.id}
              className={cn(
                'p-2 rounded-lg border text-[10px] space-y-1',
                area.id === activeAreaId
                  ? 'border-emerald-500/40 bg-emerald-500/10'
                  : 'border-white/10 bg-[#0c1222]/60',
              )}
              onClick={() => setActiveAreaId(area.id ?? null)}
            >
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={area.desc ?? ''}
                  onChange={(e) => area.id && updateArea(area.id, { desc: e.target.value })}
                  className="flex-1 bg-transparent border-b border-white/10 text-emerald-100 text-[10px] py-0.5"
                  placeholder="Area description"
                />
                <button type="button" onClick={() => area.id && removeArea(area.id)} className="text-slate-500 hover:text-red-400">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              <div className="flex gap-1">
                <select
                  value={typeof area.vector === 'string' ? area.vector : 'custom'}
                  onChange={(e) => area.id && updateArea(area.id, { vector: e.target.value })}
                  className="flex-1 bg-[#0c1222] border border-white/10 rounded px-1 py-0.5 text-[10px]"
                >
                  {VECTOR_PRESETS.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(area.intensity * 100)}
                  onChange={(e) => area.id && updateArea(area.id, { intensity: Number(e.target.value) / 100 })}
                  className="w-16"
                  title={`Intensity ${Math.round(area.intensity * 100)}%`}
                />
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="text-[9px] text-slate-600">Select an area, then paint on canvas to set mask region.</p>
    </div>
  );
}