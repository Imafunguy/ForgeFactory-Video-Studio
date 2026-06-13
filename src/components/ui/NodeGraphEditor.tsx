import { GitBranch } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { VideoControls } from '../../lib/videoControls';

interface NodeGraphEditorProps {
  controls: VideoControls;
  onChange: (patch: Partial<VideoControls>) => void;
  className?: string;
}

export function NodeGraphEditor({ controls, onChange, className }: NodeGraphEditorProps) {
  const graph = controls.nodeGraph;

  return (
    <div className={cn('space-y-2', className)}>
      <label className="flex items-center gap-2 text-xs">
        <input
          type="checkbox"
          checked={graph.enabled}
          onChange={(e) => onChange({
            nodeGraph: { ...graph, enabled: e.target.checked },
          })}
        />
        <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
        <span className="font-semibold text-emerald-300">Node Graph (Canvas stub)</span>
      </label>

      {graph.enabled && (
        <div className="p-2 rounded-lg border border-white/10 bg-[#0c1222]/60 text-[10px] space-y-1.5">
          {graph.templateName && (
            <p className="text-emerald-400/80">Template: {graph.templateName}</p>
          )}
          <div className="flex flex-wrap gap-1">
            {graph.nodes.map((node) => (
              <span
                key={node.id}
                className="px-1.5 py-0.5 rounded bg-indigo-500/15 border border-indigo-500/25 text-indigo-200"
              >
                {node.label}
              </span>
            ))}
          </div>
          {graph.connections.length > 0 && (
            <p className="text-slate-500">
              {graph.connections.map((c) => `${c.from}→${c.to}`).join(' · ')}
            </p>
          )}
          <p className="text-[9px] text-slate-600">Visual editor coming in Step 5 — pipeline params active now.</p>
        </div>
      )}
    </div>
  );
}