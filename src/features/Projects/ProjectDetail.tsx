import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Target, Calendar, DollarSign, MapPin, ArrowLeft, 
  CheckCircle2, Clock, ShieldCheck, Mail, MessageSquare,
  FileText, Download, Building2, Briefcase, Zap, 
  ChevronRight, ExternalLink, Hash, LayoutDashboard, MousePointer2
} from 'lucide-react';
import { useProjects } from '../../contexts/DashboardContext';
import { USERS, PROJECT_AREAS, INITIAL_PROJECTS } from '../../constants/dashboard';
import { ClientPortalOverlay } from './components/ClientPortalOverlay';
import { ClientDashboard } from './components/ClientDashboard';
import { DashboardSkeleton, RibbonSkeleton } from './components/ClientPortalSkeleton';

// --- MAIN PORTAL COMPONENT ---

const ProjectDetail: React.FC<{ navigate: (p: string) => void }> = ({ navigate }) => {
  const { projects, activeProjectId } = useProjects();
  const [query, setQuery] = useState('');
  const [localProject, setLocalProject] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Sync with Global Store
  useEffect(() => {
    if (activeProjectId) {
      const p = projects.find(it => it.id === activeProjectId);
      if (p) setLocalProject(p);
    }
  }, [activeProjectId, projects]);

  const handleSearch = () => {
    setLoading(true);
    const q = query.trim().replace(/^#/, '').toUpperCase();
    
    setTimeout(() => {
      const found = projects.find(p => p.id === q || p.id === `PRJ-${q}`);
      setLocalProject(found || null);
      setLoading(false);
      if (!found && query) alert("Contenedor no identificado en la infraestructura ARCHCOS.");
    }, 1200);
  };

  const project = useMemo(() => {
    if (!localProject) return null;
    const seed = INITIAL_PROJECTS.find(p => p.id === localProject.id);
    if (!seed) return localProject;
    
    return {
      ...seed,
      ...localProject,
      budget: localProject.budget || seed.budget,
      totalArea: localProject.totalArea || seed.totalArea,
      progress: localProject.progress || seed.progress,
      assignments: (localProject.assignments && Object.keys(localProject.assignments).length > 0) 
        ? localProject.assignments 
        : seed.assignments,
      estimatedCompletion: localProject.estimatedCompletion || seed.estimatedCompletion,
    };
  }, [localProject]);

  if (!project) {
    return <ClientPortalOverlay query={query} setQuery={setQuery} onSearch={handleSearch} isSearching={loading} onBack={() => navigate('#/login')} />;
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-10 space-y-10">
        <RibbonSkeleton />
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <ClientDashboard 
      project={project} 
      onBack={() => setLocalProject(null)} 
      onDownloadReport={() => window.print()} 
    />
  );
};

export default ProjectDetail;
