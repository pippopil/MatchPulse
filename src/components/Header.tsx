import React from 'react';
import { 
  Play, 
  Pause, 
  RotateCw, 
  Download, 
  Moon, 
  Sun, 
  ShieldCheck, 
  Activity, 
  Radio,
  Send
} from 'lucide-react';

import { DataSourceType } from '../types/football';

interface HeaderProps {
  isMonitoring: boolean;
  onToggleMonitoring: () => void;
  onManualRefresh: () => void;
  isLoading: boolean;
  refreshInterval: number; // in seconds
  onIntervalChange: (sec: number) => void;
  countdown: number;
  onExportCSV: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  liveMatchesCount: number;
  totalMatchesCount: number;
  currentSource: DataSourceType;
  onSourceChange: (source: DataSourceType) => void;
  onOpenTelegramSettings: () => void;
  isTelegramEnabled: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  isMonitoring,
  onToggleMonitoring,
  onManualRefresh,
  isLoading,
  refreshInterval,
  onIntervalChange,
  countdown,
  onExportCSV,
  isDark,
  onToggleTheme,
  liveMatchesCount,
  totalMatchesCount,
  currentSource,
  onSourceChange,
  onOpenTelegramSettings,
  isTelegramEnabled
}) => {
  return (
    <header className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-30 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand Wordmark & Data Sources */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight text-neutral-900 dark:text-white">
                  MatchPulse
                </span>
                <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                  Без ВПН
                </span>
              </div>
              <div className="text-[11px] text-neutral-500 flex items-center gap-1.5">
                <span>Парсер данных</span>
                <span>·</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">100% Онлайн в РФ</span>
              </div>
            </div>
          </div>

          {/* Central: SOURCE SELECTOR & START BUTTON */}
          <div className="flex items-center gap-2.5">
            {/* Source Selector Dropdown */}
            <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800/80 p-1 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs">
              <span className="text-neutral-400 hidden lg:inline pl-1.5">Источник:</span>
              <select
                value={currentSource}
                onChange={(e) => onSourceChange(e.target.value as DataSourceType)}
                className="bg-transparent font-medium text-neutral-900 dark:text-white focus:outline-hidden cursor-pointer py-1 px-1.5 rounded"
                title="Переключение между источниками парсинга данных (все работают без ВПН на территории РФ)"
              >
                <option value="all" className="dark:bg-neutral-900 text-neutral-900 dark:text-white">
                  🌐 Все источники (300+ матчей / 130+ Live)
                </option>
                <option value="flashscore" className="dark:bg-neutral-900 text-neutral-900 dark:text-white">
                  ⚡ Flashscore Live (130+ в эфире / все лиги)
                </option>
                <option value="fonbet" className="dark:bg-neutral-900 text-neutral-900 dark:text-white">
                  🔴 Fonbet & Линия (Коэффициенты / H2H)
                </option>
                <option value="livescore" className="dark:bg-neutral-900 text-neutral-900 dark:text-white">
                  🌍 LiveScore Global (100+ матчей)
                </option>
                <option value="espn" className="dark:bg-neutral-900 text-neutral-900 dark:text-white">
                  🏆 ESPN World Scoreboard
                </option>
              </select>
            </div>

            {/* The Main One-Click Start Button */}
            <button
              onClick={onToggleMonitoring}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg shadow-xs flex items-center gap-2 transition-all whitespace-nowrap ${
                isMonitoring
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-900/20'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-900/20 ring-2 ring-emerald-500/30'
              }`}
              title={isMonitoring ? 'Остановить авто-сбор данных' : 'Запустить парсер и мониторинг матчей'}
            >
              {isMonitoring ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span className="hidden sm:inline">Остановить</span>
                  <span className="w-2 h-2 rounded-full bg-white animate-ping ml-1" />
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Старт</span>
                </>
              )}
            </button>

            {/* Telegram Bot Alerts Configuration Button */}
            <button
              onClick={onOpenTelegramSettings}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 relative ${
                isTelegramEnabled
                  ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/50 shadow-xs'
                  : 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
              title="Настройка Telegram-бота для автоматических push-уведомлений о голах и давлении"
            >
              <Send className="w-3.5 h-3.5 text-sky-500" />
              <span className="hidden sm:inline">Telegram</span>
              {isTelegramEnabled && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                </span>
              )}
            </button>

            {/* Manual Refresh */}
            <button
              onClick={onManualRefresh}
              disabled={isLoading}
              className="p-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors border border-neutral-200 dark:border-neutral-700 disabled:opacity-50"
              title="Обновить данные сейчас"
            >
              <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-500' : ''}`} />
            </button>

            {/* Interval dropdown & Countdown */}
            <div className="hidden sm:flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800/80 px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-600 dark:text-neutral-300">
              <span className="text-neutral-400">Авто:</span>
              <select
                value={refreshInterval}
                onChange={(e) => onIntervalChange(Number(e.target.value))}
                className="bg-transparent font-mono font-medium focus:outline-hidden cursor-pointer"
              >
                <option value={15} className="dark:bg-neutral-900">15с</option>
                <option value={30} className="dark:bg-neutral-900">30с</option>
                <option value={60} className="dark:bg-neutral-900">60с</option>
              </select>

              {isMonitoring && (
                <span className="font-mono tabular-nums text-[11px] text-emerald-600 dark:text-emerald-400 ml-1">
                  ({countdown}с)
                </span>
              )}
            </div>
          </div>

          {/* Right Action Tools: Export, Theme & Live Badge */}
          <div className="flex items-center gap-2">
            {/* Live Matches Count Badge */}
            <div className="hidden md:flex items-center gap-2 text-xs font-mono px-2.5 py-1.5 bg-neutral-100 dark:bg-neutral-800/70 rounded-lg border border-neutral-200 dark:border-neutral-700">
              <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                Live: {liveMatchesCount}
              </span>
              <span className="text-neutral-400">/</span>
              <span className="text-neutral-600 dark:text-neutral-400">
                Всего: {totalMatchesCount}
              </span>
            </div>

            {/* Export CSV Button */}
            <button
              onClick={onExportCSV}
              className="px-2.5 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors border border-neutral-200 dark:border-neutral-700 flex items-center gap-1.5"
              title="Экспорт аналитической выборки в CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">CSV</span>
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors border border-neutral-200 dark:border-neutral-700"
              title={isDark ? 'Переключить на светлую тему' : 'Переключить на темную тему'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
