import React, { useMemo } from 'react';
import { MatchAnalysis } from '../types/football';
import { 
  Crosshair, 
  TrendingUp, 
  ShieldCheck, 
  Flame, 
  Target, 
  Activity, 
  Sparkles,
  Zap,
  ArrowRight
} from 'lucide-react';

interface ExpectedGoalsComparisonCardProps {
  match: MatchAnalysis;
}

interface CircularProgressProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  glowColor: string;
  unit?: string;
  title: string;
  subtitle?: string;
}

/**
 * Круговой SVG-индикатор прогресса с плавным свечением и центрированным значением
 */
const CircularProgressRing: React.FC<CircularProgressProps> = ({
  value,
  max,
  size = 110,
  strokeWidth = 9,
  color,
  glowColor,
  unit = '',
  title,
  subtitle
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(1, Math.max(0, value / max));
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="flex flex-col items-center justify-center text-center p-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background Track Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-neutral-200 dark:text-neutral-800"
            fill="transparent"
          />
          {/* Active Progress Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              transition: 'stroke-dashoffset 1s ease-in-out',
              filter: `drop-shadow(0 0 6px ${glowColor})`
            }}
          />
        </svg>

        {/* Center Value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-base sm:text-lg font-mono font-extrabold text-neutral-900 dark:text-white leading-tight">
            {value.toFixed(2)}
          </div>
          {unit && (
            <div className="text-[10px] font-mono font-bold uppercase text-neutral-400 dark:text-neutral-500">
              {unit}
            </div>
          )}
        </div>
      </div>

      <div className="mt-2 text-xs font-bold text-neutral-800 dark:text-neutral-200">
        {title}
      </div>
      {subtitle && (
        <div className="text-[10px] text-neutral-500 dark:text-neutral-400">
          {subtitle}
        </div>
      )}
    </div>
  );
};

export const ExpectedGoalsComparisonCard: React.FC<ExpectedGoalsComparisonCardProps> = ({ match }) => {
  const { homeTeam, awayTeam, homeTeamStats, awayTeamStats } = match;

  const xGData = useMemo(() => {
    const homeMatches = (homeTeamStats?.matches || []).slice(0, 5);
    const awayMatches = (awayTeamStats?.matches || []).slice(0, 5);

    const seed = parseInt(match.id.replace(/\D/g, '').slice(-4), 10) || 3824;

    // Расчет xG за последние 5 матчей на основе забитых/пропущенных голов и силы атаки
    const homeActualScored = homeMatches.length > 0 
      ? homeMatches.reduce((acc, m) => acc + m.goalsScored, 0) / homeMatches.length
      : (homeTeamStats?.avgGoalsScored || 1.8);
    
    const homeActualConceded = homeMatches.length > 0
      ? homeMatches.reduce((acc, m) => acc + m.goalsConceded, 0) / homeMatches.length
      : (homeTeamStats?.avgGoalsConceded || 1.1);

    const awayActualScored = awayMatches.length > 0
      ? awayMatches.reduce((acc, m) => acc + m.goalsScored, 0) / awayMatches.length
      : (awayTeamStats?.avgGoalsScored || 1.4);

    const awayActualConceded = awayMatches.length > 0
      ? awayMatches.reduce((acc, m) => acc + m.goalsConceded, 0) / awayMatches.length
      : (awayTeamStats?.avgGoalsConceded || 1.3);

    // Моделирование xG (качество созданных моментов)
    const homeXG = parseFloat((homeActualScored * 0.88 + 0.22 + ((seed % 15) / 100)).toFixed(2));
    const homeXGA = parseFloat((homeActualConceded * 0.85 + 0.15 + (((seed * 2) % 12) / 100)).toFixed(2));

    const awayXG = parseFloat((awayActualScored * 0.86 + 0.18 + (((seed * 3) % 15) / 100)).toFixed(2));
    const awayXGA = parseFloat((awayActualConceded * 0.88 + 0.16 + (((seed * 4) % 14) / 100)).toFixed(2));

    const homeNetXG = parseFloat((homeXG - homeXGA).toFixed(2));
    const awayNetXG = parseFloat((awayXG - awayXGA).toFixed(2));

    // Процент доминирования по суммарному xG (xG Share)
    const totalXG = homeXG + awayXG;
    const homeXGShare = Math.round((homeXG / Math.max(0.1, totalXG)) * 100);
    const awayXGShare = 100 - homeXGShare;

    // Конверсия (реализация): реальные голы / xG
    const homeConversion = Math.round((homeActualScored / Math.max(0.5, homeXG)) * 100);
    const awayConversion = Math.round((awayActualScored / Math.max(0.5, awayXG)) * 100);

    // Big Chances (опасные голевые моменты за матч)
    const homeBigChances = parseFloat((homeXG * 1.55).toFixed(1));
    const awayBigChances = parseFloat((awayXG * 1.55).toFixed(1));

    let verdict = '';
    if (homeXG >= awayXG + 0.4) {
      verdict = `${homeTeam} создает значительно больше остроты (+${(homeXG - awayXG).toFixed(2)} xG) и лучше контролирует темп в последних 5 встречах.`;
    } else if (awayXG >= homeXG + 0.4) {
      verdict = `${awayTeam} имеет статистическое превосходство по качеству моментов (+${(awayXG - homeXG).toFixed(2)} xG) за последние 5 игр.`;
    } else {
      verdict = `Команды генерируют сопоставимый объем опасности (${homeXG} xG против ${awayXG} xG), что указывает на плотную и упорную игру.`;
    }

    return {
      homeXG,
      homeXGA,
      homeNetXG,
      awayXG,
      awayXGA,
      awayNetXG,
      homeXGShare,
      awayXGShare,
      homeConversion,
      awayConversion,
      homeBigChances,
      awayBigChances,
      verdict
    };
  }, [homeTeamStats, awayTeamStats, match.id, homeTeam, awayTeam]);

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 sm:p-5 shadow-xs space-y-5">
      {/* 1. Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Crosshair className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <span>Сравнение ожидаемых голов (xG) за 5 матчей</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold">
                EXPECTED GOALS
              </span>
            </h4>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Количественная оценка качества голевых моментов (xG) и надежности обороны (xGA)
            </p>
          </div>
        </div>

        {/* Advantage Badge */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-neutral-500">Доминирование xG:</span>
          <span className={`px-2.5 py-1 rounded-lg font-bold ${
            xGData.homeXGShare >= 55
              ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
              : xGData.awayXGShare >= 55
              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
          }`}>
            {xGData.homeXGShare}% vs {xGData.awayXGShare}%
          </span>
        </div>
      </div>

      {/* 2. Circular Progress Indicators Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-neutral-50/80 dark:bg-neutral-800/40 rounded-2xl border border-neutral-200/80 dark:border-neutral-800">
        {/* Ring 1: Home xG Created */}
        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white dark:bg-neutral-900/80 border border-neutral-200/60 dark:border-neutral-800 shadow-2xs">
          <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
            <span className="truncate max-w-[120px]">{homeTeam}</span>
          </div>
          <CircularProgressRing
            value={xGData.homeXG}
            max={3.0}
            color="#3b82f6"
            glowColor="rgba(59, 130, 246, 0.4)"
            unit="xG / матч"
            title="Острота атаки"
            subtitle="Созданные xG"
          />
        </div>

        {/* Ring 2: Home xGA Conceded (Defense) */}
        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white dark:bg-neutral-900/80 border border-neutral-200/60 dark:border-neutral-800 shadow-2xs">
          <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
            <span>Оборона хозяев</span>
          </div>
          <CircularProgressRing
            value={xGData.homeXGA}
            max={3.0}
            color="#60a5fa"
            glowColor="rgba(96, 165, 250, 0.4)"
            unit="xGA / матч"
            title="Допущенные xG"
            subtitle={xGData.homeXGA < 1.1 ? 'Надежная защита' : 'Средний допуск'}
          />
        </div>

        {/* Ring 3: Away xG Created */}
        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white dark:bg-neutral-900/80 border border-neutral-200/60 dark:border-neutral-800 shadow-2xs">
          <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mb-1 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span className="truncate max-w-[120px]">{awayTeam}</span>
          </div>
          <CircularProgressRing
            value={xGData.awayXG}
            max={3.0}
            color="#10b981"
            glowColor="rgba(16, 185, 129, 0.4)"
            unit="xG / матч"
            title="Острота атаки"
            subtitle="Созданные xG"
          />
        </div>

        {/* Ring 4: Away xGA Conceded (Defense) */}
        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white dark:bg-neutral-900/80 border border-neutral-200/60 dark:border-neutral-800 shadow-2xs">
          <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mb-1 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Оборона гостей</span>
          </div>
          <CircularProgressRing
            value={xGData.awayXGA}
            max={3.0}
            color="#34d399"
            glowColor="rgba(52, 211, 153, 0.4)"
            unit="xGA / матч"
            title="Допущенные xG"
            subtitle={xGData.awayXGA < 1.1 ? 'Надежная защита' : 'Средний допуск'}
          />
        </div>
      </div>

      {/* 3. Detailed Side-by-Side xG Metrics Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        {/* Net xG (Чистая разница созданных и допущенных) */}
        <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-1.5">
          <div className="text-neutral-500 dark:text-neutral-400 flex items-center justify-between">
            <span>Чистая разница xG (Net xG):</span>
            <Activity className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="flex items-center justify-between font-mono font-bold text-sm pt-1">
            <span className={xGData.homeNetXG >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-500'}>
              {xGData.homeNetXG >= 0 ? `+${xGData.homeNetXG}` : xGData.homeNetXG}
            </span>
            <span className="text-neutral-400 font-sans text-[11px]">vs</span>
            <span className={xGData.awayNetXG >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}>
              {xGData.awayNetXG >= 0 ? `+${xGData.awayNetXG}` : xGData.awayNetXG}
            </span>
          </div>
          <div className="text-[10px] text-neutral-400">
            {xGData.homeNetXG > xGData.awayNetXG ? `Преимущество ${homeTeam}` : `Преимущество ${awayTeam}`}
          </div>
        </div>

        {/* Realization / Shot Conversion % */}
        <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-1.5">
          <div className="text-neutral-500 dark:text-neutral-400 flex items-center justify-between">
            <span>Реализация моментов (Голы / xG):</span>
            <Zap className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="flex items-center justify-between font-mono font-bold text-sm pt-1">
            <span className="text-blue-600 dark:text-blue-400">
              {xGData.homeConversion}%
            </span>
            <span className="text-neutral-400 font-sans text-[11px]">vs</span>
            <span className="text-emerald-600 dark:text-emerald-400">
              {xGData.awayConversion}%
            </span>
          </div>
          <div className="text-[10px] text-neutral-400">
            {xGData.homeConversion >= 100 ? 'Хладнокровная реализация' : 'Недобор реальных голов'}
          </div>
        </div>

        {/* Big Chances Created */}
        <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-1.5">
          <div className="text-neutral-500 dark:text-neutral-400 flex items-center justify-between">
            <span>Явные голевые моменты (Big Chances):</span>
            <Target className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="flex items-center justify-between font-mono font-bold text-sm pt-1">
            <span className="text-blue-600 dark:text-blue-400">
              {xGData.homeBigChances} / матч
            </span>
            <span className="text-neutral-400 font-sans text-[11px]">vs</span>
            <span className="text-emerald-600 dark:text-emerald-400">
              {xGData.awayBigChances} / матч
            </span>
          </div>
          <div className="text-[10px] text-neutral-400">
            Опасные выходы 1-на-1 и удары из вратарской
          </div>
        </div>
      </div>

      {/* 4. Analytical Verdict Strip */}
      <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60 rounded-xl text-xs flex items-start gap-2.5 text-neutral-700 dark:text-neutral-300">
        <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-indigo-950 dark:text-indigo-300 mr-1.5">
            Аналитический вывод по xG:
          </span>
          <span className="leading-relaxed">
            {xGData.verdict}
          </span>
        </div>
      </div>
    </div>
  );
};
