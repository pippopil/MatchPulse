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
        <table className="w-full text-xs text-left border-collapse table-auto sm:table-fixed">
          <thead>
            <tr className="bg-neutral-100/70 dark:bg-neutral-800/50 text-neutral-600 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800 font-semibold text-[11px]">
              <th className="py-2.5 px-2.5 w-[75px] shrink-0">Время</th>
              <th className="py-2.5 px-2 w-[110px] md:w-[130px]">Турнир</th>
              <th className="py-2.5 px-2 text-right w-[110px] md:w-[140px]">Хозяева</th>
              <th className="py-2.5 px-1 text-center w-[60px] shrink-0">Счет</th>
              <th className="py-2.5 px-2 w-[110px] md:w-[140px]">Гости</th>
              <th className="py-2.5 px-1.5 text-center w-[58px] shrink-0" title="Вероятность гола в 1-м тайме">1-й т. %</th>
              <th className="py-2.5 px-1.5 text-center w-[58px] shrink-0" title="Вероятность тотала больше 2.5">ТБ 2.5 %</th>
              <th className="py-2.5 px-1.5 text-center w-[76px] shrink-0" title="Пиковый 15-минутный интервал голов">Пик 15'</th>
              <th className="py-2.5 px-1.5 text-center w-[52px] shrink-0" title="Средний тотал в очных встречах (H2H)">H2H</th>
              <th className="py-2.5 px-2 text-center w-[85px] shrink-0" title="Количество матчей в аналитической выборке">Выборка</th>
              <th className="py-2.5 px-1.5 text-right w-[32px] shrink-0"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {matches.map((match, idx) => {
              const isSelected = match.id === selectedMatchId;
              const isLive = match.status === 'live';
              const isFinished = match.status === 'finished';
              const isScoreChanged = highlightedMatchIds.has(match.id);
              const timeInfo = formatMatchTime(match.startTime, match.displayTime, match.status, match.liveMinute, match.livePeriod);
              const totalStatsCount = (match.homeTeamStats?.matchesPlayed || 10) + (match.awayTeamStats?.matchesPlayed || 10) + (match.h2h?.totalMatches || 4);

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
                  {/* Status / Kickoff Time */}
                  <td className="py-2.5 px-2.5 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-mono text-xs font-bold text-neutral-800 dark:text-neutral-200">
                        {timeInfo.kickoffTime}
                      </span>
                      {isLive ? (
                        <div className="flex items-center gap-1 font-mono font-bold text-rose-600 dark:text-rose-400 mt-0.5 text-[10px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                          <span>{timeInfo.liveLabel || `${match.liveMinute}'`}</span>
                        </div>
                      ) : isFinished ? (
                        <span className="text-[9px] text-neutral-500 dark:text-neutral-400 font-semibold px-1 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 w-fit mt-0.5 border border-neutral-200 dark:border-neutral-700 font-mono">
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
                  <td className="py-2.5 px-2">
                    <div className="font-semibold text-neutral-900 dark:text-neutral-100 truncate max-w-[110px] md:max-w-[130px]" title={match.tournament}>
                      {match.tournament}
                    </div>
                    <div className="text-[10px] text-neutral-400 font-mono truncate max-w-[110px] md:max-w-[130px]">
                      {match.source}
                    </div>
                  </td>

                  {/* Home Team */}
                  <td className="py-2.5 px-2 text-right">
                    <div className="font-bold text-neutral-900 dark:text-white truncate max-w-[110px] md:max-w-[140px] ml-auto" title={match.homeTeam}>
                      {match.homeTeam}
                    </div>
                  </td>

                  {/* Score or VS */}
                  <td className="py-2.5 px-1 text-center whitespace-nowrap">
                    {isLive ? (
                      isScoreChanged ? (
                        <div className="relative inline-block animate-scoreFlash">
                          <span className="font-mono font-black text-xs px-2 py-0.5 rounded bg-amber-400 text-neutral-950 shadow-md tabular-nums border border-amber-300 inline-flex items-center gap-0.5">
                            <span>⚽</span>
                            <span>{match.homeScore}:{match.awayScore}</span>
                          </span>
                          <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1 py-0.2 rounded-full bg-rose-600 text-[7px] text-white font-extrabold tracking-wider animate-bounce">
                            ГОЛ!
                          </span>
                        </div>
                      ) : (
                        <span className="font-mono font-extrabold text-xs px-2 py-0.5 rounded bg-neutral-900 text-white dark:bg-neutral-800 tabular-nums border border-neutral-700/60 shadow-xs inline-block">
                          {match.homeScore} : {match.awayScore}
                        </span>
                      )
                    ) : isFinished ? (
                      <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800/90 text-neutral-900 dark:text-neutral-100 tabular-nums border border-neutral-200 dark:border-neutral-700 shadow-2xs inline-block">
                        {match.homeScore ?? 0} : {match.awayScore ?? 0}
                      </span>
                    ) : (
                      <span className="font-mono text-neutral-400 text-[11px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800">
                        vs
                      </span>
                    )}
                  </td>

                  {/* Away Team */}
                  <td className="py-2.5 px-2">
                    <div className="font-bold text-neutral-900 dark:text-white truncate max-w-[110px] md:max-w-[140px]" title={match.awayTeam}>
                      {match.awayTeam}
                    </div>
                  </td>

                  {/* 1st Half Goal % */}
                  <td className="py-2.5 px-1.5 text-center font-mono tabular-nums whitespace-nowrap">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                      match.metrics.firstHalfGoalProb >= 75
                        ? 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300'
                        : 'text-neutral-600 dark:text-neutral-400'
                    }`}>
                      {match.metrics.firstHalfGoalProb}%
                    </span>
                  </td>

                  {/* Over 2.5 % */}
                  <td className="py-2.5 px-1.5 text-center font-mono tabular-nums whitespace-nowrap">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                      match.metrics.predTotalOver25 >= 75
                        ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                        : 'text-neutral-600 dark:text-neutral-400'
                    }`}>
                      {match.metrics.predTotalOver25}%
                    </span>
                  </td>

                  {/* Peak 15-min Interval */}
                  <td className="py-2.5 px-1.5 text-center whitespace-nowrap">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300">
                      {match.metrics.highestScoringInterval}
                    </span>
                  </td>

                  {/* H2H Total Goals */}
                  <td className="py-2.5 px-1.5 text-center font-mono font-semibold text-neutral-900 dark:text-neutral-100 whitespace-nowrap text-[11px]">
                    {match.h2h.avgTotalGoals.toFixed(2)}
                  </td>

                  {/* Sample Matches Count */}
                  <td className="py-2.5 px-2 text-center whitespace-nowrap">
                    <div 
                      className="inline-flex items-center gap-1 font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[10px] border border-emerald-500/20"
                      title={`${match.homeTeamStats?.matchesPlayed || 10} матчей хозяев + ${match.awayTeamStats?.matchesPlayed || 10} матчей гостей + ${match.h2h?.totalMatches || 4} H2H`}
                    >
                      <Database className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                      <span>{totalStatsCount} м.</span>
                    </div>
                  </td>

                  {/* Action Chevron */}
                  <td className="py-2.5 px-1.5 text-right whitespace-nowrap">
                    <button
                      className={`p-1 rounded-md transition-colors ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white group-hover:bg-neutral-100 dark:group-hover:bg-neutral-800'
                      }`}
                      title="Подробный анализ матча"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
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
