// @ts-nocheck
import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import ArchplanApp from './App';
import CommercialApp from './CommercialApp';
import { useProjectStore } from './store/projectStore';
import ProjectInfographicDashboard from './components/ProjectInfographicDashboard';
import SmartScheduleView from './components/SmartScheduleView';

        // --- FIREBASE CONFIGURATION ---
        const firebaseConfig = {
            apiKey: "AIzaSyAUmIg_wbjwUI-pITr_tJST-5OruLfyD48",
            authDomain: "archcosbasededatos.firebaseapp.com",
            projectId: "archcosbasededatos",
            storageBucket: "archcosbasededatos.firebasestorage.app",
            messagingSenderId: "897194789991",
            appId: "1:897194789991:web:5161f86f4ea50e149dd8c2",
            measurementId: "G-HJ29K132NV"
        };

        // Initialize Firebase
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        const db = firebase.firestore();
        const auth = firebase.auth();

        // --- MINIMALIST ICONS ---
        const Icons = {
            Building: ({className="w-6 h-6"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M3 21h18M5 21V5h14v16M9 9h6M9 13h6M9 17h6"></path></svg>,
            Check: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 12.611L8.923 17.5 20 6.5"></path></svg>,
            Search: ({className="w-5 h-5"}) => <svg width="1em" height="1em" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"></path></svg>,
            Folder: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M3 7v10h18V9h-9l-2-2H3z"></path></svg>,
            Settings: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M12 15a3 3 0 100-6 3 3 0 000 6z"></path><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"></path></svg>,
            Info: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M12 11v9m0-16h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>,
            LogOut: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M16 17l5-5-5-5M21 12H9M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"></path></svg>,
            Edit: ({className="w-4 h-4"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M11 4H4v16h16v-7m-3-9l4 4-9 9H8v-4l9-9z"></path></svg>,
            Trash: ({className="w-4 h-4"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 002 2h8a2 2 0 002-2l1-12M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"></path></svg>,
            MapPin: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"></path><circle cx="12" cy="10" r="3" strokeWidth="1.5"></circle></svg>,
            Calendar: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>,
            // --- BRAND ICONS ---
            Logo: ({className="h-12", showText=true}) => (
                <div className={`flex items-center gap-4 ${className}`}>
                    <svg className="h-full aspect-square" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="5" y="25" width="60" height="60" rx="15" fill="#D4E6A5" fillOpacity="0.9" />
                        <rect x="35" y="15" width="60" height="60" rx="15" fill="#AED9E6" fillOpacity="0.8" className="backdrop-blur-sm" />
                        <g transform="translate(42, 38)">
                            <rect x="0" y="0" width="16" height="16" fill="white" rx="1" />
                            <rect x="2" y="2" width="5.5" height="5.5" fill="#AED9E6" fillOpacity="0.4" />
                            <rect x="8.5" y="2" width="5.5" height="5.5" fill="#AED9E6" fillOpacity="0.4" />
                            <rect x="2" y="8.5" width="5.5" height="5.5" fill="#AED9E6" fillOpacity="0.4" />
                            <rect x="8.5" y="8.5" width="5.5" height="5.5" fill="#AED9E6" fillOpacity="0.4" />
                        </g>
                    </svg>
                    {showText && (
                        <div className="flex flex-col justify-center">
                            <span className="text-2xl font-bold tracking-tight text-arch-text leading-none">ARCHCOS</span>
                            <span className="text-[8px] font-black tracking-[0.5em] text-arch-text-muted uppercase mt-1">Studio Group</span>
                        </div>
                    )}
                </div>
            ),
            Home: ({className="w-6 h-6"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeWidth="1.2" d="M3 12l9-9 9 9M5 10v11h14V10M9 21v-6h6v6"></path></svg>,
            Store: ({className="w-6 h-6"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeWidth="1.2" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path d="M9 22V12h6v10M12 2v2M4.5 9h15"></path></svg>,
            City: ({className="w-6 h-6"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeWidth="1.2" d="M3 21h18M5 21V7l8-4v18M17 21V11l4-2v12M9 9h0M9 13h0M9 17h0"></path></svg>,
            Transform: ({className="w-6 h-6"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeWidth="1.2" d="M4 4v5h5M20 20v-5h-5M4 9c0 4.418 3.582 8 8 8s8-3.582 8-8M20 15c0-4.418-3.582-8-8-8s-8 3.582-8 8"></path></svg>
        };

        const CATEGORY_ICONS = {
            'Residencial': Icons.Home,
            'Comercial': Icons.Store,
            'Uso Mixto': Icons.City,
            'Cambio de uso': Icons.Transform
        };

        // --- HARDCODED DATA & HELPERS ---
        const USERS = [
            { id: 'u1', email: 'adominguez@archcos.com', password: 'ARCHCOS2026', name: 'Aldo Dominguez', role: 'ADMIN', initials: 'AD', color: '#8b5cf6' },
            { id: 'u2', email: 'acalvo@archcos.com', password: 'ARCHCOS2026', name: 'Arianna Calvo', role: 'COLABORADOR', initials: 'AC', color: '#06b6d4' },
            { id: 'u3', email: 'aavila@archcos.com', password: 'ARCHCOS2026', name: 'Alonso Avila', role: 'COLABORADOR', initials: 'AA', color: '#3b82f6' },
            { id: 'u4', email: 'acruz@archcos.com', password: 'ARCHCOS2026', name: 'Alejandra Cruz', role: 'COLABORADOR', initials: 'AZ', color: '#d946ef' },
            { id: 'u5', email: 'jvalle@archcos.com', password: 'ARCHCOS2026', name: 'Joanna Valle', role: 'COLABORADOR', initials: 'JV', color: '#f59e0b' },
            { id: 'u6', email: 'adrianasarro@archcos.com', password: 'ARCHCOS2026', name: 'Adriana Sarro', role: 'ADMIN', initials: 'AS', color: '#10b981' },
            { id: 'u7', email: 'pmacias@archcos.com', password: 'ARCHCOS2026', name: 'Paola Macias', role: 'COLABORADOR', initials: 'PM', color: '#ec4899' },
            { id: 'u8', email: 'iflores@archcos.com', password: 'ARCHCOS2026', name: 'Irving Flores', role: 'COLABORADOR', initials: 'IF', color: '#6366f1' },
            { id: 'u9', email: 'areyes@archcos.com', password: 'ARCHCOS2026', name: 'Alfredo Reyes', role: 'ADMIN', initials: 'AR', color: '#f43f5e' },
            { id: 'u10', email: 'rgaytan@archcos.com', password: 'ARCHCOS2026', name: 'Ruben Gaytan', role: 'ADMIN', initials: 'RG', color: '#14b8a6' },
        ];

        const INITIAL_PROJECTS = [
            { id: 'PRJ-1001', address: 'The Highland Residence', clientName: 'Fam. Thompson', type: 'Residencial', subtype: 'Custom Homes', procedure: 'Obra Nueva', stage: 'DISEÑO', creator: 'A. Reyes', deliveryDate: '2026-05-10', desc: 'Diseño interior y exterior de villa minimalista', badgeStyle: 'bg-arch-brand-sage/20 text-arch-text', imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80', assignments: { area_grafico: ['u6', 'u5'], area_arquitectonico: ['u2', 'u1'] }, progressMap: { area_investigacion: 100, area_concepto: 80, area_arquitectonico: 40, area_estructural: 20, area_electrico: 0, area_hidro: 0, area_grafico: 60 }, progress: 40, status: 'Finalizando planos arquitectónicos base. Próximo inicio de Ingenierías (MEP).', deliverables: [{ name: 'Concepto_V1.pdf', type: 'PDF' }, { name: 'Planta_Arquitectonica.dwg', type: 'DWG' }] },
            { id: 'PRJ-1002', address: 'Boutique M.', clientName: 'Marcus Fashion Group', type: 'Comercial', subtype: 'Retail', procedure: 'Remodelación', stage: 'EN OBRA', creator: 'R. Gaytan', deliveryDate: '2026-08-15', desc: 'Restauración completa de espacio comercial.', badgeStyle: 'bg-arch-brand-sky/20 text-arch-text', imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80', assignments: {}, progressMap: { area_investigacion: 100, area_concepto: 100, area_arquitectonico: 100, area_estructural: 90, area_electrico: 80, area_hidro: 85, area_grafico: 90 }, progress: 85, status: 'Ejecución de obra en fase de acabados finos y luminarias.', deliverables: [{ name: 'Plano_Instalaciones.pdf', type: 'PDF' }] },
            { id: 'PRJ-1003', address: 'Studio 4A', clientName: 'Creativa S.A.', type: 'Oficinas corporativas', subtype: 'Tenant Build-out', procedure: 'Mantenimiento Mayor', stage: 'REVISIÓN', creator: 'A. Calvo', deliveryDate: '2026-04-20', desc: 'Adecuación de planta libre.', badgeStyle: 'bg-arch-sand text-arch-text opacity-70', imageUrl: 'https://images.unsplash.com/photo-1497215848143-6d53526dc0bb?w=400&q=80', assignments: {}, progressMap: { area_investigacion: 100, area_concepto: 100, area_arquitectonico: 60, area_estructural: 40, area_electrico: 20, area_hidro: 20, area_grafico: 40 }, progress: 65, status: 'En revisión municipal de permisos de ocupación.', deliverables: [{ name: 'Memoria_Calculo.pdf', type: 'PDF' }] },
        ];

        const EMOJI_MAP = {
            'Residencial': '⌂', 'Comercial': '◻', 'Uso Mixto': '⬒', 'Cambio de uso': '◬',
            'Obra Nueva (Permiso)': '◱', 'Obra Nueva': '◱', 'Remodelación / Adecuación': '◩', 'Remodelación': '◩', 'Restauración Histórica': '◪', 'Mantenimiento Mayor': '◧', 'Permiso': '▧', 'Aprobación': '▣', 'Otro': '○'
        };

        const PROJECT_AREAS = [
            { id: 'area_investigacion', title: 'Investigación Preliminar & Información' },
            { id: 'area_concepto', title: 'Diseño & Concept' },
            { id: 'area_arquitectonico', title: 'Proyecto Arquitectónico' },
            { id: 'area_estructural', title: 'Estructural' },
            { id: 'area_electrico', title: 'Instalación Eléctrica' },
            { id: 'area_hidro', title: 'Instalación Hidrosanitaria' },
            { id: 'area_grafico', title: 'Representación Gráfica (Renders)' }
        ];

        const SUBTYPE_OPTIONS = {
            'Residencial': ['Vivienda Unifamiliar', 'Multifamiliar / Depas', 'Vivienda de Interés Social', 'Residencias de Lujo'],
            'Comercial': ['Retail / Locales', 'Restaurantes / Cafés', 'Hospitalidad / Hoteles', 'Clínicas / Salud'],
            'Uso Mixto': ['Residencial + Comercial', 'Oficinas + Comercial', 'Desarrollo Urbano', 'Reutilización Industrial'],
            'Cambio de uso': ['De Comercial a Residencial', 'De Oficina a Vivienda', 'De Bodega a Loft', 'De Terreno a Estacionamiento']
        };

        // --- UTILS ---
        const compressImage = (file, callback) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800;
                    const MAX_HEIGHT = 600;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.6); // 60% quality jpeg
                    callback(dataUrl);
                };
            };
        };

        // --- CONTEXT DEFINITIONS ---
        const AuthContext = createContext();
        const ProjectContext = createContext();

        const AppProvider = ({ children }: { children?: React.ReactNode }) => {
            const [user, setUser] = useState(null);
            const [projects, setProjects] = useState([]);
            const [loading, setLoading] = useState(true);
            const [currentPath, setCurrentPath] = useState(window.location.hash || '#/login');
            const [editingProject, setEditingProject] = useState(null);
            const [activeProjectId, setActiveProjectId] = useState(null);

            // 1. Local Auth Initialization
            useEffect(() => {
                const savedUser = localStorage.getItem('archuser_v2');
                if (savedUser) {
                    setUser(JSON.parse(savedUser));
                }
                setLoading(false);
            }, []);

            // 2. Real-time Project Sync + Auto-Seed Cauteloso
            useEffect(() => {
                const unsubscribe = db.collection('projects').onSnapshot((snapshot) => {
                    const projectsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
                    
                    if (projectsData.length > 0) {
                        setProjects(projectsData);
                    } else if (!localStorage.getItem('archcos_seeded')) {
                        // Si la nube está vacía, subimos los proyectos iniciales una sola vez por seguridad
                        console.log("Base de datos vacía detectada. Iniciando Auto-Seed una vez...");
                        INITIAL_PROJECTS.forEach(async (p) => {
                            try {
                                await db.collection('projects').doc(p.id).set(p);
                            } catch (e) {
                                console.error("Fallo durante Auto-Seed:", e);
                            }
                        });
                        localStorage.setItem('archcos_seeded', 'true');
                    }
                }, (error) => {
                    console.error("Error en conexión en tiempo real:", error);
                    if (error.code === 'permission-denied') {
                        alert("Error de permisos en Firebase. Verifique sus Reglas de Seguridad (Security Rules).");
                    }
                });
                return () => unsubscribe();
            }, []);

            useEffect(() => {
                const handleHashChange = () => setCurrentPath(window.location.hash || '#/login');
                window.addEventListener('hashchange', handleHashChange);
                return () => window.removeEventListener('hashchange', handleHashChange);
            }, []);

            useEffect(() => {
                if (user) {
                    localStorage.setItem('archuser_v2', JSON.stringify(user));
                    if (currentPath === '#/login') window.location.hash = '#/dashboard';
                } else {
                    localStorage.removeItem('archuser_v2');
                    if (!currentPath.includes('#/consulta-cliente')) window.location.hash = '#/login';
                }
            }, [user, currentPath]);

            // SSOT Synchronization
            const globalUpdate = useProjectStore(state => state.updateProject);
            const globalLoad = useProjectStore(state => state.loadProject);
            const globalReset = useProjectStore(state => state.resetProject);

            useEffect(() => {
                if (editingProject) {
                    globalLoad({
                        id: editingProject.id || '',
                        projectName: editingProject.projectName || editingProject.address || '',
                        location: editingProject.address || '',
                        clientName: editingProject.clientName || '',
                        estimatedDeliveryDate: editingProject.deliveryDate || '',
                        type: editingProject.type || 'Residencial',
                        status: editingProject.stage || 'Boceto',
                        timestamp: Date.now()
                    });
                }
            }, [editingProject, globalLoad]);

            const login = (email, password) => {
                console.log("Validando acceso local...");
                const validUser = USERS.find(u => u.email === email && u.password === password);
                if (validUser) {
                    setUser(validUser);
                    return true;
                }
                return false;
            };

            const syncAllUsers = async () => {
                let successCount = 0;
                let errorCount = 0;
                for (const u of USERS) {
                    try {
                        await auth.createUserWithEmailAndPassword(u.email, u.password);
                        successCount++;
                    } catch (e) {
                        if (e.code === 'auth/email-already-in-use') successCount++; // Ya existía, lo contamos como éxito
                        else errorCount++;
                    }
                }
                alert(`Sincronización terminada: ${successCount} usuarios listos en Firebase.`);
            };

            const logout = () => { setUser(null); };

            const withTimeout = (promise, ms = 8000) => {
                let timeoutId;
                const timeout = new Promise((_, reject) => {
                    timeoutId = setTimeout(() => {
                        reject(new Error("Timeout: La base de datos no responde. Verifique su conexión y configuración de Firebase."));
                    }, ms);
                });
                return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
            };

            const addProject = async (p) => {
                const numericIds = projects
                    .map(proj => parseInt(proj.id.split('-')[1]))
                    .filter(id => !isNaN(id));
                
                const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 1000;
                const nextId = "PRJ-" + (maxId + 1);
                
                const newProject = { 
                    id: nextId, 
                    stage: 'PROPUESTA', 
                    badgeStyle: 'bg-arch-sand text-arch-text', 
                    creator: user?.name || 'Sistema', 
                    createdAt: new Date().toISOString(),
                    ...p 
                };
                
                try {
                    await withTimeout(db.collection('projects').doc(nextId).set(newProject, { merge: true }));
                    return true;
                } catch (e) {
                    console.error("Error adding project:", e);
                    alert(e.message || "Error Firebase: No se pudo guardar el proyecto.");
                    return false;
                }
            };

            const updateProject = async (updatedP) => {
                try {
                    await withTimeout(db.collection('projects').doc(updatedP.id).set(updatedP, { merge: true }));
                    setEditingProject(null);
                    return true;
                } catch (e) {
                    console.error("Error updating project:", e);
                    alert(e.message || "Error Firebase: No se pudo actualizar el proyecto.");
                    return false;
                }
            };

            const startEdit = (p) => {
                setEditingProject(p);
                navigate('#/dashboard/editar');
            };

            const deleteProject = async (id) => {
                try {
                    await db.collection('projects').doc(id).delete();
                } catch (e) {
                    console.error("Error deleting project:", e);
                }
            };

            const navigate = (path) => { window.location.hash = path; };

            if (loading) return <div className="min-h-screen bg-white flex items-center justify-center font-sans text-2xl animate-pulse">ARCHCOS...</div>;

            return (
                <AuthContext.Provider value={{ user, login, logout, syncAllUsers }}>
                    <ProjectContext.Provider value={{ projects, addProject, updateProject, deleteProject, startEdit, editingProject, setEditingProject, activeProjectId, setActiveProjectId }}>
                        <Router currentPath={currentPath} navigate={navigate} user={user} />
                    </ProjectContext.Provider>
                </AuthContext.Provider>
            );
        };

        const Router = ({ currentPath, navigate, user }) => {
            const { projects, activeProjectId, setActiveProjectId } = useContext(ProjectContext);
            const activeProject = projects?.find(p => p.id === activeProjectId) || projects?.[0] || {};
            
            if (currentPath === '#/consulta-cliente') return <ClientConsultPage navigate={navigate} />;
            if (!user) return <LoginPage navigate={navigate} />;
            if (currentPath === '#/dashboard/nuevo' || currentPath === '#/dashboard/editar') return <DashboardLayout navigate={navigate}><NewProjectWizard navigate={navigate} /></DashboardLayout>;
            if (currentPath === '#/dashboard/asignacion') return <DashboardLayout navigate={navigate}><AssignmentModule /></DashboardLayout>;
            if (currentPath === '#/dashboard/cronograma') return <DashboardLayout navigate={navigate}><SmartScheduleView project={activeProject} projects={projects || []} onProjectSelect={(id) => setActiveProjectId(id)} navigate={navigate} /></DashboardLayout>;
            return <DashboardLayout navigate={navigate}><DashboardHome navigate={navigate} /></DashboardLayout>;
        };

        // --- LOGIN PAGE (Elegant Split Screen) ---
        const LoginPage = ({ navigate }) => {
            const { login, syncAllUsers } = useContext(AuthContext);
            const [email, setEmail] = useState('');
            const [password, setPassword] = useState('');
            const [error, setError] = useState('');

            const handleLogin = (e) => {
                e.preventDefault();
                setError('');
                if (login(email, password)) {
                    // Login exitoso, AppProvider redirigirá automáticamente
                } else {
                    setError('Credenciales incorrectas. Verifique e intente nuevamente.');
                }
            };

            return (
                <div className="flex min-h-screen w-full font-sans bg-white">
                    {/* Left Form Side */}
                    <div className="w-full lg:w-[45%] flex flex-col justify-center items-center p-12 z-10 slide-up">
                        <div className="max-w-md w-full">
                            <div className="mb-20 flex flex-col items-center lg:items-start">
                                <Icons.Logo className="w-20 h-20 mb-8" />
                                <h1 className="text-5xl font-sans text-arch-text tracking-tight mb-2">ARCHCOS<span className="text-brand-blue">.</span></h1>
                                <p className="text-arch-text-muted font-bold text-[11px] tracking-[0.4em] uppercase">Architecture & Computational Design</p>
                            </div>
                            
                            <div className="space-y-12">
                                <h2 className="text-3xl font-bold text-arch-text border-b border-arch-border pb-8">Acceso de Red Segura</h2>
                                
                                {error && <div className="p-5 border border-red-100 bg-red-50/30 text-red-800 text-xs font-semibold tracking-wide uppercase">{error}</div>}
                                
                                <form onSubmit={handleLogin} className="space-y-10">
                                    <div className="group">
                                        <label className="block text-[10px] font-bold text-arch-text-muted mb-3 tracking-[0.3em] uppercase group-focus-within:text-brand-blue transition-colors">Credential Profile (Email)</label>
                                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                                            className="w-full bg-transparent border-b border-arch-border pb-4 text-arch-text focus:border-brand-blue transition-all placeholder:text-arch-trim font-light text-xl outline-none"
                                            placeholder="profile@archcos.com" />
                                    </div>
                                    <div className="group">
                                        <label className="block text-[10px] font-bold text-arch-text-muted mb-3 tracking-[0.3em] uppercase group-focus-within:text-brand-green transition-colors">Secure Token (Password)</label>
                                        <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                                            className="w-full bg-transparent border-b border-arch-border pb-4 text-arch-text focus:border-brand-green transition-all placeholder:text-arch-trim font-light text-xl tracking-widest outline-none"
                                            placeholder="••••••••" />
                                    </div>
                                    <button type="submit" className="w-full bg-brand-dark-blue hover:bg-brand-ink text-white py-6 transition-all tracking-[0.4em] uppercase text-[10px] font-bold shadow-float hover:shadow-2xl">
                                        Inicializar Sesión
                                    </button>
                                </form>
                                
                                <div className="pt-20 border-t border-arch-border flex flex-col items-center lg:items-start space-y-6">
                                    <button onClick={() => navigate('#/consulta-cliente')} className="text-arch-text-muted hover:text-arch-brand-sky font-bold text-[9px] tracking-[0.3em] uppercase transition-all flex items-center gap-4 group">
                                        <span className="w-8 h-[1px] bg-arch-trim group-hover:w-16 group-hover:bg-arch-brand-sky transition-all"></span>
                                        Portal de Consulta de Clientes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Right Decorative Side */}
                    <div className="hidden lg:block w-[55%] relative overflow-hidden bg-arch-sand">
                        {/* Abstract architectural representation using shapes and borders */}
                        <div className="absolute inset-0 z-0">
                            <div className="absolute left-1/4 top-0 bottom-0 w-[1px] bg-white opacity-20"></div>
                            <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-white opacity-20"></div>
                            <div className="absolute left-3/4 top-0 bottom-0 w-[1px] bg-white opacity-20"></div>
                            <div className="absolute top-1/3 left-0 right-0 h-[1px] bg-white opacity-20"></div>
                            <div className="absolute top-2/3 left-0 right-0 h-[1px] bg-white opacity-20"></div>
                            
                            <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border border-white/20 bg-white/20 backdrop-blur-3xl p-16 flex flex-col justify-end fade-in delay-200">
                                <div className="w-20 h-20 bg-arch-text rounded-full mix-blend-multiply opacity-5 mb-auto"></div>
                                <h3 className="font-bold tracking-tight text-arch-text leading-tight mb-8">Concepto.<br/>Diseño.<br/>Ejecución.</h3>
                                <div className="w-16 h-[2px] bg-brand-blue mb-4"></div>
                                <p className="font-bold tracking-[0.3em] uppercase text-arch-text-muted text-[10px]">The Future of Computational Architecture</p>
                            </div>
                        </div>
                        {/* Soft subtle gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-arch-brand-sky/5 to-transparent z-10 pointer-events-none"></div>
                    </div>
                </div>
            );
        };

        // --- DASHBOARD LAYOUT (Elegant Sidebar) ---
        const DashboardLayout = ({ children, navigate }) => {
            const { user, logout } = useContext(AuthContext);
            const isActive = (path) => window.location.hash === path;

            return (
                <div className="flex h-screen bg-white overflow-hidden text-arch-text">
                    <aside className="w-80 bg-arch-surface border-r border-arch-border flex flex-col justify-between hidden md:flex fade-in z-20">
                        <div className="p-10">
                            <div className="mb-16">
                                <Icons.Logo className="h-10" />
                            </div>
                            
                            <nav className="space-y-2">
                                <p className="text-[10px] font-bold text-arch-text-muted tracking-[0.3em] uppercase mb-6 ml-4">Navegación</p>
                                <button onClick={() => navigate('#/dashboard')} className={`w-full flex items-center gap-4 px-6 py-4 transition-all ${isActive('#/dashboard') || isActive('#/dashboard/nuevo') ? 'bg-brand-blue/15 text-arch-text border-r-4 border-brand-blue' : 'text-arch-text-muted hover:bg-brand-neutral hover:text-arch-text'}`}>
                                    <Icons.Folder />
                                    <span className="font-bold text-[11px] uppercase tracking-widest">Directorio General</span>
                                </button>
                                <button onClick={() => navigate('#/dashboard/asignacion')} className={`w-full flex items-center gap-4 px-6 py-4 transition-all ${isActive('#/dashboard/asignacion') ? 'bg-brand-green/15 text-arch-text border-r-4 border-brand-green' : 'text-arch-text-muted hover:bg-brand-neutral hover:text-arch-text'}`}>
                                    <Icons.Settings className={`w-5 h-5 ${isActive('#/dashboard/asignacion') ? 'text-brand-green' : ''}`} />
                                    <span className="font-bold text-[11px] uppercase tracking-widest">Gestión de Equipo</span>
                                </button>
                                <button onClick={() => navigate('#/dashboard/cronograma')} className={`w-full flex items-center gap-4 px-6 py-4 transition-all ${isActive('#/dashboard/cronograma') ? 'bg-brand-blue/15 text-arch-text border-r-4 border-[#3B82F6]' : 'text-arch-text-muted hover:bg-brand-neutral hover:text-arch-text'}`}>
                                    <Icons.Calendar className={`w-5 h-5 ${isActive('#/dashboard/cronograma') ? 'text-[#3B82F6]' : ''}`} />
                                    <span className="font-bold text-[11px] uppercase tracking-widest">Smart Schedule</span>
                                </button>
                            </nav>
                        </div>
                        
                        <div className="p-10">
                            <button onClick={() => navigate('#/dashboard/nuevo')} className="w-full bg-brand-green/15 border-2 border-brand-green/30 hover:bg-brand-green/25 text-brand-dark-green font-black py-5 shadow-soft transition-all tracking-[0.3em] text-[10px] uppercase mb-10 flex items-center justify-center gap-3 rounded-none">
                                + Nuevo Proyecto
                            </button>
                            
                            <div className="flex items-center justify-between border-t border-arch-border pt-8">
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold uppercase tracking-widest leading-none mb-1">{user?.name}</span>
                                    <span className="text-[9px] text-brand-blue font-black uppercase tracking-widest">{user?.role}</span>
                                </div>
                                <button onClick={logout} className="p-3 hover:bg-arch-sand transition-colors text-arch-text-muted hover:text-arch-text">
                                    <Icons.LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </aside>

                    <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                        {children}
                    </main>
                </div>
            );
        };

        // --- PROJECT DETAILED REPORT ---
        const ProjectDetailedReport = ({ project, onClose }) => {
            const handlePrint = () => {
                window.print();
            };

            return (
                <div className="min-h-screen bg-arch-surface font-sans p-6 md:p-16 print:p-0">
                    <div className="max-w-6xl mx-auto">
                        {/* Header Controls */}
                        <div className="flex justify-between items-center mb-16 no-print">
                            <button onClick={onClose} className="flex items-center gap-3 text-arch-text-muted hover:text-arch-text transition-all group">
                                <div className="w-10 h-10 rounded-full border border-arch-border flex items-center justify-center group-hover:bg-arch-trim transition-all">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                                </div>
                                <span className="font-bold text-[10px] uppercase tracking-widest">Volver al Directorio</span>
                            </button>
                            <div className="flex gap-4">
                                <button onClick={handlePrint} className="flex items-center gap-3 bg-brand-dark-blue hover:bg-brand-ink text-white px-8 py-4 rounded-none transition-all shadow-float group">
                                    <Icons.Logo className="w-4 h-4 invert" showText={false} />
                                    <span className="font-bold text-[10px] uppercase tracking-widest">Descargar Informe PDF</span>
                                </button>
                            </div>
                        </div>

                        {/* Report Canvas */}
                        <div className="bg-white border border-arch-border p-12 md:p-24 shadow-elegant print:shadow-none print:border-none relative overflow-hidden">
                            {/* Watermark Background */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none select-none">
                                <Icons.Logo className="w-[800px] h-[800px]" showText={false} />
                            </div>

                            {/* Section 1: Identity */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24 relative z-10">
                                <div>
                                    <div className="flex items-center gap-3 mb-8 opacity-40">
                                        <div className="w-2 h-2 bg-brand-blue rounded-full"></div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">ARCHCOS Dossier Oficial</span>
                                    </div>
                                    <h1 className="text-6xl font-bold tracking-tighter text-arch-text mb-6 uppercase leading-none">{project.address}</h1>
                                    <div className="flex items-center gap-4 text-arch-text-muted mb-12">
                                        <span className="font-mono text-xs uppercase tracking-widest">Project ID: {project.id}</span>
                                        <span className="w-1 h-1 bg-arch-border rounded-full"></span>
                                        <span className="font-bold text-[10px] uppercase tracking-widest">Status: {project.stage}</span>
                                    </div>
                                    
                                    <div className="space-y-8">
                                        <div className="flex flex-col border-l-2 border-brand-blue pl-6">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-arch-text-muted mb-2">Propietario / Cliente</span>
                                            <span className="text-2xl font-semibold">{project.clientName || 'Sin Especificar'}</span>
                                        </div>
                                        <div className="flex flex-col border-l-2 border-arch-border pl-6">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-arch-text-muted mb-2">Ubicación del Proyecto</span>
                                            <span className="text-lg font-medium">{project.address}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col justify-end items-start lg:items-end text-left lg:text-right">
                                    <div className="mb-12">
                                        <div className={`w-32 h-32 rounded-3xl flex items-center justify-center mb-6 shadow-soft ${project.badgeStyle}`}>
                                            {React.createElement(CATEGORY_ICONS[project.type] || Icons.Building, { className: "w-16 h-16" })}
                                        </div>
                                        <h2 className="text-2xl font-bold uppercase tracking-widest text-arch-text">{project.type}</h2>
                                        <p className="text-arch-text-muted text-[10px] uppercase tracking-widest font-black mt-2">{project.subtype}</p>
                                    </div>
                                    <div className="p-6 bg-brand-neutral border border-arch-border text-center min-w-[200px]">
                                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-arch-text-muted mb-2 block">Fecha Entrega Objetiva</span>
                                        <span className="text-xl font-bold text-brand-dark-blue">{project.deliveryDate || 'TBD'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Summary Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-24 py-12 border-t border-b border-arch-border relative z-10">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-arch-text-muted mb-2">Avance Global</span>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-5xl font-bold tracking-tighter">{project.progress || 0}</span>
                                        <span className="text-xs font-black text-brand-blue">%</span>
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-arch-text-muted mb-2">Entregables Activos</span>
                                    <span className="text-3xl font-semibold">{project.deliverables?.length || 0} Docs</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-arch-text-muted mb-2">Equipo Asignado</span>
                                    <span className="text-3xl font-semibold">{Object.keys(project.assignments || {}).length} Áreas</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-arch-text-muted mb-2">Último Update</span>
                                    <span className="text-xs font-mono">{project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}</span>
                                </div>
                            </div>

                            {/* Section 3: Phase Progress Details */}
                            <div className="space-y-16 relative z-10">
                                <div className="flex items-center gap-4">
                                    <h3 className="text-xs font-black uppercase tracking-[0.4em] text-arch-text whitespace-nowrap">Análisis de Ejecución por Fase</h3>
                                    <div className="h-px w-full bg-arch-border"></div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-12">
                                    {PROJECT_AREAS.map(area => {
                                        const progress = project.progressMap?.[area.id] || 0;
                                        return (
                                            <div key={area.id} className="space-y-4 group">
                                                <div className="flex justify-between items-end">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-arch-text-muted group-hover:text-arch-text transition-colors">{area.title}</span>
                                                    <span className="font-mono text-xs font-bold">{progress}%</span>
                                                </div>
                                                <div className="h-2 w-full bg-arch-bg border border-arch-border relative rounded-full overflow-hidden">
                                                    <div className={`h-full transition-all duration-1000 ${progress === 100 ? 'bg-brand-green' : 'bg-brand-blue'}`} 
                                                         style={{ width: `${progress}%` }}>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Section 4: Project Narrative */}
                            <div className="mt-24 pt-16 border-t border-arch-border relative z-10">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-arch-text-muted mb-8">Estado de Obra & Descripción</h3>
                                <div className="bg-arch-neutral p-10 text-xl font-light text-arch-text leading-relaxed italic border-l-4 border-brand-green">
                                    "{project.status || 'No hay actualizaciones de estado registradas recientemente para este expediente.'}"
                                </div>
                            </div>

                            {/* Section 5: Signature & Branding */}
                            <div className="mt-32 pt-20 border-t border-arch-border flex flex-col md:flex-row justify-between items-center gap-12 relative z-10">
                                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-arch-text-muted">
                                    Emitido por: {project.creator} • ARCHCOS Digital 2026
                                </div>
                                <Icons.Logo className="h-10 opacity-30" />
                            </div>
                        </div>

                        {/* Footer (No Print) */}
                        <div className="mt-12 text-center no-print">
                            <p className="text-[9px] font-bold text-arch-text-muted uppercase tracking-[0.3em] opacity-40">
                                Documento generado dinámicamente bajo arquitectura SSOT (Single Source of Truth).
                            </p>
                        </div>
                    </div>
                </div>
            );
        };

        // --- DASHBOARD HOME ---
        const DashboardHome = ({ navigate }) => {
            const { user } = useContext(AuthContext);
            const { projects, deleteProject, startEdit, updateProject, setActiveProjectId } = useContext(ProjectContext);
            const [searchQuery, setSearchQuery] = useState('');
            const [viewingReportId, setViewingReportId] = useState(null);

            const filteredProjects = projects.filter(p => p.address.toLowerCase().includes(searchQuery.toLowerCase()) || p.type.toLowerCase().includes(searchQuery.toLowerCase()));
            
            const selectedReport = projects.find(p => p.id === viewingReportId);

            
            const stats = [
                { title: '⌾ Obras Activas', value: projects.length, bg: 'bg-brand-green/15' },
                { title: '◨ Fase de Diseño', value: projects.filter(p => ['PROPUESTA', 'DISEÑO'].includes(p.stage)).length, bg: 'bg-brand-blue/15' },
                { title: '◫ Revisión Legal', value: projects.filter(p => p.stage === 'REVISIÓN').length, bg: 'bg-brand-neutral border border-arch-border' },
            ];

            return (
                <div className="p-10 md:p-14 h-full overflow-y-auto slide-up">
                    <header className="flex flex-col md:flex-row md:justify-between md:items-end mb-12 gap-6">
                        <div>
                            <p className="text-[10px] font-black tracking-[0.4em] text-arch-text-muted uppercase mb-3 opacity-40">Gestión Integral ARCHCOS</p>
                            <h1 className="text-4xl font-bold text-arch-text tracking-tight">Hola, {user?.name.split(' ')[0]}.</h1>
                        </div>
                        <div className="flex gap-4">
                            {user?.role === 'ADMIN' && (
                                <button 
                                    onClick={async () => {
                                        if (confirm("¿Deseas subir todos los proyectos iniciales a la nube de Firebase? Esto sobreescribirá datos con el mismo ID.")) {
                                            for (const p of INITIAL_PROJECTS) {
                                                await updateProject(p);
                                            }
                                            alert("Sincronización completa con archcosbasededatos.");
                                        }
                                    }}
                                    className="bg-brand-blue/15 hover:bg-brand-blue/25 text-brand-dark-blue py-3 px-6 text-[10px] font-black tracking-[0.3em] uppercase border border-brand-blue/30 transition-all flex items-center gap-2"
                                >
                                    <Icons.Transform className="w-4 h-4" /> Sincronizar Nube
                                </button>
                            )}
                            <button onClick={() => navigate('#/dashboard/nuevo')} className="bg-brand-green text-brand-dark-green hover:bg-brand-blue py-3 px-6 text-[10px] font-black tracking-[0.3em] uppercase transition-all shadow-sm">
                                + Nuevo Ingreso
                            </button>
                        </div>
                    </header>

                    {/* KPIs - Pastel/Neutral */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        {stats.map((stat, i) => (
                            <div key={i} className={`p-8 rounded-none border border-arch-border relative overflow-hidden ${stat.bg} group transition-all`}>
                                <div className="relative z-10">
                                    <p className="text-xs font-semibold text-arch-text tracking-widest uppercase mb-4 mix-blend-color-burn opacity-70">{stat.title}</p>
                                    <p className="font-sans text-5xl text-arch-text mix-blend-color-burn">{stat.value}</p>
                                </div>
                                <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4"><Icons.Building className="w-32 h-32" /></div>
                            </div>
                        ))}
                    </div>

                    {/* Directory & Search */}
                    <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h3 className="font-bold text-2xl text-arch-text">Directorio de Proyectos</h3>
                        <div className="relative w-full md:w-80 h-10 flex items-center">
                            <Icons.Search className="absolute left-3 text-arch-text-muted w-3.5 h-3.5" />
                            <input type="text" placeholder="Buscar por cliente o ubicación..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 h-full border-b border-arch-border bg-transparent focus:border-arch-text transition-colors text-xs font-light placeholder:text-arch-trim" />
                        </div>
                    </div>

                    <div className="bg-arch-surface border border-arch-border shadow-soft">
                        {filteredProjects.length === 0 ? (
                            <div className="p-12 text-center text-arch-text-muted font-light font-bold font-sans">El archivo se encuentra vacío en este momento.</div>
                        ) : (
                            <div className="divide-y divide-arch-border">
                                {filteredProjects.map((p, i) => (
                                    <div 
                                        key={p.id} 
                                        onDoubleClick={() => setViewingReportId(p.id)}
                                        className="p-6 md:p-8 hover:bg-arch-bg cursor-pointer transition-colors flex flex-col xl:flex-row gap-6 items-start xl:items-center justify-between group"
                                        title="Doble clic para ver informe detallado"
                                    >
                                        
                                        <div className="flex-1 flex gap-6">
                                            <div className="hidden sm:block w-20 h-20 bg-arch-sand border border-arch-border flex-shrink-0 relative group/img overflow-hidden">
                                                {p.imageUrl ? (
                                                    <img src={p.imageUrl} alt={p.address} className="w-full h-full object-cover grayscale mix-blend-multiply opacity-80 group-hover/img:opacity-40 transition-opacity" />
                                                ) : (
                                                    <div className="w-full h-full flex justify-center items-center">
                                                        <span className="font-sans text-arch-text text-xl opacity-60 group-hover/img:opacity-20 transition-opacity">
                                                            {p.id.split('-')[1].substring(0)}
                                                        </span>
                                                    </div>
                                                )}
                                                
                                                <label className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover/img:opacity-100 cursor-pointer transition-opacity text-arch-text bg-white/50 backdrop-blur-sm" title="Cambiar portada">
                                                    <Icons.Folder className="w-4 h-4 mb-1" />
                                                    <span className="text-[8px] tracking-widest uppercase font-semibold">Cambiar</span>
                                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            if (file.size > 20 * 1024 * 1024) return alert("Imagen demasiado grande (máx 20MB)");
                                                            compressImage(file, (dataUrl) => {
                                                                updateProject({...p, imageUrl: dataUrl});
                                                            });
                                                        }
                                                    }} />
                                                </label>
                                            </div>
                                            <div>
                                                <div className="flex flex-wrap items-center gap-3 mb-1">
                                                    <h4 className="font-bold text-xl tracking-tight text-arch-text">{p.address}</h4>
                                                    <span className="text-[10px] text-arch-text-muted tracking-wider font-light">#{p.id}</span>
                                                    {p.clientName && (
                                                        <span className="text-[10px] bg-arch-brand-sky/20 text-arch-text px-2 py-0.5 tracking-widest uppercase font-semibold">Cliente: {p.clientName}</span>
                                                    )}
                                                </div>
                                                <p className="text-sm font-light text-arch-text-muted mb-3 max-w-xl">{p.desc}</p>
                                                
                                                <div className="flex flex-wrap gap-3 text-[10px] tracking-widest uppercase font-semibold items-center">
                                                    <div className="flex items-center gap-3 text-arch-text bg-arch-brand-sage/20 px-3 py-2 border border-arch-brand-sage/30">
                                                        {React.createElement(CATEGORY_ICONS[p.type] || Icons.Building, { className: "w-8 h-8" })}
                                                        <span className="text-xs">{p.type}</span>
                                                    </div>
                                                    <span className="text-arch-trim">•</span>
                                                    <span className="text-arch-text-muted">{p.subtype}</span>
                                                    <span className="text-arch-text-muted hidden sm:inline">{EMOJI_MAP[p.procedure] || ''} {p.procedure}</span>
                                                    
                                                    <div className="flex gap-2 items-center">
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); setActiveProjectId(p.id); navigate('#/dashboard/asignacion'); }}
                                                            className="flex items-center gap-2 text-arch-brand-sky hover:text-arch-text px-3 py-1.5 border border-arch-brand-sky/30 bg-arch-brand-sky/5 hover:bg-arch-brand-sky/10 transition-all text-[9px] font-bold group">
                                                            <Icons.Settings className="w-3 h-3 group-hover:rotate-90 transition-transform" />
                                                            Gestión de Equipo
                                                        </button>
                                                        
                                                        <div className="flex items-center">
                                                            <button 
                                                                onClick={(e) => { 
                                                                    e.stopPropagation(); 
                                                                    if (p.directoryUrl) window.open(p.directoryUrl, '_blank');
                                                                    else if (user?.role === 'ADMIN') {
                                                                       const url = prompt("Introduce la URL de OneDrive/SharePoint para este proyecto:", p.directoryUrl || "");
                                                                       if (url !== null) updateProject({...p, directoryUrl: url});
                                                                    } else {
                                                                       alert("El administrador aún no ha vinculado la carpeta de este proyecto.");
                                                                    }
                                                                }}
                                                                className={`flex items-center gap-2 px-3 py-1.5 border transition-all text-[9px] font-bold group ${p.directoryUrl ? 'text-brand-blue hover:text-white border-brand-blue/30 bg-brand-blue/10 hover:bg-brand-blue' : 'text-arch-text-muted hover:text-arch-text border-arch-border bg-arch-surface hover:bg-arch-border'}`}
                                                            >
                                                                <Icons.Folder className="w-3 h-3 group-hover:scale-110 transition-transform" />
                                                                {p.directoryUrl ? 'Abrir OneDrive' : (user?.role === 'ADMIN' ? '+ Vincular OneDrive' : 'OneDrive No Vinculado')}
                                                            </button>
                                                            {user?.role === 'ADMIN' && p.directoryUrl && (
                                                                <button 
                                                                   onClick={(e) => {
                                                                       e.stopPropagation();
                                                                       const url = prompt("Actualizar URL de OneDrive/SharePoint:", p.directoryUrl || "");
                                                                       if (url !== null) updateProject({...p, directoryUrl: url});
                                                                   }}
                                                                   className="px-2 py-1.5 border-y border-r border-brand-blue/30 bg-brand-blue/5 text-brand-blue hover:bg-brand-blue hover:text-white transition-colors"
                                                                   title="Editar URL de OneDrive"
                                                                >
                                                                   <Icons.Edit className="w-3 h-3" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="w-full xl:w-auto flex items-center justify-between xl:justify-end gap-10">
                                            <div className="text-left xl:text-right">
                                                <p className="text-[10px] font-semibold text-arch-text-muted uppercase tracking-widest mb-1">Fecha Obj.</p>
                                                <p className="text-sm font-medium">{p.deliveryDate || 'TBD'}</p>
                                            </div>
                                            
                                            <div className="flex items-center gap-6">
                                                <span className={`px-4 py-1.5 text-[10px] font-semibold tracking-widest uppercase border border-white/20 ${p.badgeStyle}`}>
                                                    {p.stage}
                                                </span>
                                                <div className="flex gap-2 opacity-100 xl:opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => startEdit(p)} className="text-arch-text-muted hover:text-arch-text transition-colors"><Icons.Edit /></button>
                                                    <button onClick={() => deleteProject(p.id)} className="text-arch-text-muted hover:text-[#8C5A5A] transition-colors"><Icons.Trash /></button>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Project Infographic Dashboard Overlay */}
                    {viewingReportId && selectedReport && (
                        <div className="fixed inset-0 z-[110] bg-white overflow-y-auto">
                            <ProjectInfographicDashboard 
                                project={selectedReport} 
                                onClose={() => setViewingReportId(null)} 
                                onUpdate={updateProject}
                                role={user?.role}
                            />
                        </div>
                    )}
                </div>
            );
        };

        // --- MAP PICKER (Optimized) ---
        const MapPicker = ({ address, onChange }) => {
            const mapRef = useRef(null);
            const markerRef = useRef(null);
            const typingTimeoutRef = useRef(null);
            const isClickingRef = useRef(false);
            
            const [isLocating, setIsLocating] = useState(false);
            const defaultCenter = [29.7604, -95.3698]; // Houston default
            
            useEffect(() => {
                let resizeObserver;
                
                if (!mapRef.current) {
                    mapRef.current = L.map('map-container', { zoomControl: false }).setView(defaultCenter, 13);
                    
                    // Minimalist light map style
                    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                        attribution: ''
                    }).addTo(mapRef.current);
                    
                    markerRef.current = L.circleMarker(defaultCenter, { 
                        radius: 8, color: '#242321', fillColor: '#F4EFEB', fillOpacity: 1, weight: 2
                    }).addTo(mapRef.current);

                    // Fix grey tiles issue using ResizeObserver to ensure map always fits container
                    const container = document.getElementById('map-container');
                    if (container) {
                        resizeObserver = new ResizeObserver(() => {
                            if (mapRef.current) mapRef.current.invalidateSize();
                        });
                        resizeObserver.observe(container);
                    }
                    
                    // Additional timeout fallback for initial render
                    setTimeout(() => {
                        if (mapRef.current) mapRef.current.invalidateSize();
                    }, 100);
                    setTimeout(() => {
                        if (mapRef.current) mapRef.current.invalidateSize();
                    }, 500);
                    
                    mapRef.current.on('click', async (e) => {
                        const { lat, lng } = e.latlng;
                        
                        // Fly to clicked location smoothly
                        mapRef.current.flyTo([lat, lng], 15, { duration: 1.2 });
                        markerRef.current.setLatLng([lat, lng]);
                        
                        isClickingRef.current = true; // Prevent reverse-triggering the geocoder effect
                        onChange("Ubicando...");
                        setIsLocating(true);
                        
                        try {
                            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                            const data = await res.json();
                            if (data && data.display_name) {
                                const parts = data.display_name.split(',');
                                onChange(parts.slice(0, 3).join(','));
                            } else {
                                onChange(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
                            }
                        } catch (err) {
                            onChange(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
                        } finally {
                            setIsLocating(false);
                            // Let the geocoder listen to input changes again after a short delay
                            setTimeout(() => isClickingRef.current = false, 800);
                        }
                    });
                }

                return () => {
                    if (resizeObserver) {
                        resizeObserver.disconnect();
                    }
                    if (mapRef.current) {
                        mapRef.current.remove();
                        mapRef.current = null;
                    }
                };
            }, []);

            // Geocode typed text address to move map (two-way sync)
            useEffect(() => {
                if (isClickingRef.current || !address || address === "Ubicando...") return;
                
                // Allow coordinates directly
                const coordsMatch = address.match(/^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/);
                if (coordsMatch) {
                    const lat = parseFloat(coordsMatch[1]);
                    const lng = parseFloat(coordsMatch[3]);
                    markerRef.current.setLatLng([lat, lng]);
                    mapRef.current.flyTo([lat, lng], 15, { duration: 1.5 });
                    return;
                }

                // Debounced text search query
                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                
                typingTimeoutRef.current = setTimeout(async () => {
                    setIsLocating(true);
                    try {
                        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
                        const [data] = await res.json();
                        if (data) {
                            const lat = parseFloat(data.lat);
                            const lng = parseFloat(data.lon);
                            markerRef.current.setLatLng([lat, lng]);
                            mapRef.current.flyTo([lat, lng], 15, { duration: 1.5 });
                        }
                    } catch (e) {
                        console.error("Geocoding unsuccesful or throttled.");
                    } finally {
                        setIsLocating(false);
                    }
                }, 1200); // 1.2s wait after user finishes typing
                
                return () => clearTimeout(typingTimeoutRef.current);
            }, [address]);

            const handleLocateMe = (e) => {
                e.preventDefault();
                if(navigator.geolocation) {
                    setIsLocating(true);
                    navigator.geolocation.getCurrentPosition(
                        (pos) => {
                            const { latitude, longitude } = pos.coords;
                            // Trigger the map click logic programmatically onto user's real location
                            mapRef.current.fire('click', { latlng: L.latLng(latitude, longitude) });
                        },
                        () => {
                            alert("No se pudo obtener la ubicación. Verifique sus permisos.");
                            setIsLocating(false);
                        }
                    );
                }
            };

            return (
                <div className="w-full h-full relative z-0">
                    <div id="map-container" className="absolute inset-0 bg-arch-bg z-0"></div>
                    
                    {/* Visual Loading Feedback */}
                    {isLocating && (
                        <div className="absolute top-6 left-6 z-[1000] bg-arch-dark text-white text-[10px] uppercase tracking-widest px-4 py-2 font-semibold shadow-float flex items-center gap-2 slide-up">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                            Sincronizando
                        </div>
                    )}
                    
                    {/* Geolocation Button */}
                    <button onClick={handleLocateMe}
                         className="absolute bottom-6 right-6 z-[1000] bg-arch-surface text-arch-text border border-arch-border hover:border-arch-text text-[10px] font-bold tracking-widest uppercase px-5 py-3 shadow-float hover:bg-arch-text hover:text-white transition-all flex items-center gap-2">
                        Mi Ubicación
                    </button>
                </div>
            );
        };

        // --- WIZARD (Minimalist & Elegant Steps) ---
        const NewProjectWizard = ({ navigate }) => {
            const { addProject, updateProject, editingProject, setEditingProject } = useContext(ProjectContext);
            const { currentProject, updateProject: syncGlobal } = useProjectStore();
            const [step, setStep] = useState(1);
            const [isSaving, setIsSaving] = useState(false);
            const [isQuestionnaireOpen, setIsQuestionnaireOpen] = useState(false);
            
            const [formData, setFormData] = useState(
                editingProject ? { ...editingProject } : { 
                    projectName: currentProject.projectName || '',
                    address: currentProject.location || '', 
                    clientName: currentProject.clientName || '', 
                    type: currentProject.type || '', 
                    subtype: '', 
                    deliveryDate: currentProject.estimatedDeliveryDate || '', 
                    procedure: 'Obra Nueva (Permiso)', 
                    desc: '', 
                    imageUrl: '', 
                    sizeSqft: '' 
                }
            );

            // Sync wizard changes to global store in real-time (SSOT)
            const updateForm = (key, val) => {
                setFormData(prev => ({ ...prev, [key]: val }));
                
                // Map local wizard fields to global standard fields
                if (key === 'projectName') syncGlobal({ projectName: val });
                if (key === 'address') syncGlobal({ location: val });
                if (key === 'clientName') syncGlobal({ clientName: val });
                if (key === 'deliveryDate') syncGlobal({ estimatedDeliveryDate: val });
            };
            
            const handleImageUpload = (e) => {
                const file = e.target.files[0];
                if (file) {
                    if (file.size > 20 * 1024 * 1024) return alert("Imagen demasiado grande (máx 20MB)");
                    compressImage(file, (dataUrl) => {
                        updateForm('imageUrl', dataUrl);
                    });
                }
            };

            const handleFinish = async () => {
                if (isSaving) return;
                try {
                    setIsSaving(true);
                    
                    // Unified payload packaging
                    const finalPayload = { ...formData };
                    
                    if (formData.type === 'Residencial') {
                        finalPayload.architectural_program = currentProject.residentialProgram;
                    } else if (formData.type === 'Comercial') {
                        finalPayload.architectural_program = formData.commercialData;
                    }

                    let success = false;
                    if (editingProject) {
                        success = await updateProject(finalPayload);
                    } else {
                        success = await addProject(finalPayload);
                    }
                    
                    if (success) {
                        window.location.hash = '#/dashboard';
                    }
                } catch (err) {
                    console.error("Error crítico en Wizard:", err);
                    alert("Error en la aplicación: " + err.message);
                } finally {
                    setIsSaving(false);
                }
            };

            return (
                <div className="h-full flex flex-col bg-arch-bg slide-up relative">
                    <header className="px-10 py-8 flex items-center justify-between border-b border-arch-border bg-arch-bg/90 backdrop-blur z-20 sticky top-0">
                        {editingProject && <div className="absolute top-0 left-0 right-0 h-1 bg-arch-brand-sky slide-up"></div>}
                        <button onClick={() => navigate('#/dashboard')} className="text-xs font-semibold tracking-widest uppercase text-arch-text-muted hover:text-arch-text transition-colors">
                            ← {editingProject ? 'Descartar Cambios' : 'Cancelar'}
                        </button>
                        
                        {editingProject && (
                            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2">
                                <span className="bg-arch-text text-white text-[9px] px-2 py-0.5 tracking-tighter uppercase font-bold">Modo Edición</span>
                                <span className="text-[10px] font-semibold text-arch-text tracking-widest uppercase">Expediente #{editingProject.id}</span>
                            </div>
                        )}

                        <div className="flex gap-8">
                            {['Emplazamiento', 'Programa', 'Verificación'].map((label, i) => (
                                <div key={i} className={`flex items-center gap-3 ${step >= i+1 ? 'text-arch-text' : 'text-arch-trim'}`}>
                                    <span className={`font-sans font-bold text-lg ${step >= i+1 ? 'text-arch-brand-sky' : 'opacity-60'}`}>0{i+1}</span>
                                    <span className="text-[10px] font-semibold tracking-widest uppercase hidden md:inline">{label}</span>
                                </div>
                            ))}
                        </div>
                    </header>

                    <div className="flex-1 overflow-y-auto w-full">
                        <div className="max-w-5xl mx-auto p-10 md:p-14">
                            
                            {step === 1 && (
                                <div className="flex flex-col lg:flex-row gap-16 fade-in h-[60vh] min-h-[500px]">
                                    <div className="w-full lg:w-5/12 flex flex-col justify-center">
                                        <p className="font-sans font-bold text-arch-text-muted text-xl mb-4">Paso 01</p>
                                        <h2 className="text-4xl font-bold text-arch-text mb-10 tracking-tight">
                                            {editingProject ? 'Actualizar Ubicación.' : 'Emplazamiento.'}
                                        </h2>
                                        
                                        <div className="relative mb-12">
                                            <label className="block text-[10px] font-semibold text-arch-text-muted tracking-widest uppercase mb-4">Coordenadas o Dirección FísicA</label>
                                            <input type="text" value={formData.address} onChange={e => updateForm('address', e.target.value)} 
                                                placeholder="Ej. Av. Reforma 22..." 
                                                className="w-full bg-transparent border-b border-arch-border pb-3 text-xl font-light focus:border-arch-text transition-colors placeholder:text-arch-trim" />
                                        </div>
                                        
                                        <button onClick={() => setStep(2)} disabled={!formData.address} 
                                            className="w-full sm:w-auto self-start bg-arch-brand-sage text-arch-text hover:bg-arch-brand-sky disabled:opacity-30 py-4 px-10 text-xs font-bold tracking-[0.3em] uppercase transition-all shadow-sm">
                                            Avanzar al Programa
                                        </button>
                                    </div>
                                    
                                    <div className="w-full lg:w-7/12 relative border border-arch-border p-2 bg-white">
                                        <div className="absolute inset-2 relative overflow-hidden h-full min-h-[300px]">
                                            <MapPicker address={formData.address} onChange={(val) => updateForm('address', val)} />
                                            {!formData.address && (
                                                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-[1000] pointer-events-none">
                                                    <span className="bg-arch-dark text-white text-[10px] font-semibold tracking-widest uppercase px-6 py-3 shadow-float whitespace-nowrap">
                                                        Defina ubicación en el plano
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="fade-in max-w-3xl">
                                    <p className="font-sans font-bold text-arch-text-muted text-xl mb-4">Paso 02</p>
                                    <h2 className="text-4xl font-bold text-arch-text mb-12 tracking-tight">
                                        {editingProject ? 'Ajustar Programa y Uso.' : 'Programa Arquitectónico.'}
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                                        <div>
                                            <label className="block text-[10px] font-semibold text-arch-text-muted tracking-widest uppercase mb-4">Uso de Suelo Principal</label>
                                            <div className="flex flex-col gap-3">
                                                {['Residencial', 'Comercial', 'Uso Mixto', 'Cambio de uso'].map(tipo => {
                                                    const IconComp = CATEGORY_ICONS[tipo];
                                                    return (
                                                        <label key={tipo} 
                                                            onClick={() => { updateForm('type', tipo); updateForm('subtype', ''); }}
                                                            className={`flex items-center gap-6 p-6 cursor-pointer border-2 transition-all ${formData.type === tipo ? 'border-brand-blue bg-brand-blue/15 shadow-elegant' : 'border-arch-border hover:border-brand-blue/30 hover:bg-brand-neutral'}`}>
                                                            <div className={`w-16 h-16 flex items-center justify-center border-2 ${formData.type === tipo ? 'bg-brand-blue/20 text-brand-dark-blue border-brand-blue' : 'bg-brand-neutral text-arch-text-muted border-arch-border'}`}>
                                                                {IconComp && <IconComp className="w-12 h-12" />}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="font-sans text-lg font-bold text-arch-text">{tipo}</span>
                                                                <span className="text-[9px] uppercase tracking-widest text-arch-text-muted mt-1 font-black">Categoría del Proyecto</span>
                                                            </div>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-8">
                                            {formData.type && (
                                                <div className="fade-in">
                                                    <label className="block text-[10px] font-semibold text-arch-text-muted tracking-widest uppercase mb-4">Subtipo de Proyecto</label>
                                                    <div className="grid grid-cols-1 gap-2">
                                                        {SUBTYPE_OPTIONS[formData.type]?.map(st => (
                                                            <button key={st} onClick={() => updateForm('subtype', st)}
                                                                className={`text-left p-4 text-sm font-medium border-2 transition-all ${formData.subtype === st ? 'bg-brand-green/15 text-brand-dark-green border-brand-green' : 'bg-transparent border-arch-border text-arch-text-muted hover:border-brand-green/40'}`}>
                                                                {st}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            <div>
                                                <label className="block text-[10px] font-semibold text-arch-text-muted tracking-widest uppercase mb-4">Tipo de Intervención</label>
                                                <select value={formData.procedure} onChange={e => updateForm('procedure', e.target.value)}
                                                    className="w-full bg-transparent border-b border-arch-border pb-3 text-lg font-light focus:border-arch-text transition-colors cursor-pointer appearance-none">
                                                    <option value="Obra Nueva (Permiso)">◱ Obra Nueva (Permiso)</option>
                                                    <option value="Remodelación / Adecuación">◩ Remodelación / Adecuación</option>
                                                    <option value="Restauración Histórica">◪ Restauración Histórica</option>
                                                    <option value="Mantenimiento Mayor">◧ Mantenimiento Mayor</option>
                                                </select>
                                            </div>
                                            
                                            <div>
                                                <label className="block text-[10px] font-semibold text-arch-text-muted tracking-widest uppercase mb-4">Nombre del Cliente (Opcional)</label>
                                                <input type="text" value={formData.clientName} onChange={e => updateForm('clientName', e.target.value)}
                                                    placeholder="Ej. Familia Thompson..."
                                                    className="w-full bg-transparent border-b border-arch-border pb-3 text-lg font-light focus:border-arch-text transition-colors placeholder:text-arch-trim" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-semibold text-arch-text-muted tracking-widest uppercase mb-4">Fecha Estimada de Proyecto</label>
                                                <input type="date" value={formData.deliveryDate} onChange={e => updateForm('deliveryDate', e.target.value)}
                                                    className="w-full bg-transparent border-b border-arch-border pb-3 text-lg font-light focus:border-arch-text transition-colors text-arch-text" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-semibold text-arch-text-muted tracking-widest uppercase mb-4">Size / SQFT (Tamaño Estimado)</label>
                                                <input type="text" value={formData.sizeSqft} onChange={e => updateForm('sizeSqft', e.target.value)}
                                                    placeholder="Ej. 1,200 sqft / 110 m2..."
                                                    className="w-full bg-transparent border-b border-arch-border pb-3 text-lg font-light focus:border-arch-text transition-colors placeholder:text-arch-trim" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-12">
                                        {(formData.type === 'Residencial' || formData.type === 'Comercial') ? (
                                            <div className="border border-arch-brand-sage/50 bg-arch-brand-sage/5 p-6 flex flex-col md:flex-row items-start md:items-center justify-between shadow-sm w-full group">
                                                <div>
                                                    <h3 className="text-sm font-bold tracking-widest uppercase text-arch-text mb-1">Programa Arquitectónico</h3>
                                                    <p className="text-[9px] text-arch-text-muted uppercase tracking-widest font-semibold flex items-center gap-2">
                                                        <Icons.Transform className="w-3 h-3 text-arch-brand-sage" />
                                                        Módulo Didáctico Integrado
                                                    </p>
                                                </div>
                                                <button 
                                                    onClick={(e) => { e.preventDefault(); setIsQuestionnaireOpen(true); }}
                                                    className="mt-4 md:mt-0 bg-white border border-arch-brand-sage/50 hover:border-arch-brand-sage hover:bg-arch-brand-sage/10 text-arch-text py-3 px-6 text-[9px] font-bold tracking-[0.3em] uppercase transition-all flex items-center gap-3">
                                                    Abrir Completo <span className="text-arch-brand-sage/80 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">↗</span>
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <label className="block text-[10px] font-semibold text-arch-text-muted tracking-widest uppercase mb-4">Memoria Descriptiva Temprana</label>
                                                <textarea value={formData.desc} onChange={e => updateForm('desc', e.target.value)} rows="3"
                                                    className="w-full bg-transparent border-b border-arch-border pb-3 text-lg font-light focus:border-arch-text transition-colors resize-none placeholder:text-arch-trim"
                                                    placeholder="Describa brevemente las intenciones de diseño..."></textarea>
                                            </>
                                        )}
                                    </div>
                                    
                                    <div className="mb-12">
                                        <label className="block text-[10px] font-semibold text-arch-text-muted tracking-widest uppercase mb-4">Fotografía de Referencia (Opcional)</label>
                                        <div className="border border-dashed border-brand-green/40 p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-brand-green/5 transition-colors relative overflow-hidden h-32">
                                            {formData.imageUrl ? (
                                                <img src={formData.imageUrl} className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale" alt="Preview" />
                                            ) : null}
                                            <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full" title="Sube una imagen representativa" />
                                            <div className="relative z-0 flex flex-col items-center">
                                                <Icons.Folder className="w-8 h-8 text-arch-text-muted mb-2"/>
                                                <span className="text-sm font-light text-arch-text-muted bg-white/50 px-2 rounded backdrop-blur-sm">{formData.imageUrl ? 'Imagen cargada - Clic para cambiar' : 'Clic para cargar imagen desde dispositivo'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center border-t border-arch-border pt-8">
                                        <button onClick={() => setStep(1)} className="text-xs font-bold tracking-[0.2em] uppercase text-arch-text-muted hover:text-brand-green transition-colors">Volver</button>
                                        <button onClick={() => setStep(3)} disabled={!formData.type || !formData.subtype || !formData.deliveryDate} 
                                            className="bg-arch-brand-sage text-arch-text hover:bg-arch-brand-sky disabled:opacity-30 py-4 px-10 text-xs font-bold tracking-[0.3em] uppercase transition-all shadow-soft">
                                            Revisar Ficha
                                        </button>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="fade-in max-w-3xl mx-auto pt-8">
                                    <div className="text-center mb-16">
                                        <span className="font-sans font-bold text-arch-text-muted text-xl mb-4 block">Ficha Técnica Final</span>
                                        <h2 className="text-4xl font-bold text-arch-text tracking-tight">
                                            {editingProject ? 'Confirmar Modificaciones.' : 'Verificación.'}
                                        </h2>
                                    </div>

                                    <div className="bg-arch-surface border border-arch-border p-10 md:p-14 relative shadow-soft">
                                        <div className="absolute top-0 right-10 w-[1px] h-10 bg-arch-border"></div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12 mb-10 pb-10 border-b border-arch-border">
                                            <div>
                                                <span className="block text-[9px] font-semibold text-arch-text-muted tracking-widest uppercase mb-2">Emplazamiento</span>
                                                <span className="font-sans text-xl">{formData.address}</span>
                                            </div>
                                            <div>
                                                <span className="block text-[9px] font-semibold text-arch-text-muted tracking-widest uppercase mb-2">Uso y Tipología</span>
                                                <div className="flex items-center gap-2">
                                                    {formData.type && CATEGORY_ICONS[formData.type] 
                                                        ? React.createElement(CATEGORY_ICONS[formData.type], { className: "w-5 h-5 text-arch-brand-sage" })
                                                        : <Icons.Building className="w-5 h-5 text-arch-brand-sage" />
                                                    }
                                                    <span className="font-sans text-xl">{formData.type || 'No definido'} {formData.subtype && `· ${formData.subtype}`}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <span className="block text-[9px] font-semibold text-arch-text-muted tracking-widest uppercase mb-2">Clase de Intervención</span>
                                                <span className="font-light text-lg">{EMOJI_MAP[formData.procedure] || ''} {formData.procedure}</span>
                                            </div>
                                            <div>
                                                <span className="block text-[9px] font-semibold text-arch-text-muted tracking-widest uppercase mb-2">Cliente</span>
                                                <span className="font-sans text-xl">{formData.clientName || 'No especificado'}</span>
                                            </div>
                                            <div>
                                                <span className="block text-[9px] font-semibold text-arch-text-muted tracking-widest uppercase mb-2">Marco Temporal</span>
                                                <span className="font-light text-lg">{formData.deliveryDate}</span>
                                            </div>
                                            <div>
                                                <span className="block text-[9px] font-semibold text-arch-text-muted tracking-widest uppercase mb-2">Size / SQFT</span>
                                                <span className="font-light text-lg">{formData.sizeSqft || 'No especificado'}</span>
                                            </div>
                                        </div>
                                        
                                        {formData.imageUrl && (
                                            <div className="mb-10 pb-10 border-b border-arch-border">
                                                <span className="block text-[9px] font-semibold text-arch-text-muted tracking-widest uppercase mb-4">Fotografía de Referencia</span>
                                                <img src={formData.imageUrl} className="w-full h-48 object-cover grayscale opacity-90 border border-arch-border" alt="Project preview" />
                                            </div>
                                        )}
                                        
                                        <div>
                                            <span className="block text-[9px] font-semibold text-arch-text-muted tracking-widest uppercase mb-3">Memoria Descriptiva</span>
                                            <p className="font-light text-arch-text-muted leading-relaxed bg-arch-bg p-6 border-l border-arch-trim">
                                                {formData.desc || 'No se ingresaron notas de diseño descriptivas.'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-6 mt-12">
                                        <button onClick={() => setStep(2)} className="text-xs font-semibold tracking-widest uppercase text-arch-text-muted hover:text-brand-blue transition-colors px-6">Modificar</button>
                                        <button onClick={handleFinish} disabled={isSaving} className={`bg-arch-brand-sky hover:bg-arch-brand-sage text-arch-text py-4 px-12 text-xs font-bold tracking-[0.4em] uppercase transition-all shadow-soft flex items-center gap-3 group ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                            {isSaving ? 'Guardando...' : (editingProject ? 'Actualizar Expediente' : 'Aprobar Ingreso')} 
                                            {!isSaving && <Icons.Check className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {isQuestionnaireOpen && (
                        <div className="fixed inset-0 z-[9999] bg-white flex flex-col fade-in shadow-2xl">
                            <div className="flex bg-white border-b border-arch-border p-6 shadow-sm items-center justify-between z-10 w-full">
                                <div className="ml-4">
                                    <h3 className="text-2xl font-sans text-arch-text">{formData.type === 'Comercial' ? 'Programa Profesional' : 'Programa A. Didáctico'}</h3>
                                    <p className="text-[9px] tracking-widest uppercase text-arch-text-muted mt-1">Inteligencia y Dimensionamiento</p>
                                </div>
                                <button onClick={() => setIsQuestionnaireOpen(false)} className="bg-arch-text hover:bg-black text-white px-8 py-3 text-[10px] uppercase font-bold tracking-[0.3em] transition-all shadow-float mr-4">
                                    Finalizar y Guardar
                                </button>
                            </div>
                            <div className="flex-1 w-full relative overflow-y-auto no-scrollbar">
                                {formData.type === 'Comercial' ? (
                                    <CommercialApp 
                                        initialData={formData.commercialData} 
                                        onComplete={(data) => {
                                            updateForm('commercialData', data);
                                            setIsQuestionnaireOpen(false);
                                        }} 
                                    />
                                ) : (
                                    <ArchplanApp 
                                        initialData={formData.architectural_program}
                                        onChange={(data) => updateForm('architectural_program', data)}
                                    />
                                )}
                            </div>
                        </div>
                    )}

                </div>
            );
        };

        // --- CLIENT PROJECT TRACKING PORTAL (High-End Dark Identity) ---
        const ClientConsultPage = ({ navigate }) => {
            const { projects } = useContext(ProjectContext);
            const [query, setQuery] = useState('');
            const [activeProject, setActiveProject] = useState(null);
            const [isSearching, setIsSearching] = useState(false);

            const handleSearch = () => {
                setIsSearching(true);
                // Normalización: quitar '#' y espacios para que coincida con el ID de la database
                const sanitizedQuery = query.trim().replace(/^#/, '').toUpperCase();
                
                setTimeout(() => {
                    const found = projects.find(p => 
                        p.id.toUpperCase() === sanitizedQuery || 
                        (p.clientName && p.clientName.toLowerCase().includes(query.toLowerCase().trim()))
                    );
                    setActiveProject(found || null);
                    setIsSearching(false);
                    if (!found) alert("Expediente no localizado en la infraestructura digital de ARCHCOS.");
                }, 1000);
            };

            const handleRequestMeeting = () => {
                const subject = encodeURIComponent(`Solicitud de Reunión: ${activeProject.address} (${activeProject.id})`);
                const body = encodeURIComponent(`Hola equipo ARCHCOS,\n\nMe gustaría solicitar una reunión para discutir los avances del proyecto ${activeProject.address}.\n\nSaludos.`);
                window.location.href = `mailto:rgaytan@archcos.com?subject=${subject}&body=${body}`;
            };

            const PHASES = ['Investigación', 'Concepto', 'Arquitectónico', 'Estructural', 'Ingenierías MEP', 'Renders'];
            
            const getPhaseProgress = (project, phaseIdx) => {
                if (!project.progressMap) return 0;
                const m = project.progressMap;
                switch(phaseIdx) {
                    case 0: return m.area_investigacion || 0;
                    case 1: return m.area_concepto || 0;
                    case 2: return m.area_arquitectonico || 0;
                    case 3: return m.area_estructural || 0;
                    case 4: return Math.round(((m.area_electrico || 0) + (m.area_hidro || 0)) / 2);
                    case 5: return m.area_grafico || 0;
                    default: return 0;
                }
            };

            const calculateGlobalProgress = (project) => {
                if (!project.progressMap) return 0;
                const values = Object.values(project.progressMap);
                return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
            };

            if (activeProject) {
                const globalProgress = calculateGlobalProgress(activeProject);
                return (
                    <div className="min-h-screen bg-white text-arch-text p-6 md:p-14 overflow-x-hidden relative slide-up font-sans selection:bg-arch-brand-sky/20">
                        {/* High-end decorative background effect */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(174,217,230,0.1)_0%,_transparent_60%)] pointer-events-none"></div>
                        
                        <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start mb-24 relative z-10 border-b border-arch-border pb-12 gap-8">
                            <div className="fade-in">
                                <h1 className="font-bold text-5xl md:text-6xl tracking-tight mb-6 text-arch-text uppercase">{activeProject.address}</h1>
                                <div className="flex flex-wrap items-center gap-6">
                                    <p className="text-arch-brand-sky text-[10px] tracking-[0.5em] uppercase flex items-center gap-4 font-bold bg-arch-brand-sky/10 px-4 py-2 border border-arch-brand-sky/20">
                                        EXP-ID: {activeProject.id}
                                    </p>
                                    <span className="text-arch-trim">|</span>
                                    <p className="text-arch-text-muted text-[10px] tracking-[0.3em] uppercase font-bold">Cliente: {activeProject.clientName}</p>
                                </div>
                            </div>
                            <div className="text-right flex flex-col items-end slide-up delay-200">
                                <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-arch-text-muted mb-3 ml-auto">PROGRESO PROYECTUAL</p>
                                <div className="flex items-end gap-2">
                                    <p className="text-7xl font-bold text-arch-text tracking-tighter leading-none" style={{ fontFamily: 'Inter, Montserrat, sans-serif' }}>
                                        {globalProgress}%
                                    </p>
                                    <span className="text-arch-brand-sage font-bold mb-2">↑</span>
                                </div>
                                <button onClick={() => setActiveProject(null)} className="mt-10 bg-arch-sand/30 hover:bg-arch-text hover:text-white text-[9px] font-bold tracking-[0.4em] uppercase px-10 py-5 border border-arch-border transition-all flex items-center gap-4 group">
                                    <span className="w-6 h-[1px] bg-arch-text group-hover:bg-white transition-all"></span> Nueva Consulta
                                </button>
                            </div>
                        </header>

                        <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-12 relative z-10">
                            {/* PROGRESS TRACKER (DYNAMIC CIRCULAR STEPS) */}
                            <div className="lg:col-span-4 bg-white border border-arch-border p-10 md:p-16 shadow-soft mb-12 relative group overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-arch-brand-sage to-transparent"></div>
                                <h2 className="text-[11px] font-bold tracking-[0.5em] uppercase text-arch-brand-sage mb-20 flex items-center gap-4">
                                    ESTADO OPERATIVO DEL PROYECTO
                                </h2>
                                
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-16">
                                    {PHASES.map((phase, i) => {
                                        const progress = getPhaseProgress(activeProject, i);
                                        const circumference = 2 * Math.PI * 34;
                                        const offset = circumference - (progress / 100) * circumference;
                                        
                                        return (
                                            <div key={i} className="flex flex-col items-center group/item scale-up" style={{ animationDelay: `${i * 100}ms` }}>
                                                <div className="relative mb-8 flex items-center justify-center w-24 h-24 md:w-28 md:h-28">
                                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 96 96">
                                                        <circle cx="48" cy="48" r="34" stroke="currentColor" strokeWidth="1" fill="transparent" className="text-arch-sand" />
                                                        <circle cx="48" cy="48" r="34" stroke="url(#archGradient)" strokeWidth="3" 
                                                                strokeDasharray={circumference} 
                                                                strokeDashoffset={offset} 
                                                                strokeLinecap="round" fill="transparent" 
                                                                className="transition-all duration-1500 ease-out" />
                                                        
                                                        <defs>
                                                            <linearGradient id="archGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                                <stop offset="0%" stopColor="#D4E6A5" />
                                                                <stop offset="100%" stopColor="#AED9E6" />
                                                            </linearGradient>
                                                        </defs>
                                                    </svg>
                                                    
                                                    <div className="absolute inset-0 flex items-center justify-center pb-1">
                                                        <span className={`text-xl font-bold tracking-tighter transition-all flex items-center justify-center ${progress === 100 ? 'text-arch-brand-sage scale-125' : 'text-arch-text-muted'}`}>
                                                            {progress === 100 ? <Icons.Check className="w-7 h-7" /> : `${progress}%`}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                <p className="text-[8px] font-bold tracking-[0.4em] uppercase text-arch-trim mb-3">ETAPA 0{i+1}</p>
                                                <h4 className={`text-[10px] font-bold tracking-[0.15em] uppercase text-center transition-all duration-500 ${progress > 0 ? 'text-arch-text' : 'text-arch-trim'}`}>{phase}</h4>
                                                
                                                {i < PHASES.length - 1 && (
                                                    <div className="hidden lg:block absolute top-[52px] -right-[40px] w-20 h-[1px] bg-arch-border opacity-50"></div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* STATUS & DELIVERABLES */}
                            <div className="lg:col-span-3 space-y-12">
                                <section className="bg-arch-sand/20 border-l-2 border-arch-brand-sage p-12 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                                        <Icons.Building className="w-32 h-32" />
                                    </div>
                                    <h3 className="text-[10px] font-bold tracking-[0.4em] uppercase text-arch-text-muted mb-10 flex items-center gap-4">
                                        <span className="w-10 h-[1px] bg-arch-brand-sage/40"></span> Bitácora Operativa
                                    </h3>
                                    <p className="font-bold text-3xl md:text-4xl leading-relaxed text-arch-text uppercase tracking-tight">
                                        "{activeProject.status || 'Los sistemas de archivo están indexando los documentos técnicos para su revisión.'}"
                                    </p>
                                </section>

                                <section>
                                    <div className="flex justify-between items-center mb-12">
                                        <h3 className="text-[10px] font-bold tracking-[0.4em] uppercase text-arch-text-muted">Repositorio de Entregables Técnicos</h3>
                                        <span className="text-[9px] text-arch-brand-sky font-bold tracking-widest uppercase bg-arch-brand-sky/10 px-3 py-1 border border-arch-brand-sky/20">Secure Node V2.1</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {activeProject.deliverables?.map((d, i) => (
                                            <div key={i} className="flex items-center justify-between p-10 border border-arch-border bg-white hover:bg-arch-sand/20 hover:border-arch-brand-sky transition-all group cursor-pointer relative overflow-hidden">
                                                <div className="absolute bottom-0 left-0 h-[2px] bg-arch-brand-sky w-0 group-hover:w-full transition-all duration-500"></div>
                                                <div className="flex items-center gap-8">
                                                    <div className="bg-arch-sand/50 p-6 text-[11px] font-bold text-arch-text-muted border border-arch-border group-hover:text-arch-brand-sky group-hover:border-arch-brand-sky transition-all font-mono uppercase">
                                                        {d.type}
                                                    </div>
                                                    <div>
                                                        <span className="block text-sm font-medium text-arch-text group-hover:text-black transition-colors">{d.name}</span>
                                                        <span className="text-[9px] text-arch-trim uppercase tracking-widest mt-1 block tracking-tighter font-bold">Liberación Verificada</span>
                                                    </div>
                                                </div>
                                                <Icons.Check className="w-6 h-6 text-arch-trim group-hover:text-arch-brand-sage transition-all" />
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>

                            {/* DIRECTOR & CONTACT INFO (SIDE) */}
                            <aside className="space-y-10">
                                <div className="bg-white border border-arch-border p-10 shadow-float relative">
                                    <div className="absolute top-0 right-0 w-2 h-2 bg-arch-brand-sky"></div>
                                    <h4 className="text-[9px] font-bold tracking-[0.5em] uppercase text-arch-text-muted mb-12">Responsable Directo</h4>
                                    <div className="flex items-center gap-6 mb-12">
                                        <div className="w-20 h-20 bg-arch-brand-sage flex items-center justify-center font-sans text-arch-text text-3xl font-bold shadow-soft">AR</div>
                                        <div>
                                            <p className="text-2xl font-sans text-arch-text">Alfredo Reyes</p>
                                            <p className="text-[9px] text-arch-brand-sky font-bold uppercase tracking-[0.2em] leading-none mt-3">Director de Diseño</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4 mb-4">
                                        <button onClick={handleRequestMeeting} className="w-full py-5 bg-arch-text text-white hover:bg-arch-brand-sage hover:text-arch-text transition-all text-[10px] font-bold tracking-[0.4em] uppercase shadow-float">
                                            Solicitar Reunión
                                        </button>
                                        <button className="w-full py-5 border border-arch-border hover:bg-arch-sand transition-all text-[10px] font-bold tracking-[0.4em] uppercase text-arch-text-muted">
                                            Descargar Registro
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="p-8 border border-arch-border bg-arch-sand/10">
                                    <p className="text-[8px] tracking-[0.4em] uppercase text-arch-trim font-bold mb-4">Protocolo de Privacidad</p>
                                    <p className="text-[10px] text-arch-text-muted leading-relaxed font-light">Su sesión está protegida. Todos los activos arquitectónicos son propiedad confidencial de ARCHCOS Group.</p>
                                </div>
                            </aside>
                        </main>
                        
                        <footer className="max-w-7xl mx-auto mt-40 py-20 border-t border-arch-border text-center transition-opacity opacity-30 hover:opacity-100">
                            <Icons.Logo className="w-20 h-20 mx-auto mb-10 grayscale" />
                            <p className="text-[10px] tracking-[1em] uppercase font-bold text-arch-trim uppercase">ARCHCOS INFRASTRUCTURE • DIGITAL RECORD PORTAL 2026</p>
                        </footer>
                    </div>
                );
            }

            return (
                <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden slide-up font-sans selection:bg-arch-brand-sky/20">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,_rgba(174,217,230,0.1)_0%,_transparent_70%)] pointer-events-none"></div>
                    
                    <button onClick={() => navigate('#/login')} className="absolute top-12 left-12 text-arch-text-muted hover:text-arch-brand-sky transition-all text-[10px] font-bold tracking-[0.6em] uppercase flex items-center gap-8 group">
                        <span className="w-12 h-[1px] bg-arch-trim group-hover:w-20 group-hover:bg-arch-brand-sky transition-all"></span> ACCESO SISTEMA
                    </button>
                    
                    <div className="max-w-3xl w-full text-center z-10 px-4">
                        <div className="flex justify-center mb-20 scale-125 fade-in">
                            <Icons.Logo className="w-24 h-24" />
                        </div>
                        <h1 className="font-sans text-7xl md:text-8xl mb-8 tracking-tighter text-arch-text uppercase leading-none slide-up">Portal Proyectos</h1>
                        <p className="text-[11px] tracking-[0.8em] uppercase text-arch-text-muted mb-24 font-bold flex items-center justify-center gap-10 slide-up delay-100">
                             NODO DE CONSULTA SEGURA <span className="w-2 h-2 rounded-full bg-arch-brand-sage animate-pulse"></span> INFRAESTRUCTURA
                        </p>
                        
                        <div className="bg-white border border-arch-border p-16 md:p-24 shadow-float relative max-w-2xl mx-auto slide-up delay-200">
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-arch-brand-sky to-transparent"></div>
                            <h2 className="text-[10px] font-bold tracking-[0.5em] uppercase text-arch-text-muted mb-20">Ingrese Credencial de Expediente</h2>
                            
                            <div className="space-y-16">
                                <div className="relative group">
                                    <input type="text" value={query} onChange={e=>setQuery(e.target.value)} placeholder="POL-0000-CLIENTE" 
                                           className="w-full bg-transparent border-b border-arch-border pb-10 text-arch-text font-sans text-4xl md:text-5xl focus:border-arch-brand-sky transition-all placeholder:text-arch-trim outline-none text-center" 
                                           onKeyDown={e => e.key === 'Enter' && handleSearch()} />
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-arch-brand-sky transition-all duration-700 group-focus-within:w-full"></div>
                                </div>
                                
                                <button onClick={handleSearch} disabled={isSearching}
                                        className="w-full bg-arch-text hover:bg-arch-brand-sky text-white hover:text-arch-text py-8 px-16 text-[11px] font-bold tracking-[0.6em] uppercase transition-all shadow-float disabled:opacity-50 flex items-center justify-center gap-6 group">
                                    {isSearching ? <span className="animate-pulse">AUTENTICANDO...</span> : (
                                        <>
                                            CONSULTAR EXPEDIENTE <span className="text-xl group-hover:translate-x-2 transition-transform">→</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        };

        // --- ASSIGNMENT & CRM MODULE (Multi-User ARCHCOS Edition) ---
        const AssignmentModule = () => {
            const { user } = useContext(AuthContext);
            const { projects, updateProject, activeProjectId } = useContext(ProjectContext);
            const [selectedProjectId, setSelectedProjectId] = useState(activeProjectId || projects[0]?.id || '');
            const [isSaving, setIsSaving] = useState(false);
            const [demoRole, setDemoRole] = useState(user?.role || 'ADMIN');

            // Sync with global activeProjectId if it changes (e.g. via direct link)
            React.useEffect(() => {
                if (activeProjectId) setSelectedProjectId(activeProjectId);
            }, [activeProjectId]);

            const currentProject = projects.find(p => p.id === selectedProjectId);
            const assignments = currentProject?.assignments || {};
            const progressMap = currentProject?.progressMap || {};

            const toggleAssign = (areaId, userId) => {
                if (demoRole !== 'ADMIN') return;
                const currentAreaList = Array.isArray(assignments[areaId]) ? assignments[areaId] : (assignments[areaId] ? [assignments[areaId]] : []);
                const newList = currentAreaList.includes(userId) 
                    ? currentAreaList.filter(id => id !== userId) 
                    : [...currentAreaList, userId];
                
                const newAssignments = { ...assignments, [areaId]: newList };
                updateProject({ ...currentProject, assignments: newAssignments });
            };

            const updateProgress = (areaId, value) => {
                if (demoRole !== 'ADMIN') return;
                const newProgressMap = { ...progressMap, [areaId]: parseInt(value) };
                
                // Calculate new global progress
                const values = Object.values(newProgressMap);
                const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
                
                // Automatiszación: Si el progreso llega a 100%, pasar a REVISIÓN LEGAL
                let newStage = currentProject.stage;
                if (avg === 100) {
                    newStage = 'REVISIÓN';
                } else if (currentProject.stage === 'REVISIÓN' && avg < 100) {
                     // Opcional: regresar a DISEÑO si se baja del 100%
                    newStage = 'DISEÑO';
                }
                
                updateProject({ ...currentProject, progressMap: newProgressMap, progress: avg, stage: newStage });
            };

            const saveAll = () => {
                setIsSaving(true);
                setTimeout(() => setIsSaving(false), 800);
            };

            return (
                <div className="h-full bg-white p-10 md:p-14 overflow-y-auto slide-up font-sans">
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
                        <div>
                            <div className="flex items-center gap-6 mb-3">
                                <h1 className="text-4xl font-sans tracking-tight text-arch-text">Gestión de Equipo & Progreso<span className="text-arch-brand-sage">.</span></h1>
                                <button onClick={() => setDemoRole(demoRole === 'ADMIN' ? 'COLABORADOR' : 'ADMIN')} 
                                    className="bg-arch-sand/50 hover:bg-arch-text hover:text-white text-[9px] uppercase tracking-[0.3em] px-4 py-2 border border-arch-border text-arch-text-muted transition-all font-bold">
                                    Simulación: {demoRole} ⇋
                                </button>
                            </div>
                            <p className="text-arch-text-muted font-light text-sm font-bold">Administración centralizada de capital humano y metas operativas.</p>
                        </div>
                        
                        <div className="flex gap-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-[9px] uppercase tracking-widest text-arch-text-muted font-bold">Seleccionar Expediente</span>
                                <select value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)}
                                    className="bg-arch-sand/30 border border-arch-border px-4 py-3 text-xs font-bold tracking-widest uppercase text-arch-text outline-none transition-all">
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id}>{p.address}</option>
                                    ))}
                                </select>
                            </div>
                            {demoRole === 'ADMIN' && (
                                <button onClick={saveAll} className="bg-arch-text hover:bg-arch-brand-sky hover:text-arch-text text-white py-2 px-10 text-[10px] font-bold tracking-[0.3em] uppercase transition-all mt-auto shadow-float">
                                    {isSaving ? 'Sincronizando' : 'Consolidar Cambios'}
                                </button>
                            )}
                        </div>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {PROJECT_AREAS.map(area => {
                            const areaUserIds = Array.isArray(assignments[area.id]) ? assignments[area.id] : (assignments[area.id] ? [assignments[area.id]] : []);
                            const areaProgress = progressMap[area.id] || 0;
                            const isMyTask = areaUserIds.includes(user?.id);

                            return (
                                <div key={area.id} className={`p-10 border transition-all duration-700 relative overflow-hidden flex flex-col ${isMyTask ? 'border-arch-brand-sage bg-arch-brand-sage/5' : 'border-arch-border bg-white hover:border-arch-brand-sky'}`}>
                                    {/* Progress background bar effect */}
                                    <div className="absolute top-0 left-0 h-1 bg-cyan-400 transition-all duration-1000 shadow-[0_0_10px_rgba(34,211,238,0.5)]" style={{ width: `${areaProgress}%` }}></div>
                                    
                                    {isMyTask && (
                                        <div className="absolute top-4 right-4 animate-pulse">
                                            <span className="bg-arch-brand-sage text-arch-text text-[9px] font-bold px-3 py-1 tracking-widest uppercase">Team Lead</span>
                                        </div>
                                    )}
                                    
                                    <div className="flex items-center gap-6 mb-12 mt-4">
                                        <div className={`w-14 h-14 border flex items-center justify-center transition-all ${areaProgress === 100 ? 'bg-arch-brand-sage border-arch-brand-sage text-arch-text' : 'bg-arch-sand/50 text-arch-text'}`}>
                                            {areaProgress === 100 ? <Icons.Check className="w-8 h-8" /> : <Icons.Building className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <h3 className="font-sans text-2xl tracking-tight text-arch-text leading-tight">{area.title}</h3>
                                            <p className="text-[10px] font-bold tracking-widest text-arch-text-muted uppercase mt-1">SLA Efficiency: {areaProgress}%</p>
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-10">
                                        {/* PROGRESS MANAGEMENT */}
                                        <div>
                                            <div className="flex justify-between items-center mb-4">
                                                <label className="text-[10px] font-bold tracking-widest uppercase text-arch-text-muted">Estado de Avance</label>
                                                <span className="text-xs font-mono font-bold text-arch-text">{areaProgress}%</span>
                                            </div>
                                            {demoRole === 'ADMIN' ? (
                                                <input type="range" min="0" max="100" step="5" value={areaProgress} onChange={e => updateProgress(area.id, e.target.value)}
                                                    className="w-full h-1.5 bg-arch-sand rounded-none appearance-none cursor-pointer accent-cyan-400" />
                                            ) : (
                                                <div className="w-full h-1.5 bg-arch-sand overflow-hidden">
                                                    <div className="h-full bg-arch-brand-sage transition-all duration-1000" style={{ width: `${areaProgress}%` }}></div>
                                                </div>
                                            )}
                                        </div>

                                        {/* TEAM MANAGEMENT */}
                                        <div className="border-t border-arch-border pt-8">
                                            <div className="flex justify-between items-center mb-6">
                                                <label className="text-[10px] font-bold tracking-widest uppercase text-arch-text-muted">Equipo Técnico</label>
                                                <span className="text-[10px] text-arch-text-muted font-mono">Count: {areaUserIds.length}</span>
                                            </div>
                                            
                                            {demoRole === 'ADMIN' ? (
                                                <div className="grid grid-cols-3 gap-2">
                                                    {USERS.map(u => {
                                                        const isSelected = areaUserIds.includes(u.id);
                                                        return (
                                                            <button key={u.id} onClick={() => toggleAssign(area.id, u.id)}
                                                                className={`flex flex-col items-center gap-2 p-3 transition-all border ${isSelected ? 'border-arch-brand-sage bg-arch-brand-sage/10 opacity-100' : 'border-transparent opacity-30 grayscale hover:opacity-100'}`}>
                                                                <div style={{ backgroundColor: u.color }} className="w-10 h-10 flex items-center justify-center text-[10px] font-bold text-white shadow-soft">
                                                                    {u.initials}
                                                                </div>
                                                                <span className="text-[8px] uppercase tracking-widest font-bold truncate w-full text-center">{u.name.split(' ')[0]}</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="flex items-center min-h-[48px]">
                                                    {areaUserIds.length > 0 ? (
                                                        <div className="flex -space-x-4">
                                                            {areaUserIds.map((uid, idx) => {
                                                                const u = USERS.find(user => user.id === uid);
                                                                if (!u) return null;
                                                                return (
                                                                    <div key={u.id} style={{ backgroundColor: u.color, zIndex: 10 - idx }} 
                                                                        title={u.name}
                                                                        className="w-12 h-12 flex items-center justify-center text-[10px] font-bold text-white border-2 border-white shadow-soft hover:scale-110 transition-transform cursor-help">
                                                                        {u.initials}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] font-bold uppercase tracking-widest text-arch-text-muted opacity-40">Pendiente de formación</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        };

        export default AppProvider;