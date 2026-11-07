import React, { useState } from 'react';
import { MatchAnalysis } from '../types/football';
import { GoalIntervalChart } from './GoalIntervalChart';
import { PressureZoneHeatmap } from './PressureZoneHeatmap';
import { OutcomeProbabilityPieChart } from './OutcomeProbabilityPieChart';
import { TeamLineupsView } from './TeamLineupsView';
import { RecentGoalsComparisonCard } from './RecentGoalsComparisonCard';
import { TeamStreaksCard } from './TeamStreaksCard';
import { ExpectedGoalsComparisonCard } from './ExpectedGoalsComparisonCard';
import { formatMatchTime } from '../utils/timeFormat';
import { 
  Trophy, 
  Flame, 
  Calendar, 
  Target, 
  Clock, 
  TrendingUp, 
  ShieldCheck, 
  AlertCircle,
  X,
  Database,
  Users,
  Crosshair
} from 'lucide-react';

interface MatchDetailProps {
  match: MatchAnalysis;
  onClose?: () => void;
}

export const MatchDetail: React.FC<MatchDetailProps> = ({ match, onClose }) => {
  const [activeTab, setActiveTab] = useState<'intervals' | 'heatmap' | 'lineups' | 'streaks' | 'xg' | 'h2h' | 'recent' | 'live'>('intervals');

  const { h2h, homeTeamStats, awayTeamStats, metrics } = match;

  const homeMatchesCount = homeTeamStats?.matchesPlayed || 10;
  const awayMatchesCount = awayTeamStats?.matchesPlayed || 10;
  const h2hMatchesCount = h2h?.totalMatches || 4;
  const totalSampleMatches = homeMatchesCount + awayMatchesCount + h2hMatchesCount;

  const timeInfo = formatMatchTime(
    match.startTime,
    match.displayTime,
    match.status,
    match.liveMinute,
    match.livePeriod
  );

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs overflow-hidden">
      {/* Top Match Header - Light & Dark theme responsive */}
      <div className="p-4 md:p-6 bg-neutral-50/70 dark:bg-neutral-900 text-neutral-900 dark:text-white border-b border-neutral-200 dark:border-neutral-800 relative transition-colors">
        <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-neutral-900 dark:text-neutral-200">{match.tournament}</span>
            <span>·</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-mono font-medium">{match.source}</span>
            <span>·</span>
            <span className="bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1 text-[11px]">
              <Database className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
              Статистика: {totalSampleMatches} матчей ({homeMatchesCount}+{awayMatchesCount}+{h2hMatchesCount} H2H)
            </span>
          </div>

          <div className="flex items-center gap-3">
            {match.status === 'live' ? (
              <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span>{timeInfo.kickoffTime} · LIVE {timeInfo.liveLabel || `${match.liveMinute}'`}</span>
              </div>
            ) : match.status === 'finished' ? (
              <div className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300 font-mono">
                <span className="px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-neutral-300 dark:border-neutral-700">
                  Матч завершен (FT)
                </span>
                <span>{timeInfo.kickoffTime}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-300 font-mono">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                <span>{timeInfo.fullDisplay}</span>
              </div>
            )}

            {onClose && (
              <button
                onClick={onClose}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                title="Закрыть"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Score & Teams */}
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 py-2">
          {/* Home Team */}
          <div className="flex items-center gap-3 md:justify-end">
            <div className="text-right">
              <h3 className="text-lg md:text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
                {match.homeTeam}
              </h3>
              <div className="flex items-center gap-1 justify-end mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                <span>Форма:</span>
                <div className="flex gap-1 font-mono font-bold text-[10px]">
                  {homeTeamStats.form.map((res, i) => (
                    <span
                      key={i}
                      className={`w-4 h-4 rounded-xs flex items-center justify-center font-bold text-white ${
                        res === 'W'
                          ? 'bg-emerald-600'
                          : res === 'D'
                          ? 'bg-amber-600'
                          : 'bg-rose-600'
                      }`}
                    >
                      {res}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Central Score or Time */}
          <div className="text-center bg-white dark:bg-neutral-800/80 py-3 px-6 rounded-xl border border-neutral-200 dark:border-neutral-700/60 max-w-[200px] mx-auto w-full shadow-2xs">
            {match.status === 'live' ? (
              <>
                <div className="text-2xl md:text-3xl font-extrabold font-mono tabular-nums tracking-wider text-neutral-900 dark:text-white">
                  {match.homeScore} : {match.awayScore}
                </div>
                <div className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 mt-1">
                  1-й тайм: {match.halfTimeScore || `${match.homeScore}:${match.awayScore}`}
                </div>
              </>
            ) : match.status === 'finished' ? (
              <>
                <div className="text-2xl md:text-3xl font-extrabold font-mono tabular-nums tracking-wider text-neutral-900 dark:text-white">
                  {match.homeScore ?? 0} : {match.awayScore ?? 0}
                </div>
                <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 mt-1 font-bold">
                  Итоговый счет (FT)
                </div>
              </>
            ) : (
              <>
                <div className="text-xl md:text-2xl font-bold font-mono tracking-wider text-emerald-600 dark:text-emerald-400">
                  {timeInfo.kickoffTime}
                </div>
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                  {timeInfo.fullDisplay}
                </div>
              </>
            )}
          </div>

          {/* Away Team */}
          <div className="flex items-center gap-3 md:justify-start">
            <div className="text-left">
              <h3 className="text-lg md:text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
                {match.awayTeam}
              </h3>
              <div className="flex items-center gap-1 mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                <span>Форма:</span>
                <div className="flex gap-1 font-mono font-bold text-[10px]">
                  {awayTeamStats.form.map((res, i) => (
                    <span
                      key={i}
                      className={`w-4 h-4 rounded-xs flex items-center justify-center font-bold text-white ${
                        res === 'W'
                          ? 'bg-emerald-600'
                          : res === 'D'
                          ? 'bg-amber-600'
                          : 'bg-rose-600'
                      }`}
                    >
                      {res}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Odds Strip */}
        {match.odds && (
          <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between text-xs gap-3">
            <div className="flex items-center gap-3 text-neutral-500 dark:text-neutral-400 flex-wrap">
              <span>Котировки исходов:</span>
              <span className="font-mono text-neutral-700 dark:text-neutral-200">П1: <strong className="text-neutral-900 dark:text-white">{match.odds.homeWin}</strong></span>
              <span className="font-mono text-neutral-700 dark:text-neutral-200">X: <strong className="text-neutral-900 dark:text-white">{match.odds.draw}</strong></span>
              <span className="font-mono text-neutral-700 dark:text-neutral-200">П2: <strong className="text-neutral-900 dark:text-white">{match.odds.awayWin}</strong></span>
              <span className="font-mono text-neutral-700 dark:text-neutral-200">ТБ 2.5: <strong className="text-neutral-900 dark:text-white">{match.odds.totalOver25}</strong></span>
              <span className="font-mono text-neutral-700 dark:text-neutral-200">ТМ 2.5: <strong className="text-neutral-900 dark:text-white">{match.odds.totalUnder25}</strong></span>
            </div>

            <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 text-[11px] flex-wrap">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Вероятность ТБ 2.5: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{metrics.predTotalOver25}%</strong></span>
              <span>·</span>
              <span>Обе забьют: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{metrics.predBTTS}%</strong></span>
              <span>·</span>
              <span className="text-emerald-700 dark:text-emerald-300 font-mono font-semibold flex items-center gap-1 bg-emerald-50 dark:bg-neutral-800 border border-emerald-500/20 dark:border-neutral-700 px-2 py-0.5 rounded">
                <Database className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                Выборка: {totalSampleMatches} матчей ({homeMatchesCount}+{awayMatchesCount}+{h2hMatchesCount} H2H)
              </span>
            </div>
          </div>
        )}

        {/* Outcome Probability (П1, X, П2) Pie Chart in Summary Card */}
        <div className="mt-4">
          <OutcomeProbabilityPieChart match={match} />
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center border-b border-neutral-200 dark:border-neutral-800 px-4 md:px-6 bg-neutral-50 dark:bg-neutral-900/60 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('intervals')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'intervals'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-neutral-900'
              : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <span>График интервалов 15'</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold">
            {totalSampleMatches} матчей
          </span>
        </button>
        <button
          onClick={() => setActiveTab('heatmap')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'heatmap'
              ? 'border-rose-500 text-rose-600 dark:text-rose-400 bg-white dark:bg-neutral-900'
              : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-rose-500" />
          <span>Карта давления (Heatmap)</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold">
            LIVE ПРЕССИНГ
          </span>
        </button>
        <button
          onClick={() => setActiveTab('lineups')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'lineups'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-neutral-900'
              : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-blue-500" />
          <span>Составы команд</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold">
            СХЕМЫ
          </span>
        </button>
        <button
          onClick={() => setActiveTab('streaks')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'streaks'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-white dark:bg-neutral-900'
              : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Trophy className="w-3.5 h-3.5 text-amber-500" />
          <span>Серии команд</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold">
            ТРЕНДЫ
          </span>
        </button>
        <button
          onClick={() => setActiveTab('xg')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'xg'
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-neutral-900'
              : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Crosshair className="w-3.5 h-3.5 text-indigo-500" />
          <span>Ожидаемые голы (xG)</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold">
            5 МАТЧЕЙ xG
          </span>
        </button>
        <button
          onClick={() => setActiveTab('h2h')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'h2h'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-neutral-900'
              : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <span>Очные встречи H2H</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-bold">
            {h2h.totalMatches} матчей
          </span>
        </button>
        <button
          onClick={() => setActiveTab('recent')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'recent'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-neutral-900'
              : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <span>Форма команд</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-bold">
            {homeMatchesCount + awayMatchesCount} матчей
          </span>
        </button>
        {match.liveEvents && match.liveEvents.length > 0 && (
          <button
            onClick={() => setActiveTab('live')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'live'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-neutral-900'
                : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Хроника событий ({match.liveEvents.length})
          </button>
        )}
      </div>

      {/* Main Tab Content */}
      <div className="p-4 md:p-6">
        {/* 1. INTERVALS TAB */}
        {activeTab === 'intervals' && (
          <div className="space-y-6">
            <GoalIntervalChart match={match} />

            {/* Expected Goals (xG) 5-Match Comparison with Circular Indicators */}
            <ExpectedGoalsComparisonCard match={match} />

            {/* Recent 5 Matches Goals Horizontal Histogram Comparison */}
            <RecentGoalsComparisonCard match={match} />

            {/* Team Streaks and Trends Card */}
            <TeamStreaksCard match={match} />

            {/* Analytical forecast card */}
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    Предматчевый вердикт по голам
                  </h5>
                  <p className="mt-1 text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    {metrics.forecastNote}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-4 text-xs font-mono tabular-nums text-neutral-600 dark:text-neutral-300">
                    <span>Гол в 1-м тайме: <strong className="text-neutral-900 dark:text-white">{metrics.firstHalfGoalProb}%</strong></span>
                    <span>·</span>
                    <span>Гол во 2-м тайме: <strong className="text-neutral-900 dark:text-white">{metrics.secondHalfGoalProb}%</strong></span>
                    <span>·</span>
                    <span>Тотал больше 2.5: <strong className="text-neutral-900 dark:text-white">{metrics.predTotalOver25}%</strong></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. HEATMAP TAB (PRESSURE ZONES) */}
        {activeTab === 'heatmap' && (
          <div className="space-y-6">
            <PressureZoneHeatmap match={match} />
          </div>
        )}

        {/* 3. LINEUPS TAB (STARTING XI & FORMATIONS) */}
        {activeTab === 'lineups' && (
          <div className="space-y-6">
            <TeamLineupsView match={match} />
          </div>
        )}

        {/* 4. STREAKS TAB (TEAM TRENDS) */}
        {activeTab === 'streaks' && (
          <div className="space-y-6">
            <TeamStreaksCard match={match} />
            <ExpectedGoalsComparisonCard match={match} />
            <RecentGoalsComparisonCard match={match} />
          </div>
        )}

        {/* 5. EXPECTED GOALS (xG) TAB */}
        {activeTab === 'xg' && (
          <div className="space-y-6">
            <ExpectedGoalsComparisonCard match={match} />
            <RecentGoalsComparisonCard match={match} />
            <TeamStreaksCard match={match} />
          </div>
        )}

        {/* 5. H2H TAB */}
        {activeTab === 'h2h' && (
          <div className="space-y-6">
            {/* H2H Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800 rounded-lg">
                <div className="text-xs text-neutral-500">Баланс побед</div>
                <div className="mt-1 text-sm font-bold font-mono text-neutral-900 dark:text-neutral-100">
                  {h2h.homeWins} В - {h2h.draws} Н - {h2h.awayWins} П
                </div>
              </div>

              <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800 rounded-lg">
                <div className="text-xs text-neutral-500">Средний тотал</div>
                <div className="mt-1 text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {h2h.avgTotalGoals.toFixed(2)} гола/матч
                </div>
              </div>

              <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800 rounded-lg">
                <div className="text-xs text-neutral-500">Обе забьют (BTTS)</div>
                <div className="mt-1 text-sm font-bold font-mono text-neutral-900 dark:text-neutral-100">
                  {h2h.bttsPercent}% матчей
                </div>
              </div>

              <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800 rounded-lg">
                <div className="text-xs text-neutral-500">Тотал больше 2.5</div>
                <div className="mt-1 text-sm font-bold font-mono text-neutral-900 dark:text-neutral-100">
                  {h2h.over25Percent}% матчей
                </div>
              </div>
            </div>

            {/* H2H Table */}
            <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-100/70 dark:bg-neutral-900/80 text-neutral-600 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800">
                    <th className="py-2.5 px-3 font-semibold">Дата</th>
                    <th className="py-2.5 px-3 font-semibold">Турнир</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Хозяева</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Счет</th>
                    <th className="py-2.5 px-3 font-semibold">Гости</th>
                    <th className="py-2.5 px-3 font-semibold text-center">1-й тайм</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Тотал</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 font-mono tabular-nums">
                  {h2h.matches.map((m) => {
                    const isHomeWin = m.homeScore > m.awayScore;
                    const isAwayWin = m.awayScore > m.homeScore;

                    return (
                      <tr key={m.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                        <td className="py-2.5 px-3 text-neutral-500 font-sans">{m.date}</td>
                        <td className="py-2.5 px-3 text-neutral-500 font-sans">{m.tournament}</td>
                        <td className={`py-2.5 px-3 text-right font-sans ${isHomeWin ? 'font-bold text-neutral-900 dark:text-white' : 'text-neutral-600 dark:text-neutral-400'}`}>
                          {m.homeTeam}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-neutral-900 dark:text-white bg-neutral-100/50 dark:bg-neutral-800/50">
                          {m.homeScore} : {m.awayScore}
                        </td>
                        <td className={`py-2.5 px-3 font-sans ${isAwayWin ? 'font-bold text-neutral-900 dark:text-white' : 'text-neutral-600 dark:text-neutral-400'}`}>
                          {m.awayTeam}
                        </td>
                        <td className="py-2.5 px-3 text-center text-neutral-500">
                          {m.halfTimeScore || '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold">
                          {m.totalGoals} {m.totalGoals >= 3 ? <span className="text-emerald-500 text-[10px] ml-1">ТБ</span> : <span className="text-neutral-400 text-[10px] ml-1">ТМ</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. RECENT FORM TAB */}
        {activeTab === 'recent' && (
          <div className="space-y-6">
            <ExpectedGoalsComparisonCard match={match} />
            <RecentGoalsComparisonCard match={match} />
            <TeamStreaksCard match={match} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Home Team Recent Form */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-800">
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                    {homeTeamStats.teamName} (Хозяева)
                  </h4>
                  <span className="text-xs font-mono text-neutral-500">
                    Средний счет: {homeTeamStats.avgGoalsScored} - {homeTeamStats.avgGoalsConceded}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                    <div className="text-neutral-500">Дома ср. заб.</div>
                    <div className="mt-1 font-bold font-mono text-neutral-900 dark:text-white">
                      {homeTeamStats.homeStats.avgScored}
                    </div>
                  </div>
                  <div className="p-2.5 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                    <div className="text-neutral-500">Дома ср. проп.</div>
                    <div className="mt-1 font-bold font-mono text-neutral-900 dark:text-white">
                      {homeTeamStats.homeStats.avgConceded}
                    </div>
                  </div>
                  <div className="p-2.5 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                    <div className="text-neutral-500">Сухие матчи</div>
                    <div className="mt-1 font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      {homeTeamStats.cleanSheets} / {homeTeamStats.matchesPlayed}
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                  <div className="px-3 py-2 bg-neutral-100/70 dark:bg-neutral-800 text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
                    Последние матчи
                  </div>
                  <div className="divide-y divide-neutral-200 dark:divide-neutral-800 text-xs">
                    {homeTeamStats.matches.map((m) => (
                      <div key={m.id} className="p-2.5 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                        <div className="flex items-center gap-2">
                          <span className={`w-4 h-4 rounded-xs text-[10px] font-bold font-mono flex items-center justify-center ${
                            m.result === 'W' ? 'bg-emerald-600 text-white' : m.result === 'D' ? 'bg-amber-600 text-white' : 'bg-rose-600 text-white'
                          }`}>
                            {m.result}
                          </span>
                          <span className="text-neutral-500 font-mono text-[11px]">{m.date}</span>
                          <span className="font-medium text-neutral-900 dark:text-white">
                            {m.isHome ? 'против ' : '@ '} {m.opponent}
                          </span>
                        </div>
                        <div className="font-mono font-bold tabular-nums text-neutral-900 dark:text-white">
                          {m.score}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Away Team Recent Form */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-800">
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    {awayTeamStats.teamName} (Гости)
                  </h4>
                  <span className="text-xs font-mono text-neutral-500">
                    Средний счет: {awayTeamStats.avgGoalsScored} - {awayTeamStats.avgGoalsConceded}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                    <div className="text-neutral-500">На выезде заб.</div>
                    <div className="mt-1 font-bold font-mono text-neutral-900 dark:text-white">
                      {awayTeamStats.awayStats.avgScored}
                    </div>
                  </div>
                  <div className="p-2.5 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                    <div className="text-neutral-500">На выезде проп.</div>
                    <div className="mt-1 font-bold font-mono text-neutral-900 dark:text-white">
                      {awayTeamStats.awayStats.avgConceded}
                    </div>
                  </div>
                  <div className="p-2.5 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                    <div className="text-neutral-500">Сухие матчи</div>
                    <div className="mt-1 font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      {awayTeamStats.cleanSheets} / {awayTeamStats.matchesPlayed}
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                  <div className="px-3 py-2 bg-neutral-100/70 dark:bg-neutral-800 text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
                    Последние матчи
                  </div>
                  <div className="divide-y divide-neutral-200 dark:divide-neutral-800 text-xs">
                    {awayTeamStats.matches.map((m) => (
                      <div key={m.id} className="p-2.5 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                        <div className="flex items-center gap-2">
                          <span className={`w-4 h-4 rounded-xs text-[10px] font-bold font-mono flex items-center justify-center ${
                            m.result === 'W' ? 'bg-emerald-600 text-white' : m.result === 'D' ? 'bg-amber-600 text-white' : 'bg-rose-600 text-white'
                          }`}>
                            {m.result}
                          </span>
                          <span className="text-neutral-500 font-mono text-[11px]">{m.date}</span>
                          <span className="font-medium text-neutral-900 dark:text-white">
                            {m.isHome ? 'против ' : '@ '} {m.opponent}
                          </span>
                        </div>
                        <div className="font-mono font-bold tabular-nums text-neutral-900 dark:text-white">
                          {m.score}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. LIVE EVENTS TAB */}
        {activeTab === 'live' && match.liveEvents && (
          <div className="space-y-3">
            <h5 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Хроника матча (Live фид)
            </h5>
            <div className="space-y-2">
              {match.liveEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800 rounded-lg flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded font-mono font-bold bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white">
                      {ev.minute}'
                    </span>
                    <div>
                      <span className="font-bold text-neutral-900 dark:text-white mr-2">
                        {ev.type === 'goal' ? '⚽ ГОЛ!' : '🟨 Желтая карточка'}
                      </span>
                      <span className="text-neutral-700 dark:text-neutral-300">
                        {ev.player} ({ev.team === 'home' ? match.homeTeam : match.awayTeam})
                      </span>
                      {ev.description && (
                        <div className="text-[11px] text-neutral-500 mt-0.5">
                          {ev.description}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
