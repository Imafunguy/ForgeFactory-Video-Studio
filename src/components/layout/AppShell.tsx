import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Sparkles } from 'lucide-react';
import { TABS } from '../../lib/constants';
import type { Project } from '../../lib/storage';
import { cn } from '../../lib/utils';

interface AppShellProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  projects: Project[];
  currentProjectId: string;
  onProjectChange: (id: string) => void;
  children: React.ReactNode;
}

export function AppShell({
  currentTab,
  onTabChange,
  projects,
  currentProjectId,
  onProjectChange,
  children,
}: AppShellProps) {
  const currentProject = projects.find(p => p.id === currentProjectId);

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-slate-200 flex">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-indigo-600/8 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-violet-600/6 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-500/3 rounded-full blur-[80px]" />
      </div>

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-[240px] z-40 flex flex-col border-r border-white/[0.06] bg-[#080d18]/80 backdrop-blur-2xl">
        {/* Logo */}
        <div className="px-5 pt-6 pb-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="text-white font-bold text-sm tracking-tight">FF</span>
            </div>
            <div>
              <div className="font-bold text-base tracking-tight text-white">ForgeFactory</div>
              <div className="text-[9px] text-slate-500 uppercase tracking-[0.15em] font-semibold">v2 Studio</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative',
                  isActive
                    ? 'text-white bg-indigo-500/15 border border-indigo-500/25'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] border border-transparent'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-400 rounded-r-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-indigo-400' : 'text-slate-600 group-hover:text-slate-400')} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Project selector */}
        <div className="px-4 py-4 border-t border-white/[0.06]">
          <p className="forge-label mb-2 px-1">Active Project</p>
          <div className="relative">
            <select
              value={currentProjectId}
              onChange={e => onProjectChange(e.target.value)}
              className="w-full appearance-none bg-[#0c1222] border border-white/10 rounded-xl px-3 py-2.5 pr-8 text-sm font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 cursor-pointer"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>
          {currentProject && (
            <p className="text-[10px] text-slate-600 mt-2 px-1 truncate">{currentProject.tone}</p>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-[240px] relative z-10">
        {/* Top bar */}
        <header className="sticky top-0 z-30 px-8 py-4 border-b border-white/[0.06] bg-[#0a0f1a]/70 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-white">
                {TABS.find(t => t.id === currentTab)?.label}
              </h1>
              <p className="text-xs text-slate-500">
                {TABS.find(t => t.id === currentTab)?.description}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Local Render Ready</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span className="text-[10px] font-semibold text-indigo-300 uppercase tracking-wider">OpenRouter</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="px-8 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}