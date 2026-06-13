import { GitBranch, Plus, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { NodeGraphNode, NodeGraphNodeType, VideoControls } from '../../lib/videoControls';

interface NodeGraphEditorProps {
  controls: VideoControls;
  onChange: (patch: Partial<VideoControls>) => void;
  className?: string;
}

const NODE_TYPES: NodeGraphNodeType[] = [
  'prompt', 'image', 'video', 'motion', 'ref', 'camera', 'audio', 'output',
];

const NODE_COLORS: Record<NodeGraphNodeType, string> = {
  prompt: 'bg-violet-500/20 border-violet-500/30 text-violet-200',
  image: 'bg-indigo-500/20 border-indigo-500/30 text-indigo-200',
  video: 'bg-blue-500/20 border-blue-500/30 text-blue-200',
  motion: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-200',
  ref: 'bg-amber-500/20 border-amber-500/30 text-amber-200',
  camera: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-200',
  audio: 'bg-pink-500/20 border-pink-500/30 text-pink-200',
  output: 'bg-slate-500/20 border-slate-500/30 text-slate-200',
};

export function NodeGraphEditor({ controls, onChange, className }: NodeGraphEditorProps) {
  const graph = controls.nodeGraph;

  const updateGraph = (patch: Partial<typeof graph>) => {
    onChange({ nodeGraph: { ...graph, ...patch } });
  };

  const addNode = () => {
    const id = `node_${Date.now()}`;
    const node: NodeGraphNode = { id, type: 'motion', label: `Node ${graph.nodes.length + 1}` };
    updateGraph({ nodes: [...graph.nodes, node] });
  };

  const removeNode = (id: string) => {
    updateGraph({
      nodes: graph.nodes.filter((n) => n.id !== id),
      connections: graph.connections.filter((c) => c.from !== id && c.to !== id),
    });
  };

  const updateNode = (id: string, patch: Partial<NodeGraphNode>) => {
    updateGraph({
      nodes: graph.nodes.map((n) => (n.id === id ? { ...n, ...patch } : n)),
    });
  };

  const addConnection = (from: string, to: string) => {
    if (!from || !to || from === to) return;
    if (graph.connections.some((c) => c.from === from && c.to === to)) return;
    updateGraph({ connections: [...graph.connections, { from, to }] });
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={graph.enabled}
            onChange={(e) => updateGraph({ enabled: e.target.checked })}
          />
          <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold text-emerald-300">Node Graph</span>
        </label>
        {graph.enabled && (
          <button
            type="button"
            onClick={addNode}
            className="flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/20"
          >
            <Plus className="w-3 h-3" /> Add node
          </button>
        )}
      </div>

      {graph.enabled && (
        <div className="p-2 rounded-lg border border-white/10 bg-[#0c1222]/60 text-[10px] space-y-2">
          {graph.templateName && (
            <p className="text-emerald-400/80">Template: {graph.templateName}</p>
          )}

          {graph.nodes.length > 0 && (
            <div className="relative min-h-[80px] p-2 rounded border border-white/5 bg-black/20">
              <div className="flex flex-wrap gap-1.5 items-start">
                {graph.nodes.map((node, i) => (
                  <div
                    key={node.id}
                    className={cn(
                      'relative px-2 py-1 rounded border text-[9px] min-w-[72px]',
                      NODE_COLORS[node.type],
                    )}
                    style={{ marginTop: (i % 3) * 4 }}
                  >
                    <div className="flex items-center gap-1">
                      <select
                        value={node.type}
                        onChange={(e) => updateNode(node.id, { type: e.target.value as NodeGraphNodeType })}
                        className="bg-transparent border-none text-[8px] p-0 max-w-[52px]"
                      >
                        {NODE_TYPES.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      <button type="button" onClick={() => removeNode(node.id)} className="text-slate-500 hover:text-red-400 ml-auto">
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={node.label}
                      onChange={(e) => updateNode(node.id, { label: e.target.value })}
                      className="w-full bg-transparent border-b border-white/10 text-[9px] mt-0.5 py-0.5"
                    />
                  </div>
                ))}
              </div>
              {graph.connections.length > 0 && (
                <p className="text-slate-500 mt-2 pt-1 border-t border-white/5">
                  {graph.connections.map((c) => `${c.from}→${c.to}`).join(' · ')}
                </p>
              )}
            </div>
          )}

          {graph.nodes.length >= 2 && (
            <div className="flex gap-1 items-center">
              <select id="conn-from" className="flex-1 bg-[#0c1222] border border-white/10 rounded px-1 py-0.5 text-[9px]">
                {graph.nodes.map((n) => (
                  <option key={n.id} value={n.id}>{n.label}</option>
                ))}
              </select>
              <span className="text-slate-600">→</span>
              <select id="conn-to" className="flex-1 bg-[#0c1222] border border-white/10 rounded px-1 py-0.5 text-[9px]">
                {graph.nodes.map((n) => (
                  <option key={n.id} value={n.id}>{n.label}</option>
                ))}
              </select>
              <button
                type="button"
                className="text-[9px] text-emerald-400 px-1.5 py-0.5 border border-emerald-500/20 rounded"
                onClick={() => {
                  const from = (document.getElementById('conn-from') as HTMLSelectElement)?.value;
                  const to = (document.getElementById('conn-to') as HTMLSelectElement)?.value;
                  addConnection(from, to);
                }}
              >
                Link
              </button>
            </div>
          )}

          <p className="text-[9px] text-slate-600">
            {graph.nodes.length} nodes · {graph.connections.length} links — wired to Comfy IPAdapter / AnimateDiff / ControlNet
          </p>
        </div>
      )}
    </div>
  );
}