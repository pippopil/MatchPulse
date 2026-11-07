import React from 'react';
import { FilterState } from '../types/football';
import { Search, SlidersHorizontal, RotateCcw, Flame, Clock, Target, Activity } from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  totalMatches: number;
  filteredCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  totalMatches,
  filteredCount
}) => {
  const update = (partial: Partial<FilterState>) => {
    onFilterChange({ ...filters, ...partial });
  };

  const handleReset = () => {
    onFilterChange({
      sourceType: 'all',
      status: 'all',
      timeRange: 'all',
      liveMinuteMin: 0,
      liveMinuteMax: 90,
      minOver25Percent: 0,
      minFirstHalfGoalPercent: 0,
      minLateGoalPercent: 0,
      minBttsPercent: 0,
      searchQuery: '',
      tournament: 'all'
    });
  };

  const isFiltered =
    filters.sourceType !== 'all' ||
    filters.status !== 'all' ||
    filters.timeRange !== 'all' ||
    filters.minOver25Percent > 0 ||
    filters.minFirstHalfGoalPercent > 0 ||
    filters.minLateGoalPercent > 0 ||
    filters.minBttsPercent > 0 ||
    filters.searchQuery !== '' ||
    filters.liveMinuteMin > 0 ||
    filters.liveMinuteMax < 90;

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs space-y-4">
      {/* Source Switcher Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-neutral-500 font-semibold shrink-0 pr-1">Источник данных:</span>
          <button
            onClick={() => update({ sourceType: 'all' })}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 flex items-center gap-1.5 ${
              filters.sourceType === 'all'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <span>🌐 Главный</span>
          </button>

          <button
            onClick={() => update({ sourceType: 'flashscore' })}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 flex items-center gap-1.5 ${
              filters.sourceType === 'flashscore' || filters.sourceType === 'fonbet'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <span>⚡ Источник 1</span>
          </button>

          <button
            onClick={() => update({ sourceType: 'livescore' })}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 flex items-center gap-1.5 ${
              filters.sourceType === 'livescore'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <span>🌍 Источник 3</span>
          </button>

          <button
            onClick={() => update({ sourceType: 'espn' })}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 flex items-center gap-1.5 ${
              filters.sourceType === 'espn'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <span>🏆 Источник 4</span>
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800/80 px-2.5 py-1 rounded-md border border-neutral-200 dark:border-neutral-700 font-mono">
            <span>📊 Выборка: <strong>20–25 матчей</strong> на каждую пару команд</span>
          </div>
        </div>
      </div>

      {/* Top Search & Primary Status Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Status Segmented Control */}
        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800/80 p-1 rounded-lg shrink-0">
          <button
            onClick={() => update({ status: 'all' })}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              filters.status === 'all'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Все матчи ({totalMatches})
          </button>
          <button
            onClick={() => update({ status: 'live' })}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              filters.status === 'live'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
            Только Лайв (Live)
          </button>
          <button
            onClick={() => update({ status: 'upcoming' })}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              filters.status === 'upcoming'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Предстоящие (Прематч)
          </button>
          <button
            onClick={() => update({ status: 'finished' })}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              filters.status === 'finished'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Завершенные (FT)
          </button>
        </div>

        {/* Quick Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => update({ searchQuery: e.target.value })}
            placeholder="Поиск команды или турнира..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
          />
          {filters.searchQuery && (
            <button
              onClick={() => update({ searchQuery: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              ✕
            </button>
          )}
        </div>

        {/* Reset button & Match count */}
        <div className="flex items-center gap-3 shrink-0 justify-end">
          <span className="text-xs text-neutral-500">
            Найдено: <strong className="font-mono text-neutral-900 dark:text-neutral-100">{filteredCount}</strong> из {totalMatches}
          </span>
          {isFiltered && (
            <button
              onClick={handleReset}
              className="px-2.5 py-1 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Сброс
            </button>
          )}
        </div>
      </div>

      {/* Quick Presets Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-neutral-400 text-[11px] font-medium shrink-0 flex items-center gap-1">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Быстрые пресеты:
        </span>
        <button
          onClick={() => update({ minOver25Percent: 70 })}
          className={`px-2.5 py-1 rounded-md transition-colors shrink-0 flex items-center gap-1 ${
            filters.minOver25Percent === 70
              ? 'bg-emerald-600 text-white font-semibold'
              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
          }`}
        >
          <Flame className="w-3 h-3 text-amber-400" />
          Высокий тотал (ТБ 2.5 &gt; 70%)
        </button>
        <button
          onClick={() => update({ minLateGoalPercent: 25 })}
          className={`px-2.5 py-1 rounded-md transition-colors shrink-0 flex items-center gap-1 ${
            filters.minLateGoalPercent === 25
              ? 'bg-emerald-600 text-white font-semibold'
              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
          }`}
        >
          <Clock className="w-3 h-3 text-blue-400" />
          Гол в концовке (76-90' &gt; 25%)
        </button>
        <button
          onClick={() => update({ minFirstHalfGoalPercent: 75 })}
          className={`px-2.5 py-1 rounded-md transition-colors shrink-0 flex items-center gap-1 ${
            filters.minFirstHalfGoalPercent === 75
              ? 'bg-emerald-600 text-white font-semibold'
              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
          }`}
        >
          <Target className="w-3 h-3 text-purple-400" />
          Быстрый гол (1-й тайм &gt; 75%)
        </button>
        <button
          onClick={() => update({ status: 'live', liveMinuteMin: 46, liveMinuteMax: 90 })}
          className={`px-2.5 py-1 rounded-md transition-colors shrink-0 flex items-center gap-1 ${
            filters.status === 'live' && filters.liveMinuteMin === 46
              ? 'bg-rose-600 text-white font-semibold'
              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
          }`}
        >
          <Activity className="w-3 h-3 text-rose-400" />
          Live 2-й тайм (46-90')
        </button>
      </div>

      {/* Advanced Fine-Tuning Filters Grid */}
      <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        {/* Time Range Filter */}
        <div className="space-y-1.5">
          <label className="text-neutral-500 font-medium flex items-center justify-between">
            <span>Время до начала матча</span>
            <span className="font-mono text-neutral-900 dark:text-neutral-100">
              {filters.timeRange === 'all'
                ? 'Все'
                : filters.timeRange === '1h'
                ? '1 час'
                : filters.timeRange === '3h'
                ? '3 часа'
                : filters.timeRange === '6h'
                ? '6 часов'
                : 'Сегодня'}
            </span>
          </label>
          <select
            value={filters.timeRange}
            onChange={(e) => update({ timeRange: e.target.value as any })}
            className="w-full py-1.5 px-2 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
          >
            <option value="all">Все предстоящие</option>
            <option value="1h">Ближайший 1 час</option>
            <option value="3h">Ближайшие 3 часа</option>
            <option value="6h">Ближайшие 6 часов</option>
            <option value="today">Все матчи сегодня</option>
          </select>
        </div>

        {/* Goal %: Total Over 2.5 Slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-neutral-500 font-medium">
            <span>Мин. % ТБ 2.5</span>
            <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
              {filters.minOver25Percent}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={90}
            step={5}
            value={filters.minOver25Percent}
            onChange={(e) => update({ minOver25Percent: Number(e.target.value) })}
            className="w-full accent-emerald-500 cursor-pointer"
          />
        </div>

        {/* Goal %: 1st Half Goal Slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-neutral-500 font-medium">
            <span>Мин. % гола в 1-м тайме</span>
            <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
              {filters.minFirstHalfGoalPercent}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={90}
            step={5}
            value={filters.minFirstHalfGoalPercent}
            onChange={(e) => update({ minFirstHalfGoalPercent: Number(e.target.value) })}
            className="w-full accent-emerald-500 cursor-pointer"
          />
        </div>

        {/* Goal %: Late Goal (76-90') Slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-neutral-500 font-medium">
            <span>Мин. % гола в концовке (76-90')</span>
            <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
              {filters.minLateGoalPercent}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={50}
            step={5}
            value={filters.minLateGoalPercent}
            onChange={(e) => update({ minLateGoalPercent: Number(e.target.value) })}
            className="w-full accent-emerald-500 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
