import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  MapPin, 
  Calendar, 
  FileText, 
  Image as ImageIcon, 
  ListTodo, 
  Video,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  Eye,
  Camera,
  Layers,
  ThermometerSun,
  Palette,
  Users,
  Compass
} from 'lucide-react';

const MOCK_PROJECT = {
  name: "86 Kings Lake Residence",
  location: "Kings Lake, Naples, FL",
  status: "En Diseño Esquemático",
  progress: 25,
  architect: "ARCHCOS Studio",
  lastUpdate: "Trabajando en detalles de la distribución de la cocina e integración térmica del ventanal este.",
  weather: "Soleado, 28°C",
  nextMilestone: {
    title: "Revisión de Fachadas",
    date: "15 de Mayo, 2026",
    daysLeft: 8
  },
  dna: {
    style: "Moderno Contemporáneo",
    colors: ["#2d3748", "#e2e8f0", "#c6f6d5"],
    needs: [
      "Doble altura en la sala principal",
      "Cocina de chef abierta al comedor",
      "Iluminación cálida indirecta",
      "Espacio para 2 perros grandes"
    ],
    inhabitants: 4,
    pets: 2
  },
  gallery: [
    { url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80", title: "Fachada Principal - Concepto" },
    { url: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&q=80", title: "Sala a doble altura" },
    { url: "https://images.unsplash.com/photo-1600566753086-00f18efc2291?w=800&q=80", title: "Cocina y Comedor" }
  ],
  timeline: [
    { id: 1, phase: "Briefing Arquitectónico", status: "completed", date: "10 Abril 2026", desc: "Definición de necesidades y estilo." },
    { id: 2, phase: "Diseño Esquemático", status: "current", date: "En curso", desc: "Generación de volumetría y plantas iniciales." },
    { id: 3, phase: "Planos Constructivos", status: "pending", date: "Junio 2026", desc: "Ingenierías y desarrollo técnico." },
    { id: 4, phase: "Permisos y Licencias", status: "pending", date: "Agosto 2026", desc: "Aprobación de la ciudad." },
    { id: 5, phase: "Construcción", status: "pending", date: "Octubre 2026", desc: "Ejecución de obra física." }
  ],
  log: [
    { id: 1, week: "Semana 4", date: "01 May", note: "Aprobación del master plan y zonificación.", img: "https://images.unsplash.com/photo-1541888086425-d81bb19240f5?w=500&q=80" },
    { id: 2, week: "Semana 3", date: "24 Abr", note: "Visita al terreno y toma de medidas finales.", img: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=500&q=80" }
  ]
};

type Tab = 'overview' | 'dna' | 'gallery' | 'timeline' | 'log';

export default function ClientDashboard({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const tabs: { id: Tab, label: string, icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Resumen', icon: <Home size={18} /> },
    { id: 'dna', label: 'Mi Programa', icon: <Compass size={18} /> },
    { id: 'gallery', label: 'Galería', icon: <ImageIcon size={18} /> },
    { id: 'timeline', label: 'Cronograma', icon: <Calendar size={18} /> },
    { id: 'log', label: 'Bitácora', icon: <Video size={18} /> }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col h-[85vh] bg-white rounded-3xl overflow-hidden shadow-2xl border border-brand-ink/10 relative">
      
      {/* HEADER */}
      <header className="bg-brand-ink text-white p-6 md:p-8 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            aria-label="Volver"
          >
            <ChevronRight size={24} className="rotate-180" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{MOCK_PROJECT.name}</h1>
            <div className="flex items-center gap-2 text-white/60 text-sm mt-1">
              <MapPin size={14} /> {MOCK_PROJECT.location}
            </div>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-white/50 uppercase tracking-widest font-bold">Estado</p>
            <p className="text-brand-green-light font-medium">{MOCK_PROJECT.status}</p>
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-brand-green-light flex items-center justify-center font-bold text-lg">
            {MOCK_PROJECT.progress}%
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-brand-neutral/20">
        
        {/* SIDEBAR NAVIGATION */}
        <nav className="w-full md:w-64 bg-white/80 backdrop-blur-md border-r border-brand-ink/10 shrink-0 overflow-x-auto md:overflow-y-auto">
          <div className="flex md:flex-col p-4 md:p-6 gap-2 min-w-max md:min-w-0">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm md:text-base ${
                  activeTab === tab.id 
                    ? 'bg-brand-ink text-white shadow-md' 
                    : 'text-brand-ink/60 hover:bg-brand-ink/5 hover:text-brand-ink'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        {/* TAB CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          <AnimatePresence mode="wait">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid gap-6 md:grid-cols-2"
              >
                <div className="glass-card p-6 md:col-span-2 bg-white rounded-2xl border border-brand-ink/5 shadow-sm flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-brand-green-light/20 flex items-center justify-center text-brand-green-dark shrink-0">
                    <AlertCircle size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-brand-ink mb-1">Última Actualización</h3>
                    <p className="text-brand-ink/70 leading-relaxed">{MOCK_PROJECT.lastUpdate}</p>
                  </div>
                </div>

                <div className="bg-brand-ink text-white p-6 rounded-2xl shadow-lg relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:scale-110 transition-transform duration-500">
                    <Calendar size={100} />
                  </div>
                  <h3 className="font-bold text-white/50 text-xs uppercase tracking-widest mb-4">Próximo Hito</h3>
                  <p className="text-3xl font-light mb-1">{MOCK_PROJECT.nextMilestone.title}</p>
                  <p className="text-brand-green-light font-medium">{MOCK_PROJECT.nextMilestone.date}</p>
                  <div className="mt-8 flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full w-max backdrop-blur-sm">
                    <Clock size={16} /> Falta {MOCK_PROJECT.nextMilestone.daysLeft} días
                  </div>
                </div>

                <div className="bg-gradient-to-br from-brand-neutral to-brand-green-light/20 p-6 rounded-2xl border border-brand-ink/5 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-brand-ink/50 text-xs uppercase tracking-widest mb-4">Ubicación y Clima</h3>
                    <p className="text-xl font-medium text-brand-ink mb-1">{MOCK_PROJECT.location}</p>
                    <div className="flex items-center gap-2 text-brand-ink/70">
                      <ThermometerSun size={18} /> {MOCK_PROJECT.weather}
                    </div>
                  </div>
                  <div className="mt-6 w-full h-32 bg-black/5 rounded-xl overflow-hidden relative">
                    <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80" alt="Map" className="w-full h-full object-cover opacity-60" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-4 h-4 bg-brand-green-dark rounded-full shadow-[0_0_15px_rgba(35,78,82,0.6)] animate-pulse" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* DNA TAB */}
            {activeTab === 'dna' && (
              <motion.div
                key="dna"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-brand-ink">El ADN del Proyecto</h2>
                    <p className="text-brand-ink/60">Tus necesidades y visión, plasmadas.</p>
                  </div>
                  <button className="flex items-center gap-2 bg-white border border-brand-ink/20 px-4 py-2 rounded-xl text-brand-ink hover:bg-brand-neutral transition-colors text-sm font-medium shadow-sm">
                    <FileText size={16} /> Ver PDF Original
                  </button>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="col-span-2 grid grid-cols-2 gap-4">
                    <div className="bg-white p-6 rounded-2xl border border-brand-ink/5 shadow-sm">
                      <Palette className="text-brand-green-dark mb-4" size={28} />
                      <p className="text-xs uppercase text-brand-ink/50 font-bold mb-1">Estilo Arquitectónico</p>
                      <p className="font-medium text-lg">{MOCK_PROJECT.dna.style}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-brand-ink/5 shadow-sm">
                      <Users className="text-brand-green-dark mb-4" size={28} />
                      <p className="text-xs uppercase text-brand-ink/50 font-bold mb-1">Habitantes</p>
                      <p className="font-medium text-lg">{MOCK_PROJECT.dna.inhabitants} Personas, {MOCK_PROJECT.dna.pets} Mascotas</p>
                    </div>
                  </div>
                  
                  <div className="bg-brand-ink text-white p-6 rounded-2xl shadow-md">
                    <p className="text-xs uppercase text-white/50 font-bold mb-4">Paleta de Colores</p>
                    <div className="flex gap-3">
                      {MOCK_PROJECT.dna.colors.map(color => (
                        <div key={color} className="w-12 h-12 rounded-full border-2 border-white/20 shadow-inner" style={{ backgroundColor: color }} />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-brand-ink/5 shadow-sm">
                  <p className="text-xs uppercase text-brand-ink/50 font-bold mb-4">Prioridades de Diseño</p>
                  <ul className="grid md:grid-cols-2 gap-3">
                    {MOCK_PROJECT.dna.needs.map((need, idx) => (
                      <li key={idx} className="flex items-start gap-3 bg-brand-neutral/30 p-3 rounded-lg">
                        <CheckCircle2 size={18} className="text-brand-green-dark shrink-0 mt-0.5" />
                        <span className="text-brand-ink/80 text-sm font-medium">{need}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}

            {/* GALLERY TAB */}
            {activeTab === 'gallery' && (
              <motion.div
                key="gallery"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-brand-ink">Entregables Visuales</h2>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-brand-ink text-white rounded-lg text-sm font-medium">Imágenes</button>
                    <button className="px-4 py-2 bg-white border border-brand-ink/20 text-brand-ink rounded-lg text-sm font-medium">Planos PDFs</button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {MOCK_PROJECT.gallery.map((item, idx) => (
                    <div key={idx} className="group relative rounded-2xl overflow-hidden aspect-video shadow-md cursor-pointer">
                      <img src={item.url} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                        <p className="text-white font-bold text-lg">{item.title}</p>
                        <div className="flex gap-3 mt-3">
                          <button className="flex items-center gap-1 bg-white/20 hover:bg-white/40 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs font-medium transition-colors"><Eye size={14} /> Ver Ampliado</button>
                          <button className="flex items-center gap-1 bg-white hover:bg-gray-100 px-3 py-1.5 rounded-lg text-brand-ink text-xs font-medium transition-colors"><Download size={14} /> Descargar</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* TIMELINE TAB */}
            {activeTab === 'timeline' && (
              <motion.div
                key="timeline"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-2xl mx-auto"
              >
                <h2 className="text-2xl font-bold text-brand-ink mb-8">Cronograma del Proyecto</h2>
                <div className="relative border-l-2 border-brand-ink/10 ml-6 space-y-8">
                  {MOCK_PROJECT.timeline.map((item, idx) => (
                    <div key={item.id} className="relative pl-8">
                      <div className={`absolute -left-[11px] top-1 w-5 h-5 rounded-full border-4 border-white ${
                        item.status === 'completed' ? 'bg-brand-green-dark' :
                        item.status === 'current' ? 'bg-brand-ink animate-pulse-slow' : 'bg-gray-300'
                      }`} />
                      
                      <div className={`p-5 rounded-2xl border ${
                        item.status === 'current' ? 'bg-white shadow-lg border-brand-ink/20' : 
                        item.status === 'completed' ? 'bg-brand-neutral/50 border-transparent opacity-80' : 'bg-white/50 border-transparent opacity-50'
                      }`}>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className={`font-bold text-lg ${item.status === 'current' ? 'text-brand-ink' : 'text-brand-ink/70'}`}>{item.phase}</h4>
                          <span className="text-xs font-bold uppercase tracking-wider text-brand-ink/40">{item.date}</span>
                        </div>
                        <p className="text-brand-ink/60 text-sm">{item.desc}</p>
                        
                        {item.status === 'current' && (
                          <div className="mt-4 w-full bg-brand-ink/5 rounded-full h-1.5">
                            <div className="bg-brand-ink h-1.5 rounded-full w-[45%]" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* LOG TAB */}
            {activeTab === 'log' && (
              <motion.div
                key="log"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-brand-ink">Bitácora Visual</h2>
                  <div className="bg-brand-green-light/20 text-brand-green-dark px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-green-dark animate-pulse" /> Obra no iniciada
                  </div>
                </div>

                <div className="bg-white p-12 rounded-3xl border border-brand-ink/10 flex flex-col items-center justify-center text-center shadow-sm">
                  <div className="w-20 h-20 bg-brand-neutral rounded-full flex items-center justify-center text-brand-ink/20 mb-4">
                    <Camera size={40} />
                  </div>
                  <h3 className="font-bold text-xl text-brand-ink mb-2">Fase de Construcción Pendiente</h3>
                  <p className="text-brand-ink/50 max-w-md mx-auto">Las fotos y reportes de avance semanal aparecerán aquí una vez que el proyecto inicie la fase de obra civil.</p>
                </div>

                <div className="mt-8 space-y-6 opacity-40 grayscale pointer-events-none">
                  <p className="text-xs font-bold uppercase text-brand-ink/50 tracking-widest pl-2">VISTA PREVIA</p>
                  {MOCK_PROJECT.log.map((item) => (
                    <div key={item.id} className="flex bg-white rounded-2xl overflow-hidden border border-brand-ink/10 shadow-sm">
                      <div className="w-48 shrink-0">
                        <img src={item.img} alt="Avance" className="w-full h-full object-cover" />
                      </div>
                      <div className="p-6 flex-1">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-bold text-lg">{item.week}</h4>
                          <span className="text-xs text-brand-ink/50">{item.date}</span>
                        </div>
                        <p className="text-brand-ink/70 text-sm">{item.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
