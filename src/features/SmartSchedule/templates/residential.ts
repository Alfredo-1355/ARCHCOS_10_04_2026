import { Category, TaskRow, ProjectSchedule } from '../../../types/dashboard';
import { uid, buildWeeks } from '../utils/helpers';

/**
 * Residential Master Template v1
 * 45 Deliverables, 4 Phases, 17 Weeks
 */

const createWeeks = (start: number, end: number, total = 17) => {
    const arr = Array(total).fill(false);
    for (let i = start - 1; i < end; i++) {
        if (i < total) arr[i] = true;
    }
    return arr;
};

export const getResidentialTemplate = (startDate: string): ProjectSchedule => {
    const categories: Category[] = [
        {
            id: 'cat_arq',
            name: 'Arquitectónicos',
            color: '#60A5FA',
            icon: 'Building2',
            expanded: true,
            tasks: [
                { id: uid(), name: 'Existing / Proposed Site Plan', type: 'critical', weeks: createWeeks(1, 2), progress: 0 },
                { id: uid(), name: '1st & 2nd Floor Plan', type: 'critical', weeks: createWeeks(1, 2), progress: 0 },
                { id: uid(), name: 'Proposed Facades (Option A)', type: 'critical', weeks: createWeeks(3, 4), progress: 0 },
                { id: uid(), name: 'Proposed Roof Plan', type: 'critical', weeks: createWeeks(3, 3), progress: 0 },
                { id: uid(), name: 'Proposed Cross Sections', type: 'refinement', weeks: createWeeks(4, 5), progress: 0 },
                { id: uid(), name: 'Life Safety & Fire Safety Plan', type: 'refinement', weeks: createWeeks(6, 7), progress: 0 },
                { id: uid(), name: 'Accessibility Guidelines', type: 'refinement', weeks: createWeeks(6, 6), progress: 0 },
                { id: uid(), name: 'Measurements Plan', type: 'refinement', weeks: createWeeks(6, 6), progress: 0 },
                { id: uid(), name: 'Doors & Windows Plan', type: 'refinement', weeks: createWeeks(7, 7), progress: 0 },
                { id: uid(), name: 'Enlarged Restroom Plan & Elev.', type: 'refinement', weeks: createWeeks(8, 9), progress: 0 },
                { id: uid(), name: 'Reflected Ceiling Plan', type: 'refinement', weeks: createWeeks(8, 9), progress: 0 },
                { id: uid(), name: 'Interior Finish Plan', type: 'refinement', weeks: createWeeks(9, 10), progress: 0 },
                { id: uid(), name: 'Building Floor Penetration Plan', type: 'refinement', weeks: createWeeks(9, 10), progress: 0 },
            ]
        },
        {
            id: 'cat_renders',
            name: 'Renders',
            color: '#EC4899',
            icon: 'LayoutGrid',
            expanded: true,
            tasks: [
                { id: uid(), name: 'Exterior Renders', type: 'refinement', weeks: createWeeks(2, 2), progress: 0 },
                { id: uid(), name: 'Interior Renders', type: 'refinement', weeks: createWeeks(3, 4), progress: 0 },
            ]
        },
        {
            id: 'cat_est',
            name: 'Estructurales',
            color: '#FACC15',
            icon: 'Layers',
            expanded: true,
            tasks: [
                { id: uid(), name: 'Foundation Plan', type: 'critical', weeks: createWeeks(3, 4), progress: 0 },
                { id: uid(), name: 'Foundation Details', type: 'refinement', weeks: createWeeks(4, 5), progress: 0 },
                { id: uid(), name: 'Anchor Bolt Plan', type: 'refinement', weeks: createWeeks(5, 5), progress: 0 },
                { id: uid(), name: 'Framing Elevations', type: 'critical', weeks: createWeeks(6, 7), progress: 0 },
                { id: uid(), name: 'Roof Rafter Framing Plan', type: 'critical', weeks: createWeeks(6, 7), progress: 0 },
                { id: uid(), name: 'Drywall Grid Ceiling Plan', type: 'refinement', weeks: createWeeks(7, 8), progress: 0 },
                { id: uid(), name: 'Typ. Wall Detail / 2HR Fire Rated', type: 'refinement', weeks: createWeeks(7, 7), progress: 0 },
                { id: uid(), name: 'Windstorm Construction Details', type: 'refinement', weeks: createWeeks(7, 7), progress: 0 },
                { id: uid(), name: 'Construction Notes', type: 'refinement', weeks: createWeeks(11, 11), progress: 0 },
            ]
        },
        {
            id: 'cat_mep',
            name: 'MEP',
            color: '#34D399',
            icon: 'Wrench',
            expanded: true,
            tasks: [
                { id: uid(), name: 'Proposed Mechanical Plans', type: 'critical', weeks: createWeeks(6, 7), progress: 0 },
                { id: uid(), name: 'Mechanical Details', type: 'refinement', weeks: createWeeks(8, 8), progress: 0 },
                { id: uid(), name: 'Water Plumbing Floor Plan', type: 'critical', weeks: createWeeks(6, 7), progress: 0 },
                { id: uid(), name: 'Water Waste Floor Plan', type: 'refinement', weeks: createWeeks(7, 8), progress: 0 },
                { id: uid(), name: 'Gas Floor Plan', type: 'refinement', weeks: createWeeks(8, 8), progress: 0 },
                { id: uid(), name: 'Plumbing Details', type: 'refinement', weeks: createWeeks(9, 9), progress: 0 },
                { id: uid(), name: 'Electrical Lighting Plan', type: 'refinement', weeks: createWeeks(9, 10), progress: 0 },
                { id: uid(), name: 'Electrical Power Plan', type: 'refinement', weeks: createWeeks(8, 9), progress: 0 },
                { id: uid(), name: 'Electrical Panels & Details', type: 'refinement', weeks: createWeeks(10, 11), progress: 0 },
                { id: uid(), name: 'Electrical Site Plan', type: 'refinement', weeks: createWeeks(10, 10), progress: 0 },
            ]
        },
        {
            id: 'cat_civil',
            name: 'Civil',
            color: '#A78BFA',
            icon: 'MapPin',
            expanded: true,
            tasks: [
                { id: uid(), name: 'Grading Plan (Detention & Mit.)', type: 'refinement', weeks: createWeeks(6, 7), progress: 0 },
                { id: uid(), name: 'Drainage Area Map', type: 'refinement', weeks: createWeeks(7, 8), progress: 0 },
                { id: uid(), name: 'Utility Plan', type: 'refinement', weeks: createWeeks(7, 7), progress: 0 },
                { id: uid(), name: 'Paving Plan', type: 'refinement', weeks: createWeeks(8, 8), progress: 0 },
                { id: uid(), name: 'Storm Water Quality (SWQP)', type: 'refinement', weeks: createWeeks(8, 9), progress: 0 },
                { id: uid(), name: 'Traffic Plan', type: 'refinement', weeks: createWeeks(7, 7), progress: 0 },
                { id: uid(), name: 'Septic New Design', type: 'refinement', weeks: createWeeks(8, 8), progress: 0 },
            ]
        },
        {
            id: 'cat_rev',
            name: 'Revisión Cliente & CA',
            color: '#F59E0B',
            icon: 'CheckCircle2',
            expanded: true,
            tasks: [
                { id: uid(), name: 'Revisión Schematic Design (SD)', type: 'review', weeks: createWeeks(2, 2), progress: 0 },
                { id: uid(), name: 'Revisión Design Development (DD)', type: 'review', weeks: createWeeks(5, 5), progress: 0 },
                { id: uid(), name: 'Revisión Construction Docs (CD)', type: 'review', weeks: createWeeks(12, 12), progress: 0 },
                { id: uid(), name: 'Aprobación Final HOA / Permitting', type: 'milestone', weeks: createWeeks(13, 17), progress: 0 },
            ]
        }
    ];

    return {
        categories,
        weeks: buildWeeks(17),
        startDate,
        statuses: {},
        timeScale: 'weeks'
    };
};
