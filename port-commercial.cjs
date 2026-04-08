const fs = require('fs');
const path = require('path');

const sourcePath = 'c:/Users/alfre/Desktop/before-design---archcos-commercial/src/App.tsx';
const targetPath = 'c:/Users/alfre/Desktop/Programa_Arquitectonico_ARCHCOS/src/CommercialApp.tsx';

let content = fs.readFileSync(sourcePath, 'utf8');

// 1. Remove unsupported imports
content = content.replace(/import \{ domToPng \} from 'modern-screenshot';\n/g, '');
content = content.replace(/import \{ jsPDF \} from 'jspdf';\n/g, '');
content = content.replace(/import \{ useTranslation \} from 'react-i18next';\n/g, '');
content = content.replace(/import '\.\/i18n\/config';\n/g, '');

// Fix constants imports
content = content.replace(/from '\.\/constants'/g, "from './constants/commercial'");
content = content.replace(/from '\.\/types'/g, "from './types/commercial'");

// 2. Inject mock useTranslation
const translationMock = `
const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    'common.progress': 'PROGRESS', 'common.save': 'SAVE', 'common.help': 'HELP', 'common.phase': 'PHASE',
    'common.custom_areas': 'Custom Areas', 'common.add_custom_area': '+ Add custom space', 'common.configurator': 'Configurator',
    'common.new_custom_area': 'New Space', 'common.space_name': 'Space Name', 'common.width': 'Width', 'common.length': 'Length',
    'common.total_area': 'Total Area', 'common.based_on_net': 'Based on precise net area', 'common.sq_ft': 'SQFT',
    'common.integrate_program': 'Integrate to Program', 'common.net_program': 'Net Area', 'common.circulation': 'Circulation (20%)',
    'common.gross_total': 'Gross Expected Construction', 'common.select': 'SELECT', 'common.min_required': 'Min Req.',
    'common.quantity': 'Qty', 'common.units': 'units', 'common.summary_title': 'Blueprint Summary', 'common.ref': 'Ref',
    'common.binding_line': 'OFFICIAL RECORD', 'common.not_specified': 'Not specified', 'common.blueprint_summary': 'Blueprint Summary',
    'common.commercial_intake': 'Commercial Intake', 'common.download_pdf': 'Export PDF', 'common.generating': 'Exporting...',
    'common.print': 'Print Official Document', 'common.project_identity': 'Project Identity', 'common.location_viability': 'Location & Viability',
    'common.scope_of_work': 'Scope of Work', 'common.target_audience': 'Target Audience', 'common.operational_strategic': 'Operational & Strategic',
    'common.plans': 'Plans', 'common.restrictions': 'Restrictions', 'common.priority': 'Priority', 'common.estimated_budget': 'Estimated Budget',
    'common.tbd': 'TBD', 'common.target_timeline': 'Target Timeline', 'common.parametric_note': 'Parametric intelligence accounts for...',
    'common.additional_custom_areas': 'Specific Areas', 'common.start_new_questionnaire': 'Approve & Save to Database',
    'common.confidential_document': 'Confidential', 'common.generated_on': 'Generated on'
  },
  es: {
    'common.progress': 'PROGRESO', 'common.save': 'GUARDAR', 'common.help': 'AYUDA', 'common.phase': 'FASE',
    'common.custom_areas': 'Áreas Especiales', 'common.add_custom_area': '+ Añadir área designada', 'common.configurator': 'Configurador',
    'common.new_custom_area': 'Nuevo Espacio', 'common.space_name': 'Nombre del Espacio', 'common.width': 'Ancho (W) ft', 'common.length': 'Largo (L) ft',
    'common.total_area': 'Área Total', 'common.based_on_net': 'Dimensión Neta', 'common.sq_ft': 'SQFT',
    'common.integrate_program': 'Integrar al Programa', 'common.net_program': 'Subtotal Neto', 'common.circulation': 'Circulación (20%)',
    'common.gross_total': 'Total Estimado', 'common.select': 'SELECCIONAR', 'common.min_required': 'Mín Req.',
    'common.quantity': 'Cant.', 'common.units': 'unid.', 'common.summary_title': 'Resumen de Ficha', 'common.ref': 'Ref',
    'common.binding_line': 'REGISTRO APROBADO', 'common.not_specified': 'No especificado', 'common.blueprint_summary': 'Ficha de Integración',
    'common.commercial_intake': 'Consulta Comercial', 'common.download_pdf': 'Guardar en Expediente', 'common.generating': 'Procesando...',
    'common.print': 'Impresión Formal', 'common.project_identity': 'Identidad del Proyecto', 'common.location_viability': 'Ubicación y Variables',
    'common.scope_of_work': 'Alcance', 'common.target_audience': 'Público', 'common.operational_strategic': 'Indicadores',
    'common.plans': 'Planos', 'common.restrictions': 'Restricciones', 'common.priority': 'Prioridad', 'common.estimated_budget': 'Presupuesto',
    'common.tbd': 'TBD', 'common.target_timeline': 'Timeline Base', 'common.parametric_note': 'El motor paramétrico añade zonas de tolerancia...',
    'common.additional_custom_areas': 'Volumetría Adicional', 'common.start_new_questionnaire': 'Finalizar y Guardar en Proyecto',
    'common.confidential_document': 'Documento Confidencial', 'common.generated_on': 'Generado:'
  }
};

let currentLangGlobal = 'es';

const useTranslation = () => {
    const [lang, setLang] = React.useState(currentLangGlobal);
    const t = (key: string) => TRANSLATIONS[lang]?.[key] || key;
    return {
        t,
        i18n: {
             language: lang,
             changeLanguage: (l: string) => { currentLangGlobal = l; setLang(l); }
        }
    };
};
`;

content = content.replace(/export default function App\(\) \{/, translationMock + "\nexport default function CommercialApp({ onComplete, initialData }: { onComplete?: (data: any) => void, initialData?: any }) {");

// 3. Inject initial state support
content = content.replace(/const \[formState, setFormState\] = useState<FormState>\(\{\}\);/, `const [formState, setFormState] = useState<FormState>(initialData || {});`);

// 4. Transform SummaryView export functions
content = content.replace(/const generateOfficialPDF = async \(\) => \{[\s\S]*?return pdf;\n  \};/g, `
  const generateOfficialPDF = async () => {
      window.print();
      return null;
  };
`);

content = content.replace(/const handleDownloadPDF = async \(\) => \{[\s\S]*?finally \{\n      setIsGenerating\(false\);\n    \}\n  \};/g, `
  const handleDownloadPDF = async () => {
      setIsGenerating(true);
      setTimeout(() => {
          onComplete?.(formState);
          setIsGenerating(false);
      }, 800);
  };
`);

content = content.replace(/const handlePrint = async \(\) => \{[\s\S]*?finally \{\n      setIsGenerating\(false\);\n    \}\n  \};/g, `
  const handlePrint = async () => {
      window.print();
  };
`);

// 5. Update the SummaryView signature to support onComplete forwarding
content = content.replace(/function SummaryView\(\{ formState, visiblePhases, netSqFt, circulationSqFt, grossSqFt, onReset, currentLang \}: \{/g, `function SummaryView({ formState, visiblePhases, netSqFt, circulationSqFt, grossSqFt, onReset, currentLang, onComplete }: {`);
content = content.replace(/onReset:\s*\(\) => void,/g, `onReset: () => void,\n  onComplete?: (data: any) => void,`);
content = content.replace(/<SummaryView(.*?)\/>/gs, `<SummaryView$1 onComplete={onComplete} />`);

fs.writeFileSync(targetPath, content);
console.log('CommercialApp.tsx successfully generated!');
