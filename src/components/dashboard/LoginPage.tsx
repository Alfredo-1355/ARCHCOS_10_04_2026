import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../contexts/DashboardContext';
import { DashIcons as Icons } from '../../constants/dashboard';
import { LoginPageProps } from '../../types/dashboard';
import { Mail, Lock, User, Hash, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LoginPage = ({ navigate }: LoginPageProps) => {
    const { login } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState<'client' | 'staff'>('client');
    
    // Staff state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // Client state
    const [projectId, setProjectId] = useState('');

    const [error, setError] = useState('');

    // Slideshow state
    const backgroundImages = [
        "/assets/slideshow/R-006.png",
        "/assets/slideshow/R-07.png",
        "/assets/slideshow/A-02.png",
        "/assets/slideshow/A-01.png",
        "/assets/slideshow/I_018.png",
    ];
    const [bgIndex, setBgIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setBgIndex((prev) => (prev + 1) % backgroundImages.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [backgroundImages.length]);

    const handleStaffLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (login(email, password)) {
            // AppProvider redirigirá
        } else {
            setError('Credenciales incorrectas. Verifique e intente nuevamente.');
        }
    };

    const handleClientLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Client portal logic. For now, simulated redirect
        navigate('#/consulta-cliente');
    };

    return (
        <div className="flex min-h-screen w-full font-sans bg-white text-[#1A2B3C] selection:bg-[#6A8D7D] selection:text-white">
            
            {/* Left Image Side */}
            <div className="hidden lg:flex w-[48%] relative bg-[#E2E8F0] items-center overflow-hidden">
                
                {/* Framer Motion Slideshow Background (Optimized) */}
                <div className="absolute inset-0 z-0 bg-[#E2E8F0] overflow-hidden">
                    {backgroundImages.map((src, index) => {
                        const isActive = index === bgIndex;
                        return (
                            <motion.img 
                                key={src}
                                src={src} 
                                alt={`Background ${index}`}
                                className="absolute inset-0 w-full h-full object-cover origin-center"
                                initial={{ opacity: 0, scale: 1 }}
                                animate={{ 
                                    opacity: isActive ? 1 : 0, 
                                    scale: isActive ? 1.05 : 1 
                                }}
                                transition={{ 
                                    opacity: { duration: 2.5, ease: "easeInOut" },
                                    scale: { duration: 8, ease: "linear" } 
                                }}
                                style={{ 
                                    willChange: "transform, opacity",
                                    zIndex: isActive ? 10 : 0,
                                    pointerEvents: "none"
                                }}
                            />
                        );
                    })}
                </div>
                
                {/* Logo Top Left */}
                <div className="absolute top-10 left-10 z-20">
                    <Icons.Logo className="h-10 drop-shadow-md" showText={true} />
                </div>
                
                {/* Glass Card */}
                <div className="relative z-10 w-[80%] ml-[10%] rounded-[2rem] backdrop-blur-[10px] bg-slate-50/40 border border-white/50 p-12 shadow-2xl flex flex-col slide-up delay-200">
                    <h2 className="text-[2.75rem] font-medium text-[#1A2B3C] leading-[1.1] mb-6 tracking-tight drop-shadow-sm">
                        Arquitectura que<br/>
                        <span className="font-medium text-[#4C6F5A] italic">trasciende</span> el<br/>
                        tiempo.
                    </h2>
                    <p className="text-[#1A2B3C]/90 text-sm font-medium leading-relaxed max-w-[85%] drop-shadow-sm">
                        Diseñamos espacios que inspiran, conectan y perduran. Ingrese a su portal personalizado para gestionar su visión.
                    </p>
                </div>
            </div>

            {/* Right Form Side */}
            <div className="relative w-full lg:w-[52%] flex flex-col justify-center items-center py-12 px-6 lg:px-20 bg-[#FAFAFA]">
                
                {/* EN Language Toggle */}
                <div className="absolute top-10 right-10 flex items-center gap-2 border border-black/10 rounded-full px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-50 cursor-pointer transition-colors shadow-sm bg-white">
                    <Globe size={12} className="text-gray-400" />
                    <span>EN</span>
                </div>

                <div className="w-full max-w-md flex flex-col items-center">
                    
                    <h1 className="text-3xl font-bold text-[#1A2B3C] mb-2 tracking-tight">Bienvenido</h1>
                    <p className="text-[#64748B] text-[13px] mb-10 text-center font-medium">
                        {activeTab === 'client' 
                            ? "Ingrese el ID de su proyecto para ver los avances." 
                            : "Acceso exclusivo para el equipo de ARCHCOS."}
                    </p>

                    {/* Pill Tabs */}
                    <div className="flex items-center bg-[#F1F5F9] rounded-full p-1.5 mb-10 shadow-inner w-full max-w-xs relative text-xs font-bold text-gray-500">
                        <button 
                            onClick={() => { setActiveTab('client'); setError(''); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full transition-all duration-300 z-10 ${activeTab === 'client' ? 'bg-white text-[#1A2B3C] shadow-sm ring-1 ring-black/5' : 'hover:text-[#1A2B3C]'}`}
                        >
                            <User size={14} />
                            Portal Clientes
                        </button>
                        <button 
                            onClick={() => { setActiveTab('staff'); setError(''); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full transition-all duration-300 z-10 ${activeTab === 'staff' ? 'bg-white text-[#1A2B3C] shadow-sm ring-1 ring-black/5' : 'hover:text-[#1A2B3C]'}`}
                        >
                            <Icons.Building className="w-3.5 h-3.5" />
                            Acceso Staff
                        </button>
                    </div>

                    {error && <div className="mb-6 w-full text-center text-red-500 text-xs font-bold">{error}</div>}

                    {/* Forms Switcher */}
                    {activeTab === 'client' ? (
                        <form onSubmit={handleClientLogin} className="w-full space-y-6 flex flex-col items-center slide-up">
                            <div className="w-full flex flex-col gap-2">
                                <label className="text-[9px] font-black tracking-widest uppercase text-gray-400 ml-4">ID DEL PROYECTO</label>
                                <div className="relative w-full">
                                    <Hash size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input 
                                        type="text" 
                                        required 
                                        value={projectId} 
                                        onChange={e => setProjectId(e.target.value)}
                                        placeholder="Ej: PRJ-2026-001"
                                        className="w-full bg-white border border-gray-200 rounded-full py-3.5 pl-12 pr-6 text-[13px] font-semibold text-[#1A2B3C] placeholder:text-gray-300 placeholder:font-normal focus:outline-none focus:border-[#6A8D7D] focus:ring-4 focus:ring-[#6A8D7D] /10 transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                            <button type="submit" className="mt-2 bg-[#6A8D7D] hover:bg-[#5C7E6F] text-white rounded-full py-3.5 px-10 text-sm font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group">
                                Ver mi Proyecto
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </button>
                            
                            <div className="mt-16 text-center space-y-6 flex flex-col items-center">
                                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-400">ARCHCOS STUDIO</span>
                                <a href="#" className="text-[11px] text-gray-400 hover:text-[#6A8D7D] transition-colors relative after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[1px] after:bg-gray-300 after:hover:bg-[#6A8D7D] pb-0.5">
                                    ¿No conoce su ID? Contacte a su arquitecto asignado.
                                </a>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleStaffLogin} className="w-full space-y-6 flex flex-col items-center slide-up">
                            <div className="w-full flex flex-col gap-2">
                                <label className="text-[9px] font-black tracking-widest uppercase text-gray-400 ml-4">CORREO CORPORATIVO</label>
                                <div className="relative w-full">
                                    <Mail size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input 
                                        type="email" 
                                        required 
                                        value={email} 
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="nombre@archcos.com"
                                        className="w-full bg-white border border-gray-200 rounded-full py-3.5 pl-12 pr-6 text-[13px] font-semibold text-[#1A2B3C] placeholder:text-gray-300 placeholder:font-normal focus:outline-none focus:border-[#6A8D7D] focus:ring-4 focus:ring-[#6A8D7D]/10 transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                            <div className="w-full flex flex-col gap-2">
                                <div className="flex justify-between items-end px-4">
                                    <label className="text-[9px] font-black tracking-widest uppercase text-gray-400">CONTRASEÑA</label>
                                    <a href="#" className="text-[10px] text-[#6A8D7D] font-bold hover:underline">¿Olvidó su contraseña?</a>
                                </div>
                                <div className="relative w-full">
                                    <Lock size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input 
                                        type="password" 
                                        required 
                                        value={password} 
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-white border border-gray-200 rounded-full py-3.5 pl-12 pr-6 text-sm font-black tracking-widest text-[#1A2B3C] placeholder:text-gray-300 placeholder:font-normal focus:outline-none focus:border-[#6A8D7D] focus:ring-4 focus:ring-[#6A8D7D]/10 transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                            <button type="submit" className="mt-2 bg-[#6A8D7D] hover:bg-[#5C7E6F] text-white rounded-full w-full py-3.5 text-sm font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group max-w-[280px]">
                                Iniciar Sesión
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </button>
                            
                            <div className="mt-16 text-center space-y-6 flex flex-col items-center">
                                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-400">ARCHCOS STUDIO</span>
                                <span className="text-[10px] text-gray-400">
                                    Acceso restringido únicamente para personal autorizado.
                                </span>
                            </div>
                        </form>
                    )}
                </div>

                {/* Copyright Footer */}
                <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                    <span className="text-[8px] font-black tracking-[0.2em] text-gray-400 uppercase text-center max-w-[80%]">
                        © 2026 ARCHCOS ARCHITECTURE & DESIGN, TODOS LOS DERECHOS RESERVADOS.
                    </span>
                </div>
            </div>
            
        </div>
    );
};
export default LoginPage;
