import React from 'react';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  colorClass: string;
}

export default function StatCard({ title, value, icon, colorClass }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow duration-200">
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
        <p className={`text-4xl font-extrabold mt-2 tracking-tight ${colorClass}`}>{value}</p>
      </div>
      <div className="p-3 bg-slate-50 rounded-xl text-slate-600">
        {icon}
      </div>
    </div>
  );
}
