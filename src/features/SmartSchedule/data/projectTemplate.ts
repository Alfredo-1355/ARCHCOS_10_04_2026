export interface TemplateTask {
  id: string;
  name: string;
  category: 'arch' | 'mep' | 'struct' | 'renders' | 'civil' | 'client' | 'other';
  duration: number; // in units (days or weeks)
  dependsOn?: string[];
  type?: 'critical' | 'refinement' | 'review';
}

export const ARCHITECTURAL_TEMPLATE: TemplateTask[] = [
  // Phase 1
  { id: 'site_plan', name: 'Existing Site Plan', category: 'arch', duration: 2, type: 'critical' },
  { id: 'floor_plan', name: '1st & 2nd Floor Plan', category: 'arch', duration: 3, dependsOn: ['site_plan'], type: 'critical' },

  // Phase 2
  { id: 'roof_plan', name: 'Roof Plan', category: 'arch', duration: 1, dependsOn: ['floor_plan'] },
  { id: 'facades', name: 'Facades', category: 'arch', duration: 2, dependsOn: ['floor_plan'] },
  { id: 'ext_renders', name: 'Exterior Renders', category: 'renders', duration: 2, dependsOn: ['floor_plan'] },
  { id: 'sd_review', name: 'Schematic Design Review', category: 'client', duration: 1, dependsOn: ['roof_plan', 'facades', 'ext_renders'], type: 'review' },

  // Phase 3 (Parallel)
  { id: 'civil_grading', name: 'Civil Grading', category: 'civil', duration: 2, dependsOn: ['sd_review'] },
  { id: 'foundation', name: 'Foundation Plan', category: 'struct', duration: 2, dependsOn: ['sd_review'], type: 'critical' },
  { id: 'roof_framing', name: 'Roof Framing', category: 'struct', duration: 2, dependsOn: ['sd_review'] },

  // Phase 4 (MEP Hierarchy - Sequential)
  { id: 'plumbing', name: 'Plumbing/Water', category: 'mep', duration: 2, dependsOn: ['foundation'] },
  { id: 'hvac', name: 'HVAC/Mechanical', category: 'mep', duration: 2, dependsOn: ['plumbing'] },
  { id: 'electrical', name: 'Electrical', category: 'mep', duration: 2, dependsOn: ['hvac'], type: 'critical' },

  // Phase 5 (Finishes)
  { id: 'rcp', name: 'Reflected Ceiling Plan', category: 'arch', duration: 2, dependsOn: ['electrical'] },
  { id: 'int_renders', name: 'Interior Renders', category: 'renders', duration: 3, dependsOn: ['electrical'] },
  { id: 'doors_windows', name: 'Doors & Windows', category: 'arch', duration: 1, dependsOn: ['electrical'] },

  // Phase 6 (Closure)
  { id: 'cd_review', name: 'Construction Docs Review', category: 'client', duration: 1, dependsOn: ['rcp', 'int_renders', 'doors_windows'], type: 'review' },
  { id: 'permits', name: 'HOA/Permit Approvals', category: 'other', duration: 4, dependsOn: ['cd_review'], type: 'critical' },
];
