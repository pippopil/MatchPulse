import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MatchAnalysis, FilterState, TelegramConfig } from './types/football';
import { 
  getInitialMatchData, 
  advanceLiveMatches, 
  exportMatchesToCSV,
  fetchMatchesFromParser 
} from './services/footballParser';
import { 
  getStoredTelegramConfig, 
  saveStoredTelegramConfig, 
  evaluateMatchForTelegramAlert, 
  sendLiveGoalTelegramNotification 
} from './services/telegramService';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { MatchList } from './components/MatchList';
import { MatchDetail } from './components/MatchDetail';
import { TelegramSettingsModal } from './components/TelegramSettingsModal';
import { 
  Activity, 
  Flame, 
  Clock, 
  Bell, 
  ShieldCheck, 
  CheckCircle2, 
  BarChart2, 
  Info,
  ChevronDown
} from 'lucide-react';

export default function App() {
  const [matches, setMatches] = useState<MatchAnalysis[]>(() => getInitialMatchData());
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(() => matches[0]?.id || null);
  const [isMonitoring, setIsMonitoring] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [refreshInterval, setRefreshInterval] = useState<number>(15);
  const [countdown, setCountdown] = useState<number>(15);
  const [isDark, setIsDark] = useState<boolean>(true);
  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig>(() => getStoredTelegramConfig());
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState<boolean>(false);
  const [recentNotification, setRecentNotification] = useState<{
    id: string;
    title: string;
    message: string;
  } | null>(null);

  const [filters, setFilters] = useState<FilterState>({
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

  // Dark mode effect
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Запуск парсера при монтировании и при переключении источника
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    fetchMatchesFromParser(filters.sourceType)
      .then((parsed) => {
        if (isMounted && parsed && parsed.length > 0) {
          setMatches(parsed);
          setSelectedMatchId((prev) => {
            const exists = parsed.some((m) => m.id === prev);
            return exists ? prev : parsed[0].id;
          });
        }
      })
      .catch((err) => console.error('Parser fetch error:', err))
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [filters.sourceType]);

  // Selected match instance
  const selectedMatch = useMemo(() => {
    return matches.find((m) => m.id === selectedMatchId) || matches[0] || null;
  }, [matches, selectedMatchId]);

  // Filtering matches
  const filteredMatches = useMemo(() => {
    return matches.filter((match) => {
      // 0. Source filter
      if (filters.sourceType !== 'all' && match.sourceType && match.sourceType !== filters.sourceType) {
        return false;
      }

      // 1. Status filter
      if (filters.status !== 'all' && match.status !== filters.status) {
        return false;
      }

      // 2. Search query (team or tournament)
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const homeMatch = match.homeTeam.toLowerCase().includes(query);
        const awayMatch = match.awayTeam.toLowerCase().includes(query);
        const tourMatch = match.tournament.toLowerCase().includes(query);
        if (!homeMatch && !awayMatch && !tourMatch) return false;
      }

      // 3. Time range filter for upcoming matches
      if (filters.timeRange !== 'all' && match.status === 'upcoming') {
        const startTime = new Date(match.startTime).getTime();
        const now = Date.now();
        const diffHours = (startTime - now) / (1000 * 60 * 60);

        if (filters.timeRange === '1h' && diffHours > 1) return false;
        if (filters.timeRange === '3h' && diffHours > 3) return false;
        if (filters.timeRange === '6h' && diffHours > 6) return false;
      }

      // 4. Live minute range
      if (match.status === 'live' && match.liveMinute !== undefined) {
        if (match.liveMinute < filters.liveMinuteMin || match.liveMinute > filters.liveMinuteMax) {
          return false;
        }
      }

      // 5. Goal percentage filters
      if (filters.minOver25Percent > 0 && match.metrics.predTotalOver25 < filters.minOver25Percent) {
        return false;
      }
      if (filters.minFirstHalfGoalPercent > 0 && match.metrics.firstHalfGoalProb < filters.minFirstHalfGoalPercent) {
        return false;
      }
      if (filters.minLateGoalPercent > 0 && (match.intervals15.lateGoalRiskPercent < filters.minLateGoalPercent)) {
        return false;
      }
      if (filters.minBttsPercent > 0 && match.metrics.predBTTS < filters.minBttsPercent) {
        return false;
      }

      return true;
    });
  }, [matches, filters]);

  // Automated Telegram alert dispatcher when matches update or reach critical late phase
  useEffect(() => {
    if (!telegramConfig.enabled || !telegramConfig.botToken || !telegramConfig.chatId) return;

    for (const match of matches) {
      evaluateMatchForTelegramAlert(match, telegramConfig).catch((err) => {
        console.error('Failed to dispatch Telegram alert:', err);
      });
    }
  }, [matches, telegramConfig]);

  // Real-time loop (countdown & sync with parser)
  useEffect(() => {
    if (!isMonitoring) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Периодический запрос актуальных данных по активному источнику
          fetchMatchesFromParser(filters.sourceType)
            .then((refreshed) => {
              if (refreshed && refreshed.length > 0) {
                setMatches(refreshed);
              }
            })
            .catch(() => {
              // Локальное продвижение минут лайва
              setMatches((currentMatches) => {
                const { updatedMatches, newGoalEvent } = advanceLiveMatches(currentMatches);
                if (newGoalEvent) {
                  // Отправка в Telegram при включенном боте
                  if (telegramConfig.enabled && telegramConfig.notifyOnGoals) {
                    sendLiveGoalTelegramNotification(
                      newGoalEvent.match,
                      newGoalEvent.event.player,
                      newGoalEvent.event.minute,
                      telegramConfig
                    ).catch(console.error);
                  }

                  setRecentNotification({
                    id: String(Date.now()),
                    title: `⚽ ГОЛ В ЛАЙВЕ: ${newGoalEvent.match.homeTeam} vs ${newGoalEvent.match.awayTeam}`,
                    message: `${newGoalEvent.event.player} забивает на ${newGoalEvent.event.minute}'! Счет: ${newGoalEvent.match.homeScore}:${newGoalEvent.match.awayScore}`
                  });
                  setTimeout(() => setRecentNotification(null), 6000);
                }
                return updatedMatches;
              });
            });
          return refreshInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isMonitoring, refreshInterval, filters.sourceType, telegramConfig]);

  // Manual refresh handler
  const handleManualRefresh = async () => {
    setIsLoading(true);
    try {
      const refreshed = await fetchMatchesFromParser(filters.sourceType);
      setMatches(refreshed);
      setCountdown(refreshInterval);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle monitoring
  const handleToggleMonitoring = () => {
    setIsMonitoring((prev) => !prev);
    if (!isMonitoring) {
      setCountdown(refreshInterval);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const csvContent = exportMatchesToCSV(filteredMatches);
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `MatchPulse_Analytics_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const liveCount = matches.filter((m) => m.status === 'live').length;

  const sourceNameDisplay = 
    filters.sourceType === 'all'
      ? 'Все источники (Объединенная база 200+ матчей)'
      : filters.sourceType === 'livescore'
      ? 'LiveScore Global (100+ матчей онлайн)'
      : filters.sourceType === 'fonbet'
      ? 'Fonbet & Flashscore (Линии и очные встречи)'
      : 'ESPN World (Еврокубки и топ-лиги)';

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-[#0B0F17] text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* Top Navigation & Live Controls */}
      <Header
        isMonitoring={isMonitoring}
        onToggleMonitoring={handleToggleMonitoring}
        onManualRefresh={handleManualRefresh}
        isLoading={isLoading}
        refreshInterval={refreshInterval}
        onIntervalChange={(sec) => {
          setRefreshInterval(sec);
          setCountdown(sec);
        }}
        countdown={countdown}
        onExportCSV={handleExportCSV}
        isDark={isDark}
        onToggleTheme={() => setIsDark((prev) => !prev)}
        liveMatchesCount={liveCount}
        totalMatchesCount={matches.length}
        currentSource={filters.sourceType}
        onSourceChange={(source) => setFilters((prev) => ({ ...prev, sourceType: source }))}
        onOpenTelegramSettings={() => setIsTelegramModalOpen(true)}
        isTelegramEnabled={telegramConfig.enabled}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Info Banner on Active Monitoring */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400'}`} />
            <div>
              <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <span>{isMonitoring ? 'Автоматический парсер запущен' : 'Мониторинг на паузе'}</span>
                <span className="text-neutral-400">·</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{sourceNameDisplay}</span>
              </div>
              <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                Работает без ВПН на территории РФ · Авто-обновление каждые {refreshInterval}с · Очные встречи H2H и интервалы по 15 мин
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono tabular-nums text-neutral-600 dark:text-neutral-300">
            <div>
              Лайв матчей: <strong className="text-rose-600 dark:text-rose-400">{liveCount}</strong>
            </div>
            <div>·</div>
            <div>
              Предстоящих: <strong className="text-emerald-600 dark:text-emerald-400">{matches.length - liveCount}</strong>
            </div>
            <div>·</div>
            <div>
              След. опрос: <strong className="text-neutral-900 dark:text-white">{isMonitoring ? `${countdown}с` : 'Пауза'}</strong>
            </div>
          </div>
        </div>

        {/* Filters and Selection Bar */}
        <FilterBar
          filters={filters}
          onFilterChange={setFilters}
          totalMatches={matches.length}
          filteredCount={filteredMatches.length}
        />

        {/* Selected Match Detailed Analytics Card */}
        {selectedMatch && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-emerald-500" />
                Детальный предматчевый и лайв анализ
              </h2>
              <span className="text-xs text-neutral-500 font-mono">
                Выбран матч: {selectedMatch.homeTeam} — {selectedMatch.awayTeam}
              </span>
            </div>

            <MatchDetail match={selectedMatch} />
          </div>
        )}

        {/* Match List Table */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              Все матчи по фильтру ({filteredMatches.length})
            </h3>
            <span className="text-xs text-neutral-500">
              Показаны игры в реальном времени и ближайшие встречи
            </span>
          </div>

          <MatchList
            matches={filteredMatches}
            selectedMatchId={selectedMatchId}
            onSelectMatch={(m) => {
              setSelectedMatchId(m.id);
              window.scrollTo({ top: 180, behavior: 'smooth' });
            }}
            onResetFilters={() => {
              setFilters({
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
            }}
          />
        </div>
      </main>

      {/* Floating Goal Event Toast Notification */}
      {recentNotification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-neutral-900 text-white p-4 rounded-xl shadow-2xl border border-emerald-500/50 flex items-start gap-3 animate-bounce">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold text-emerald-400">
              {recentNotification.title}
            </div>
            <div className="mt-1 text-xs text-neutral-200">
              {recentNotification.message}
            </div>
          </div>
          <button
            onClick={() => setRecentNotification(null)}
            className="text-neutral-400 hover:text-white text-xs p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Telegram Configuration Modal */}
      <TelegramSettingsModal
        isOpen={isTelegramModalOpen}
        onClose={() => setIsTelegramModalOpen(false)}
        config={telegramConfig}
        onSave={(newCfg) => {
          setTelegramConfig(newCfg);
          saveStoredTelegramConfig(newCfg);
        }}
      />

      {/* Footer */}
      <footer className="mt-16 border-t border-neutral-200 dark:border-neutral-800 py-6 text-center text-xs text-neutral-500">
        <p>MatchPulse Analytics · Парсер данных Fonbet & Flashscore · Расчет 15-минутных интервалов голов и H2H очных встреч</p>
      </footer>
    </div>
  );
}
