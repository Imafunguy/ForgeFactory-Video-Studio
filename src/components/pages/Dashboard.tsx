import { motion } from 'framer-motion';
import { Play, Bot, Film, Clock, Cpu, FolderOpen, ArrowRight, Sparkles } from 'lucide-react';
import type { Project, Generation } from '../../lib/storage';
import { PROJECT_DESCRIPTIONS } from '../../lib/constants';
import { getProjectAccent } from '../../lib/utils';
import { Button, Card, StatCard, VideoThumbnail, Badge } from '../ui';

interface DashboardProps {
  projects: Project[];
  generations: Generation[];
  onNavigate: (tab: string) => void;
  onSelectProject: (id: string) => void;
}

export function Dashboard({ projects, generations, onNavigate, onSelectProject }: DashboardProps) {
  const videoCount = generations.length;
  const renderTimeSec = generations.filter(g => g.videoName).length * 15;
  const renderTimeLabel = renderTimeSec >= 60
    ? `${Math.floor(renderTimeSec / 60)}m ${renderTimeSec % 60}s`
    : `${renderTimeSec}s`;

  const handleProjectClick = (id: string) => {
    onSelectProject(id);
    onNavigate('studio');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#0e1528] via-[#0a0f1a] to-[#12102a] p-10"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-600/8 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/4" />

        <div className="relative z-10">
          <Badge variant="accent" className="mb-4">
            <Sparkles className="w-3 h-3 mr-1 inline" /> Premium Local Studio
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.1] max-w-2xl">
            Create stunning SaaS marketing videos —{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
              locally, privately, instantly.
            </span>
          </h1>
          <p className="text-base text-slate-400 mt-4 max-w-xl leading-relaxed">
            Powered by Grok Heavy, Grok Imagine, and local Hyperframes rendering.
            Built for StrataBody, SpeedMend, and ClubCensus marketing at scale.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <Button size="lg" icon={Play} onClick={() => onNavigate('studio')}>
              Create Video
            </Button>
            <Button size="lg" variant="secondary" icon={Bot} onClick={() => onNavigate('agentic')}>
              Start Agentic Pipeline
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Videos Created" value={videoCount} icon={Film} trend={videoCount > 0 ? 'Across all projects' : 'Start your first video'} />
        <StatCard label="Total Render Time" value={renderTimeLabel} icon={Clock} trend="15s per local render" />
        <StatCard label="Models Active" value="4" icon={Cpu} trend="Reasoning + Image + Video + Voice" />
        <StatCard label="Projects" value={projects.length} icon={FolderOpen} trend="Brand profiles loaded" />
      </div>

      {/* Project cards */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white">Your Projects</h2>
          <span className="text-xs text-slate-500">Click to start creating</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {projects.slice(0, 3).map((p, i) => {
            const accent = getProjectAccent(p.colors);
            const desc = PROJECT_DESCRIPTIONS[p.name] || `${p.tone} — ${p.uiElements}`;
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Card hover glow className="p-0 overflow-hidden" onClick={() => handleProjectClick(p.id)}>
                  <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${accent}, ${accent}88)` }} />
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                        style={{ background: `${accent}33`, border: `1px solid ${accent}55` }}
                      >
                        {p.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-lg">{p.name}</h3>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">{p.tone}</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed mb-5 line-clamp-3">{desc}</p>
                    <div className="flex items-center gap-1.5 text-sm font-medium text-indigo-400 group-hover:text-indigo-300 transition-colors">
                      Create video for this project
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Recent videos */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white">Recent Videos</h2>
          {generations.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => onNavigate('library')}>
              View all <ArrowRight className="w-3 h-3" />
            </Button>
          )}
        </div>
        {generations.length === 0 ? (
          <div className="text-center py-10">
            <Film className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No videos yet. Use Video Studio or Agentic Pipeline to create your first.</p>
            <Button className="mt-4" size="sm" icon={Play} onClick={() => onNavigate('studio')}>
              Create your first video
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {generations.slice(0, 6).map(gen => {
              const project = projects.find(p => p.id === gen.projectId);
              const accent = getProjectAccent(project?.colors || '#6366f1');
              return (
                <div key={gen.id} className="group cursor-pointer" onClick={() => onNavigate('library')}>
                  <VideoThumbnail
                    projectName={gen.projectName}
                    accent={accent}
                    duration={gen.videoName ? '0:15' : undefined}
                  />
                  <div className="mt-2.5">
                    <p className="text-sm font-medium text-white truncate">{gen.goal}</p>
                    <p className="text-[10px] text-slate-600 mt-0.5">
                      {new Date(gen.timestamp).toLocaleDateString()} · {gen.note}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}