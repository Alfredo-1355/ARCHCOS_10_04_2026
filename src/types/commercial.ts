export type FieldType = 'Texto Corto' | 'Texto Largo' | 'Opción Múltiple' | 'Checkboxes' | 'Número' | 'Fecha' | 'Chips' | 'Image Picker';

export interface LocalizedString {
  en: string;
  es: string;
}

export interface Question {
  id: string;
  label: string | LocalizedString;
  type: FieldType | 'Area Stepper';
  options?: string[] | { value: string; label: LocalizedString }[];
  optionIcons?: { [key: string]: string }; // Map option value to Lucide icon name
  placeholder?: string | LocalizedString;
  required?: boolean;
  minSqFt?: number; // Minimum square footage for one unit of this area
  helperText?: string | LocalizedString;
  icon?: string; // Lucide icon name
  condition?: (state: FormState) => boolean;
}

export interface Phase {
  id: string;
  title: string | LocalizedString;
  description: string | LocalizedString;
  questions: Question[];
  condition?: (state: FormState) => boolean;
}

export interface CustomArea {
  id: string;
  name: string;
  qty: number;
  width: number;
  length: number;
  sqFt: number;
}

export interface FormState {
  [key: string]: any;
  custom_areas?: CustomArea[];
}
