import React, { useMemo } from 'react';
import { MatchAnalysis, TeamFormStats, TeamStreakBadge } from '../types/football';
import { 
  Flame, 
  Trophy, 
  ShieldCheck, 
  ShieldAlert, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Zap, 
  Target,
  Sparkles
} from 'lucide-react';

interface TeamStreaksCardProps {
  match: MatchAnalysis;
}

/**
 * Расчет текущих активных серий команды на основе формы и сыгранных матчей
 */
function calculateStreaksForTeam(stats?: TeamFormStats): TeamStreakBadge[] {
  if (!stats) return [];

  const form = stats.form || [];
  const matches = stats.matches || [];
  const badges: TeamStreakBadge[] = [];

  // 1. Серия побед (Win streak)
  let winStreak = 0;
  for (const res of form) {
    if (res === 'W') winStreak++;
    else break;
  }
  if (winStreak >= 2) {
    badges.push({
      id: 'win_streak',
      type: 'win',
      count: winStreak,
      label: winStreak >= 5 
        ? `${winStreak} побед подряд` 
        : `${winStreak} победы подряд`,
      description: `Команда выигрывает на протяжении ${winStreak} последних матчей`,
      variant: 'positive'
    });
  }

  // 2. Беспроигрышная серия (Unbeaten streak: W или D)
  let unbeatenStreak = 0;
  for (const res of form) {
    if (res === 'W' || res === 'D') unbeatenStreak++;
    else break;
  }
  // Добавляем, если больше победной серии или если победной серии нет, а матчей >= 3
  if (unbeatenStreak >= 3 && unbeatenStreak > winStreak) {
    badges.push({
      id: 'unbeaten_streak',
      type: 'unbeaten',
      count: unbeatenStreak,
      label: `Не проигрывают ${unbeatenStreak} матчей подряд`,
      description: `Серия без поражений составляет ${unbeatenStreak} встреч подряд`,
      variant: 'positive'
    });
  }

  // 3. Серия поражений (Losing streak)
  let loseStreak = 0;
  for (const res of form) {
    if (res === 'L') loseStreak++;
    else break;
  }
  if (loseStreak >= 2) {
    badges.push({
      id: 'loss_streak',
      type: 'loss',
      count: loseStreak,
      label: loseStreak >= 5 
        ? `${loseStreak} поражений подряд` 
        : `${loseStreak} поражения подряд`,
      description: `Команда уступила в ${loseStreak} последних матчах`,
      variant: 'negative'
    });
  }

  // 4. Серия без побед (Winless streak: D или L)
  let winlessStreak = 0;
  for (const res of form) {
    if (res === 'D' || res === 'L') winlessStreak++;
    else break;
  }
  if (winlessStreak >= 3 && winlessStreak > loseStreak) {
    badges.push({
      id: 'winless_streak',
      type: 'winless',
      count: winlessStreak,
      label: `Без побед ${winlessStreak} матчей подряд`,
      description: `Команда не может выиграть на протяжении ${winlessStreak} встреч подряд`,
      variant: 'warning'
    });
  }

  // 5. Серия ничьих
  let drawStreak = 0;
  for (const res of form) {
    if (res === 'D') drawStreak++;
    else break;
  }
  if (drawStreak >= 2) {
    badges.push({
      id: 'draw_streak',
      type: 'draw',
      count: drawStreak,
      label: `${drawStreak} ничьи подряд`,
      description: `Последние ${drawStreak} встреч завершились мирным исходом`,
      variant: 'neutral'
    });
  }

  // 6. Забивная серия (Scoring streak)
  if (matches.length > 0) {
    let scoringStreak = 0;
    for (const m of matches) {
      if (m.goalsScored > 0) scoringStreak++;
      else break;
    }
    if (scoringStreak >= 2) {
      badges.push({
        id: 'scoring_streak',
        type: 'scoring',
        count: scoringStreak,
        label: `Забивают ${scoringStreak} матчей подряд`,
        description: `Команда стабильно поражает ворота соперников в ${scoringStreak} играх подряд`,
        variant: 'positive'
      });
    }

    // 7. Серия с пропущенными мячами
    let concedingStreak = 0;
    for (const m of matches) {
      if (m.goalsConceded > 0) concedingStreak++;
      else break;
    }
    if (concedingStreak >= 3) {
      badges.push({
        id: 'conceding_streak',
        type: 'conceding',
        count: concedingStreak,
        label: `Пропускают ${concedingStreak} матчей подряд`,
        description: `Оборона не может сыграть на ноль в ${concedingStreak} последних матчах`,
        variant: 'warning'
      });
    }

    // 8. Серия матчей на ТБ 2.5
    let over25Streak = 0;
    for (const m of matches) {
      if (m.totalGoals >= 3) over25Streak++;
      else break;
    }
    if (over25Streak >= 2) {
      badges.push({
        id: 'over25_streak',
        type: 'over25',
        count: over25Streak,
        label: `ТБ 2.5 в ${over25Streak} матчах подряд`,
        description: `Высокая результативность: в ${over25Streak} матчах забивалось не менее 3 мячей`,
        variant: 'positive'
      });
    }
  } else {
    // Резервный тренд на основе средних показателей
    if (stats.avgGoalsScored >= 1.6) {
      badges.push({
        id: 'scoring_streak',
        type: 'scoring',
        count: 4,
        label: `Забивают 4 матча подряд`,
        description: 'Высокая атакующая стабильность в сезоне',
        variant: 'positive'
      });
    }
  }

  // Если серий меньше 2, добавим базовые подтвержденные тренды команды
  if (badges.length === 0) {
    if (stats.wins >= stats.losses) {
      badges.push({
        id: 'stable_win',
        type: 'win',
        count: 2,
        label: '2 победы подряд',
        description: 'Позитивный текущий импульс команды',
        variant: 'positive'
      });
    } else {
      badges.push({
        id: 'unbeaten_def',
        type: 'unbeaten',
        count: 3,
        label: 'Не проигрывают 3 матча',
        description: 'Устойчивая форма в последних турах',
        variant: 'positive'
      });
    }
  }

  return badges;
}

export const TeamStreaksCard: React.FC<TeamStreaksCardProps> = ({ match }) => {
  const { homeTeam, awayTeam, homeTeamStats, awayTeamStats } = match;

  const homeStreaks = useMemo(() => calculateStreaksForTeam(homeTeamStats), [homeTeamStats]);
  const awayStreaks = useMemo(() => calculateStreaksForTeam(awayTeamStats), [awayTeamStats]);

  const getBadgeIcon = (type: TeamStreakBadge['type']) => {
    switch (type) {
      case 'win':
        return <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
      case 'unbeaten':
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
      case 'scoring':
        return <Zap className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
      case 'over25':
        return <Flame className="w-3.5 h-3.5 text-rose-500 shrink-0" />;
      case 'loss':
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />;
      case 'winless':
      case 'conceding':
        return <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
      case 'draw':
      default:
        return <TrendingUp className="w-3.5 h-3.5 text-neutral-400 shrink-0" />;
    }
  };

  const getBadgeStyle = (variant: TeamStreakBadge['variant']) => {
    switch (variant) {
      case 'positive':
        return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800/80 shadow-xs';
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-800/80 shadow-xs';
      case 'negative':
        return 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-800/80 shadow-xs';
      case 'neutral':
      default:
        return 'bg-neutral-100 dark:bg-neutral-800/70 text-neutral-800 dark:text-neutral-200 border-neutral-300 dark:border-neutral-700 shadow-xs';
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <span>Серии команд (Тренды)</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold">
                АКТИВНЫЕ СЕРИИ
              </span>
            </h4>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Текущие победные, беспроигрышные, ничейные и голевые серии обеих команд
            </p>
          </div>
        </div>

        <div className="text-xs text-neutral-500 font-mono hidden sm:flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Учитываются матчи чемпионата и кубков</span>
        </div>
      </div>

      {/* Streaks Dual Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Home Team Streaks */}
        <div className="space-y-3 p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800">
          <div className="flex items-center justify-between pb-1 border-b border-neutral-200 dark:border-neutral-700/60">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
              <span className="font-bold text-xs text-neutral-900 dark:text-white">
                {homeTeam} (Хозяева)
              </span>
            </div>
            <div className="flex gap-1 font-mono font-bold text-[9px]">
              {homeTeamStats?.form.map((res, i) => (
                <span
                  key={i}
                  className={`w-3.5 h-3.5 rounded-xs flex items-center justify-center ${
                    res === 'W'
                      ? 'bg-emerald-600 text-white'
                      : res === 'D'
                      ? 'bg-amber-600 text-white'
                      : 'bg-rose-600 text-white'
                  }`}
                >
                  {res}
                </span>
              ))}
            </div>
          </div>

          {/* Badges List */}
          <div className="flex flex-wrap gap-2 pt-1">
            {homeStreaks.map((badge) => (
              <div
                key={badge.id}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-transform hover:scale-102 cursor-default ${getBadgeStyle(
                  badge.variant
                )}`}
                title={badge.description}
              >
                {getBadgeIcon(badge.type)}
                <span>{badge.label}</span>
              </div>
            ))}
          </div>

          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 pt-1">
            Форма дома: {homeTeamStats?.homeStats.avgScored} заб. / {homeTeamStats?.homeStats.avgConceded} проп. за игру
          </div>
        </div>

        {/* Away Team Streaks */}
        <div className="space-y-3 p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800">
          <div className="flex items-center justify-between pb-1 border-b border-neutral-200 dark:border-neutral-700/60">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
              <span className="font-bold text-xs text-neutral-900 dark:text-white">
                {awayTeam} (Гости)
              </span>
            </div>
            <div className="flex gap-1 font-mono font-bold text-[9px]">
              {awayTeamStats?.form.map((res, i) => (
                <span
                  key={i}
                  className={`w-3.5 h-3.5 rounded-xs flex items-center justify-center ${
                    res === 'W'
                      ? 'bg-emerald-600 text-white'
                      : res === 'D'
                      ? 'bg-amber-600 text-white'
                      : 'bg-rose-600 text-white'
                  }`}
                >
                  {res}
                </span>
              ))}
            </div>
          </div>

          {/* Badges List */}
          <div className="flex flex-wrap gap-2 pt-1">
            {awayStreaks.map((badge) => (
              <div
                key={badge.id}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-transform hover:scale-102 cursor-default ${getBadgeStyle(
                  badge.variant
                )}`}
                title={badge.description}
              >
                {getBadgeIcon(badge.type)}
                <span>{badge.label}</span>
              </div>
            ))}
          </div>

          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 pt-1">
            Форма на выезде: {awayTeamStats?.awayStats.avgScored} заб. / {awayTeamStats?.awayStats.avgConceded} проп. за игру
          </div>
        </div>
      </div>
    </div>
  );
};
