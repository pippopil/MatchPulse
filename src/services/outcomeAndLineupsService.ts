import { MatchAnalysis, OutcomeProbabilities, MatchLineups, TeamLineupInfo, PlayerLineup } from '../types/football';

/**
 * Оценка вероятности исхода матча (П1, X, П2) на основе:
 * 1. Коэффициентов букмекера (маркет-имплицитные вероятности)
 * 2. Очных встреч H2H и баланса побед
 * 3. Формы команд (последние 5 матчей, голы дома/на выезде)
 * 4. Лайв-динамики (текущий счет, сыгранная минута, индекс давления)
 */
export function calculateOutcomeProbabilities(match: MatchAnalysis): OutcomeProbabilities {
  // 1. Базовые веса из котировок (если есть)
  let homeWeight = 40;
  let drawWeight = 28;
  let awayWeight = 32;

  if (match.odds) {
    const invHome = 1 / Math.max(1.05, match.odds.homeWin);
    const invDraw = 1 / Math.max(1.05, match.odds.draw);
    const invAway = 1 / Math.max(1.05, match.odds.awayWin);
    const sumInv = invHome + invDraw + invAway;

    homeWeight = (invHome / sumInv) * 100;
    drawWeight = (invDraw / sumInv) * 100;
    awayWeight = (invAway / sumInv) * 100;
  }

  // 2. Влияние H2H статистики
  if (match.h2h && match.h2h.totalMatches > 0) {
    const h2hHomeShare = (match.h2h.homeWins / match.h2h.totalMatches) * 100;
    const h2hDrawShare = (match.h2h.draws / match.h2h.totalMatches) * 100;
    const h2hAwayShare = (match.h2h.awayWins / match.h2h.totalMatches) * 100;

    // Смешиваем с котировками (вес H2H 30%)
    homeWeight = homeWeight * 0.7 + h2hHomeShare * 0.3;
    drawWeight = drawWeight * 0.7 + h2hDrawShare * 0.3;
    awayWeight = awayWeight * 0.7 + h2hAwayShare * 0.3;
  }

  // 3. Форма и фактор домашнего/выездного поля
  const homeAvgScored = match.homeTeamStats?.homeStats?.avgScored ?? 1.6;
  const homeAvgConceded = match.homeTeamStats?.homeStats?.avgConceded ?? 1.1;
  const awayAvgScored = match.awayTeamStats?.awayStats?.avgScored ?? 1.2;
  const awayAvgConceded = match.awayTeamStats?.awayStats?.avgConceded ?? 1.5;

  const homeStrength = homeAvgScored - homeAvgConceded;
  const awayStrength = awayAvgScored - awayAvgConceded;
  const formDiff = (homeStrength - awayStrength) * 4; // корректировка до ±10%

  homeWeight += formDiff;
  awayWeight -= formDiff;

  // 4. Лайв динамика (если матч уже идет)
  if (match.status === 'live') {
    const hScore = match.homeScore ?? 0;
    const aScore = match.awayScore ?? 0;
    const diff = hScore - aScore;
    const minute = match.liveMinute || 45;
    const progress = Math.min(1, Math.max(0, minute / 90)); // доля прошедшего времени (0..1)

    if (diff > 0) {
      // Хозяева ведут: чем ближе конец матча, тем выше П1
      const leadBonus = diff >= 2 ? 35 + progress * 40 : 20 + progress * 35;
      homeWeight += leadBonus;
      drawWeight = Math.max(8, drawWeight * (1 - progress * 0.65));
      awayWeight = Math.max(5, awayWeight * (1 - progress * 0.8));
    } else if (diff < 0) {
      // Гости ведут: чем ближе конец, тем выше П2
      const absDiff = Math.abs(diff);
      const leadBonus = absDiff >= 2 ? 35 + progress * 40 : 20 + progress * 35;
      awayWeight += leadBonus;
      drawWeight = Math.max(8, drawWeight * (1 - progress * 0.65));
      homeWeight = Math.max(5, homeWeight * (1 - progress * 0.8));
    } else {
      // Ничья в лайве: к концу матча вероятность ничьи возрастает
      const lateDrawBoost = progress > 0.65 ? (progress - 0.65) * 45 : 0;
      drawWeight += lateDrawBoost;
      homeWeight = Math.max(15, homeWeight - lateDrawBoost * 0.5);
      awayWeight = Math.max(15, awayWeight - lateDrawBoost * 0.5);
    }

    // Влияние прессинга, если доступно
    if (match.pressureData) {
      const pressDiff = (match.pressureData.homePressureIndex - match.pressureData.awayPressureIndex) * 0.15;
      homeWeight += pressDiff;
      awayWeight -= pressDiff;
    }
  }

  // Нормализация к 100%
  const total = Math.max(1, homeWeight + drawWeight + awayWeight);
  let p1 = Math.round((homeWeight / total) * 100);
  let px = Math.round((drawWeight / total) * 100);
  let p2 = 100 - p1 - px;

  // Коррекция граничных значений
  if (p2 < 2) {
    p2 = 2;
    if (p1 > px) p1 -= 2; else px -= 2;
  }
  if (px < 3) {
    px = 3;
    if (p1 > p2) p1 -= 3; else p2 -= 3;
  }
  if (p1 < 2) {
    p1 = 2;
    if (p2 > px) p2 -= 2; else px -= 2;
  }

  let dominantOutcome: 'home' | 'draw' | 'away' = 'home';
  if (p2 > p1 && p2 > px) dominantOutcome = 'away';
  else if (px > p1 && px > p2) dominantOutcome = 'draw';

  const maxProb = Math.max(p1, px, p2);
  const confidence: 'high' | 'medium' | 'moderate' = 
    maxProb >= 60 ? 'high' : maxProb >= 45 ? 'medium' : 'moderate';

  let rationale = '';
  if (match.status === 'live') {
    const min = match.liveMinute || 0;
    const hs = match.homeScore ?? 0;
    const as = match.awayScore ?? 0;
    if (hs > as) {
      rationale = `Преимущество ${match.homeTeam} (${hs}:${as}, ${min}'). Высокая вероятность победы хозяев при контроле темпа.`;
    } else if (as > hs) {
      rationale = `Преимущество ${match.awayTeam} (${hs}:${as}, ${min}'). Гости удерживают преимущество в счете.`;
    } else {
      rationale = `Равный счет (${hs}:${as}, ${min}'). Высокая вероятность ничейного исхода по мере приближения финального свистка.`;
    }
  } else {
    if (p1 >= p2 + 15) {
      rationale = `Фаворит — ${match.homeTeam}. Преимущество домашнего поля, лучшая статистика очных встреч H2H и коэффициенты.`;
    } else if (p2 >= p1 + 15) {
      rationale = `Фаворит — ${match.awayTeam}. Гости имеют превосходство по текущей форме и атакующему потенциалу.`;
    } else {
      rationale = `Плотное противостояние. Схожие показатели формы и высокий потенциал ничейного исхода.`;
    }
  }

  return {
    homeWin: p1,
    draw: px,
    awayWin: p2,
    dominantOutcome,
    confidence,
    rationale
  };
}

/**
 * База реальных и тактических прототипов игроков для генерации стартовых составов
 */
const ROSTER_SEEDS: Record<string, { formation: string; coach: string; starters: string[]; subs: string[] }> = {
  'default_home': {
    formation: '4-3-3',
    coach: 'Карло Анчелотти',
    starters: [
      '1. Куртуа (ВР)', 
      '2. Карвахаль (ПЗ)', 
      '3. Милитао (ЦЗ)', 
      '22. Рюдигер (ЦЗ)', 
      '23. Менди (ЛЗ)', 
      '8. Вальверде (ЦП)', 
      '14. Тчуамени (ОП)', 
      '5. Беллингем (АП)', 
      '11. Родриго (ПН)', 
      '9. Мбаппе (ЦН)', 
      '7. Винисиус (ЛН)'
    ],
    subs: ['13. Лунин (ВР)', '17. Васкес (ЗЩ)', '20. Фран Гарсия (ЗЩ)', '10. Модрич (ПЗ)', '6. Камавинга (ПЗ)', '15. Гюлер (ПЗ)', '16. Эндрик (НАП)']
  },
  'default_away': {
    formation: '4-2-3-1',
    coach: 'Хосеп Гвардиола',
    starters: [
      '31. Эдерсон (ВР)', 
      '2. Уокер (ПЗ)', 
      '3. Диаш (ЦЗ)', 
      '25. Аканджи (ЦЗ)', 
      '24. Гвардиол (ЛЗ)', 
      '16. Родри (ОП)', 
      '8. Ковачич (ЦП)', 
      '20. Бернарду Силва (ПП)', 
      '17. Де Брюйне (АП)', 
      '47. Фоден (ЛП)', 
      '9. Холанд (ЦН)'
    ],
    subs: ['18. Ортега (ВР)', '5. Стоунз (ЗЩ)', '6. Аке (ЗЩ)', '27. Нуньеш (ПЗ)', '10. Грилиш (ПЗ)', '11. Доку (НАП)', '82. Льюис (ПЗ)']
  }
};

/**
 * Координаты игроков на тактическом поле (0-100 по X и Y)
 * X: 0 (свои ворота) -> 100 (чужие ворота)
 * Y: 0 (верхний фланг) -> 100 (нижний фланг), 50 (центр)
 */
function getFormationCoordinates(formation: string, isHome: boolean): { x: number; y: number; pos: 'GK' | 'DF' | 'MF' | 'FW' }[] {
  // Для гостей поле инвертируется по X, если нужно зеркальное отображение
  // Но для индивидуального просмотра схемы команды стандартно отображаем: Вратарь слева (X ~ 12), атака справа (X ~ 88)
  switch (formation) {
    case '4-3-3':
      return [
        { x: 10, y: 50, pos: 'GK' },
        { x: 28, y: 15, pos: 'DF' }, // RB
        { x: 26, y: 38, pos: 'DF' }, // CB
        { x: 26, y: 62, pos: 'DF' }, // CB
        { x: 28, y: 85, pos: 'DF' }, // LB
        { x: 50, y: 50, pos: 'MF' }, // DM
        { x: 60, y: 30, pos: 'MF' }, // CM
        { x: 60, y: 70, pos: 'MF' }, // CM
        { x: 82, y: 18, pos: 'FW' }, // RW
        { x: 86, y: 50, pos: 'FW' }, // ST
        { x: 82, y: 82, pos: 'FW' }  // LW
      ];

    case '4-2-3-1':
      return [
        { x: 10, y: 50, pos: 'GK' },
        { x: 28, y: 15, pos: 'DF' },
        { x: 26, y: 38, pos: 'DF' },
        { x: 26, y: 62, pos: 'DF' },
        { x: 28, y: 85, pos: 'DF' },
        { x: 46, y: 36, pos: 'MF' }, // DM
        { x: 46, y: 64, pos: 'MF' }, // DM
        { x: 68, y: 18, pos: 'MF' }, // RM
        { x: 68, y: 50, pos: 'MF' }, // CAM
        { x: 68, y: 82, pos: 'MF' }, // LM
        { x: 88, y: 50, pos: 'FW' }  // ST
      ];

    case '3-5-2':
      return [
        { x: 10, y: 50, pos: 'GK' },
        { x: 26, y: 25, pos: 'DF' }, // CB
        { x: 24, y: 50, pos: 'DF' }, // CB
        { x: 26, y: 75, pos: 'DF' }, // CB
        { x: 50, y: 12, pos: 'MF' }, // RWB
        { x: 48, y: 36, pos: 'MF' }, // CM
        { x: 48, y: 64, pos: 'MF' }, // CM
        { x: 50, y: 88, pos: 'MF' }, // LWB
        { x: 68, y: 50, pos: 'MF' }, // CAM
        { x: 86, y: 36, pos: 'FW' }, // ST
        { x: 86, y: 64, pos: 'FW' }  // ST
      ];

    case '4-4-2':
    default:
      return [
        { x: 10, y: 50, pos: 'GK' },
        { x: 28, y: 16, pos: 'DF' },
        { x: 26, y: 38, pos: 'DF' },
        { x: 26, y: 62, pos: 'DF' },
        { x: 28, y: 84, pos: 'DF' },
        { x: 55, y: 16, pos: 'MF' },
        { x: 52, y: 38, pos: 'MF' },
        { x: 52, y: 62, pos: 'MF' },
        { x: 55, y: 84, pos: 'MF' },
        { x: 84, y: 38, pos: 'FW' },
        { x: 84, y: 62, pos: 'FW' }
      ];
  }
}

/**
 * Генерация стартовых составов и тактических схем команд
 */
export function generateLineupsForMatch(match: MatchAnalysis): MatchLineups {
  const seed = parseInt(match.id.replace(/\D/g, '').slice(-4), 10) || 7421;

  const formationsList = ['4-3-3', '4-2-3-1', '4-4-2', '3-5-2'];
  const homeFormation = formationsList[seed % formationsList.length];
  const awayFormation = formationsList[(seed + 1) % formationsList.length];

  const homeCoords = getFormationCoordinates(homeFormation, true);
  const awayCoords = getFormationCoordinates(awayFormation, false);

  // Имена тренеров
  const homeCoaches = ['Карло Анчелотти', 'Микель Артета', 'Юлиан Нагельсманн', 'Сергей Семак', 'Луис Энрике', 'Диего Симеоне'];
  const awayCoaches = ['Хосеп Гвардиола', 'Ханси Флик', 'Симоне Индзаги', 'Михаил Галактионов', 'Рубен Аморим', 'Эрик тен Хаг'];

  const homeCoach = homeCoaches[seed % homeCoaches.length];
  const awayCoach = awayCoaches[(seed * 3) % awayCoaches.length];

  // Генерация 11 стартовых игроков для хозяев
  const homeStarters: PlayerLineup[] = homeCoords.map((coord, idx) => {
    const num = idx === 0 ? 1 : idx + 1;
    const isCaptain = idx === 1; // капитан обычно один из ключевых защитников/лидеров
    const names = [
      'Вратарь', 'Защитник (П)', 'Защитник (Ц)', 'Защитник (Ц)', 'Защитник (Л)',
      'Полузащитник (О)', 'Полузащитник (Ц)', 'Полузащитник (А)',
      'Нападающий (П)', 'Форвард (Ц)', 'Нападающий (Л)'
    ];

    // Фамилии по позиции
    const customNames = [
      'А. Голубев', 'М. Родригес', 'Д. Миллер', 'И. Шмидт', 'К. Силва',
      'Л. Модрич', 'Т. Кроос', 'Д. Беллингем',
      'К. Мбаппе', 'Э. Холанд', 'В. Жуниор'
    ];

    return {
      number: num,
      name: `${customNames[idx]}`,
      position: coord.pos,
      isCaptain,
      gridPos: { x: coord.x, y: coord.y },
      rating: 6.8 + ((seed + idx) % 15) / 10
    };
  });

  // Запасные хозяев
  const homeSubs: PlayerLineup[] = [
    { number: 12, name: 'С. Ромеро (ВР)', position: 'GK', rating: 6.5 },
    { number: 14, name: 'Э. Гарсия (ЗЩ)', position: 'DF', rating: 6.7 },
    { number: 17, name: 'Ф. Менди (ЗЩ)', position: 'DF', rating: 6.9 },
    { number: 19, name: 'Д. Себальос (ПЗ)', position: 'MF', rating: 6.8 },
    { number: 21, name: 'Б. Диас (ПЗ)', position: 'MF', rating: 7.1 },
    { number: 24, name: 'А. Гюлер (ПЗ)', position: 'MF', rating: 7.3 },
    { number: 27, name: 'Э. Эндрик (НАП)', position: 'FW', rating: 7.0 }
  ];

  // Генерация 11 стартовых игроков для гостей
  const awayStarters: PlayerLineup[] = awayCoords.map((coord, idx) => {
    const num = idx === 0 ? 1 : idx === 1 ? 2 : idx + 2;
    const isCaptain = idx === 2;

    const customNames = [
      'Я. Облак', 'Н. Аке', 'Р. Диаш', 'М. Аканджи', 'Й. Гвардиол',
      'Р. Родри', 'М. Ковачич', 'К. Де Брюйне',
      'Б. Силва', 'Ф. Фоден', 'Х. Альварес'
    ];

    return {
      number: num,
      name: `${customNames[idx]}`,
      position: coord.pos,
      isCaptain,
      gridPos: { x: coord.x, y: coord.y },
      rating: 6.7 + ((seed * 2 + idx) % 16) / 10
    };
  });

  // Запасные гостей
  const awaySubs: PlayerLineup[] = [
    { number: 13, name: 'Ш. Ортега (ВР)', position: 'GK', rating: 6.6 },
    { number: 15, name: 'Д. Стоунз (ЗЩ)', position: 'DF', rating: 7.0 },
    { number: 18, name: 'Р. Льюис (ЗЩ)', position: 'DF', rating: 6.8 },
    { number: 20, name: 'М. Нуньеш (ПЗ)', position: 'MF', rating: 6.7 },
    { number: 22, name: 'Д. Грилиш (ПЗ)', position: 'MF', rating: 7.2 },
    { number: 25, name: 'Ж. Доку (НАП)', position: 'FW', rating: 7.4 },
    { number: 29, name: 'О. Бобб (НАП)', position: 'FW', rating: 6.9 }
  ];

  return {
    home: {
      teamName: match.homeTeam,
      formation: homeFormation,
      coach: homeCoach,
      starters: homeStarters,
      substitutes: homeSubs
    },
    away: {
      teamName: match.awayTeam,
      formation: awayFormation,
      coach: awayCoach,
      starters: awayStarters,
      substitutes: awaySubs
    }
  };
}
