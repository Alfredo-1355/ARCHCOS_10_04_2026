// src/features/NewProjectWizard/NewProjectWizard.tsx

import React, { useState, useContext } from 'react';
import { ProjectContext } from '../../contexts/DashboardContext';
import { useProjectStore } from '../../store/projectStore';
import { compressImage } from '../../utils/image';
import MapPicker from './components/MapPicker';
import { DashIcons as Icons, CATEGORY_ICONS, SUBTYPE_OPTIONS, EMOJI_MAP } from '../../constants/dashboard';
import { Project } from '../../types/dashboard';
import ArchplanApp from '../../App';
import CommercialApp from '../../CommercialApp';

const NewProjectWizard = ({ navigate }: { navigate: (path: string) => void }) => {
  const { addProject, updateProject, editingProject } = useContext(ProjectContext);
  const { currentProject, updateProject: syncGlobal } = useProjectStore();
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isQuestionnaireOpen, setIsQuestionnaireOpen] = useState(false);

  interface FormData {
    projectName: string;
    address: string;
    clientName: string;
    type: string;
    subtype: string;
    deliveryDate: string;
    procedure: string;
    desc: string;
    imageUrl: string;
    sizeSqft: string;
    commercialData?: any;
    architectural_program?: any;
    [key: string]: any;
  }

  const [formData, setFormData] = useState<FormData>(
    editingProject
      ? { ...editingProject }
      : {
          projectName: currentProject?.projectName || '',
          address: currentProject?.location || '',
          clientName: currentProject?.clientName || '',
          type: currentProject?.type || '',
          subtype: '',
          deliveryDate: currentProject?.estimatedDeliveryDate || '',
          procedure: 'Obra Nueva (Permiso)',
          desc: '',
          imageUrl: '',
          sizeSqft: ''
        }
  );

  // Sync wizard changes to global store in real-time (SSOT)
  const updateForm = (key: string, val: any) => {
    setFormData(prev => ({ ...prev, [key]: val }));
    // Map local wizard fields to global standard fields
    if (key === 'projectName') syncGlobal({ projectName: val });
    if (key === 'address') syncGlobal({ location: val });
    if (key === 'clientName') syncGlobal({ clientName: val });
    if (key === 'deliveryDate') syncGlobal({ estimatedDeliveryDate: val });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) return alert('Imagen demasiado grande (máx 20MB)');
      compressImage(file, dataUrl => {
        updateForm('imageUrl', dataUrl);
      });
    }
  };

  const handleFinish = async () => {
    if (isSaving) return;
    try {
      setIsSaving(true);
      const finalPayload = { ...formData };
      if (formData.type === 'Residencial') {
        finalPayload.architectural_program = currentProject?.residentialProgram;
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
        navigate('#/dashboard');
      }
    } catch (err: any) {
      console.error('Error crítico en Wizard:', err);
      alert('Error en la aplicación: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-arch-bg slide-up relative">
      <header className="px-10 py-8 flex items-center justify-between border-b border-arch-border bg-arch-bg/90 backdrop-blur z-20 sticky top-0">
        {editingProject && <div className="absolute top-0 left-0 right-0 h-1 bg-arch-brand-sky slide-up" />}
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
            <div key={i} className={`flex items-center gap-3 ${step >= i + 1 ? 'text-arch-text' : 'text-arch-trim'}`}>
              <span className={`font-sans font-bold text-lg ${step >= i + 1 ? 'text-arch-brand-sky' : 'opacity-60'}`}>0{i + 1}</span>
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
                  <label className="block text-[10px] font-semibold text-arch-text-muted tracking-widest uppercase mb-4">Coordenadas o Dirección Física</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={e => updateForm('address', e.target.value)}
                    placeholder="Ej. Av. Reforma 22..."
                    className="w-full bg-transparent border-b border-arch-border pb-3 text-xl font-light focus:border-arch-text transition-colors placeholder:text-arch-trim"
                  />
                </div>
                <button onClick={() => setStep(2)} disabled={!formData.address}
                  className="w-full sm:w-auto self-start bg-arch-brand-sage text-arch-text hover:bg-arch-brand-sky disabled:opacity-30 py-4 px-10 text-xs font-bold tracking-[0.3em] uppercase transition-all shadow-sm"
                >
                  Avanzar al Programa
                </button>
              </div>
              <div className="w-full lg:w-7/12 relative border border-arch-border p-2 bg-white">
                <div className="absolute inset-2 relative overflow-hidden h-full min-h-[300px]">
                  <MapPicker address={formData.address} onChange={val => updateForm('address', val)} />
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
                        <label
                          key={tipo}
                          onClick={() => { updateForm('type', tipo); updateForm('subtype', ''); }}
                          className={`flex items-center gap-6 p-6 cursor-pointer border-2 transition-all ${formData.type === tipo ? 'border-brand-blue bg-brand-blue/15 shadow-elegant' : 'border-arch-border hover:border-brand-blue/30 hover:bg-brand-neutral'}`}
                        >
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
                          <button
                            key={st}
                            onClick={() => updateForm('subtype', st)}
                            className={`text-left p-4 text-sm font-medium border-2 transition-all ${formData.subtype === st ? 'bg-brand-green/15 text-brand-dark-green border-brand-green' : 'bg-transparent border-arch-border text-arch-text-muted hover:border-brand-green/40'}`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-[10px] font-semibold text-arch-text-muted tracking-widest uppercase mb-4">Tipo de Intervención</label>
                    <select
                      value={formData.procedure}
                      onChange={e => updateForm('procedure', e.target.value)}
                      className="w-full bg-transparent border-b border-arch-border pb-3 text-lg font-light focus:border-arch-text transition-colors cursor-pointer appearance-none"
                    >
                      <option value="Obra Nueva (Permiso)">◱ Obra Nueva (Permiso)</option>
                      <option value="Remodelación / Adecuación">◩ Remodelación / Adecuación</option>
                      <option value="Restauración Histórica">◪ Restauración Histórica</option>
                      <option value="Mantenimiento Mayor">◧ Mantenimiento Mayor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-arch-text-muted tracking-widest uppercase mb-4">Nombre del Cliente (Opcional)</label>
                    <input
                      type="text"
                      value={formData.clientName}
                      onChange={e => updateForm('clientName', e.target.value)}
                      placeholder="Ej. Familia Thompson..."
                      className="w-full bg-transparent border-b border-arch-border pb-3 text-lg font-light focus:border-arch-text transition-colors placeholder:text-arch-trim"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-arch-text-muted tracking-widest uppercase mb-4">Fecha Estimada de Proyecto</label>
                    <input
                      type="date"
                      value={formData.deliveryDate}
                      onChange={e => updateForm('deliveryDate', e.target.value)}
                      className="w-full bg-transparent border-b border-arch-border pb-3 text-lg font-light focus:border-arch-text transition-colors text-arch-text"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-arch-text-muted tracking-widest uppercase mb-4">Size / SQFT (Tamaño Estimado)</label>
                    <input
                      type="text"
                      value={formData.sizeSqft}
                      onChange={e => updateForm('sizeSqft', e.target.value)}
                      placeholder="Ej. 1,200 sqft / 110 m2..."
                      className="w-full bg-transparent border-b border-arch-border pb-3 text-lg font-light focus:border-arch-text transition-colors placeholder:text-arch-trim"
                    />
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
                      onClick={e => { e.preventDefault(); setIsQuestionnaireOpen(true); }}
                      className="mt-4 md:mt-0 bg-white border border-arch-brand-sage/50 hover:border-arch-brand-sage hover:bg-arch-brand-sage/10 text-arch-text py-3 px-6 text-[9px] font-bold tracking-[0.3em] uppercase transition-all flex items-center gap-3"
                    >
                      Abrir Completo <span className="text-arch-brand-sage/80 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">↗</span>
                    </button>
                  </div>
                ) : (
                  <>
                    <label className="block text-[10px] font-semibold text-arch-text-muted tracking-widest uppercase mb-4">Memoria Descriptiva Temprana</label>
                    <textarea
                      value={formData.desc}
                      onChange={e => updateForm('desc', e.target.value)}
                      rows={3}
                      className="w-full bg-transparent border-b border-arch-border pb-3 text-lg font-light focus:border-arch-text transition-colors resize-none placeholder:text-arch-trim"
                      placeholder="Describa brevemente las intenciones de diseño..."
                    />
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
                    <Icons.Folder className="w-8 h-8 text-arch-text-muted mb-2" />
                    <span className="text-sm font-light text-arch-text-muted bg-white/50 px-2 rounded backdrop-blur-sm">
                      {formData.imageUrl ? 'Imagen cargada - Clic para cambiar' : 'Clic para cargar imagen desde dispositivo'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-arch-border pt-8">
                <button onClick={() => setStep(1)} className="text-xs font-bold tracking-[0.2em] uppercase text-arch-text-muted hover:text-brand-green transition-colors">
                  Volver
                </button>
                <button onClick={() => setStep(3)} disabled={!formData.type || !formData.subtype || !formData.deliveryDate}
                  className="bg-arch-brand-sage text-arch-text hover:bg-arch-brand-sky disabled:opacity-30 py-4 px-10 text-xs font-bold tracking-[0.3em] uppercase transition-all shadow-soft"
                >
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
                <div className="absolute top-0 right-10 w-[1px] h-10 bg-arch-border" />
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
                <button onClick={() => setStep(2)} className="text-xs font-semibold tracking-widest uppercase text-arch-text-muted hover:text-brand-blue transition-colors px-6">
                  Modificar
                </button>
                <button onClick={handleFinish} disabled={isSaving} className={`bg-arch-brand-sky hover:bg-arch-brand-sage text-arch-text py-4 px-12 text-xs font-bold tracking-[0.4em] uppercase transition-all shadow-soft flex items-center gap-3 group ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
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
                onComplete={data => { updateForm('commercialData', data); setIsQuestionnaireOpen(false); }}
              />
            ) : (
              <ArchplanApp
                initialData={formData.architectural_program}
                onChange={data => updateForm('architectural_program', data)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NewProjectWizard;
