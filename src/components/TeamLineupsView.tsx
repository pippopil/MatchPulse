import React, { useState, useMemo } from 'react';
import { MatchAnalysis, MatchLineups, TeamLineupInfo, PlayerLineup } from '../types/football';
import { generateLineupsForMatch } from '../services/outcomeAndLineupsService';
import { 
  Users, 
  Shield, 
  UserCheck, 
  Shirt, 
  Award, 
  ArrowRight, 
  Layers, 
  Sparkles,
  Info
} from 'lucide-react';

interface TeamLineupsViewProps {
  match: MatchAnalysis;
}

export const TeamLineupsView: React.FC<TeamLineupsViewProps> = ({ match }) => {
  const [activeTeamTab, setActiveTeamTab] = useState<'both' | 'home' | 'away'>('both');
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerLineup | null>(null);

  const lineups: MatchLineups = useMemo(() => {
    return match.lineups || generateLineupsForMatch(match);
  }, [match]);

  const { home, away } = lineups;

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <span>Стартовые составы и тактические схемы</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold">
                {home.formation} vs {away.formation}
              </span>
            </h4>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Тактическая расстановка на газоне, тренеры и заявка запасных игроков
            </p>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg text-xs">
          <button
            onClick={() => setActiveTeamTab('both')}
            className={`px-3 py-1 rounded-md font-semibold transition-colors ${
              activeTeamTab === 'both'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Оба состава
          </button>
          <button
            onClick={() => setActiveTeamTab('home')}
            className={`px-3 py-1 rounded-md font-semibold transition-colors ${
              activeTeamTab === 'home'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            {match.homeTeam} ({home.formation})
          </button>
          <button
            onClick={() => setActiveTeamTab('away')}
            className={`px-3 py-1 rounded-md font-semibold transition-colors ${
              activeTeamTab === 'away'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            {match.awayTeam} ({away.formation})
          </button>
        </div>
      </div>

      {/* Tactical Formations & Coaches Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Home Coach & Formation Card */}
        <div className="p-3.5 bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-500/20">
              {home.formation}
            </div>
            <div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                Главный тренер: <strong>{home.coach}</strong>
              </div>
              <div className="font-bold text-sm text-neutral-900 dark:text-white">
                {match.homeTeam}
              </div>
            </div>
          </div>
          <span className="text-[11px] font-mono px-2 py-1 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold">
            Схема: {home.formation}
          </span>
        </div>

        {/* Away Coach & Formation Card */}
        <div className="p-3.5 bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/20">
              {away.formation}
            </div>
            <div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                Главный тренер: <strong>{away.coach}</strong>
              </div>
              <div className="font-bold text-sm text-neutral-900 dark:text-white">
                {match.awayTeam}
              </div>
            </div>
          </div>
          <span className="text-[11px] font-mono px-2 py-1 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold">
            Схема: {away.formation}
          </span>
        </div>
      </div>

      {/* Visual Tactical Pitch */}
      <div className="relative rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950 shadow-2xl p-2 sm:p-4 select-none">
        {/* Pitch Direction Header */}
        <div className="flex items-center justify-between text-xs font-mono font-bold text-neutral-400 px-3 pb-2.5">
          <div className="flex items-center gap-1.5 text-blue-400">
            <span>{match.homeTeam} ({home.formation})</span>
          </div>
          <div className="text-[11px] text-neutral-500 font-sans hidden sm:inline">
            Нажмите на игрока для отображения информации
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span>{match.awayTeam} ({away.formation})</span>
          </div>
        </div>

        {/* Pitch Surface */}
        <div className="relative w-full aspect-[16/9] min-h-[340px] sm:min-h-[420px] rounded-xl overflow-hidden border-2 border-emerald-900/80 bg-emerald-950">
          {/* Lawn Stripes */}
          <div className="absolute inset-0 grid grid-cols-12 pointer-events-none opacity-40">
            {Array.from({ length: 12 }).map((_, i) => (
              <div 
                key={i} 
                className={`h-full ${i % 2 === 0 ? 'bg-emerald-900/40' : 'bg-emerald-950/60'}`} 
              />
            ))}
          </div>

          {/* SVG Pitch Markings */}
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none" 
            viewBox="0 0 1000 600" 
            preserveAspectRatio="none"
          >
            {/* Outer touchlines */}
            <rect x="20" y="20" width="960" height="560" fill="none" stroke="#ffffff" strokeWidth="2.5" opacity="0.4" />

            {/* Halfway line */}
            <line x1="500" y1="20" x2="500" y2="580" stroke="#ffffff" strokeWidth="2" opacity="0.4" />

            {/* Center circle & spot */}
            <circle cx="500" cy="300" r="85" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.4" />
            <circle cx="500" cy="300" r="3.5" fill="#ffffff" opacity="0.7" />

            {/* Left Penalty Area */}
            <rect x="20" y="140" width="165" height="320" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.4" />
            <rect x="20" y="220" width="55" height="160" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.4" />
            <circle cx="130" cy="300" r="3.5" fill="#ffffff" opacity="0.7" />
            <path d="M 185 240 A 85 85 0 0 1 185 360" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.4" />

            {/* Right Penalty Area */}
            <rect x="815" y="140" width="165" height="320" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.4" />
            <rect x="925" y="220" width="55" height="160" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.4" />
            <circle cx="870" cy="300" r="3.5" fill="#ffffff" opacity="0.7" />
            <path d="M 815 240 A 85 85 0 0 0 815 360" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.4" />
          </svg>

          {/* HOME TEAM PLAYERS (Left half: X 5% -> 45%) */}
          {(activeTeamTab === 'both' || activeTeamTab === 'home') &&
            home.starters.map((player) => {
              // Если показываем обе команды, масштабируем X на левую половину (X 6% -> 46%)
              // Если показываем только хозяев, распределяем по всему полю
              const posX = activeTeamTab === 'both' 
                ? (player.gridPos ? player.gridPos.x * 0.44 + 4 : 20)
                : (player.gridPos ? player.gridPos.x : 20);
              const posY = player.gridPos ? player.gridPos.y : 50;

              const isSelected = selectedPlayer?.number === player.number && selectedPlayer?.name === player.name;

              return (
                <div
                  key={`home-${player.number}-${player.name}`}
                  onClick={() => setSelectedPlayer(isSelected ? null : player)}
                  className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group flex flex-col items-center"
                  style={{ left: `${posX}%`, top: `${posY}%` }}
                >
                  {/* Jersey circle node */}
                  <div className={`w-8 h-8 rounded-full border-2 border-white/80 bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-lg transition-transform group-hover:scale-125 ${
                    isSelected ? 'ring-4 ring-amber-400 scale-125' : ''
                  }`}>
                    {player.number}
                    {player.isCaptain && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 text-neutral-950 rounded-full text-[8px] font-black flex items-center justify-center shadow-xs">
                        C
                      </span>
                    )}
                  </div>

                  {/* Player Name Tag */}
                  <div className="mt-1 px-1.5 py-0.5 rounded bg-neutral-900/90 border border-neutral-700/80 text-[10px] text-white whitespace-nowrap font-medium shadow-md">
                    {player.name}
                  </div>
                </div>
              );
            })}

          {/* AWAY TEAM PLAYERS (Right half: X 55% -> 95%) */}
          {(activeTeamTab === 'both' || activeTeamTab === 'away') &&
            away.starters.map((player) => {
              // Если показываем обе команды, зеркалим X на правую половину (X 96% -> 54%)
              // Если показываем только гостей, распределяем по всему полю
              const posX = activeTeamTab === 'both' 
                ? (player.gridPos ? 96 - player.gridPos.x * 0.44 : 80)
                : (player.gridPos ? player.gridPos.x : 80);
              const posY = player.gridPos ? player.gridPos.y : 50;

              const isSelected = selectedPlayer?.number === player.number && selectedPlayer?.name === player.name;

              return (
                <div
                  key={`away-${player.number}-${player.name}`}
                  onClick={() => setSelectedPlayer(isSelected ? null : player)}
                  className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group flex flex-col items-center"
                  style={{ left: `${posX}%`, top: `${posY}%` }}
                >
                  {/* Jersey circle node */}
                  <div className={`w-8 h-8 rounded-full border-2 border-white/80 bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-lg transition-transform group-hover:scale-125 ${
                    isSelected ? 'ring-4 ring-amber-400 scale-125' : ''
                  }`}>
                    {player.number}
                    {player.isCaptain && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 text-neutral-950 rounded-full text-[8px] font-black flex items-center justify-center shadow-xs">
                        C
                      </span>
                    )}
                  </div>

                  {/* Player Name Tag */}
                  <div className="mt-1 px-1.5 py-0.5 rounded bg-neutral-900/90 border border-neutral-700/80 text-[10px] text-white whitespace-nowrap font-medium shadow-md">
                    {player.name}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-neutral-400 px-2 gap-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
              <span>{match.homeTeam} ({home.formation})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" />
              <span>{match.awayTeam} ({away.formation})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-amber-400 text-black text-[9px] font-bold flex items-center justify-center">
                C
              </span>
              <span>Капитан команды</span>
            </div>
          </div>

          <div className="text-[11px] text-neutral-500 font-mono">
            Тактическая проекция расстановки 11 игроков
          </div>
        </div>
      </div>

      {/* Selected Player Inspector Card */}
      {selectedPlayer && (
        <div className="p-3.5 bg-neutral-900 border border-neutral-700 rounded-xl text-white shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm border border-amber-500/30">
              #{selectedPlayer.number}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">{selectedPlayer.name}</span>
                {selectedPlayer.isCaptain && (
                  <span className="px-1.5 py-0.5 rounded bg-amber-400 text-neutral-950 font-bold text-[10px]">
                    КАПИТАН
                  </span>
                )}
                <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono text-[10px]">
                  Позиция: {selectedPlayer.position}
                </span>
              </div>
              <div className="text-xs text-neutral-400 mt-0.5">
                Оценка готовности: <strong className="text-emerald-400">{selectedPlayer.rating || 7.2} / 10</strong>
              </div>
            </div>
          </div>

          <button
            onClick={() => setSelectedPlayer(null)}
            className="text-xs text-neutral-400 hover:text-white px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 transition-colors"
          >
            Закрыть
          </button>
        </div>
      )}

      {/* Side-by-Side Detailed Lineups Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Home Lineup List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-800">
            <h5 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
              <span>{match.homeTeam}</span>
              <span className="text-xs font-mono text-neutral-400">({home.formation})</span>
            </h5>
            <span className="text-xs text-neutral-500">Тренер: {home.coach}</span>
          </div>

          {/* Starting XI */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
            <div className="px-3 py-2 bg-neutral-100/70 dark:bg-neutral-800 text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 flex justify-between">
              <span>Стартовый состав (11)</span>
              <span>Позиция / Оценка</span>
            </div>
            <div className="divide-y divide-neutral-200 dark:divide-neutral-800 text-xs">
              {home.starters.map((pl) => (
                <div key={pl.number} className="p-2.5 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-mono font-bold flex items-center justify-center text-xs">
                      {pl.number}
                    </span>
                    <span className="font-medium text-neutral-900 dark:text-white flex items-center gap-1.5">
                      {pl.name}
                      {pl.isCaptain && (
                        <span className="w-3.5 h-3.5 rounded-full bg-amber-400 text-neutral-950 text-[9px] font-black flex items-center justify-center">
                          C
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="text-neutral-500">{pl.position}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{pl.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Substitutes */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
            <div className="px-3 py-2 bg-neutral-100/70 dark:bg-neutral-800 text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
              Запасные игроки ({home.substitutes.length})
            </div>
            <div className="divide-y divide-neutral-200 dark:divide-neutral-800 text-xs">
              {home.substitutes.map((pl) => (
                <div key={pl.number} className="p-2 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-neutral-400 text-xs w-5">{pl.number}</span>
                    <span className="text-neutral-700 dark:text-neutral-300">{pl.name}</span>
                  </div>
                  <span className="text-neutral-400 font-mono text-[11px]">{pl.position}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Away Lineup List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-800">
            <h5 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" />
              <span>{match.awayTeam}</span>
              <span className="text-xs font-mono text-neutral-400">({away.formation})</span>
            </h5>
            <span className="text-xs text-neutral-500">Тренер: {away.coach}</span>
          </div>

          {/* Starting XI */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
            <div className="px-3 py-2 bg-neutral-100/70 dark:bg-neutral-800 text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 flex justify-between">
              <span>Стартовый состав (11)</span>
              <span>Позиция / Оценка</span>
            </div>
            <div className="divide-y divide-neutral-200 dark:divide-neutral-800 text-xs">
              {away.starters.map((pl) => (
                <div key={pl.number} className="p-2.5 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-mono font-bold flex items-center justify-center text-xs">
                      {pl.number}
                    </span>
                    <span className="font-medium text-neutral-900 dark:text-white flex items-center gap-1.5">
                      {pl.name}
                      {pl.isCaptain && (
                        <span className="w-3.5 h-3.5 rounded-full bg-amber-400 text-neutral-950 text-[9px] font-black flex items-center justify-center">
                          C
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="text-neutral-500">{pl.position}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{pl.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Substitutes */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
            <div className="px-3 py-2 bg-neutral-100/70 dark:bg-neutral-800 text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
              Запасные игроки ({away.substitutes.length})
            </div>
            <div className="divide-y divide-neutral-200 dark:divide-neutral-800 text-xs">
              {away.substitutes.map((pl) => (
                <div key={pl.number} className="p-2 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-neutral-400 text-xs w-5">{pl.number}</span>
                    <span className="text-neutral-700 dark:text-neutral-300">{pl.name}</span>
                  </div>
                  <span className="text-neutral-400 font-mono text-[11px]">{pl.position}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
