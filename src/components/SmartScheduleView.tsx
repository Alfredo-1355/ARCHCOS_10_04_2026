import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  RefreshCw,
  Zap,
  PlayCircle,
  StopCircle,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  GripVertical,
  X,
  Settings,
  Building2,
  Wrench,
  Layers,
  Image,
  MapPin,
  Briefcase,
  Calendar,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import { USERS } from "../AdminDashboard";

type TaskStatus = "not_started" | "in_progress" | "completed" | "delayed";
interface TaskRow {
  id: string;
  name: string;
  type: "critical" | "refinement" | "review";
  blocks: boolean[];
  progress: number;
  baselineBlocks?: boolean[];
  assigneeId?: string | null;
  zeroFloat?: boolean;
}
interface TimeColumn {
  id: string;
  label: string;
  offset: number;
  isWeekend?: boolean;
}
interface Category {
  id: string;
  name: string;
  color: string;
  icon: React.ElementType;
  tasks: TaskRow[];
  expanded: boolean;
}
interface ProjectSchedule {
  categories: Category[];
  columns: TimeColumn[];
  startDate: string;
  statuses: Record<string, TaskStatus>;
  timeScale: "weeks" | "days";
}
interface Props {
  project?: any;
  projects?: any[];
  onProjectSelect?: (id: string) => void;
  navigate?: (path: string) => void;
  updateProject?: (p: any) => Promise<boolean>;
  user?: any;
}

const PHASES = [
  {
    id: "sd",
    short: "SD",
    label: "Schematic Design",
    color: "#0A2342",
    bg: "#DBEAFE",
    frac: 0.3,
  },
  {
    id: "dd",
    short: "DD",
    label: "Design Development",
    color: "#1A56DB",
    bg: "#BFDBFE",
    frac: 0.56,
  },
  {
    id: "cd",
    short: "CD",
    label: "Construction Docs",
    color: "#0891B2",
    bg: "#BAE6FD",
    frac: 0.81,
  },
  {
    id: "ca",
    short: "CA",
    label: "Contract Admin",
    color: "#4338CA",
    bg: "#E0E7FF",
    frac: 1.0,
  },
];
const getPhase = (wi: number, total: number) => {
  const f = (wi + 1) / total;
  return PHASES.find((p) => f <= p.frac) ?? PHASES[3];
};

const STATUS_CFG: Record<
  TaskStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  not_started: {
    label: "No iniciada",
    color: "#94A3B8",
    icon: <Clock size={9} />,
  },
  in_progress: {
    label: "En progreso",
    color: "#1A56DB",
    icon: <RefreshCw size={9} />,
  },
  completed: {
    label: "Completada",
    color: "#10B981",
    icon: <CheckCircle2 size={9} />,
  },
  delayed: {
    label: "Retrasada",
    color: "#EF4444",
    icon: <AlertTriangle size={9} />,
  },
};
const STATUS_ORDER: TaskStatus[] = [
  "not_started",
  "in_progress",
  "completed",
  "delayed",
];

const TEAM_MEMBERS = [
  {
    id: "t1",
    name: "Arianna M.",
    role: "Architect",
    avatar: "AM",
    color: "#8B5CF6",
  },
  {
    id: "t2",
    name: "Luis G.",
    role: "MEP Engineer",
    avatar: "LG",
    color: "#10B981",
  },
  {
    id: "t3",
    name: "Elena R.",
    role: "Civil Engineer",
    avatar: "ER",
    color: "#F59E0B",
  },
  {
    id: "t4",
    name: "Carlos V.",
    role: "Project Mgr",
    avatar: "CV",
    color: "#1A56DB",
  },
];

const uid = () => Math.random().toString(36).slice(2, 9);
const addDays = (d: Date, n: number) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};
const fmtDate = (d: Date) =>
  d.toLocaleDateString("es-MX", { month: "short", day: "numeric" });
const fmtTime = (s: number) =>
  `${Math.floor(s / 3600)
    .toString()
    .padStart(2, "0")}:${Math.floor((s % 3600) / 60)
    .toString()
    .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
const buildWeeks = (n: number): Week[] =>
  Array.from({ length: n }, (_, i) => ({
    id: uid(),
    label: `S${i + 1}`,
    offset: i * 7,
  }));
const relabel = (ws: Week[]): Week[] =>
  ws.map((w, i) => ({ ...w, label: `S${i + 1}` }));

const buildDefaults = (n: number): Category[] => {
  const w = (idx: number[]) =>
    Array.from({ length: n }, (_, i) => idx.includes(i));
  const t = (
    id: string,
    name: string,
    type: TaskRow["type"],
    ws: number[],
    prog: number,
    assg?: string,
    zf?: boolean,
  ): TaskRow => ({
    id,
    name,
    type,
    weeks: w(ws),
    progress: prog,
    assignee: assg || null,
    zeroFloat: zf || false,
  });
  return [
    {
      id: "arch",
      name: "Architectural Plans",
      color: "#0A2342",
      icon: Building2,
      expanded: true,
      tasks: [
        t(
          "a1",
          "Existing / Proposed Site Plan",
          "critical",
          [0, 1],
          0,
          "t1",
          true,
        ),
        t("a2", "1st & 2nd Floor Plan", "critical", [1, 2, 3], 0, "t1"),
        t("a3", "Proposed Roof Plan", "refinement", [3, 4], 0, "t1"),
        t("a4", "Proposed Facades (Option A)", "critical", [2, 3], 0, "t1"),
        t("a5", "Proposed Cross Sections", "refinement", [4, 5], 0, "t1"),
        t(
          "a6",
          "Life Safety & Fire Safety Plan",
          "critical",
          [5, 6],
          0,
          "t1",
          true,
        ),
        t("a7", "Accessibility Guidelines", "refinement", [6], 0, "t1"),
        t(
          "a8",
          "Building Floor Penetration Plan",
          "refinement",
          [6, 7],
          0,
          "t1",
        ),
        t(
          "a9",
          "Enlarged Restroom Plan & Elevations",
          "refinement",
          [7],
          0,
          "t1",
        ),
        t("a10", "Interior Finish Plan", "refinement", [7, 8], 0, "t1"),
        t("a11", "Reflected Ceiling Plan", "refinement", [8], 0, "t1"),
        t("a12", "Doors & Windows Plan", "refinement", [8, 9], 0, "t1"),
        t("a13", "Measurements Plan", "refinement", [9], 0, "t1"),
      ],
    },
    {
      id: "mep",
      name: "MEP Plans",
      color: "#1A56DB",
      icon: Wrench,
      expanded: false,
      tasks: [
        t("m1", "Proposed Mechanical Plans", "critical", [4, 5, 6], 0, "t2"),
        t("m2", "Mechanical Details", "refinement", [6, 7], 0, "t2"),
        t("m3", "Water Plumbing Floor Plan", "critical", [5, 6], 0, "t2", true),
        t("m4", "Water Waste Floor Plan", "critical", [5, 6, 7], 0, "t2", true),
        t("m5", "Gas Floor Plan", "refinement", [7], 0, "t2"),
        t("m6", "Plumbing Details", "refinement", [7, 8], 0, "t2"),
        t("m7", "Electrical Lighting Plan", "critical", [8, 9], 0, "t2"),
        t("m8", "Electrical Power Plan", "critical", [8, 9, 10], 0, "t2", true),
        t("m9", "Electrical Panels & Details", "refinement", [10], 0, "t2"),
        t("m10", "Electrical Site Plan", "refinement", [10, 11], 0, "t2"),
      ],
    },
    {
      id: "struct",
      name: "Structurals",
      color: "#0891B2",
      icon: Layers,
      expanded: false,
      tasks: [
        t("s1", "Foundation Plan", "critical", [5, 6, 7], 0, "t3", true),
        t("s2", "Foundation Details", "refinement", [7, 8], 0, "t3"),
        t("s3", "Anchor Bolt Plan", "refinement", [8], 0, "t3"),
        t("s4", "Drywall Grid Ceiling Plan", "critical", [8, 9], 0, "t3"),
        t("s5", "Roof Rafter Framing Plan", "critical", [9, 10], 0, "t3"),
        t("s6", "Framing Elevations", "refinement", [10], 0, "t3"),
        t(
          "s7",
          "Typ. Wall Detail / 2HR Fire Rated",
          "refinement",
          [10, 11],
          0,
          "t3",
          true,
        ),
        t("s8", "Construction Notes", "refinement", [11], 0, "t3"),
        t(
          "s9",
          "Windstorm Construction Details",
          "critical",
          [11, 12],
          0,
          "t3",
          true,
        ),
      ],
    },
    {
      id: "renders",
      name: "Renders",
      color: "#4338CA",
      icon: Image,
      expanded: false,
      tasks: [
        t("r1", "Exterior Renders", "critical", [2, 3], 0, "t1"),
        t("r2", "Interior Renders", "refinement", [6, 7], 0, "t1"),
      ],
    },
    {
      id: "civil",
      name: "Civil Plans",
      color: "#38BDF8",
      icon: MapPin,
      expanded: false,
      tasks: [
        t(
          "c1",
          "Grading Plan (Detention & Mitigation)",
          "critical",
          [9, 10, 11],
          0,
          "t3",
        ),
        t("c2", "Drainage Area Map", "refinement", [11], 0, "t3"),
        t("c3", "Utility Plan", "critical", [11, 12], 0, "t3"),
        t("c4", "Paving Plan", "refinement", [12], 0, "t3"),
        t(
          "c5",
          "Storm Water Quality (SWQP)",
          "critical",
          [12, 13],
          0,
          "t3",
          true,
        ),
        t("c6", "Traffic Plan", "refinement", [13], 0, "t3"),
        t("c7", "Septic New Design", "refinement", [13, 14], 0, "t3", true),
      ],
    },
    {
      id: "revisiones",
      name: "Revisiones del Cliente",
      color: "#D97706",
      icon: Eye,
      expanded: true,
      tasks: [
        t("rv1", "Revisión Schematic Design (SD)", "review", [4, 5], 0, "t4"),
        t(
          "rv2",
          "Revisión Design Development (DD)",
          "review",
          [9, 10],
          0,
          "t4",
        ),
        t(
          "rv3",
          "Revisión Construction Docs (CD)",
          "review",
          [13, 14],
          0,
          "t4",
        ),
        t(
          "rv4",
          "Aprobación Final HOA / Permitting",
          "review",
          [15],
          0,
          "t4",
          true,
        ),
      ],
    },
  ];
};

// ── Sub-components ──
const MiniRing: React.FC<{ pct: number; color: string }> = ({ pct, color }) => {
  const r = 8,
    c = 2 * Math.PI * r;
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" className="flex-shrink-0">
      <circle
        cx="10"
        cy="10"
        r={r}
        fill="none"
        stroke="#E2E8F0"
        strokeWidth="2.5"
      />
      <circle
        cx="10"
        cy="10"
        r={r}
        fill="none"
        stroke={pct === 100 ? "#10B981" : color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c - (c * pct) / 100}
        transform="rotate(-90 10 10)"
        style={{ transition: "stroke-dashoffset 0.8s ease" }}
      />
    </svg>
  );
};

const InfoChip: React.FC<{ icon: string; label: string; accent?: boolean }> = ({
  icon,
  label,
  accent,
}) => (
  <div
    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-semibold ${accent ? "bg-[#0A2342] text-white border-[#0A2342]" : "bg-[#F8FAFC] text-[#475569] border-[#E2E8F0]"}`}
  >
    <span>{icon}</span>
    <span className="max-w-[160px] truncate">{label}</span>
  </div>
);

// ── Main ──
const SmartScheduleView: React.FC<Props> = ({
  project,
  projects = [],
  onProjectSelect,
  navigate,
}) => {
  const DWC = 16;
  const [store, setStore] = useState<Record<string, ProjectSchedule>>({});
  const [startDate, setStartDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + 1);
    return d;
  });
  const [search, setSearch] = useState("");
  const [drag, setDrag] = useState<{
    catId: string;
    taskId: string;
    toggling: boolean;
  } | null>(null);
  const pid = project?.id || "default";

  const cur = useMemo<ProjectSchedule>(
    () =>
      store[pid] ?? {
        categories: buildDefaults(DWC),
        weeks: buildWeeks(DWC),
        startDate: startDate.toISOString(),
        statuses: {},
      },
    [store, pid],
  );
  const { categories, weeks, statuses } = cur;
  const wc = weeks.length;

  const save = (fn: (p: ProjectSchedule) => ProjectSchedule) =>
    setStore((prev) => {
      const c = prev[pid] ?? {
        categories: buildDefaults(DWC),
        weeks: buildWeeks(DWC),
        startDate: startDate.toISOString(),
        statuses: {},
      };
      return { ...prev, [pid]: fn(c) };
    });
  const setCats = (fn: (p: Category[]) => Category[]) =>
    save((s) => ({ ...s, categories: fn(s.categories) }));
  const cycleStatus = (tid: string) =>
    save((s) => ({
      ...s,
      statuses: {
        ...s.statuses,
        [tid]:
          STATUS_ORDER[
            (STATUS_ORDER.indexOf(s.statuses[tid] ?? "not_started") + 1) % 4
          ],
      },
    }));

  const delWeek = (wi: number) =>
    save((s) => ({
      ...s,
      weeks: relabel(s.weeks.filter((_, i) => i !== wi)),
      categories: s.categories.map((c) => ({
        ...c,
        tasks: c.tasks.map((t) => ({
          ...t,
          weeks: t.weeks.filter((_, i) => i !== wi),
        })),
      })),
    }));
  const insAfter = (wi: number) =>
    save((s) => {
      const nw = [...s.weeks];
      nw.splice(wi + 1, 0, {
        id: uid(),
        label: "",
        offset: (s.weeks[wi]?.offset ?? wi * 7) + 7,
      });
      return {
        ...s,
        weeks: relabel(nw),
        categories: s.categories.map((c) => ({
          ...c,
          tasks: c.tasks.map((t) => {
            const nws = [...t.weeks];
            nws.splice(wi + 1, 0, false);
            return { ...t, weeks: nws };
          }),
        })),
      };
    });
  const addWeek = () =>
    save((s) => ({
      ...s,
      weeks: [
        ...s.weeks,
        {
          id: uid(),
          label: `S${s.weeks.length + 1}`,
          offset: (s.weeks[s.weeks.length - 1]?.offset ?? -7) + 7,
        },
      ],
      categories: s.categories.map((c) => ({
        ...c,
        tasks: c.tasks.map((t) => ({ ...t, weeks: [...t.weeks, false] })),
      })),
    }));
  const renameWk = (wi: number, label: string) =>
    save((s) => ({
      ...s,
      weeks: s.weeks.map((w, i) => (i === wi ? { ...w, label } : w)),
    }));

  const [editName, setEditName] = useState<{
    catId: string;
    taskId: string;
  } | null>(null);
  const [editCat, setEditCat] = useState<string | null>(null);
  const [editWk, setEditWk] = useState<number | null>(null);
  const [timers, setTimers] = useState<Record<string, boolean>>({});
  const [elapsed, setElapsed] = useState<Record<string, number>>({});
  const [generated, setGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [hovWk, setHovWk] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const COL_W = Math.max(20, Math.round(60 * zoom));
  const FONT_SCALE = Math.max(1, zoom * 0.85); // Scales font gently based on zoom
  const nameRef = useRef<HTMLInputElement>(null);
  const catRef = useRef<HTMLInputElement>(null);
  const wkRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editName) setTimeout(() => nameRef.current?.select(), 30);
  }, [editName]);
  useEffect(() => {
    if (editCat) setTimeout(() => catRef.current?.select(), 30);
  }, [editCat]);
  useEffect(() => {
    if (editWk !== null) setTimeout(() => wkRef.current?.select(), 30);
  }, [editWk]);
  useEffect(() => {
    const iv = setInterval(
      () =>
        setElapsed((p) => {
          const n = { ...p };
          Object.keys(timers).forEach((id) => {
            if (timers[id]) n[id] = (n[id] || 0) + 1;
          });
          return n;
        }),
      1000,
    );
    return () => clearInterval(iv);
  }, [timers]);

  const updAssignee = (cid: string, tid: string, assignee: string) =>
    setCats((p) =>
      p.map((c) =>
        c.id !== cid
          ? c
          : {
              ...c,
              tasks: c.tasks.map((t) =>
                t.id !== tid ? t : { ...t, assignee },
              ),
            },
      ),
    );

  const gen = () => {
    setGenerating(true);
    setGenerated(false);
    const steps = [
      "Leyendo Programa…",
      "Calibrando ruta crítica…",
      "Ajustando revisiones…",
      "Guardando línea base…",
    ];
    let i = 0;
    setStatusMsg(steps[0]);
    const iv = setInterval(() => {
      i++;
      if (i < steps.length) setStatusMsg(steps[i]);
      else {
        clearInterval(iv);
        // Parametric Calculation
        const sqft = project?.sqft || 4000;
        const yieldPerDay = 500;
        const totalWorkDays = sqft / yieldPerDay;
        const calcWeeks = Math.max(8, Math.ceil(totalWorkDays / 5) * 4); // Just a heuristic multiplier to reach ~16 weeks for average projects
        const scale = calcWeeks / 16.0;

        save((s) => {
          const newWkCount = Math.max(DWC, Math.ceil(16 * scale));
          const newWeeks = buildWeeks(newWkCount);

          const newCats = s.categories.map((c) => ({
            ...c,
            tasks: c.tasks.map((t) => {
              const firstWk = t.weeks.indexOf(true);
              const lastWk = t.weeks.lastIndexOf(true);
              const origLen = lastWk >= 0 ? lastWk - firstWk + 1 : 0;

              let newWks = Array(newWkCount).fill(false);
              if (origLen > 0) {
                const newStart = Math.round(firstWk * scale);
                const newLen = Math.max(1, Math.round(origLen * scale));
                for (let j = 0; j < newLen; j++) {
                  if (newStart + j < newWkCount) newWks[newStart + j] = true;
                }
              }
              // Set the baseline to exactly the generated weeks.
              return { ...t, weeks: newWks, baselineWeeks: [...newWks] };
            }),
          }));
          return { ...s, categories: newCats, weeks: newWeeks };
        });

        setGenerating(false);
        setGenerated(true);
        setStatusMsg("");
      }
    }, 400);
  };
  useEffect(() => {
    gen();
  }, [pid]);

  const todayWi = useMemo(() => {
    const t = new Date();
    for (let i = 0; i < weeks.length; i++) {
      const s = addDays(startDate, weeks[i].offset);
      const e = addDays(startDate, weeks[i].offset + 7);
      if (t >= s && t < e) return i;
    }
    return -1;
  }, [weeks, startDate]);

  const allTasks = useMemo(
    () => categories.flatMap((c) => c.tasks),
    [categories],
  );
  const wkLoad = useMemo(
    () => weeks.map((_, i) => allTasks.filter((t) => t.weeks[i]).length),
    [allTasks, weeks],
  );
  const maxLoad = Math.max(...wkLoad, 1);

  const toggleExpand = (cid: string) =>
    setCats((p) =>
      p.map((c) => (c.id === cid ? { ...c, expanded: !c.expanded } : c)),
    );
  const addTask = (cid: string, type: TaskRow["type"] = "refinement") => {
    const t: TaskRow = {
      id: uid(),
      name: type === "review" ? "Nueva Revisión" : "Nuevo Plano",
      type,
      weeks: Array(wc).fill(false),
      progress: 0,
    };
    setCats((p) =>
      p.map((c) =>
        c.id !== cid ? c : { ...c, tasks: [...c.tasks, t], expanded: true },
      ),
    );
    setTimeout(() => setEditName({ catId: cid, taskId: t.id }), 80);
  };
  const addCat = () => {
    const c: Category = {
      id: uid(),
      name: "Nueva Disciplina",
      color: "#64748B",
      icon: Settings,
      expanded: true,
      tasks: [],
    };
    setCats((p) => [...p, c]);
    setTimeout(() => setEditCat(c.id), 80);
  };
  const delTask = (cid: string, tid: string) =>
    setCats((p) =>
      p.map((c) =>
        c.id !== cid ? c : { ...c, tasks: c.tasks.filter((t) => t.id !== tid) },
      ),
    );
  const delCat = (cid: string) => setCats((p) => p.filter((c) => c.id !== cid));
  const updName = (cid: string, tid: string, name: string) =>
    setCats((p) =>
      p.map((c) =>
        c.id !== cid
          ? c
          : {
              ...c,
              tasks: c.tasks.map((t) => (t.id !== tid ? t : { ...t, name })),
            },
      ),
    );
  const updCatName = (cid: string, name: string) =>
    setCats((p) => p.map((c) => (c.id !== cid ? c : { ...c, name })));
  const toggleWk = (cid: string, tid: string, wi: number, force?: boolean) =>
    setCats((p) =>
      p.map((c) =>
        c.id !== cid
          ? c
          : {
              ...c,
              tasks: c.tasks.map((t) =>
                t.id !== tid
                  ? t
                  : {
                      ...t,
                      weeks: t.weeks.map((v, i) =>
                        i === wi ? (force !== undefined ? force : !v) : v,
                      ),
                    },
              ),
            },
      ),
    );
  const updProg = (cid: string, tid: string, v: number) =>
    setCats((p) =>
      p.map((c) =>
        c.id !== cid
          ? c
          : {
              ...c,
              tasks: c.tasks.map((t) =>
                t.id !== tid
                  ? t
                  : { ...t, progress: Math.max(0, Math.min(100, v)) },
              ),
            },
      ),
    );
  const toggleType = (cid: string, tid: string) => {
    const o: TaskRow["type"][] = ["critical", "refinement", "review"];
    setCats((p) =>
      p.map((c) =>
        c.id !== cid
          ? c
          : {
              ...c,
              tasks: c.tasks.map((t) =>
                t.id !== tid
                  ? t
                  : { ...t, type: o[(o.indexOf(t.type) + 1) % 3] },
              ),
            },
      ),
    );
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.toLowerCase();
    return categories
      .map((c) => ({
        ...c,
        tasks: c.tasks.filter((t) => t.name.toLowerCase().includes(q)),
      }))
      .filter((c) => c.tasks.length > 0 || c.name.toLowerCase().includes(q));
  }, [categories, search]);

  const onMouseUp = useCallback(() => setDrag(null), []);
  useEffect(() => {
    window.addEventListener("mouseup", onMouseUp);
    return () => window.removeEventListener("mouseup", onMouseUp);
  }, [onMouseUp]);

  const crit = allTasks.filter((t) => t.type === "critical").length;
  const ref = allTasks.filter((t) => t.type === "refinement").length;
  const rev = allTasks.filter((t) => t.type === "review").length;
  const avgPct = allTasks.length
    ? Math.round(allTasks.reduce((a, t) => a + t.progress, 0) / allTasks.length)
    : 0;
  const lastWk =
    allTasks.reduce((m, t) => {
      const l = t.weeks.lastIndexOf(true);
      return l > m ? l : m;
    }, 0) + 1;
  const eff = generated ? Math.min(99, 94 - Math.round(avgPct * 0.02)) : 0;

  const assigneeLoad = useMemo(() => {
    const load: Record<string, number[]> = {};
    TEAM_MEMBERS.forEach((tm) => (load[tm.id] = Array(wc).fill(0)));
    allTasks.forEach((t) => {
      if (t.assignee && load[t.assignee]) {
        t.weeks.forEach((active, wi) => {
          if (active) load[t.assignee][wi]++;
        });
      }
    });
    return load;
  }, [allTasks, wc]);

  // S-Curve Calculation
  const sCurve = useMemo(() => {
    let planned: number[] = [];
    let actual: number[] = [];
    if (!allTasks.length || wc === 0) return { planned, actual };

    // Planned Velocity
    const totalWksAllTasks = allTasks.reduce(
      (sum, t) => sum + (t.baselineWeeks?.filter(Boolean).length || 1),
      0,
    );
    // Aggregate cumulative
    let accumPlan = 0;
    for (let wi = 0; wi < wc; wi++) {
      let wkContribution = 0;
      allTasks.forEach((t) => {
        const tWks = t.baselineWeeks?.filter(Boolean).length || 1;
        if (t.baselineWeeks?.[wi]) wkContribution += 1 / tWks;
      });
      accumPlan += (wkContribution / allTasks.length) * 100;
      planned.push(Math.min(100, accumPlan));
    }

    // Actual Spread
    const currentActual = allTasks.length
      ? allTasks.reduce((a, t) => a + t.progress, 0) / allTasks.length
      : 0;
    for (let wi = 0; wi < wc; wi++) {
      if (wi <= todayWi || todayWi === -1) {
        const plHere = planned[wi < 1 ? 0 : wi];
        const plToday =
          planned[todayWi >= 0 ? todayWi : planned.length - 1] || 1;
        const ratio = currentActual / plToday;
        actual.push(Math.min(100, plHere * ratio));
      }
    }
    if (todayWi >= 0 && actual.length > 0)
      actual[actual.length - 1] = currentActual;

    return { planned, actual };
  }, [allTasks, wc, todayWi]);

  const ptsPlanned = sCurve.planned
    .map((val, i) => `${i * (200 / (wc - 1 || 1))},${60 - (val / 100) * 60}`)
    .join(" ");
  const ptsActual = sCurve.actual
    .map((val, i) => `${i * (200 / (wc - 1 || 1))},${60 - (val / 100) * 60}`)
    .join(" ");

  const FIXED_W = 398; // Increased for assignee dropdown (8+230+70+10+80)

  return (
    <div
      className="bg-[#F8FAFC] h-full overflow-y-auto font-sans text-[#0A192F]"
      onMouseUp={onMouseUp}
    >
      <div className="flex flex-col gap-4 p-4 xl:p-5 max-w-[1900px] mx-auto min-h-max">
        {/* TOP BAR */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm px-5 py-4">
          <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
            <div>
              <button
                onClick={() => navigate?.("#/dashboard")}
                className="flex items-center gap-1.5 text-[#94A3B8] hover:text-[#0A192F] text-[10px] font-black uppercase tracking-widest mb-1 transition-colors"
              >
                <ArrowLeft size={11} />
                Directorio
              </button>
              <h1 className="text-3xl font-extrabold tracking-tighter">
                Smart Schedule<span className="text-[#1A56DB]">.</span>
              </h1>
            </div>
            <div className="flex flex-col gap-1 flex-1 max-w-sm">
              <label className="text-[9px] font-black text-[#64748B] uppercase tracking-widest flex items-center gap-1.5">
                <Briefcase size={9} className="text-[#1A56DB]" />
                Proyecto
              </label>
              <select
                value={project?.id || ""}
                onChange={(e) => onProjectSelect?.(e.target.value)}
                aria-label="Seleccionar proyecto"
                className="w-full h-10 px-3 border-2 border-[#0A2342] rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#0A2342]/20 bg-white appearance-none cursor-pointer"
              >
                {projects.length === 0 && (
                  <option value="">Sin proyectos</option>
                )}
                {projects.map((p: any) => {
                  const id = p.id ? `[${p.id.slice(0, 6).toUpperCase()}]` : "";
                  const nm = p.name || p.title || p.nombre || "Sin nombre";
                  return (
                    <option key={p.id} value={p.id}>
                      {id} {nm}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="flex flex-wrap gap-2 items-end">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black text-[#64748B] uppercase tracking-widest flex items-center gap-1">
                  <Calendar size={9} />
                  Inicio
                </label>
                <input
                  type="date"
                  aria-label="Fecha de inicio"
                  value={startDate.toISOString().slice(0, 10)}
                  onChange={(e) => {
                    const d = new Date(e.target.value + "T00:00:00");
                    if (!isNaN(d.getTime())) setStartDate(d);
                  }}
                  className="h-9 px-2 border border-[#E2E8F0] rounded-lg text-xs font-bold focus:outline-none bg-white"
                />
              </div>
              <button
                onClick={addWeek}
                className="h-9 flex items-center gap-1.5 px-3 border border-[#E2E8F0] rounded-lg text-xs font-bold text-[#64748B] hover:border-[#1A56DB] hover:text-[#1A56DB] transition-all bg-white"
              >
                <Plus size={12} />
                Semana
              </button>
              <button
                onClick={gen}
                disabled={generating}
                className="h-9 flex items-center gap-2 px-5 bg-[#0A2342] text-white rounded-xl font-bold text-sm hover:bg-[#112240] shadow-md transition-all disabled:opacity-60"
              >
                {generating ? (
                  <RefreshCw
                    size={14}
                    className="animate-spin text-[#38BDF8]"
                  />
                ) : (
                  <Zap size={14} className="text-[#38BDF8]" />
                )}
                {generating ? statusMsg.slice(0, 20) : "⟳ Generar Plan"}
              </button>
            </div>
          </div>
          {project && (
            <div className="mt-3 pt-3 border-t border-[#F1F5F9] flex flex-wrap gap-x-5 gap-y-2 items-center">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-black text-[#94A3B8] uppercase tracking-widest">
                  ID
                </span>
                <span className="text-[11px] font-black text-[#0A192F] font-mono">
                  {project.id?.slice(0, 10) || "—"}
                </span>
              </div>
              {(project.client || project.clientName || project.cliente) && (
                <InfoChip
                  icon="👤"
                  label={
                    project.client || project.clientName || project.cliente
                  }
                />
              )}
              {(project.location || project.address || project.ubicacion) && (
                <InfoChip
                  icon="ðŸ“"
                  label={
                    project.location || project.address || project.ubicacion
                  }
                />
              )}
              {project.stage && (
                <InfoChip icon="📌" label={project.stage} accent />
              )}
              {project.sqft && (
                <InfoChip
                  icon="ðŸ“"
                  label={`${Math.round(project.sqft).toLocaleString()} SqFt`}
                />
              )}
              {(project.status || project.estado) && (
                <InfoChip
                  icon="🔄"
                  label={project.status || project.estado}
                />
              )}
              {project.activities?.length > 0 &&
                (() => {
                  const p = Math.round(
                    project.activities.reduce(
                      (s: number, a: any) => s + (a.completionPercentage || 0),
                      0,
                    ) / project.activities.length,
                  );
                  return (
                    <InfoChip
                      icon="⚡"
                      label={`${p}% completado`}
                      accent={p > 50}
                    />
                  );
                })()}
            </div>
          )}
        </div>

        <div className="flex flex-col xl:flex-row gap-4">
          {/* TABLE */}
          <div className="flex-1 min-w-0 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
            {/* Search & Zoom */}
            <div className="px-4 py-2.5 border-b border-[#F1F5F9] flex items-center gap-2 bg-[#FAFBFC]">
              <Search size={13} className="text-[#94A3B8] flex-shrink-0" />
              <input
                type="text"
                placeholder="Buscar plano o disciplina…"
                aria-label="Buscar plano"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 text-xs bg-transparent focus:outline-none text-[#0A192F] placeholder:text-[#CBD5E1]"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="text-[#94A3B8] hover:text-[#0A192F]"
                >
                  <X size={12} />
                </button>
              )}
              <div className="flex-none flex items-center gap-1 border-l border-[#E2E8F0] pl-3 ml-2">
                <button
                  onClick={() => setZoom((z) => Math.max(0.4, z - 0.2))}
                  className="w-6 h-6 flex items-center justify-center rounded text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#0A192F] transition-colors"
                  title="Alejar"
                >
                  <ZoomOut size={13} />
                </button>
                <span className="text-[10px] font-bold text-[#64748B] w-8 text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={() => setZoom((z) => Math.min(4.0, z + 0.2))}
                  className="w-6 h-6 flex items-center justify-center rounded text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#0A192F] transition-colors"
                  title="Acercar"
                >
                  <ZoomIn size={13} />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <div style={{ minWidth: `${FIXED_W + wc * COL_W + 76}px` }}>
                {/* PHASE BANNER */}
                <div className="flex">
                  <div
                    className="flex-none border-r border-[#E2E8F0]"
                    style={{ width: FIXED_W }}
                  />
                  {weeks.map((wk, wi) => {
                    const ph = getPhase(wi, wc);
                    const prev = wi > 0 ? getPhase(wi - 1, wc) : null;
                    const next = wi < wc - 1 ? getPhase(wi + 1, wc) : null;
                    const isStart = !prev || prev.id !== ph.id;
                    const isEnd = !next || next.id !== ph.id;
                    return (
                      <div
                        key={wk.id}
                        className="flex-none h-6 flex items-center justify-center text-[9px] font-black border-r border-white/40 last:border-r-0 transition-all overflow-hidden"
                        style={{
                          width: COL_W,
                          background: ph.bg,
                          color: ph.color,
                          borderRadius:
                            isStart && isEnd
                              ? "4px"
                              : isStart
                                ? "4px 0 0 4px"
                                : isEnd
                                  ? "0 4px 4px 0"
                                  : "0",
                        }}
                        title={`${ph.label} (${ph.short})`}
                      >
                        {isStart && zoom > 0.6 ? ph.short : ""}
                      </div>
                    );
                  })}
                  <div className="flex-none w-[76px]" />
                </div>

                {/* COLUMN HEADERS */}
                <div className="flex border-b-2 border-[#E2E8F0] bg-[#F8FAFC] sticky top-0 z-20">
                  <div className="flex-none w-8 border-r border-[#E2E8F0]" />
                  <div className="flex-none w-[230px] px-3 py-2 border-r border-[#E2E8F0] text-[9px] font-black uppercase tracking-widest text-[#64748B]">
                    Plan / Plano
                  </div>
                  <div className="flex-none w-[70px] px-2 py-2 border-r border-[#E2E8F0] text-[9px] font-black uppercase tracking-widest text-[#64748B]">
                    Asignado
                  </div>
                  <div className="flex-none w-10 text-center py-2 border-r border-[#E2E8F0] text-[9px] font-black uppercase tracking-widest text-[#64748B]">
                    %
                  </div>
                  <div className="flex-none w-20 px-2 py-2 border-r border-[#E2E8F0] text-[9px] font-black uppercase tracking-widest text-[#64748B]">
                    Avance
                  </div>
                  {weeks.map((wk, wi) => {
                    const isToday = wi === todayWi;
                    const load = wkLoad[wi];
                    const lp = Math.round((load / maxLoad) * 100);
                    const lc =
                      lp > 80 ? "#EF4444" : lp > 50 ? "#F59E0B" : "#1A56DB";
                    return (
                      <div
                        key={wk.id}
                        className="flex-none text-center border-r border-[#E2E8F0] last:border-r-0 relative group/wk"
                        style={{
                          width: COL_W,
                          background: isToday ? "#FFFBEB" : undefined,
                        }}
                        onMouseEnter={() => setHovWk(wi)}
                        onMouseLeave={() => setHovWk(null)}
                      >
                        {isToday && (
                          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-amber-400/60 z-10 pointer-events-none" />
                        )}
                        {editWk === wi ? (
                          <input
                            ref={wkRef}
                            defaultValue={wk.label}
                            onBlur={(e) => {
                              renameWk(wi, e.target.value || `S${wi + 1}`);
                              setEditWk(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === "Escape")
                                (e.target as HTMLInputElement).blur();
                            }}
                            className="w-full text-center font-black border-b border-[#1A56DB] bg-transparent focus:outline-none py-0.5"
                            style={{ fontSize: `${Math.round(10 * FONT_SCALE)}px` }}
                          />
                        ) : (
                          <div
                            onDoubleClick={() => setEditWk(wi)}
                            className={`font-black cursor-pointer py-0.5 select-none ${isToday ? "text-amber-600" : "text-[#0A192F] hover:text-[#1A56DB]"}`}
                            style={{ fontSize: `${Math.round(10 * FONT_SCALE)}px` }}
                          >
                            {wk.label}
                            {isToday ? " ◆" : ""}
                          </div>
                        )}
                        <div
                          className={`font-medium ${isToday ? "text-amber-500" : "text-[#94A3B8]"}`}
                          style={{ fontSize: `${Math.round(8 * FONT_SCALE)}px` }}
                        >
                          {fmtDate(addDays(startDate, wk.offset))}
                        </div>
                        {/* Heatmap */}
                        <div className="px-2 pb-1 pt-0.5">
                          <div
                            className="w-full h-1 bg-[#F1F5F9] rounded-full overflow-hidden"
                            title={`${load} tarea${load === 1 ? "" : "s"}`}
                          >
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${lp}%`, background: lc }}
                            />
                          </div>
                        </div>
                        {/* Hover controls */}
                        <AnimatePresence>
                          {hovWk === wi && (
                            <motion.div
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.12 }}
                              className="absolute -top-1 inset-x-0 flex items-center justify-center gap-0.5 z-30"
                            >
                              <button
                                onClick={() => delWeek(wi)}
                                className="w-5 h-5 rounded bg-red-500 text-white flex items-center justify-center hover:bg-red-600 shadow-sm"
                                title="Eliminar semana"
                              >
                                <X size={9} />
                              </button>
                              <button
                                onClick={() => insAfter(wi)}
                                className="w-5 h-5 rounded bg-[#1A56DB] text-white flex items-center justify-center hover:bg-[#1D4ED8] shadow-sm"
                                title="Insertar después"
                              >
                                <Plus size={9} />
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                  <button
                    onClick={addWeek}
                    title="Añadir semana"
                    className="flex-none w-10 flex items-center justify-center text-[#CBD5E1] hover:text-[#1A56DB] hover:bg-[#EFF6FF] transition-colors border-l border-[#E2E8F0]"
                  >
                    <Plus size={13} />
                  </button>
                  <div className="flex-none w-[66px] py-2 text-center text-[9px] font-black uppercase tracking-widest text-[#64748B]">
                    Timer
                  </div>
                </div>

                {/* CATEGORIES */}
                {filtered.map((cat) => {
                  const Icon = cat.icon;
                  const done = cat.tasks.filter(
                    (t) => t.progress === 100,
                  ).length;
                  const catPct = cat.tasks.length
                    ? Math.round(
                        cat.tasks.reduce((a, t) => a + t.progress, 0) /
                          cat.tasks.length,
                      )
                    : 0;
                  const isRev = cat.id === "revisiones";
                  return (
                    <div
                      key={cat.id}
                      className="border-b border-[#E2E8F0] last:border-b-0"
                    >
                      {/* Category header */}
                      <div
                        className="flex items-center group hover:bg-[#F8FAFC] transition-colors"
                        style={{
                          borderLeft: `3px solid ${cat.color}`,
                          background: isRev ? "#FFFBEB" : undefined,
                        }}
                      >
                        <button
                          onClick={() => toggleExpand(cat.id)}
                          className="flex-none w-8 flex items-center justify-center h-10 text-[#94A3B8] hover:text-[#0A192F] transition-colors"
                        >
                          {cat.expanded ? (
                            <ChevronDown size={13} />
                          ) : (
                            <ChevronRight size={13} />
                          )}
                        </button>
                        <div className="flex-none w-[230px] flex items-center gap-1.5 px-2 border-r border-[#E2E8F0] py-2 min-w-0">
                          <div title={`${catPct}% completado`}>
                            <MiniRing pct={catPct} color={cat.color} />
                          </div>
                          <Icon
                            size={12}
                            style={{ color: cat.color }}
                            className="flex-shrink-0"
                          />
                          {editCat === cat.id ? (
                            <input
                              ref={catRef}
                              defaultValue={cat.name}
                              onBlur={(e) => {
                                updCatName(cat.id, e.target.value);
                                setEditCat(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === "Escape")
                                  (e.target as HTMLInputElement).blur();
                              }}
                              className="flex-1 text-xs font-black border-b border-[#1A56DB] bg-transparent focus:outline-none min-w-0"
                            />
                          ) : (
                            <span
                              onDoubleClick={() => setEditCat(cat.id)}
                              className="text-xs font-black text-[#0A192F] cursor-text flex-1 truncate select-none"
                            >
                              {cat.name}
                            </span>
                          )}
                          <span className="text-[9px] text-[#94A3B8] flex-shrink-0 font-mono">
                            {done}/{cat.tasks.length}
                          </span>
                        </div>
                        <div className="flex-none w-[70px] border-r border-[#E2E8F0] h-10" />
                        <div className="flex-none w-10 border-r border-[#E2E8F0] h-10" />
                        <div className="flex-none w-20 px-2 border-r border-[#E2E8F0] h-10 flex items-center">
                          <div className="w-full h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${catPct}%`,
                                background:
                                  catPct === 100 ? "#10B981" : cat.color,
                              }}
                            />
                          </div>
                        </div>
                        {weeks.map((wk, wi) => (
                          <div
                            key={wk.id}
                            className="flex-none border-r border-[#E2E8F0] h-10"
                            style={{
                              width: COL_W,
                              background:
                                wi === todayWi ? "#FFFBEB" : undefined,
                            }}
                          />
                        ))}
                        <div className="flex-none w-10 h-10 border-l border-[#E2E8F0]" />
                        <div className="flex-none w-[66px] h-10 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() =>
                              addTask(cat.id, isRev ? "review" : "refinement")
                            }
                            className="w-6 h-6 rounded flex items-center justify-center bg-[#F1F5F9] hover:bg-[#1A56DB] hover:text-white text-[#64748B] transition-colors"
                            title="Agregar"
                          >
                            <Plus size={11} />
                          </button>
                          <button
                            onClick={() => delCat(cat.id)}
                            className="w-6 h-6 rounded flex items-center justify-center bg-[#F1F5F9] hover:bg-red-500 hover:text-white text-[#64748B] transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      </div>

                      {/* Task rows */}
                      <AnimatePresence initial={false}>
                        {cat.expanded &&
                          cat.tasks.map((task, ti) => {
                            const isCrit = task.type === "critical";
                            const isRevT = task.type === "review";
                            const st = statuses[task.id] ?? "not_started";
                            const sc = STATUS_CFG[st];
                            const isTimerOn = timers[task.id];
                            const barColor =
                              st === "completed"
                                ? "#10B981"
                                : isRevT
                                  ? "#D97706"
                                  : isCrit
                                    ? cat.color
                                    : "#94A3B8";
                            const rowBg =
                              st === "completed"
                                ? "#F0FDF4"
                                : st === "delayed"
                                  ? "#FFF1F2"
                                  : isRevT
                                    ? "#FFFBEB"
                                    : undefined;
                            const lb =
                              st === "delayed"
                                ? "#EF4444"
                                : st === "completed"
                                  ? "#10B981"
                                  : isRevT
                                    ? "#D97706"
                                    : isCrit
                                      ? cat.color
                                      : "transparent";

                            return (
                              <motion.div
                                key={task.id}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{
                                  duration: 0.14,
                                  delay: ti * 0.008,
                                }}
                                className="flex items-center group border-b border-[#F1F5F9] last:border-b-0 transition-colors select-none"
                                style={{
                                  borderLeft: `3px solid ${lb}`,
                                  background: rowBg,
                                }}
                              >
                                <div className="flex-none w-8 flex items-center justify-center h-9 text-[#E2E8F0] group-hover:text-[#CBD5E1] cursor-grab">
                                  <GripVertical size={12} />
                                </div>

                                {/* Name */}
                                <div className="flex-none w-[230px] flex items-center gap-1.5 px-2 border-r border-[#F1F5F9] py-1 min-w-0">
                                  {/* Status button */}
                                  <button
                                    onClick={() => cycleStatus(task.id)}
                                    title={`${sc.label} — click para cambiar`}
                                    className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all hover:scale-125"
                                    style={{
                                      background: sc.color + "22",
                                      color: sc.color,
                                      border: `1.5px solid ${sc.color}`,
                                    }}
                                  >
                                    {sc.icon}
                                  </button>
                                  {/* Type dot */}
                                  <button
                                    onClick={() => toggleType(cat.id, task.id)}
                                    title={`Tipo: ${isRevT ? "Revisión" : isCrit ? "Crítico" : "Refinamiento"} — click para cambiar`}
                                    className="flex-shrink-0 w-2 h-2 rounded-full hover:scale-125 transition-transform"
                                    style={{
                                      background: isRevT
                                        ? "#D97706"
                                        : isCrit
                                          ? cat.color
                                          : "#CBD5E1",
                                    }}
                                  />
                                  {editName?.catId === cat.id &&
                                  editName.taskId === task.id ? (
                                    <input
                                      ref={nameRef}
                                      defaultValue={task.name}
                                      onBlur={(e) => {
                                        updName(
                                          cat.id,
                                          task.id,
                                          e.target.value,
                                        );
                                        setEditName(null);
                                      }}
                                      onKeyDown={(e) => {
                                        if (
                                          e.key === "Enter" ||
                                          e.key === "Escape"
                                        )
                                          (e.target as HTMLInputElement).blur();
                                      }}
                                      className="flex-1 text-xs border border-[#1A56DB] rounded px-1 py-0.5 focus:outline-none bg-white min-w-0"
                                    />
                                  ) : (
                                    <span
                                      onClick={() =>
                                        setEditName({
                                          catId: cat.id,
                                          taskId: task.id,
                                        })
                                      }
                                      className={`flex-1 text-xs truncate cursor-text hover:text-[#1A56DB] min-w-0 transition-colors ${isRevT ? "font-bold text-[#92400E] italic" : isCrit ? "font-semibold text-[#0A192F]" : "text-[#475569]"}`}
                                      title={task.name}
                                    >
                                      {task.name}
                                    </span>
                                  )}
                                  {task.zeroFloat && (
                                    <span
                                      title="Holgura Cero: Tarea crítica sin margen de maniobra"
                                      className="text-red-500 flex-shrink-0 cursor-help"
                                    >
                                      <AlertTriangle
                                        size={11}
                                        className="fill-red-500/20"
                                      />
                                    </span>
                                  )}
                                  <button
                                    onClick={() => delTask(cat.id, task.id)}
                                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-[#CBD5E1] hover:text-red-400 transition-all"
                                  >
                                    <X size={11} />
                                  </button>
                                </div>

                                {/* Assignee */}
                                <div className="flex-none w-[70px] flex items-center justify-center border-r border-[#F1F5F9] px-1 relative">
                                  <select
                                    value={task.assignee || ""}
                                    onChange={(e) =>
                                      updAssignee(
                                        cat.id,
                                        task.id,
                                        e.target.value,
                                      )
                                    }
                                    title="Responsable"
                                    className="w-full text-[9px] font-bold bg-transparent text-center focus:outline-none cursor-pointer appearance-none"
                                  >
                                    <option value="">--</option>
                                    {TEAM_MEMBERS.map((tm) => (
                                      <option key={tm.id} value={tm.id}>
                                        {tm.avatar}
                                      </option>
                                    ))}
                                  </select>
                                  <ChevronDown
                                    size={8}
                                    className="absolute right-2 text-[#CBD5E1] pointer-events-none"
                                  />
                                </div>

                                {/* % */}
                                <div className="flex-none w-10 flex items-center justify-center border-r border-[#F1F5F9]">
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={task.progress}
                                    aria-label="Porcentaje de avance"
                                    onChange={(e) =>
                                      updProg(
                                        cat.id,
                                        task.id,
                                        parseInt(e.target.value) || 0,
                                      )
                                    }
                                    className="w-9 text-center text-[11px] font-bold bg-transparent focus:bg-white focus:border focus:border-[#1A56DB] rounded py-0.5 focus:outline-none"
                                  />
                                </div>

                                {/* Progress bar */}
                                <div className="flex-none w-20 px-2 border-r border-[#F1F5F9] flex items-center">
                                  <div
                                    className="flex-1 h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden cursor-pointer"
                                    onClick={(e) => {
                                      const r = (
                                        e.currentTarget as HTMLDivElement
                                      ).getBoundingClientRect();
                                      updProg(
                                        cat.id,
                                        task.id,
                                        Math.round(
                                          ((e.clientX - r.left) / r.width) *
                                            100,
                                        ),
                                      );
                                    }}
                                  >
                                    <div
                                      className="h-full rounded-full transition-all duration-300"
                                      style={{
                                        width: `${task.progress}%`,
                                        background: barColor,
                                      }}
                                    />
                                  </div>
                                </div>

                                {/* Week cells — continuous bar + ghost + heatmap */}
                                {weeks.map((wk, wi) => {
                                  const active = task.weeks[wi] ?? false;
                                  const baseline =
                                    task.baselineWeeks?.[wi] ?? false;
                                  const isToday = wi === todayWi;

                                  // Borders and radius
                                  const prevB =
                                    wi > 0 &&
                                    (task.baselineWeeks?.[wi - 1] ?? false);
                                  const nextB =
                                    wi < wc - 1 &&
                                    (task.baselineWeeks?.[wi + 1] ?? false);
                                  const radiusB = baseline
                                    ? !prevB && !nextB
                                      ? "4px"
                                      : !prevB
                                        ? "4px 0 0 4px"
                                        : !nextB
                                          ? "0 4px 4px 0"
                                          : "0"
                                    : "4px";

                                  const prev =
                                    wi > 0 && (task.weeks[wi - 1] ?? false);
                                  const next =
                                    wi < wc - 1 &&
                                    (task.weeks[wi + 1] ?? false);
                                  const radius = active
                                    ? !prev && !next
                                      ? "4px"
                                      : !prev
                                        ? "4px 0 0 4px"
                                        : !next
                                          ? "0 4px 4px 0"
                                          : "0"
                                    : "4px";
                                  const pl = prev ? "0px" : "4px",
                                    pr = next ? "0px" : "4px";
                                  const bh = isCrit || isRevT ? "20px" : "10px";

                                  // Heatmap resolution
                                  let overloadLevel = 0;
                                  let showAvatar = false;
                                  if (active && task.assignee) {
                                    const cLoad =
                                      assigneeLoad[task.assignee]?.[wi] || 0;
                                    if (cLoad >= 3)
                                      overloadLevel = 2; // Extra heavy
                                    else if (cLoad === 2) overloadLevel = 1; // Heavy
                                    // Show avatar once per active block
                                    if (!prev) showAvatar = true;
                                  }
                                  const tm = task.assignee
                                    ? TEAM_MEMBERS.find(
                                        (tm) => tm.id === task.assignee,
                                      )
                                    : null;

                                  return (
                                    <div
                                      key={wk.id}
                                      className="flex-none border-r border-[#F1F5F9] last:border-r-0 flex items-center cursor-pointer h-9 transition-colors group/cell relative"
                                      style={{
                                        width: COL_W,
                                        paddingLeft: pl,
                                        paddingRight: pr,
                                        background: isToday
                                          ? active
                                            ? "#FFFBEB"
                                            : "#FFFDE7"
                                          : undefined,
                                      }}
                                      title={`${wk.label}: ${fmtDate(addDays(startDate, wk.offset))}`}
                                      onMouseDown={() => {
                                        const c = categories.find(
                                          (c) => c.id === cat.id,
                                        );
                                        const t = c?.tasks.find(
                                          (t) => t.id === task.id,
                                        );
                                        const cv = t?.weeks[wi] ?? false;
                                        setDrag({
                                          catId: cat.id,
                                          taskId: task.id,
                                          toggling: !cv,
                                        });
                                        toggleWk(cat.id, task.id, wi, !cv);
                                      }}
                                      onMouseEnter={() => {
                                        if (
                                          drag &&
                                          drag.catId === cat.id &&
                                          drag.taskId === task.id
                                        )
                                          toggleWk(
                                            cat.id,
                                            task.id,
                                            wi,
                                            drag.toggling,
                                          );
                                      }}
                                    >
                                      {/* Baseline Ghost */}
                                      {baseline && !active && (
                                        <div
                                          className="absolute inset-x-0 h-[18px] top-1/2 -translate-y-1/2 border-[1.5px] border-dashed border-[#CBD5E1] bg-[#F8FAFC]/50 pointer-events-none z-0"
                                          style={{
                                            borderRadius: radiusB,
                                            margin: "0 4px",
                                          }}
                                          title="Línea base original"
                                        />
                                      )}
                                      {baseline && active && (
                                        <div
                                          className="absolute inset-x-0 h-[24px] top-1/2 -translate-y-1/2 border border-dashed border-gray-400 opacity-30 pointer-events-none z-0"
                                          style={{
                                            borderRadius: radiusB,
                                            margin: "0 2px",
                                          }}
                                        />
                                      )}

                                      {/* Active Bar */}
                                      {active ? (
                                        <div
                                          className={`flex-1 flex items-center justify-center relative overflow-visible z-10 shadow-sm ${task.zeroFloat ? "ring-1 ring-red-500" : ""}`}
                                          style={{
                                            height: bh,
                                            background: barColor,
                                            borderRadius: radius,
                                          }}
                                        >
                                          {task.progress > 0 && (
                                            <div
                                              className="absolute inset-0 transition-all duration-500"
                                              style={{
                                                width: `${task.progress}%`,
                                                borderRadius: radius,
                                                background:
                                                  "rgba(255,255,255,0.25)",
                                              }}
                                            />
                                          )}
                                          {!prev &&
                                            (isCrit || isRevT) &&
                                            task.progress > 0 && (
                                              <span className="relative z-10 text-[8px] font-black text-white px-0.5">
                                                {task.progress}%
                                              </span>
                                            )}
                                          {!prev &&
                                            isRevT &&
                                            task.progress === 0 && (
                                              <span className="relative z-10 text-[8px] text-white">
                                                ðŸ”
                                              </span>
                                            )}

                                          {/* Avatar Overlay */}
                                          {showAvatar && tm && (
                                            <div
                                              className={`absolute -top-1.5 -left-1 w-4 h-4 rounded-full flex items-center justify-center text-[6px] font-bold text-white shadow-md transition-colors
                                              ${overloadLevel === 2 ? "bg-red-600 ring-2 ring-red-200" : overloadLevel === 1 ? "bg-orange-500 ring-1 ring-orange-200" : "bg-[#1A56DB]"}`}
                                              title={`${tm.name} (${overloadLevel === 2 ? "Sobrecargado" : overloadLevel === 1 ? "Alta Carga" : "Ok"})`}
                                            >
                                              {tm.avatar}
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        <div
                                          className="flex-1 transition-colors relative z-10"
                                          style={{ height: "18px" }}
                                        />
                                      )}
                                    </div>
                                  );
                                })}

                                <div className="flex-none w-10 h-9 border-l border-[#F1F5F9]" />

                                {/* Timer */}
                                <div className="flex-none w-[66px] flex flex-col items-center justify-center py-1 gap-0.5">
                                  <button
                                    onClick={() =>
                                      setTimers((p) => ({
                                        ...p,
                                        [task.id]: !p[task.id],
                                      }))
                                    }
                                    title={
                                      isTimerOn
                                        ? "Detener timer"
                                        : "Iniciar timer"
                                    }
                                    className={`transition-colors ${isTimerOn ? "text-[#1A56DB]" : "text-[#CBD5E1] group-hover:text-[#94A3B8]"}`}
                                  >
                                    {isTimerOn ? (
                                      <StopCircle size={14} />
                                    ) : (
                                      <PlayCircle size={14} />
                                    )}
                                  </button>
                                  {(elapsed[task.id] || 0) > 0 && (
                                    <span className="text-[8px] font-mono text-[#94A3B8]">
                                      {fmtTime(elapsed[task.id] || 0)}
                                    </span>
                                  )}
                                </div>
                              </motion.div>
                            );
                          })}
                      </AnimatePresence>

                      {cat.expanded && (
                        <button
                          onClick={() =>
                            addTask(cat.id, isRev ? "review" : "refinement")
                          }
                          className="flex items-center gap-2 w-full pl-12 py-1.5 text-xs font-semibold border-t border-dashed border-[#E2E8F0] transition-colors hover:bg-[#F0F7FF]"
                          style={{ color: isRev ? "#D97706" : "#94A3B8" }}
                        >
                          <Plus size={11} />
                          {isRev
                            ? "Agregar revisiÃ³n"
                            : `Agregar plano en ${cat.name}`}
                        </button>
                      )}
                    </div>
                  );
                })}

                <button
                  onClick={addCat}
                  className="flex items-center gap-2 w-full px-5 py-2.5 text-[#94A3B8] hover:text-[#1A56DB] hover:bg-[#F0F7FF] transition-colors text-xs font-bold border-t-2 border-dashed border-[#E2E8F0]"
                >
                  <Plus size={13} />
                  Agregar nueva disciplina / categoría
                </button>
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="w-full xl:w-[250px] flex-shrink-0 flex flex-col gap-4">
            {/* Gauge */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5 text-center relative overflow-hidden">
              <div className="absolute -top-8 -left-8 w-24 h-24 bg-[#10B981]/8 rounded-full blur-3xl" />
              <h3 className="text-[9px] font-black uppercase tracking-widest text-[#64748B] mb-4">
                Efficiency Score
              </h3>
              <div className="relative w-28 h-28 mx-auto mb-3">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#F1F5F9"
                    strokeWidth="9"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="url(#gs)"
                    strokeWidth="9"
                    strokeLinecap="round"
                    strokeDasharray="251.2"
                    initial={{ strokeDashoffset: 251.2 }}
                    animate={{
                      strokeDashoffset: generated
                        ? 251.2 - (251.2 * eff) / 100
                        : 251.2,
                    }}
                    transition={{ duration: 2, ease: "easeOut", delay: 0.4 }}
                  />
                  <defs>
                    <linearGradient id="gs" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#1A56DB" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <AnimatePresence mode="wait">
                    {generated ? (
                      <motion.span
                        key="s"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 1, type: "spring" }}
                        className="text-4xl font-extrabold tracking-tighter text-[#0A192F]"
                      >
                        {eff}
                      </motion.span>
                    ) : (
                      <span className="text-3xl font-bold text-[#CBD5E1]">
                        --
                      </span>
                    )}
                  </AnimatePresence>
                  <span className="text-[9px] font-black text-[#64748B] uppercase tracking-widest">
                    SLA
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-[#64748B]">
                {project?.name || project?.title || "Sin proyecto"}
              </p>
            </div>

            {/* Metrics */}
            <div className="bg-[#0A2342] text-white rounded-2xl p-5 shadow-lg flex flex-col gap-4">
              <div>
                <h4 className="text-[9px] font-black uppercase tracking-widest text-[#94A3B8] mb-2 flex items-center justify-between">
                  <span>Execution Metrics</span>
                  <span className="text-[#38BDF8]">Curva S</span>
                </h4>

                {/* S-Curve Chart */}
                <div className="w-full h-[60px] bg-[#112240] rounded-xl relative mb-2">
                  <svg
                    viewBox="-2 -2 204 64"
                    preserveAspectRatio="none"
                    className="w-full h-full"
                  >
                    {/* Grid lines */}
                    <path
                      d="M0,15 L200,15 M0,30 L200,30 M0,45 L200,45"
                      stroke="#1E293B"
                      strokeWidth="1"
                    />
                    <path
                      d="M0,60 L200,60 M0,0 L0,60"
                      stroke="#334155"
                      strokeWidth="1"
                    />

                    {/* Dotted Planned Line */}
                    {ptsPlanned && (
                      <polyline
                        points={ptsPlanned}
                        fill="none"
                        stroke="#64748B"
                        strokeWidth="1.5"
                        strokeDasharray="3,3"
                      />
                    )}

                    {/* Solid Actual Progress */}
                    {ptsActual && (
                      <polyline
                        points={ptsActual}
                        fill="none"
                        stroke="#34D399"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}
                  </svg>
                  <div className="absolute top-1 left-2 flex gap-2">
                    <div className="flex items-center gap-1">
                      <div className="w-2 border-t-2 border-dashed border-[#64748B]" />
                      <span className="text-[7px] text-[#94A3B8]">
                        Planeado
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 border-t-2 border-[#34D399]" />
                      <span className="text-[7px] text-[#94A3B8]">Real</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                {[
                  { label: "Est. Completion", val: `${lastWk} Sem.` },
                  { label: "Total Planos", val: allTasks.length },
                  { label: "Ruta CrÃ­tica", val: crit, color: "#60A5FA" },
                  { label: "Refinamientos", val: ref },
                  { label: "Revisiones", val: rev, color: "#FBBF24" },
                  {
                    label: "Avance Global",
                    val: `${avgPct}%`,
                    color: avgPct > 50 ? "#34D399" : "#FBBF24",
                  },
                ].map((r) => (
                  <div
                    key={r.label}
                    className="flex justify-between items-center border-b border-white/10 py-1.5 last:border-0"
                  >
                    <span className="text-[11px] text-[#94A3B8] font-medium">
                      {r.label}
                    </span>
                    <span
                      className="text-sm font-black"
                      style={{ color: (r as any).color || "white" }}
                    >
                      {r.val}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Legend / Phase guide */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 space-y-2">
              <p className="text-[9px] font-black uppercase tracking-widest text-[#64748B] mb-2">
                Fases del Proyecto
              </p>
              {PHASES.map((ph) => (
                <div key={ph.id} className="flex items-center gap-2">
                  <div
                    className="w-7 h-4 rounded text-[8px] font-black flex items-center justify-center"
                    style={{ background: ph.bg, color: ph.color }}
                  >
                    {ph.short}
                  </div>
                  <span className="text-[10px] text-[#475569]">{ph.label}</span>
                </div>
              ))}
              <hr className="border-[#F1F5F9] my-2" />
              <p className="text-[9px] font-black uppercase tracking-widest text-[#64748B] mb-1">
                Tipos de Tarea
              </p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#0A2342]" />
                <span className="text-[10px] text-[#475569] font-semibold">
                  Crítico
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#CBD5E1]" />
                <span className="text-[10px] text-[#475569]">Refinamiento</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye size={10} className="text-[#D97706]" />
                <span className="text-[10px] text-[#92400E] font-semibold">
                  Revisión Cliente
                </span>
              </div>
              <hr className="border-[#F1F5F9] my-2" />
              <p className="text-[9px] font-black uppercase tracking-widest text-[#64748B] mb-1">
                Estado
              </p>
              {STATUS_ORDER.map((s) => {
                const c = STATUS_CFG[s];
                return (
                  <div key={s} className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center"
                      style={{
                        background: c.color + "22",
                        color: c.color,
                        border: `1.5px solid ${c.color}`,
                      }}
                    >
                      {c.icon}
                    </div>
                    <span className="text-[10px] text-[#475569]">
                      {c.label}
                    </span>
                  </div>
                );
              })}
              <hr className="border-[#F1F5F9] my-2" />
              <p className="text-[9px] font-black uppercase tracking-widest text-[#64748B] mb-1">
                Heatmap de Carga
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-[#475569]">
                <div className="w-6 h-1.5 rounded bg-[#1A56DB]" />
                <span>Normal</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-[#475569]">
                <div className="w-6 h-1.5 rounded bg-[#F59E0B]" />
                <span>Alta carga</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-[#475569]">
                <div className="w-6 h-1.5 rounded bg-[#EF4444]" />
                <span>Sobrecarga</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartScheduleView;
