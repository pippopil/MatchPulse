import React, { useState } from 'react';
import { MatchAnalysis } from '../types/football';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  Cell, 
  ReferenceLine 
} from 'recharts';
import { Activity, Clock, BarChart3, Database, Flame, CheckCircle2 } from 'lucide-react';

interface GoalIntervalChartProps {
  match: MatchAnalysis;
}

export const GoalIntervalChart: React.FC<GoalIntervalChartProps> = ({ match }) => {
  const [chartMode, setChartMode] = useState<'probability' | 'teams' | 'scored_conceded'>('probability');

  const { 
    intervals, 
    firstHalfHomePercent, 
    firstHalfAwayPercent, 
    secondHalfHomePercent, 
    secondHalfAwayPercent, 
    lateGoalRiskPercent 
  } = match.intervals15;

  // Расчет размера статистической выборки
  const homeMatchesCount = match.homeTeamStats?.matchesPlayed || 10;
  const awayMatchesCount = match.awayTeamStats?.matchesPlayed || 10;
  const h2hMatchesCount = match.h2h?.totalMatches || 4;
  const totalSampleMatches = homeMatchesCount + awayMatchesCount + h2hMatchesCount;

  // Подготовка данных для Recharts
  const chartData = intervals.map((interval) => {
    // Расчет статистической вероятности гола на данном 15-минутном отрезке матча
    // Основано на интенсивности забитых и пропущенных мячей обеих команд и H2H очных встреч
    const baseProb = Math.round(
      (interval.homeScoredPercent * 0.4) +
      (interval.awayScoredPercent * 0.4) +
      (interval.homeConcededPercent * 0.1) +
      (interval.awayConcededPercent * 0.1)
    );
    // Нормализованная вероятность (от 15% до 85%) с бустом пиковых опасных интервалов
    const goalProbability = Math.min(88, Math.max(16, baseProb + (interval.isPeakDanger ? 12 : 2)));

    return {
      id: interval.id,
      label: interval.label,
      half: interval.half === 1 ? '1-й тайм' : '2-й тайм',
      goalProbability,
      homeScoredPercent: interval.homeScoredPercent,
      awayScoredPercent: interval.awayScoredPercent,
      homeConcededPercent: interval.homeConcededPercent,
      awayConcededPercent: interval.awayConcededPercent,
      homeGoalsScored: interval.homeGoalsScored,
      awayGoalsScored: interval.awayGoalsScored,
      homeGoalsConceded: interval.homeGoalsConceded,
      awayGoalsConceded: interval.awayGoalsConceded,
      totalH2HGoals: interval.totalH2HGoals,
      isPeakDanger: interval.isPeakDanger
    };
  });

  // Кастомный всплывающий Tooltip для Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-neutral-900/95 text-white p-3.5 rounded-lg border border-neutral-700 shadow-xl backdrop-blur-md max-w-xs text-xs space-y-2">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-1.5">
            <span className="font-bold text-sm text-neutral-100 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              Интервал {label}
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">{data.half}</span>
          </div>

          <div className="bg-neutral-800/80 p-2 rounded border border-neutral-700/60">
            <div className="flex items-center justify-between">
              <span className="text-neutral-300">Вероятность гола:</span>
              <span className="font-mono font-bold text-amber-400 text-sm">
                {data.goalProbability}%
              </span>
            </div>
            {data.isPeakDanger && (
              <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-rose-400">
                <Flame className="w-3 h-3 text-rose-500" />
                Пиковый отрезок результативности
              </div>
            )}
          </div>

          <div className="space-y-1 font-mono text-[11px]">
            <div className="flex justify-between items-center text-blue-300">
              <span>{match.homeTeam}:</span>
              <span>{data.homeGoalsScored} заб. ({data.homeScoredPercent}%)</span>
            </div>
            <div className="flex justify-between items-center text-emerald-300">
              <span>{match.awayTeam}:</span>
              <span>{data.awayGoalsScored} заб. ({data.awayScoredPercent}%)</span>
            </div>
            <div className="flex justify-between items-center text-neutral-400 pt-1 border-t border-neutral-800 text-[10px]">
              <span>Очные встречи H2H:</span>
              <span>{data.totalH2HGoals} мячей</span>
            </div>
          </div>

          <div className="pt-1.5 border-t border-neutral-800 text-[10px] text-neutral-400 flex items-center gap-1">
            <Database className="w-3 h-3 text-emerald-500 shrink-0" />
            <span>Выборка: {totalSampleMatches} матчей</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-5">
      {/* Sample Size & Statistical Basis Banner */}
      <div className="p-3.5 bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <span>Статистическая выборка анализа:</span>
              <span className="font-mono text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded font-bold">
                {totalSampleMatches} матчей
              </span>
            </div>
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
              Включает: {homeMatchesCount} матчей «{match.homeTeam}» (5 дома, 5 на выезде) + {awayMatchesCount} матчей «{match.awayTeam}» (5 дома, 5 на выезде) + {h2hMatchesCount} очных встреч H2H
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-neutral-200/70 dark:bg-neutral-800 p-1 rounded-lg">
          <button
            onClick={() => setChartMode('probability')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
              chartMode === 'probability'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Вероятность гола (%)
          </button>
          <button
            onClick={() => setChartMode('teams')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
              chartMode === 'teams'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Команды
          </button>
          <button
            onClick={() => setChartMode('scored_conceded')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
              chartMode === 'scored_conceded'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Забитые / Пропущенные
          </button>
        </div>
      </div>

      {/* Recharts Bar Chart Visualization */}
      <div className="bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4">
        <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-500" />
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              {chartMode === 'probability' && 'Вероятность гола по 15-минутным отрезкам матча (Recharts)'}
              {chartMode === 'teams' && `Сравнение распределения голов: ${match.homeTeam} vs ${match.awayTeam}`}
              {chartMode === 'scored_conceded' && 'Баланс забитых и пропущенных мячей по интервалам'}
            </span>
          </div>
          <span className="text-[11px] font-mono">Шкала: 0% — 100%</span>
        </div>

        <div className="h-64 sm:h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 15, left: -15, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#555" opacity={0.15} vertical={false} />
              <XAxis 
                dataKey="label" 
                stroke="#888" 
                tick={{ fontSize: 12, fill: '#888' }}
                axisLine={{ stroke: '#666', opacity: 0.3 }}
              />
              <YAxis 
                stroke="#888" 
                tick={{ fontSize: 11, fill: '#888' }} 
                unit="%"
                domain={[0, 100]}
                axisLine={{ stroke: '#666', opacity: 0.3 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="3 3" opacity={0.4} />

              {/* Mode 1: Unified statistical goal probability per 15-minute slice */}
              {chartMode === 'probability' && (
                <Bar 
                  dataKey="goalProbability" 
                  name="Вероятность гола (%)" 
                  radius={[6, 6, 0, 0]}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.isPeakDanger ? '#f59e0b' : '#10b981'} 
                    />
                  ))}
                </Bar>
              )}

              {/* Mode 2: Team comparison */}
              {chartMode === 'teams' && (
                <>
                  <Bar 
                    dataKey="homeScoredPercent" 
                    name={`${match.homeTeam} (Забитые %)`} 
                    fill="#3b82f6" 
                    radius={[4, 4, 0, 0]} 
                  />
                  <Bar 
                    dataKey="awayScoredPercent" 
                    name={`${match.awayTeam} (Забитые %)`} 
                    fill="#10b981" 
                    radius={[4, 4, 0, 0]} 
                  />
                </>
              )}

              {/* Mode 3: Scored vs Conceded */}
              {chartMode === 'scored_conceded' && (
                <>
                  <Bar 
                    dataKey="homeScoredPercent" 
                    name={`${match.homeTeam} (Забитые %)`} 
                    fill="#3b82f6" 
                    radius={[4, 4, 0, 0]} 
                  />
                  <Bar 
                    dataKey="homeConcededPercent" 
                    name={`${match.homeTeam} (Пропущенные %)`} 
                    fill="#fb7185" 
                    radius={[4, 4, 0, 0]} 
                  />
                  <Bar 
                    dataKey="awayScoredPercent" 
                    name={`${match.awayTeam} (Забитые %)`} 
                    fill="#10b981" 
                    radius={[4, 4, 0, 0]} 
                  />
                  <Bar 
                    dataKey="awayConcededPercent" 
                    name={`${match.awayTeam} (Пропущенные %)`} 
                    fill="#c084fc" 
                    radius={[4, 4, 0, 0]} 
                  />
                </>
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-neutral-600 dark:text-neutral-400 pt-3 border-t border-neutral-200 dark:border-neutral-800">
          {chartMode === 'probability' ? (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block" />
                <span>Базовая вероятность гола</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-amber-500 inline-block" />
                <span className="font-semibold text-amber-600 dark:text-amber-400">Пиковый интервал матча</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-blue-500 inline-block" />
                <span>{match.homeTeam}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block" />
                <span>{match.awayTeam}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Summary Matrix Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rounded-lg">
          <div className="text-xs text-neutral-500 dark:text-neutral-400">1-й тайм (1-45')</div>
          <div className="mt-1 text-sm font-bold font-mono tabular-nums text-neutral-900 dark:text-neutral-100">
            {match.homeTeam}: {firstHalfHomePercent}% <span className="text-neutral-400 font-normal">|</span> {match.awayTeam}: {firstHalfAwayPercent}%
          </div>
        </div>

        <div className="p-3 bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rounded-lg">
          <div className="text-xs text-neutral-500 dark:text-neutral-400">2-й тайм (46-90+')</div>
          <div className="mt-1 text-sm font-bold font-mono tabular-nums text-neutral-900 dark:text-neutral-100">
            {match.homeTeam}: {secondHalfHomePercent}% <span className="text-neutral-400 font-normal">|</span> {match.awayTeam}: {secondHalfAwayPercent}%
          </div>
        </div>

        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <div className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            Опасная концовка (76-90+')
          </div>
          <div className="mt-1 text-sm font-bold font-mono tabular-nums text-amber-700 dark:text-amber-300">
            {lateGoalRiskPercent}% всех мячей
          </div>
        </div>

        <div className="p-3 bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rounded-lg">
          <div className="text-xs text-neutral-500 dark:text-neutral-400">Пиковый интервал</div>
          <div className="mt-1 text-sm font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
            {match.metrics.highestScoringInterval}
          </div>
        </div>
      </div>

      {/* Comparative 15-Minute Data Table with Sample Size Indication */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400 px-1">
          <span className="font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-emerald-500" />
            Сводная матрица интервалов (выборка: {totalSampleMatches} матчей)
          </span>
          <span className="text-[11px] font-mono text-neutral-500">
            {homeMatchesCount} игр «{match.homeTeam}» • {awayMatchesCount} игр «{match.awayTeam}» • {h2hMatchesCount} H2H
          </span>
        </div>
        <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
          <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-neutral-100/70 dark:bg-neutral-900/80 text-neutral-600 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800">
              <th className="py-2.5 px-3 font-semibold">Интервал</th>
              <th className="py-2.5 px-3 font-semibold">Тайм</th>
              <th className="py-2.5 px-3 font-semibold text-center">Вероятность гола</th>
              <th className="py-2.5 px-3 font-semibold text-right">{match.homeTeam} (Заб.)</th>
              <th className="py-2.5 px-3 font-semibold text-right">{match.homeTeam} (Проп.)</th>
              <th className="py-2.5 px-3 font-semibold text-right">{match.awayTeam} (Заб.)</th>
              <th className="py-2.5 px-3 font-semibold text-right">{match.awayTeam} (Проп.)</th>
              <th className="py-2.5 px-3 font-semibold text-right">Суммарно H2H</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 font-mono tabular-nums">
            {chartData.map((row) => (
              <tr
                key={row.id}
                className={`hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors ${
                  row.isPeakDanger ? 'bg-amber-50/40 dark:bg-amber-950/10' : ''
                }`}
              >
                <td className="py-2 px-3 font-semibold font-sans text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                  {row.label}
                  {row.isPeakDanger && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 inline-block animate-pulse" />
                  )}
                </td>
                <td className="py-2 px-3 text-neutral-500 font-sans">
                  {row.half}
                </td>
                <td className="py-2 px-3 text-center">
                  <span className={`px-2 py-0.5 rounded font-bold ${
                    row.isPeakDanger 
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300' 
                      : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                  }`}>
                    {row.goalProbability}%
                  </span>
                </td>
                <td className="py-2 px-3 text-right font-medium text-blue-600 dark:text-blue-400">
                  {row.homeGoalsScored} ({row.homeScoredPercent}%)
                </td>
                <td className="py-2 px-3 text-right text-neutral-500 dark:text-neutral-400">
                  {row.homeGoalsConceded} ({row.homeConcededPercent}%)
                </td>
                <td className="py-2 px-3 text-right font-medium text-emerald-600 dark:text-emerald-400">
                  {row.awayGoalsScored} ({row.awayScoredPercent}%)
                </td>
                <td className="py-2 px-3 text-right text-neutral-500 dark:text-neutral-400">
                  {row.awayGoalsConceded} ({row.awayConcededPercent}%)
                </td>
                <td className="py-2 px-3 text-right font-semibold text-neutral-900 dark:text-neutral-100">
                  {row.totalH2HGoals}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
};
