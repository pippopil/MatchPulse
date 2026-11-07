import { TelegramConfig, MatchAnalysis } from '../types/football';

const TELEGRAM_CONFIG_KEY = 'matchpulse_telegram_config';

export const DEFAULT_TELEGRAM_CONFIG: TelegramConfig = {
  botToken: '',
  chatId: '',
  enabled: false,
  minGoalProbability: 75,
  notifyOnGoals: true,
  notifyOnLatePressure: true,
  notifyOnOver25: true,
};

// Хранилище отправленных алертов во избежание дубликатов
const sentAlerts = new Set<string>();

export function getStoredTelegramConfig(): TelegramConfig {
  try {
    const raw = localStorage.getItem(TELEGRAM_CONFIG_KEY);
    if (!raw) return DEFAULT_TELEGRAM_CONFIG;
    return { ...DEFAULT_TELEGRAM_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_TELEGRAM_CONFIG;
  }
}

export function saveStoredTelegramConfig(config: TelegramConfig): void {
  try {
    localStorage.setItem(TELEGRAM_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save Telegram config to localStorage:', e);
  }
}

/**
 * Отправка сообщения в Telegram через серверный прокси или прямой API запрос
 */
export async function sendTelegramMessage(
  botToken: string,
  chatId: string,
  text: string
): Promise<{ success: boolean; message?: string }> {
  const cleanToken = botToken.trim();
  const cleanChatId = chatId.trim();

  if (!cleanToken || !cleanChatId) {
    return { success: false, message: 'Укажите токен бота и Chat ID' };
  }

  // 1. Попытка отправки через серверный прокси (/api/telegram/send)
  try {
    const res = await fetch('/api/telegram/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: cleanToken, chatId: cleanChatId, text }),
      signal: AbortSignal.timeout(6000)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.ok) return { success: true };
    }
  } catch {
    // Переход к прямому запросу
  }

  // 2. Прямой запрос к Telegram Bot API
  try {
    const telegramUrl = `https://api.telegram.org/bot${cleanToken}/sendMessage`;
    const res = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: cleanChatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      }),
      signal: AbortSignal.timeout(7000)
    });

    const data = await res.json();
    if (data.ok) {
      return { success: true };
    } else {
      return { success: false, message: data.description || 'Ошибка Telegram API' };
    }
  } catch (err: any) {
    return { success: false, message: err?.message || 'Ошибка сети при отправке в Telegram' };
  }
}

/**
 * Отправка тестового уведомления для проверки связки бота
 */
export async function sendTelegramTestAlert(
  botToken: string,
  chatId: string
): Promise<{ success: boolean; message?: string }> {
  const now = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  const message = [
    `⚽ <b>MatchPulse: Проверка связи с ботом</b>`,
    `━━━━━━━━━━━━━━━━━━`,
    `✅ Бот успешно подключен к MatchPulse!`,
    `🕒 Время проверки: <b>${now}</b>`,
    `🔔 Теперь вы будете получать оперативные сигналы:`,
    ` • 🚨 Пиковые отрезки голов (интервал 76-90+')`,
    ` • ⚽ Голы в режиме реального времени`,
    ` • 📈 Высокая вероятность ТБ 2.5`,
    `━━━━━━━━━━━━━━━━━━`,
    `<i>MatchPulse — Аналитический футбольный парсер</i>`
  ].join('\n');

  return await sendTelegramMessage(botToken, chatId, message);
}

/**
 * Проверка условий матча и авто-диспатч сигналов в Telegram
 */
export async function evaluateMatchForTelegramAlert(
  match: MatchAnalysis,
  config: TelegramConfig
): Promise<void> {
  if (!config.enabled || !config.botToken || !config.chatId) return;

  const matchId = match.id;
  const isLive = match.status === 'live';
  const liveMinute = match.liveMinute || 0;

  // 1. Алерт по опасной концовке матча (76-90+')
  if (config.notifyOnLatePressure && isLive && liveMinute >= 76 && liveMinute <= 90) {
    const alertKey = `${matchId}_late_danger`;
    if (!sentAlerts.has(alertKey)) {
      sentAlerts.add(alertKey);

      const text = [
        `🔥 <b>СИГНАЛ: Опасная концовка матча (76-90+')</b>`,
        `🏆 ${match.tournament}`,
        `⚔️ <b>${match.homeTeam}</b> ${match.homeScore ?? 0} : ${match.awayScore ?? 0} <b>${match.awayTeam}</b>`,
        `⏱ Минута: <b>${liveMinute}'</b>`,
        `📈 Риск гола в концовке: <b>${match.intervals15.lateGoalRiskPercent}%</b>`,
        `🎯 Вероятность гола: <b>${match.metrics.predTotalOver25}%</b>`,
        `<i>MatchPulse Live Alerts</i>`
      ].join('\n');

      await sendTelegramMessage(config.botToken, config.chatId, text);
    }
  }

  // 2. Алерт по превышению вероятности гола / ТБ 2.5
  if (config.notifyOnOver25 && match.metrics.predTotalOver25 >= config.minGoalProbability) {
    const alertKey = `${matchId}_over25_prob_${match.metrics.predTotalOver25}`;
    if (!sentAlerts.has(alertKey)) {
      sentAlerts.add(alertKey);

      const text = [
        `🎯 <b>ВЫСОКАЯ ВЕРОЯТНОСТЬ ГОЛА (${match.metrics.predTotalOver25}%)</b>`,
        `🏆 ${match.tournament}`,
        `⚔️ <b>${match.homeTeam}</b> vs <b>${match.awayTeam}</b>`,
        `📊 Статус: ${isLive ? `LIVE (${liveMinute}')` : match.displayTime}`,
        `🔥 Пиковый интервал: <b>${match.metrics.highestScoringInterval}</b>`,
        `⚽ Ср. тотал H2H: <b>${match.h2h.avgTotalGoals.toFixed(2)}</b>`,
        `<i>MatchPulse Analytics</i>`
      ].join('\n');

      await sendTelegramMessage(config.botToken, config.chatId, text);
    }
  }
}

/**
 * Отправка сообщения о забитом голе в лайве
 */
export async function sendLiveGoalTelegramNotification(
  match: MatchAnalysis,
  player: string,
  minute: number,
  config: TelegramConfig
): Promise<void> {
  if (!config.enabled || !config.botToken || !config.chatId || !config.notifyOnGoals) return;

  const alertKey = `${match.id}_goal_${match.homeScore}_${match.awayScore}_${minute}`;
  if (sentAlerts.has(alertKey)) return;
  sentAlerts.add(alertKey);

  const text = [
    `⚽ <b>ГОЛ В ЛАЙВЕ! (${minute}')</b>`,
    `🏆 ${match.tournament}`,
    `⚔️ <b>${match.homeTeam} ${match.homeScore} : ${match.awayScore} ${match.awayTeam}</b>`,
    `👤 Автор: <b>${player}</b>`,
    `⏱ Текущая минута: <b>${minute}'</b>`,
    `<i>MatchPulse Live Tracker</i>`
  ].join('\n');

  await sendTelegramMessage(config.botToken, config.chatId, text);
}
