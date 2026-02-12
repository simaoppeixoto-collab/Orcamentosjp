
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import CatalogView from './components/CatalogView';
import BuilderView from './components/BuilderView';
import AIView from './components/AIView';
import { View, Part, Project } from './types';
import { INITIAL_PARTS } from './constants';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>(View.DASHBOARD);
  
  const [parts, setParts] = useState<Part[]>(() => {
    const saved = localStorage.getItem('mpro_parts');
    return saved ? JSON.parse(saved) : INITIAL_PARTS;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('mpro_projects');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('mpro_parts', JSON.stringify(parts));
  }, [parts]);

  useEffect(() => {
    localStorage.setItem('mpro_projects', JSON.stringify(projects));
  }, [projects]);

  const handleAddPart = (newPart: Part) => {
    setParts(prev => [...prev, newPart]);
  };

  const handleDeletePart = (id: string) => {
    setParts(prev => prev.filter(p => p.id !== id));
  };

  const handleSaveProject = (newProject: Project) => {
    setProjects(prev => [...prev, newProject]);
    setActiveView(View.DASHBOARD);
  };

  const handleDeleteProject = (id: string) => {
    if (window.confirm('Tem a certeza que deseja apagar este orçamento permanentemente?')) {
      setProjects(prev => prev.filter(p => p.id !== id));
    }
  };

  const renderView = () => {
    switch (activeView) {
      case View.DASHBOARD:
        return (
          <Dashboard 
            projects={projects} 
            parts={parts} 
            setView={setActiveView} 
            onDeleteProject={handleDeleteProject}
          />
        );
      case View.CATALOG:
        return <CatalogView parts={parts} onAddPart={handleAddPart} onDeletePart={handleDeletePart} />;
      case View.PROJECT_BUILDER:
        return <BuilderView catalog={parts} onSaveProject={handleSaveProject} />;
      case View.AI_GEN:
        return <AIView parts={parts} />;
      default:
        return <Dashboard projects={projects} parts={parts} setView={setActiveView} />;
    }
  };

  return (
    <Layout activeView={activeView} setView={setActiveView}>
      {renderView()}
    </Layout>
  );
};

export default App;
