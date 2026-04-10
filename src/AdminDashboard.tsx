import React, { useState, useEffect, useContext } from 'react';
import SmartSchedule from './features/SmartSchedule/SmartSchedule';
import LoginPage from './components/dashboard/LoginPage';
import DashboardLayout from './components/dashboard/DashboardLayout';
import ProjectDirectory from './features/ProjectDirectory/ProjectDirectory';
import NewProjectWizard from './features/NewProjectWizard/NewProjectWizard';
import AssignmentModule from './features/AssignmentModule/AssignmentModule';
import ClientConsultPage from './features/ClientConsultPage/ClientConsultPage';
import ProjectDetail from './features/Projects/ProjectDetail';
import ErrorBoundary from './components/dashboard/ErrorBoundary';

// --- CONTEXTS ---
import { AuthContext, ProjectContext, AuthProvider, ProjectProvider } from './contexts/DashboardContext';

const DashboardProvider = () => {
    const [currentPath, setCurrentPath] = useState(window.location.hash || '#/dashboard');

    useEffect(() => {
        const handleHashChange = () => setCurrentPath(window.location.hash);
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const navigate = (path: string) => { window.location.hash = path; };

    return (
        <ErrorBoundary navigate={navigate}>
            <AuthProvider>
                <ProjectProvider>
                    <Router currentPath={currentPath} navigate={navigate} />
                </ProjectProvider>
            </AuthProvider>
        </ErrorBoundary>
    );
};

const Router = ({ currentPath, navigate }: { currentPath: string, navigate: (path: string) => void }) => {
    const { user } = useContext(AuthContext) || {};
    
    if (currentPath === '#/consulta-cliente') return <ProjectDetail navigate={navigate} />;
    if (!user) return <LoginPage navigate={navigate} />;
    
    if (currentPath === '#/dashboard/nuevo' || currentPath === '#/dashboard/editar') {
        return (
            <DashboardLayout navigate={navigate}>
                <NewProjectWizard navigate={navigate} />
            </DashboardLayout>
        );
    }
    
    if (currentPath === '#/dashboard/asignacion') {
        return (
            <DashboardLayout navigate={navigate}>
                <AssignmentModule />
            </DashboardLayout>
        );
    } 
    
    if (currentPath === '#/dashboard/consultas') { 
        return ( 
            <DashboardLayout navigate={navigate}> 
                <ClientConsultPage navigate={navigate} /> 
            </DashboardLayout> 
        ); 
    }
    
    if (currentPath === '#/dashboard/cronograma') {
        return (
            <DashboardLayout navigate={navigate}>
                <SmartSchedule navigate={navigate} />
            </DashboardLayout>
        );
    }
    
    return (
        <DashboardLayout navigate={navigate}>
            <ProjectDirectory navigate={navigate} />
        </DashboardLayout>
    );
};

export default DashboardProvider;