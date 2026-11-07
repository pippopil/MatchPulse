export type MatchStatus = 'live' | 'upcoming' | 'finished';
export type DataSourceType = 'all' | 'flashscore' | 'livescore' | 'fonbet' | 'espn';

export interface GoalInterval {
  id: '1-15' | '16-30' | '31-45' | '46-60' | '61-75' | '76-90';
  label: string; // "1-15'", "16-30'", "31-45+'", "46-60'", "61-75'", "76-90+'"
  half: 1 | 2;
  // Home team stats
  homeGoalsScored: number;
  homeGoalsConceded: number;
  homeScoredPercent: number; // e.g. 18.5%
  homeConcededPercent: number;
  // Away team stats
  awayGoalsScored: number;
  awayGoalsConceded: number;
  awayScoredPercent: number;
  awayConcededPercent: number;
  // Combined / H2H
  totalH2HGoals: number;
  isPeakDanger?: boolean;
}

export interface H2HMatch {
  id: string;
  date: string;
  tournament: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  halfTimeScore?: string;
  totalGoals: number;
}

export interface H2HSummary {
  totalMatches: number;
  homeWins: number;
  draws: number;
  awayWins: number;
  homeGoalsScored: number;
  awayGoalsScored: number;
  avgTotalGoals: number;
  bttsPercent: number; // Обе забьют %
  over25Percent: number; // Тотал больше 2.5 %
  matches: H2HMatch[];
}

export interface TeamRecentMatch {
  id: string;
  date: string;
  tournament: string;
  opponent: string;
  isHome: boolean;
  score: string;
  goalsScored: number;
  goalsConceded: number;
  result: 'W' | 'D' | 'L';
  totalGoals: number;
}

export interface TeamFormStats {
  teamName: string;
  form: ('W' | 'D' | 'L')[];
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsScoredTotal: number;
  goalsConcededTotal: number;
  avgGoalsScored: number;
  avgGoalsConceded: number;
  cleanSheets: number;
  failedToScore: number;
  homeStats: {
    matches: number;
    scored: number;
    conceded: number;
    avgScored: number;
    avgConceded: number;
  };
  awayStats: {
    matches: number;
    scored: number;
    conceded: number;
    avgScored: number;
    avgConceded: number;
  };
  matches: TeamRecentMatch[];
}

export interface MatchLiveEvent {
  id: string;
  minute: number;
  type: 'goal' | 'yellow_card' | 'red_card' | 'penalty';
  team: 'home' | 'away';
  player: string;
  description?: string;
}

export interface MatchAnalysis {
  id: string;
  source: 'LiveScore' | 'Fonbet & Flashscore' | 'ESPN World' | string;
  sourceType?: DataSourceType;
  tournament: string;
  country: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string; // ISO string
  displayTime: string; // "19:30" or "Сегодня, 21:45"
  status: MatchStatus;
  liveMinute?: number;
  livePeriod?: string; // "1-й тайм", "Перерыв", "2-й тайм", "90+3'"
  homeScore?: number;
  awayScore?: number;
  halfTimeScore?: string;
  
  // 15-minute interval distribution
  intervals15: {
    intervals: GoalInterval[];
    firstHalfHomePercent: number;
    firstHalfAwayPercent: number;
    secondHalfHomePercent: number;
    secondHalfAwayPercent: number;
    lateGoalRiskPercent: number; // 76-90+
  };

  // Pre-match stats
  h2h: H2HSummary;
  homeTeamStats: TeamFormStats;
  awayTeamStats: TeamFormStats;

  // Key metrics and indicators
  metrics: {
    predTotalOver25: number; // %
    predTotalOver15: number; // %
    predBTTS: number; // % Обе забьют
    firstHalfGoalProb: number; // %
    secondHalfGoalProb: number; // %
    highestScoringInterval: string;
    dangerLevel: 'high' | 'medium' | 'low';
    forecastNote: string;
  };

  liveEvents?: MatchLiveEvent[];
  pressureData?: PitchMomentumStats;
  lineups?: MatchLineups;
  outcomeProbabilities?: OutcomeProbabilities;
  odds?: {
    homeWin: number;
    draw: number;
    awayWin: number;
    totalOver25: number;
    totalUnder25: number;
  };
}

export interface OutcomeProbabilities {
  homeWin: number; // П1 % (0-100)
  draw: number;    // X % (0-100)
  awayWin: number; // П2 % (0-100)
  dominantOutcome: 'home' | 'draw' | 'away';
  confidence: 'high' | 'medium' | 'moderate';
  rationale: string;
}

export interface PlayerLineup {
  number: number;
  name: string;
  position: 'GK' | 'DF' | 'MF' | 'FW';
  isCaptain?: boolean;
  gridPos?: { x: number; y: number }; // 0-100 coordinates on tactical pitch
  rating?: number;
}

export interface TeamLineupInfo {
  teamName: string;
  formation: string; // e.g., '4-3-3', '4-2-3-1', '3-5-2', '4-4-2'
  coach: string;
  starters: PlayerLineup[];
  substitutes: PlayerLineup[];
}

export interface MatchLineups {
  home: TeamLineupInfo;
  away: TeamLineupInfo;
}

export type StreakType = 'win' | 'unbeaten' | 'draw' | 'loss' | 'winless' | 'scoring' | 'conceding' | 'clean_sheet' | 'over25';

export interface TeamStreakBadge {
  id: string;
  type: StreakType;
  count: number;
  label: string; // e.g., "3 победы подряд"
  description: string;
  variant: 'positive' | 'warning' | 'negative' | 'neutral';
}

export interface PressureZonePoint {
  id: string;
  name: string;
  x: number; // 0-100 (left to right, home attacking towards 100, away towards 0)
  y: number; // 0-100 (top to bottom of pitch)
  intensity: number; // 0-100
  team: 'home' | 'away' | 'both';
  actionType: 'dangerous_attack' | 'box_entry' | 'shot' | 'possession' | 'high_press';
  description: string;
}

export interface PitchMomentumStats {
  homePossession: number; // %
  awayPossession: number; // %
  homeDangerousAttacks: number;
  awayDangerousAttacks: number;
  homeBoxEntries: number;
  awayBoxEntries: number;
  homePressureIndex: number; // 0-100
  awayPressureIndex: number; // 0-100
  dominantTeam: 'home' | 'away' | 'balanced';
  activeHotspot: string;
  points: PressureZonePoint[];
}

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  enabled: boolean;
  minGoalProbability: number; // e.g. 70
  notifyOnGoals: boolean;
  notifyOnLatePressure: boolean; // 76-90+ min
  notifyOnOver25: boolean;
}

export interface FilterState {
  sourceType: DataSourceType;
  status: 'all' | 'live' | 'upcoming' | 'finished';
  timeRange: 'all' | '1h' | '3h' | '6h' | 'today';
  liveMinuteMin: number;
  liveMinuteMax: number;
  minOver25Percent: number; // 0 to 100
  minFirstHalfGoalPercent: number; // 0 to 100
  minLateGoalPercent: number; // 0 to 100
  minBttsPercent: number; // 0 to 100
  searchQuery: string;
  tournament: string;
}
