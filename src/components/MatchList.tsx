import React, { useState, useEffect, useRef } from 'react';
import { MatchAnalysis } from '../types/football';
import { formatMatchTime } from '../utils/timeFormat';
import { Clock, ChevronRight, Activity, Flame, ShieldAlert, Database, Sparkles } from 'lucide-react';

interface MatchListProps {
  matches: MatchAnalysis[];
  selectedMatchId: string | null;
  onSelectMatch: (match: MatchAnalysis) => void;
  onResetFilters?: () => void;
}

export const MatchList: React.FC<MatchListProps> = ({
  matches,
  selectedMatchId,
  onSelectMatch,
  onResetFilters
}) => {
  // Хранилище предыдущих счетов для детекции изменений в лайве
  const previousScoresRef = useRef<Map<string, { home: number; away: number }>>(new Map());
  const [highlightedMatchIds, setHighlightedMatchIds] = useState<Set<string>>(new Set());

  // Эффект отслеживания изменившихся счетов и анимации подсветки
  useEffect(() => {
    const newlyChanged = new Set<string>();

    matches.forEach((m) => {
      const prev = previousScoresRef.current.get(m.id);
      const currentHome = m.homeScore ?? 0;
      const currentAway = m.awayScore ?? 0;

      if (prev !== undefined && m.status === 'live') {
        if (prev.home !== currentHome || prev.away !== currentAway) {
          newlyChanged.add(m.id);
        }
      }

      // Сохраняем текущий счет
      previousScoresRef.current.set(m.id, { home: currentHome, away: currentAway });
    });

    if (newlyChanged.size > 0) {
      setHighlightedMatchIds((prev) => {
        const next = new Set(prev);
        newlyChanged.forEach((id) => next.add(id));
        return next;
      });

      // Автоматическое снятие подсветки через 4.5 секунды
      const timer = setTimeout(() => {
        setHighlightedMatchIds((prev) => {
          const next = new Set(prev);
          newlyChanged.forEach((id) => next.delete(id));
          return next;
        });
      }, 4500);

      return () => clearTimeout(timer);
    }
  }, [matches]);

  if (matches.length === 0) {
    return (
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-12 text-center animate-fadeIn">
        <ShieldAlert className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
          Матчи по выбранным критериям не найдены
        </h3>
        <p className="mt-1 text-xs text-neutral-500 max-w-sm mx-auto">
          Попробуйте ослабить фильтры по процентам голов или изменить временной интервал.
        </p>
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="mt-4 px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-xs"
          >
            Сбросить все фильтры
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs animate-fadeIn">
      <div className="px-4 py-3 bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-700 dark:text-neutral-300">
          Список матчей для анализа ({matches.length})
        </span>
        <span className="text-[11px] text-neutral-500 hidden sm:inline">
          Нажмите на строку матча для открытия графиков, зон давления и очных встреч
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-neutral-100/60 dark:bg-neutral-800/40 text-neutral-600 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800 font-semibold">
              <th className="py-3 px-4">Время / Статус</th>
              <th className="py-3 px-4">Турнир</th>
              <th className="py-3 px-4 text-right">Хозяева</th>
              <th className="py-3 px-3 text-center">Счет</th>
              <th className="py-3 px-4">Гости</th>
              <th className="py-3 px-3 text-center">1-й тайм (%)</th>
              <th className="py-3 px-3 text-center">ТБ 2.5 (%)</th>
              <th className="py-3 px-3 text-center">Пиковый интервал</th>
              <th className="py-3 px-3 text-center">H2H тотал</th>
              <th className="py-3 px-3 text-center">Выборка статистики</th>
              <th className="py-3 px-3 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {matches.map((match, idx) => {
              const isSelected = match.id === selectedMatchId;
              const isLive = match.status === 'live';
              const isFinished = match.status === 'finished';
              const isScoreChanged = highlightedMatchIds.has(match.id);
              const timeInfo = formatMatchTime(match.startTime, match.displayTime, match.status, match.liveMinute, match.livePeriod);

              return (
                <tr
                  key={match.id}
                  onClick={() => onSelectMatch(match)}
                  style={{ animationDelay: `${Math.min(idx * 20, 250)}ms` }}
                  className={`cursor-pointer transition-all duration-300 group animate-fadeIn ${
                    isScoreChanged
                      ? 'bg-amber-100/80 dark:bg-amber-950/40 ring-2 ring-amber-400/90 shadow-md'
                      : isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/20'
                      : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                  }`}
                >
                  {/* Status / Kickoff Time (Formatted accurately like live scoreboards) */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-mono text-xs font-bold text-neutral-700 dark:text-neutral-200">
                        {timeInfo.kickoffTime}
                      </span>
                      {isLive ? (
                        <div className="flex items-center gap-1 font-mono font-bold text-rose-600 dark:text-rose-400 mt-0.5 text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                          <span>{timeInfo.liveLabel || `${match.liveMinute}'`}</span>
                        </div>
                      ) : isFinished ? (
                        <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-semibold px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 w-fit mt-0.5 border border-neutral-200 dark:border-neutral-700 font-mono">
                          Завершен
                        </span>
                      ) : (
                        <span className="text-[10px] text-neutral-400 font-medium mt-0.5">
                          Скоро
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Tournament */}
                  <td className="py-3 px-4 font-medium text-neutral-600 dark:text-neutral-300 whitespace-nowrap">
                    <div className="font-semibold text-neutral-900 dark:text-neutral-100">{match.tournament}</div>
                    <div className="text-[10px] text-neutral-400 font-mono">{match.source}</div>
                  </td>

                  {/* Home Team */}
                  <td className="py-3 px-4 text-right font-bold text-neutral-900 dark:text-white whitespace-nowrap">
                    {match.homeTeam}
                  </td>

                  {/* Score or VS (With Highlight Pop on change) */}
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    {isLive ? (
                      isScoreChanged ? (
                        <div className="relative inline-block animate-scoreFlash">
                          <span className="font-mono font-black text-sm px-2.5 py-1 rounded bg-amber-400 text-neutral-950 shadow-lg tabular-nums border border-amber-300 flex items-center gap-1">
                            <span>⚽</span>
                            <span>{match.homeScore} : {match.awayScore}</span>
                          </span>
                          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full bg-rose-600 text-[8px] text-white font-extrabold tracking-wider animate-bounce">
                            ГОЛ!
                          </span>
                        </div>
                      ) : (
                        <span className="font-mono font-extrabold text-sm px-2.5 py-1 rounded bg-neutral-900 text-white dark:bg-neutral-800 tabular-nums border border-neutral-700/60 shadow-xs">
                          {match.homeScore} : {match.awayScore}
                        </span>
                      )
                    ) : isFinished ? (
                      <span className="font-mono font-bold text-sm px-2.5 py-1 rounded bg-neutral-100 dark:bg-neutral-800/90 text-neutral-900 dark:text-neutral-100 tabular-nums border border-neutral-200 dark:border-neutral-700 shadow-2xs">
                        {match.homeScore ?? 0} : {match.awayScore ?? 0}
                      </span>
                    ) : (
                      <span className="font-mono text-neutral-400 text-xs px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800">
                        vs
                      </span>
                    )}
                  </td>

                  {/* Away Team */}
                  <td className="py-3 px-4 font-bold text-neutral-900 dark:text-white whitespace-nowrap">
                    {match.awayTeam}
                  </td>

                  {/* 1st Half Goal % */}
                  <td className="py-3 px-3 text-center font-mono tabular-nums whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      match.metrics.firstHalfGoalProb >= 75
                        ? 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300'
                        : 'text-neutral-600 dark:text-neutral-400'
                    }`}>
                      {match.metrics.firstHalfGoalProb}%
                    </span>
                  </td>

                  {/* Over 2.5 % */}
                  <td className="py-3 px-3 text-center font-mono tabular-nums whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      match.metrics.predTotalOver25 >= 75
                        ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                        : 'text-neutral-600 dark:text-neutral-400'
                    }`}>
                      {match.metrics.predTotalOver25}%
                    </span>
                  </td>

                  {/* Peak 15-min Interval */}
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300">
                      {match.metrics.highestScoringInterval}
                    </span>
                  </td>

                  {/* H2H Total Goals */}
                  <td className="py-3 px-3 text-center font-mono font-semibold text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                    {match.h2h.avgTotalGoals.toFixed(2)}
                  </td>

                  {/* Sample Matches Count */}
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <div className="inline-flex items-center gap-1 font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[11px] border border-emerald-500/20">
                      <Database className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span>{(match.homeTeamStats?.matchesPlayed || 10) + (match.awayTeamStats?.matchesPlayed || 10) + (match.h2h?.totalMatches || 4)} матчей</span>
                    </div>
                    <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                      {match.homeTeamStats?.matchesPlayed || 10}+{match.awayTeamStats?.matchesPlayed || 10}+{match.h2h?.totalMatches || 4} H2H
                    </div>
                  </td>

                  {/* Action Chevron */}
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <button
                      className={`p-1.5 rounded-md transition-colors ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white group-hover:bg-neutral-100 dark:group-hover:bg-neutral-800'
                      }`}
                      title="Подробный анализ матча"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
