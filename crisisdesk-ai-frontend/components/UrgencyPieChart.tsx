'use client';

import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface UrgencyPieChartProps {
  data: Record<string, number>;
}

export default function UrgencyPieChart({ data }: UrgencyPieChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-80 w-full bg-slate-50 animate-pulse rounded-2xl" />;
  }

  // Format record into array for Recharts
  const chartData = Object.entries(data).map(([key, value]) => ({
    name: key.replace(/\b\w/g, c => c.toUpperCase()),
    value,
  })).filter(item => item.value > 0);

  // Map severity levels to semantic colors
  const COLOR_MAP: Record<string, string> = {
    Low: '#10b981',      // Green
    Medium: '#eab308',   // Yellow
    High: '#f97316',     // Orange
    Critical: '#ef4444', // Red
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-full flex flex-col">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Reports by Urgency</h3>
      <div className="h-80 flex-grow relative">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-slate-400">
            No active report data
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLOR_MAP[entry.name] || '#64748b'} 
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }}
                itemStyle={{ fontSize: '12px' }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                iconSize={8}
                formatter={(value) => <span className="text-xs font-medium text-slate-600 ml-1">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
