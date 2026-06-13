import { useEffect, useState } from 'react';
import { Film, Play, Pencil, Download, Trash2, Search, X } from 'lucide-react';
import type { Project, Generation } from '../../lib/storage';
import { getProjectAccent } from '../../lib/utils';
import { loadThumbnailUrl, loadVideoBlob } from '../../lib/mediaStorage';
import { Button, Card, EmptyState, VideoThumbnail, Badge, Input } from '../ui';

interface LibraryProps {
  generations: Generation[];
  projects: Project[];
  onPlay: (gen: Generation) => void;
  onReedit: (gen: Generation) => void;
  onExport: (gen: Generation) => void;
  onDelete: (id: string) => void;
}

function formatDuration(sec?: number): string | undefined {
  if (!sec) return undefined;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function Library({ generations, projects, onPlay, onReedit, onExport, onDelete }: LibraryProps) {
  const [search, setSearch] = useState('');
  const [filterProject, setFilterProject] = useState('all');
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const [previewGen, setPreviewGen] = useState<Generation | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadThumbs = async () => {
      const next: Record<string, string> = {};
      for (const gen of generations) {
        if (gen.hasThumbnail) {
          const url = await loadThumbnailUrl(gen.id);
          if (url && !cancelled) next[gen.id] = url;
        }
      }
      if (!cancelled) setThumbnails(next);
    };
    loadThumbs();
    return () => { cancelled = true; };
  }, [generations]);

  const openPreview = async (gen: Generation) => {
    if (gen.hasStoredVideo) {
      setPreviewLoading(true);
      setPreviewGen(gen);
      const url = await loadVideoBlob(gen.id);
      setPreviewUrl(url);
      setPreviewLoading(false);
      if (!url) onPlay(gen);
    } else {
      onPlay(gen);
    }
  };

  const closePreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPreviewGen(null);
  };

  const filtered = generations.filter(g => {
    const matchesSearch = g.goal.toLowerCase().includes(search.toLowerCase()) ||
      g.projectName.toLowerCase().includes(search.toLowerCase());
    const matchesProject = filterProject === 'all' || g.projectId === filterProject;
    return matchesSearch && matchesProject;
  });

  if (generations.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <EmptyState
            icon={Film}
            title="Your library is empty"
            description="Videos you create in Video Studio, Agentic Pipeline, or Hyperframes will appear here with thumbnails, metadata, and export actions."
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search videos..."
            className="pl-10"
          />
        </div>
        <select
          value={filterProject}
          onChange={e => setFilterProject(e.target.value)}
          className="bg-[#0c1222] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 min-w-[160px]"
        >
          <option value="all">All Projects</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(gen => {
          const project = projects.find(p => p.id === gen.projectId);
          const accent = getProjectAccent(project?.colors || '#6366f1');
          return (
            <Card key={gen.id} className="p-0 overflow-hidden group">
              <div className="relative">
                <VideoThumbnail
                  projectName={gen.projectName}
                  accent={accent}
                  duration={formatDuration(gen.durationSec)}
                  thumbnailUrl={thumbnails[gen.id]}
                />
                {gen.hasStoredVideo && (
                  <Badge variant="success" className="absolute top-2 left-2 text-[9px]">Replayable</Badge>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => openPreview(gen)}
                    className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <Play className="w-4 h-4 text-white ml-0.5" />
                  </button>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="accent">{gen.projectName}</Badge>
                  {gen.note && <Badge>{gen.note}</Badge>}
                </div>
                <h3 className="text-sm font-medium text-white line-clamp-2 mb-1">{gen.goal}</h3>
                <p className="text-[10px] text-slate-600 mb-4">
                  {new Date(gen.timestamp).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                  {gen.videoName && ` · ${gen.videoName}`}
                </p>

                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" icon={Pencil} className="flex-1" onClick={() => onReedit(gen)}>
                    Re-edit
                  </Button>
                  <Button variant="secondary" size="sm" icon={Download} onClick={() => onExport(gen)} />
                  <Button variant="danger" size="sm" icon={Trash2} onClick={() => onDelete(gen.id)} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-500 text-sm">No videos match your search.</div>
      )}

      {(previewGen || previewLoading) && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={closePreview}>
          <div className="w-full max-w-3xl" onClick={e => e.stopPropagation()}>
          <Card className="p-0 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <div>
                <h3 className="font-semibold text-white line-clamp-1">{previewGen?.goal}</h3>
                <p className="text-[10px] text-slate-500">{previewGen?.projectName} · Library replay</p>
              </div>
              <button onClick={closePreview} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            {previewLoading ? (
              <div className="aspect-video bg-[#0c1222] flex items-center justify-center text-slate-500 text-sm">
                Loading video…
              </div>
            ) : previewUrl ? (
              <video src={previewUrl} controls autoPlay className="w-full aspect-video bg-black" playsInline />
            ) : (
              <div className="aspect-video bg-[#0c1222] flex items-center justify-center text-slate-500 text-sm p-6 text-center">
                No stored video — re-render in Studio to preview
              </div>
            )}
          </Card>
          </div>
        </div>
      )}
    </div>
  );
}