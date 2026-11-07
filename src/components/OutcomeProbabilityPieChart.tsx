import React, { useMemo } from 'react';
import { MatchAnalysis, OutcomeProbabilities } from '../types/football';
import { calculateOutcomeProbabilities } from '../services/outcomeAndLineupsService';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Trophy, 
  HelpCircle, 
  TrendingUp, 
  ShieldCheck, 
  Sparkles,
  PieChart as PieIcon
} from 'lucide-react';

interface OutcomeProbabilityPieChartProps {
  match: MatchAnalysis;
}

export const OutcomeProbabilityPieChart: React.FC<OutcomeProbabilityPieChartProps> = ({ match }) => {
  const outcome: OutcomeProbabilities = useMemo(() => {
    return match.outcomeProbabilities || calculateOutcomeProbabilities(match);
  }, [match]);

  const chartData = [
    {
      name: `П1 (${match.homeTeam})`,
      shortName: 'П1',
      team: match.homeTeam,
      value: outcome.homeWin,
      color: '#3b82f6', // Blue
      bgClass: 'bg-blue-500',
      textClass: 'text-blue-500',
      borderClass: 'border-blue-500/30'
    },
    {
      name: 'X (Ничья)',
      shortName: 'X',
      team: 'Ничья',
      value: outcome.draw,
      color: '#f59e0b', // Amber
      bgClass: 'bg-amber-500',
      textClass: 'text-amber-500',
      borderClass: 'border-amber-500/30'
    },
    {
      name: `П2 (${match.awayTeam})`,
      shortName: 'П2',
      team: match.awayTeam,
      value: outcome.awayWin,
      color: '#10b981', // Emerald
      bgClass: 'bg-emerald-500',
      textClass: 'text-emerald-500',
      borderClass: 'border-emerald-500/30'
    }
  ];

  const dominantItem = chartData.find(d => {
    if (outcome.dominantOutcome === 'home') return d.shortName === 'П1';
    if (outcome.dominantOutcome === 'draw') return d.shortName === 'X';
    return d.shortName === 'П2';
  }) || chartData[0];

  return (
    <div className="bg-neutral-800/70 border border-neutral-700/60 rounded-xl p-4 text-white">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-700/60 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <PieIcon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-neutral-100 flex items-center gap-2">
              <span>Вероятность исхода матча (П1 - X - П2)</span>
              {match.status === 'live' && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold animate-pulse">
                  LIVE РАСЧЕТ
                </span>
              )}
            </h4>
            <p className="text-[11px] text-neutral-400">
              Модель на основе котировок, H2H, формы команд и счета в лайве
            </p>
          </div>
        </div>

        {/* Confidence badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md bg-neutral-900/80 border border-neutral-700 text-[11px] font-mono text-neutral-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Фаворит: <strong className="text-white">{dominantItem.shortName} ({dominantItem.value}%)</strong></span>
        </div>
      </div>

      {/* Main Grid: Pie Chart + Stat Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-4">
        {/* Recharts Pie Chart (left/center) */}
        <div className="md:col-span-5 relative flex items-center justify-center min-h-[160px]">
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={46}
                outerRadius={70}
                paddingAngle={3}
                stroke="#171717"
                strokeWidth={2}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-neutral-900/95 border border-neutral-700 p-2.5 rounded-lg shadow-xl text-xs backdrop-blur-md">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
                          <span>{data.name}</span>
                        </div>
                        <div className="mt-1 font-mono text-amber-400 font-bold text-sm">
                          {data.value}% вероятность
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Central Doughnut Hole Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
              {dominantItem.shortName}
            </span>
            <span className="text-lg font-mono font-extrabold text-white leading-none">
              {dominantItem.value}%
            </span>
          </div>
        </div>

        {/* Legend & Probability Badges (right) */}
        <div className="md:col-span-7 space-y-2.5">
          <div className="grid grid-cols-3 gap-2">
            {chartData.map((item) => (
              <div 
                key={item.shortName}
                className="p-2.5 rounded-lg bg-neutral-900/90 border border-neutral-700/60 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold" style={{ color: item.color }}>
                    {item.shortName}
                  </span>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                </div>
                <div className="mt-1 font-mono text-base font-extrabold text-white">
                  {item.value}%
                </div>
                <div className="text-[10px] text-neutral-400 truncate mt-0.5">
                  {item.team}
                </div>
              </div>
            ))}
          </div>

          {/* Analytical Rationale Strip */}
          <div className="p-2.5 rounded-lg bg-neutral-900/50 border border-neutral-700/40 text-[11px] text-neutral-300 flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span className="leading-snug">{outcome.rationale}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
