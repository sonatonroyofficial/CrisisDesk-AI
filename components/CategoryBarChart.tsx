'use client';

import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface CategoryBarChartProps {
  data: Record<string, number>;
}

export default function CategoryBarChart({ data }: CategoryBarChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-80 w-full bg-slate-50 animate-pulse rounded-2xl" />;
  }

  // Format record into array for Recharts
  const chartData = Object.entries(data).map(([key, value]) => ({
    name: key.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
    count: value,
  }));

  // Navy/slate thematic colors
  const COLORS = [
    '#1e3a8a', // Dark Navy
    '#2563eb', // Royal Blue
    '#3b82f6', // Medium Blue
    '#60a5fa', // Light Blue
    '#475569', // Slate Gray
    '#64748b', // Medium Slate
    '#94a3b8', // Light Slate
    '#cbd5e1', // Cool Gray
    '#4b5563', // Dark Gray
  ];

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-full flex flex-col">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Reports by Category</h3>
      <div className="h-80 flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              stroke="#94a3b8" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              tickMargin={10}
            />
            <YAxis 
              stroke="#94a3b8" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip 
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }}
              labelStyle={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '4px' }}
              itemStyle={{ color: '#cbd5e1', fontSize: '12px' }}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={36}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
