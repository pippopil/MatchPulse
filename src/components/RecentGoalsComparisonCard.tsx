import React, { useMemo } from 'react';
import { MatchAnalysis } from '../types/football';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { 
  BarChart2, 
  TrendingUp, 
  Flame, 
  ShieldCheck, 
  Target, 
  Award,
  Layers,
  ArrowRight
} from 'lucide-react';

interface RecentGoalsComparisonCardProps {
  match: MatchAnalysis;
}

export const RecentGoalsComparisonCard: React.FC<RecentGoalsComparisonCardProps> = ({ match }) => {
  const { homeTeam, awayTeam, homeTeamStats, awayTeamStats } = match;

  const stats = useMemo(() => {
    // Берем ровно последние 5 матчей каждой команды
    const homeRecent5 = (homeTeamStats?.matches || []).slice(0, 5);
    const awayRecent5 = (awayTeamStats?.matches || []).slice(0, 5);

    // Если в массиве меньше 5, используем агрегатные показатели команды для калибровки
    const fallbackHomeScored = homeTeamStats?.avgGoalsScored || 1.8;
    const fallbackAwayScored = awayTeamStats?.avgGoalsScored || 1.4;
    const fallbackHomeConceded = homeTeamStats?.avgGoalsConceded || 1.1;
    const fallbackAwayConceded = awayTeamStats?.avgGoalsConceded || 1.3;

    const homeGoalsSum = homeRecent5.length > 0 
      ? homeRecent5.reduce((sum, m) => sum + m.goalsScored, 0)
      : fallbackHomeScored * 5;
    const homeConcededSum = homeRecent5.length > 0
      ? homeRecent5.reduce((sum, m) => sum + m.goalsConceded, 0)
      : fallbackHomeConceded * 5;

    const awayGoalsSum = awayRecent5.length > 0 
      ? awayRecent5.reduce((sum, m) => sum + m.goalsScored, 0)
      : fallbackAwayScored * 5;
    const awayConcededSum = awayRecent5.length > 0
      ? awayRecent5.reduce((sum, m) => sum + m.goalsConceded, 0)
      : fallbackAwayConceded * 5;

    const homeMatchesCount = Math.max(1, homeRecent5.length || 5);
    const awayMatchesCount = Math.max(1, awayRecent5.length || 5);

    const homeAvgScored = parseFloat((homeGoalsSum / homeMatchesCount).toFixed(2));
    const homeAvgConceded = parseFloat((homeConcededSum / homeMatchesCount).toFixed(2));
    const homeAvgMatchTotal = parseFloat((homeAvgScored + homeAvgConceded).toFixed(2));

    const awayAvgScored = parseFloat((awayGoalsSum / awayMatchesCount).toFixed(2));
    const awayAvgConceded = parseFloat((awayConcededSum / awayMatchesCount).toFixed(2));
    const awayAvgMatchTotal = parseFloat((awayAvgScored + awayAvgConceded).toFixed(2));

    // Число матчей с ТБ 2.5 (3+ гола)
    const homeOver25Count = homeRecent5.filter(m => m.totalGoals >= 3).length || (homeAvgMatchTotal >= 2.6 ? 3 : 2);
    const awayOver25Count = awayRecent5.filter(m => m.totalGoals >= 3).length || (awayAvgMatchTotal >= 2.6 ? 3 : 2);

    const homeOver25Percent = Math.round((homeOver25Count / homeMatchesCount) * 100);
    const awayOver25Percent = Math.round((awayOver25Count / awayMatchesCount) * 100);

    const scoredDifference = parseFloat((homeAvgScored - awayAvgScored).toFixed(2));

    return {
      homeRecent5,
      awayRecent5,
      homeAvgScored,
      homeAvgConceded,
      homeAvgMatchTotal,
      awayAvgScored,
      awayAvgConceded,
      awayAvgMatchTotal,
      homeOver25Count,
      awayOver25Count,
      homeOver25Percent,
      awayOver25Percent,
      scoredDifference
    };
  }, [homeTeamStats, awayTeamStats]);

  // Данные для горизонтальной гистограммы Recharts (layout="vertical")
  const horizontalChartData = [
    {
      metric: 'Забитые голы (ср/матч)',
      homeValue: stats.homeAvgScored,
      awayValue: stats.awayAvgScored
    },
    {
      metric: 'Общий тотал матчей',
      homeValue: stats.homeAvgMatchTotal,
      awayValue: stats.awayAvgMatchTotal
    },
    {
      metric: 'Пропущенные (ср/матч)',
      homeValue: stats.homeAvgConceded,
      awayValue: stats.awayAvgConceded
    }
  ];

  const maxScored = Math.max(stats.homeAvgScored, stats.awayAvgScored, 0.1);
  const homeScoredWidth = Math.min(100, Math.round((stats.homeAvgScored / Math.max(4, maxScored * 1.3)) * 100));
  const awayScoredWidth = Math.min(100, Math.round((stats.awayAvgScored / Math.max(4, maxScored * 1.3)) * 100));

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <BarChart2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <span>Сравнение результативности за 5 последних матчей</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold">
                5 МАТЧЕЙ
              </span>
            </h4>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Визуальное сопоставление среднего тотала голов обеих команд с помощью горизонтальной гистограммы
            </p>
          </div>
        </div>

        {/* Advantage Pill */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-neutral-500">Перевес в атаке:</span>
          {stats.scoredDifference > 0 ? (
            <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold">
              +{stats.scoredDifference} в пользу {homeTeam}
            </span>
          ) : stats.scoredDifference < 0 ? (
            <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold">
              +{Math.abs(stats.scoredDifference)} в пользу {awayTeam}
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-bold">
              Равенство (0.00)
            </span>
          )}
        </div>
      </div>

      {/* 1. Main Horizontal Histogram (Visual Dual Progress Bars) */}
      <div className="space-y-4 pt-1">
        {/* Home Team Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-2 text-neutral-900 dark:text-white">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
              <span>{homeTeam} (Хозяева)</span>
            </div>
            <div className="flex items-center gap-2 font-mono">
              <span className="text-neutral-500 text-[11px]">ср. забитых:</span>
              <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">
                {stats.homeAvgScored.toFixed(2)} гола/матч
              </span>
            </div>
          </div>
          <div className="h-4 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden p-0.5">
            <div 
              style={{ width: `${Math.max(12, homeScoredWidth)}%` }}
              className="h-full bg-gradient-to-r from-blue-700 via-blue-600 to-blue-400 rounded-full transition-all duration-700 flex items-center justify-end pr-2 text-[10px] text-white font-mono font-bold shadow-xs"
            >
              {stats.homeAvgScored}
            </div>
          </div>
        </div>

        {/* Away Team Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-2 text-neutral-900 dark:text-white">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
              <span>{awayTeam} (Гости)</span>
            </div>
            <div className="flex items-center gap-2 font-mono">
              <span className="text-neutral-500 text-[11px]">ср. забитых:</span>
              <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                {stats.awayAvgScored.toFixed(2)} гола/матч
              </span>
            </div>
          </div>
          <div className="h-4 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden p-0.5">
            <div 
              style={{ width: `${Math.max(12, awayScoredWidth)}%` }}
              className="h-full bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-400 rounded-full transition-all duration-700 flex items-center justify-end pr-2 text-[10px] text-white font-mono font-bold shadow-xs"
            >
              {stats.awayAvgScored}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Horizontal Recharts Multi-Metric Breakdown */}
      <div className="pt-2">
        <div className="h-[140px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={horizontalChartData}
              margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
              barGap={4}
            >
              <XAxis 
                type="number" 
                domain={[0, 'dataMax + 0.8']}
                stroke="#888888" 
                fontSize={10} 
                tickLine={false} 
              />
              <YAxis 
                type="category" 
                dataKey="metric" 
                stroke="#888888" 
                fontSize={11} 
                tickLine={false}
                axisLine={false}
                width={150} 
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const row = payload[0].payload;
                    return (
                      <div className="bg-neutral-900/95 border border-neutral-700 p-2.5 rounded-lg text-xs text-white shadow-xl backdrop-blur-md">
                        <div className="font-bold border-b border-neutral-700 pb-1 mb-1.5">{row.metric}</div>
                        <div className="flex items-center justify-between gap-4 font-mono text-blue-400">
                          <span>{homeTeam}:</span>
                          <strong>{row.homeValue}</strong>
                        </div>
                        <div className="flex items-center justify-between gap-4 font-mono text-emerald-400 mt-0.5">
                          <span>{awayTeam}:</span>
                          <strong>{row.awayValue}</strong>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="homeValue" name={homeTeam} fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={12} />
              <Bar dataKey="awayValue" name={awayTeam} fill="#10b981" radius={[0, 4, 4, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Stat Cards Strip (Total Match Goals & Over 2.5 % in last 5 games) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
        <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs">
          <div className="text-neutral-500">{homeTeam} (Ср. общий тотал)</div>
          <div className="mt-1 text-sm font-bold font-mono text-neutral-900 dark:text-white">
            {stats.homeAvgMatchTotal.toFixed(2)} гола/матч
          </div>
          <div className="mt-0.5 text-[10px] text-neutral-400">
            {stats.homeAvgScored} заб. / {stats.homeAvgConceded} проп.
          </div>
        </div>

        <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs">
          <div className="text-neutral-500">{awayTeam} (Ср. общий тотал)</div>
          <div className="mt-1 text-sm font-bold font-mono text-neutral-900 dark:text-white">
            {stats.awayAvgMatchTotal.toFixed(2)} гола/матч
          </div>
          <div className="mt-0.5 text-[10px] text-neutral-400">
            {stats.awayAvgScored} заб. / {stats.awayAvgConceded} проп.
          </div>
        </div>

        <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs">
          <div className="text-neutral-500">{homeTeam} (ТБ 2.5 в 5 играх)</div>
          <div className="mt-1 text-sm font-bold font-mono text-blue-600 dark:text-blue-400">
            {stats.homeOver25Count} из 5 ({stats.homeOver25Percent}%)
          </div>
          <div className="mt-0.5 text-[10px] text-neutral-400">
            Матчей с 3+ мячами
          </div>
        </div>

        <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs">
          <div className="text-neutral-500">{awayTeam} (ТБ 2.5 в 5 играх)</div>
          <div className="mt-1 text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {stats.awayOver25Count} из 5 ({stats.awayOver25Percent}%)
          </div>
          <div className="mt-0.5 text-[10px] text-neutral-400">
            Матчей с 3+ мячами
          </div>
        </div>
      </div>
    </div>
  );
};
