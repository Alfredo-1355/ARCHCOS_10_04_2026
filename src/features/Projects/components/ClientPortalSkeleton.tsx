import React from 'react';
import { motion } from 'motion/react';

export const CardSkeleton = () => (
  <div className="bg-white/40 backdrop-blur-xl border border-white/50 p-8 rounded-[40px] animate-pulse">
    <div className="h-4 bg-slate-200 rounded w-1/4 mb-6" />
    <div className="h-8 bg-slate-300 rounded w-1/2 mb-10" />
    <div className="space-y-4">
      <div className="h-2 bg-slate-200 rounded w-full" />
      <div className="h-2 bg-slate-200 rounded w-5/6" />
    </div>
  </div>
);

export const RibbonSkeleton = () => (
  <div className="max-w-7xl mx-auto h-20 bg-white/40 backdrop-blur-xl border border-white/50 rounded-3xl flex items-center justify-between px-10 animate-pulse">
    <div className="flex gap-4">
      <div className="w-12 h-12 bg-slate-200 rounded-2xl" />
      <div className="w-32 h-10 bg-slate-200 rounded-xl" />
    </div>
    <div className="flex gap-12">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex gap-3">
          <div className="w-10 h-10 bg-slate-200 rounded-xl" />
          <div className="w-20 h-10 bg-slate-200 rounded-lg" />
        </div>
      ))}
    </div>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-12">
    <div className="h-24 bg-slate-100 rounded-[40px] w-full" />
    <div className="grid grid-cols-12 gap-10">
      <div className="col-span-8 space-y-12">
        <div className="h-[400px] bg-slate-50 rounded-[40px]" />
        <div className="grid grid-cols-2 gap-6">
          <div className="h-32 bg-slate-50 rounded-3xl" />
          <div className="h-32 bg-slate-50 rounded-3xl" />
        </div>
      </div>
      <div className="col-span-4 space-y-10">
        <div className="h-[250px] bg-slate-100 rounded-[30px]" />
        <div className="h-[400px] bg-slate-100 rounded-[40px]" />
      </div>
    </div>
  </div>
);
