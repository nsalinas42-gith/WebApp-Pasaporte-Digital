/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Trophy, Medal, Search, Star, Award, Compass } from 'lucide-react';
import { LeaderboardEntry, UserProfile } from '../types';
import { useLanguage } from '../translations';
import { resolveAvatar } from '../utils/avatars';


interface LeaderboardViewProps {
  entries: LeaderboardEntry[];
  user: UserProfile;
  userPoints: number;
  unlockedCount: number;
}

export default function LeaderboardView({
  entries,
  user,
  userPoints,
  unlockedCount
  }: LeaderboardViewProps) {
  const { t, translateUser, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  // Update original entries array with dynamic user points and badge unlocks in real time!
  const updatedEntries = entries.map(entry => {
    let title = entry.title;
    if (language === 'en') {
      if (entry.title === 'Explorador Supremo') title = 'Supreme Explorer';
      if (entry.title === 'Explorador Novato') title = 'Novice Explorer';
      if (entry.title === 'Iniciado del Templo') title = 'Temple Initiate';
      if (entry.title === 'Custodio del Olimpo') title = 'Olympus Warden';
      if (entry.title === 'Embajador del Desierto') title = 'Desert Ambassador';
      if (entry.title === 'Sabio Forestal') title = 'Forest Sage';
      if (entry.title === 'Cazador Marino') title = 'Marine Hunter';
    }

    if (entry.isCurrentUser) {
      const translatedUser = translateUser(user);
      return {
        ...entry,
        name: translatedUser.name,
        title: translatedUser.title,
        avatarUrl: translatedUser.avatarUrl || entry.avatarUrl,
        points: userPoints,
        badgesUnlocked: unlockedCount
      };
    }
    return {
      ...entry,
      title
    };
  }).sort((a, b) => b.points - a.points); // Resort dynamically based on checks!

  // Re-map ranks after sorting to reward real-time climbers!
  const rankedEntries = updatedEntries.map((entry, idx) => ({
    ...entry,
    rank: idx + 1
  }));

  const filteredEntries = rankedEntries.filter(entry => 
    entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Banner */}
      <div className="text-left space-y-2">
        <h2 className="font-headline text-xl md:text-2xl font-bold text-on-surface flex items-center gap-2">
          <Trophy className="w-6 h-6 text-secondary" />
          {t('ranking_global_title')}
        </h2>
        <p className="text-sm text-on-surface-variant max-w-2xl leading-relaxed font-sans">
          {t('ranking_global_desc')}
        </p>
      </div>

      {/* Top 3 Podium Visualizer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-6 max-w-3xl mx-auto">
        
        {/* Podium 2nd Place */}
        {rankedEntries[1] && (
          <div className="bg-surface-container/60 border border-[#00E676]/15 rounded-2xl p-6 text-center order-2 md:order-1 h-fit transform hover:translate-y-[-4px] transition-all relative">
            <div className="absolute top-3 left-1/2 transform -translate-x-1/2 bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30 font-bold text-[10px] uppercase px-2.5 py-0.5 rounded-full">
              {t('puesto_index').replace('{num}', '2')}
            </div>
            <div className="w-16 h-16 rounded-full border-2 border-slate-400 overflow-hidden mx-auto mt-3 flex items-center justify-center">
              {rankedEntries[1].avatarUrl ? (
                <img src={resolveAvatar(rankedEntries[1].avatarUrl)} alt={rankedEntries[1].name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[#00E676] text-base font-black font-mono">
                  {rankedEntries[1].name ? rankedEntries[1].name.charAt(0).toUpperCase() : '2'}
                </span>
              )}
            </div>
            <div className="mt-3">
              <h4 className="font-headline text-sm font-bold text-on-surface truncate">{rankedEntries[1].name}</h4>
              <p className="text-[10px] text-on-surface-variant">{rankedEntries[1].title}</p>
            </div>
            <div className="mt-3 py-1.5 px-3 bg-[#00E676]/10 rounded-lg border border-[#00E676]/20 text-xs font-bold text-[#00E676]">
              {t('pts_suffix').replace('{points}', String(rankedEntries[1].points)).replace('{badges}', String(rankedEntries[1].badgesUnlocked))}
            </div>
          </div>
        )}

        {/* Podium 1st Place - King/Queen */}
        {rankedEntries[0] && (
          <div className="bg-gradient-to-t from-surface-container-high to-[#0d2d3d]/80 border-2 border-[#00E676] rounded-2xl p-8 text-center order-1 md:order-2 glow-cyan transform hover:translate-y-[-8px] transition-all relative md:bottom-2">
            <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 bg-[#00E676] text-[#001314] font-black text-[11px] uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md flex items-center gap-1">
              <Star className="w-3 h-3 fill-[#001314]" /> {t('rey_del_mapapodium')}
            </div>
            <div className="w-20 h-20 rounded-full border-4 border-[#00E676] overflow-hidden mx-auto mt-4 flex items-center justify-center">
              {rankedEntries[0].avatarUrl ? (
                <img src={resolveAvatar(rankedEntries[0].avatarUrl)} alt={rankedEntries[0].name} className="w-full h-full object-cover animate-pulse" style={{ animationDuration: '3s' }} />
              ) : (
                <span className="text-[#00E676] text-2xl font-black font-mono">
                  {rankedEntries[0].name ? rankedEntries[0].name.charAt(0).toUpperCase() : '1'}
                </span>
              )}
            </div>
            <div className="mt-4">
              <h4 className="font-headline text-base font-extrabold text-[#c8e7fb] truncate">{rankedEntries[0].name}</h4>
              <p className="text-xs text-[#00E676] font-semibold">{rankedEntries[0].title}</p>
            </div>
            <div className="mt-4 py-2 px-4 bg-[#00E676]/10 rounded-xl border border-[#00E676]/25 text-sm font-black text-[#00E676] flex items-center justify-center gap-1.5 shadow-sm">
              <Star className="w-4 h-4 fill-[#00E676]" />
              {t('pts_suffix').replace('{points}', String(rankedEntries[0].points)).replace('{badges}', String(rankedEntries[0].badgesUnlocked))}
            </div>
          </div>
        )}

        {/* Podium 3rd Place */}
        {rankedEntries[2] && (
          <div className="bg-surface-container/60 border border-[#005049]/15 rounded-2xl p-6 text-center order-3 md:order-3 h-fit transform hover:translate-y-[-4px] transition-all relative">
            <div className="absolute top-3 left-1/2 transform -translate-x-1/2 bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30 font-bold text-[10px] uppercase px-2.5 py-0.5 rounded-full">
              {t('puesto_index').replace('{num}', '3')}
            </div>
            <div className="w-16 h-16 rounded-full border-2 border-amber-600/50 overflow-hidden mx-auto mt-3 flex items-center justify-center">
              {rankedEntries[2].avatarUrl ? (
                <img src={resolveAvatar(rankedEntries[2].avatarUrl)} alt={rankedEntries[2].name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[#00E676] text-base font-black font-mono">
                  {rankedEntries[2].name ? rankedEntries[2].name.charAt(0).toUpperCase() : '3'}
                </span>
              )}
            </div>
            <div className="mt-3">
              <h4 className="font-headline text-sm font-bold text-on-surface truncate">{rankedEntries[2].name}</h4>
              <p className="text-[10px] text-on-surface-variant truncate">{rankedEntries[2].title}</p>
            </div>
            <div className="mt-3 py-1.5 px-3 bg-[#00E676]/10 rounded-lg border border-[#00E676]/20 text-xs font-bold text-[#00E676]">
              {t('pts_suffix').replace('{points}', String(rankedEntries[2].points)).replace('{badges}', String(rankedEntries[2].badgesUnlocked))}
            </div>
          </div>
        )}

      </div>

      {/* Leaderboard Table List panel */}
      <div className="bg-surface-container rounded-2xl border border-[#005049]/20 p-6 space-y-4 shadow-lg max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="font-headline text-sm font-bold text-on-surface uppercase tracking-wider">
            {t('exploradores_comunidad_title').replace('{num}', String(filteredEntries.length))}
          </h3>

          {/* Search bar inputs */}
          <div className="relative w-full sm:w-64">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder={t('buscar_explorador')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background/60 border border-[#005049]/20 rounded-full py-1.5 pl-9 pr-4 text-xs text-[#c8e7fb] focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/20 placeholder-on-surface-variant/50"
            />
          </div>
        </div>

        {/* Row Entries */}
        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
          {filteredEntries.length > 0 ? (
            filteredEntries.map((player) => {
              const isSelf = player.isCurrentUser;
              return (
                <div
                  key={player.name}
                  className={`px-4 py-3.5 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                    isSelf
                      ? 'bg-[#00E676]/10 border-[#00E676] glow-mint active:scale-[0.99] hover:bg-[#00E676]/15'
                      : 'bg-background/45 border-outline-variant/10 hover:bg-surface-container-high/45 hover:border-outline-variant/25'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Position circle */}
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-headline text-xs font-black ${
                      player.rank === 1 ? 'bg-[#00E676] text-[#001314]' :
                      player.rank === 2 ? 'bg-[#00E676]/80 text-[#001314]' :
                      player.rank === 3 ? 'bg-[#00E676]/60 text-[#001314]' : 'bg-surface-container-high text-[#00E676] border border-[#00E676]/20'
                    }`}>
                      {player.rank}
                    </div>

                    {/* Small avatar */}
                    <div className="w-9 h-9 rounded-full border border-secondary/20 overflow-hidden shrink-0 flex items-center justify-center">
                      {player.avatarUrl ? (
                        <img src={resolveAvatar(player.avatarUrl)} alt={player.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[#00E676] text-[10px] font-black font-mono">
                          {player.name ? player.name.charAt(0).toUpperCase() : '?'}
                        </span>
                      )}
                    </div>

                    <div className="text-left min-w-0">
                      <h4 className={`text-sm font-bold truncate ${isSelf ? 'text-[#00E676]' : 'text-on-surface'}`}>
                        {player.name} {isSelf && <span className="text-[9px] font-black uppercase text-tertiary ml-1.5 bg-tertiary/10 border border-tertiary/20 px-1.5 py-0.5 rounded-full select-none">{t('tu_label')}</span>}
                      </h4>
                      <p className="text-[10px] text-on-surface-variant truncate font-semibold">
                        {player.title}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    {/* Badge counts */}
                    <div className="hidden sm:flex items-center gap-1 bg-surface-container-highest/60 px-2 py-1 rounded border border-[#00E676]/20 text-[10px] font-bold text-on-surface-variant">
                      <Award className="w-3.5 h-3.5 text-[#00E676]" />
                      <span>{t('sellos_label').replace('{num}', String(player.badgesUnlocked))}</span>
                    </div>

                    {/* XP Points */}
                    <span className="font-headline text-sm font-extrabold text-[#c8e7fb] tracking-tight">
                      {t('pts_label').replace('{num}', String(player.points))}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-10 space-y-2">
              <Search className="w-8 h-8 text-on-surface-variant/40 mx-auto" />
              <p className="text-sm text-on-surface-variant">{t('no_se_encontraron_usuarios')}</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
