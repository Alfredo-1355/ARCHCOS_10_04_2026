import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType, ProjectContextType } from '../types/dashboard';
import { db } from '../config/firebase';
import { USERS } from '../constants/dashboard';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const useProjects = () => {
    const context = useContext(ProjectContext);
    if (context === undefined) {
        throw new Error('useProjects must be used within a ProjectProvider');
    }
    return context;
};

// ============================================
// Auth Provider
// ============================================
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>(null);

    // Initial check from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('arch_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = (email: string, password: string) => {
        const cleanEmail = (email || '').trim().toLowerCase();
        const cleanPassword = (password || '').trim();

        // Buscar el usuario en la base de datos local
        const userFound = USERS.find(u => u.email.toLowerCase() === cleanEmail);

        // Si existe y la contraseña es correcta (ARCHCOS2026 o la definida en su perfil)
        if (userFound && (cleanPassword === 'ARCHCOS2026' || cleanPassword === userFound.password)) {
            const loggedInUser = { 
                id: userFound.id, 
                name: userFound.name, 
                email: userFound.email, 
                role: userFound.role,
                initials: userFound.initials,
                color: userFound.color
            };
            
            setUser(loggedInUser);
            // Guardar localmente
            localStorage.setItem('arch_user', JSON.stringify(loggedInUser));
            window.location.hash = '#/dashboard';
            return true;
        }

        return false;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('arch_user');
        window.location.hash = '#/login';
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// ============================================
// Project Provider
// ============================================
export const ProjectProvider = ({ children }: { children: React.ReactNode }) => {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
    const [editingProject, setEditingProject] = useState<any>(null);
    
    // UI Global States
    const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
    const [paretoFocus, setParetoFocus] = useState(false);

    // Initial project state from Firebase (Optimized Fetching)
    useEffect(() => {
        setLoading(true);

        // Load persisted active project ID
        const storedActiveId = localStorage.getItem('active_project_id');
        if (storedActiveId) {
            setActiveProjectId(storedActiveId);
        }

        const unsubscribe = db.collection('projects').onSnapshot((snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setProjects(data);
            setLoading(false);
        }, (error) => {
            console.error("Firebase Snapshot Error: ", error);
            setLoading(false);
        });
        
        return () => unsubscribe();
    }, []);

    // Persist active project ID on change
    useEffect(() => {
        if (activeProjectId) {
            localStorage.setItem('active_project_id', activeProjectId);
        }
    }, [activeProjectId]);

    const withTimeout = (promise: Promise<any>, ms = 10000) => {
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Tiempo de espera agotado')), ms));
        return Promise.race([promise, timeout]);
    };

    const addProject = async (p: any) => {
        try {
            const newDoc = db.collection('projects').doc();
            const projectWithId = { 
                ...p, 
                id: p.id || `PRJ-${Math.floor(Math.random() * 9000) + 1000}-${newDoc.id.substring(0, 4)}`,
                createdAt: new Date().toISOString(),
                progress: 0,
                stage: 'PROPUESTA',
                assignments: {},
                progressMap: {}
            };
            await withTimeout(db.collection('projects').doc(projectWithId.id).set(projectWithId));
            return true;
        } catch (e: any) {
            console.error("Error adding project:", e);
            alert(e.message || "Error Firebase: No se pudo guardar el proyecto.");
            return false;
        }
    };

    const updateProject = async (updatedP: any) => {
        try {
            await withTimeout(db.collection('projects').doc(updatedP.id).set(updatedP, { merge: true }));
            setEditingProject(null);
            return true;
        } catch (e: any) {
            console.error("Error updating project:", e);
            alert(e.message || "Error Firebase: No se pudo actualizar el proyecto.");
            return false;
        }
    };

    const startEdit = (p: any) => {
        setEditingProject(p);
        window.location.hash = '#/dashboard/editar';
    };

    const deleteProject = async (id: string) => {
        if (!confirm("¿Seguro que desea eliminar este proyecto permanentemente?")) return;
        try {
            await db.collection('projects').doc(id).delete();
        } catch (e) {
            console.error("Error deleting project:", e);
        }
    };

    return (
        <ProjectContext.Provider value={{ 
            projects, 
            addProject, 
            updateProject, 
            deleteProject, 
            startEdit, 
            editingProject, 
            setEditingProject, 
            activeProjectId, 
            setActiveProjectId,
            loading,
            isCommandPaletteOpen,
            setCommandPaletteOpen,
            paretoFocus,
            setParetoFocus
        }}>
            {children}
        </ProjectContext.Provider>
    );
};
