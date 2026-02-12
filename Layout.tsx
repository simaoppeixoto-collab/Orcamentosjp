
import React, { useState } from 'react';
import { View } from '../types';
import { LayoutDashboard, BookOpen, Hammer, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeView: View;
  setView: (view: View) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, setView }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-stone-50 overflow-hidden">
      <aside 
        className={`${
          isCollapsed ? 'w-20' : 'w-64'
        } bg-stone-900 text-white flex flex-col shrink-0 transition-all duration-300 ease-in-out relative border-r border-stone-800`}
      >
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 bg-amber-600 text-white p-1 rounded-full shadow-lg z-20 hover:bg-amber-700 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <div className={`p-6 flex items-center gap-3 overflow-hidden ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="bg-amber-600 p-2 rounded-lg shrink-0">
            <Hammer className="w-6 h-6 text-white" />
          </div>
          {!isCollapsed && (
            <h1 className="text-xl font-bold tracking-tight whitespace-nowrap">
              Orçamentos <span className="text-amber-500">JP</span>
            </h1>
          )}
        </div>
        
        <nav className="flex-1 px-3 py-4 space-y-2">
          <button
            onClick={() => setView(View.DASHBOARD)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
              activeView === View.DASHBOARD ? 'bg-amber-600 text-white' : 'text-stone-400 hover:bg-stone-800'
            } ${isCollapsed ? 'justify-center' : ''}`}
          >
            <LayoutDashboard size={20} />
            {!isCollapsed && <span className="font-medium whitespace-nowrap">Dashboard</span>}
          </button>
          
          <button
            onClick={() => setView(View.CATALOG)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
              activeView === View.CATALOG ? 'bg-amber-600 text-white' : 'text-stone-400 hover:bg-stone-800'
            } ${isCollapsed ? 'justify-center' : ''}`}
          >
            <BookOpen size={20} />
            {!isCollapsed && <span className="font-medium whitespace-nowrap">Catálogo</span>}
          </button>
          
          <button
            onClick={() => setView(View.PROJECT_BUILDER)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
              activeView === View.PROJECT_BUILDER ? 'bg-amber-600 text-white' : 'text-stone-400 hover:bg-stone-800'
            } ${isCollapsed ? 'justify-center' : ''}`}
          >
            <Hammer size={20} />
            {!isCollapsed && <span className="font-medium whitespace-nowrap">Novo Orçamento</span>}
          </button>

          <button
            onClick={() => setView(View.AI_GEN)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
              activeView === View.AI_GEN ? 'bg-purple-600 text-white' : 'text-stone-400 hover:bg-stone-800'
            } ${isCollapsed ? 'justify-center' : ''}`}
          >
            <Sparkles size={20} />
            {!isCollapsed && <span className="font-medium whitespace-nowrap">Laboratório IA</span>}
          </button>
        </nav>

        <div className={`p-4 border-t border-stone-800 text-stone-500 text-[10px] text-center overflow-hidden`}>
          {isCollapsed ? 'JP' : `© ${new Date().getFullYear()} Orçamentos JP`}
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-white border-b border-stone-200 flex items-center justify-between px-8 sticky top-0 z-10 shrink-0">
          <h2 className="text-lg font-semibold text-stone-800">
            {activeView === View.DASHBOARD ? 'Projetos Concluídos' : 
             activeView === View.CATALOG ? 'Catálogo de Peças' : 
             activeView === View.AI_GEN ? 'Design Inteligente' : 'Construtor'}
          </h2>
          <div className="flex items-center gap-4 text-sm text-stone-500">
            {new Date().toLocaleDateString('pt-PT')}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
