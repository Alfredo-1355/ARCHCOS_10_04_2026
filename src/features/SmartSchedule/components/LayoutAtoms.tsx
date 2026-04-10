import React from 'react';

export const MiniRing: React.FC<{ pct: number; color: string }> = ({ pct, color }) => {
  const r = 8,
    c = 2 * Math.PI * r;
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" className="flex-shrink-0">
      <circle
        cx="10"
        cy="10"
        r={r}
        fill="none"
        stroke="rgba(0,0,0,0.05)"
        strokeWidth="2.5"
      />
      <circle
        cx="10"
        cy="10"
        r={r}
        fill="none"
        stroke={pct === 100 ? "#10B981" : color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c - (c * pct) / 100}
        transform="rotate(-90 10 10)"
        className="transition-all duration-1000 ease-out"
      />
    </svg>
  );
};

export const InfoChip: React.FC<{ icon: string | React.ReactNode; label: string; accent?: boolean }> = ({
  icon,
  label,
  accent,
}) => (
  <div
    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider backdrop-blur-md transition-all hover:bg-white/60 ${accent ? "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20 shadow-sm" : "bg-white/40 text-[#64748B] border-white/40 shadow-sm"}`}
  >
    <span className="text-xs">{icon}</span>
    <span className="max-w-[160px] truncate">{label}</span>
  </div>
);
