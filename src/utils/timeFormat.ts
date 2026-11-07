import { MatchStatus } from '../types/football';

export interface FormattedMatchTime {
  kickoffTime: string;   // например, "16:00" или "20:45"
  liveLabel?: string;     // например, "62'", "HT", "90+'", "Завершен"
  fullDisplay: string;   // например, "16:00 · LIVE 62'", "Сегодня, 20:45", "16:00 · Завершен"
  isToday: boolean;
  statusText: string;    // "LIVE", "Завершен", "Скоро"
  isFinished: boolean;
  isLive: boolean;
}

export function formatMatchTime(
  startTime?: string,
  displayTime?: string,
  statusOrLive?: boolean | MatchStatus,
  liveMinute?: number,
  livePeriod?: string
): FormattedMatchTime {
  let dateObj: Date | null = null;

  if (startTime) {
    const parsed = new Date(startTime);
    if (!isNaN(parsed.getTime())) {
      dateObj = parsed;
    }
  }

  // Если дата не распознана из ISO, пробуем извлечь часы:минуты из displayTime
  let hours = '19';
  let minutes = '00';

  if (dateObj) {
    hours = String(dateObj.getHours()).padStart(2, '0');
    minutes = String(dateObj.getMinutes()).padStart(2, '0');
  } else if (displayTime) {
    const timeMatch = displayTime.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      hours = timeMatch[1].padStart(2, '0');
      minutes = timeMatch[2];
    }
  }

  const kickoffTime = `${hours}:${minutes}`;

  // Определение фактического статуса
  const isExplicitFinished = 
    statusOrLive === 'finished' || 
    displayTime === 'Завершен' || 
    displayTime === 'FT' || 
    livePeriod === 'Матч завершен' || 
    livePeriod === 'Завершен';

  const isLive = !isExplicitFinished && (statusOrLive === true || statusOrLive === 'live');
  const isFinished = isExplicitFinished;

  let liveLabel: string | undefined;
  let statusText = 'Скоро';

  if (isLive) {
    statusText = 'LIVE';
    if (livePeriod === 'Перерыв' || livePeriod === 'HT') {
      liveLabel = 'HT';
    } else if (liveMinute !== undefined && liveMinute > 0) {
      liveLabel = liveMinute >= 90 ? "90+'" : `${liveMinute}'`;
    } else {
      liveLabel = 'LIVE';
    }
  } else if (isFinished) {
    statusText = 'Завершен';
    liveLabel = 'FT';
  }

  let fullDisplay = `Сегодня, ${kickoffTime}`;
  if (isLive) {
    fullDisplay = `${kickoffTime} · LIVE ${liveLabel}`;
  } else if (isFinished) {
    fullDisplay = `${kickoffTime} · Завершен`;
  } else if (displayTime && displayTime.includes('Завтра')) {
    fullDisplay = `Завтра, ${kickoffTime}`;
  }

  return {
    kickoffTime,
    liveLabel,
    fullDisplay,
    isToday: true,
    statusText,
    isFinished,
    isLive
  };
}
