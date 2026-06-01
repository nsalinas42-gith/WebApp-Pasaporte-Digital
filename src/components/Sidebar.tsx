/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  LayoutDashboard, 
  Compass, 
  Layers, 
  Trophy, 
  Settings, 
  Rocket, 
  HelpCircle, 
  LogOut, 
  Sparkles,
  Lock
} from 'lucide-react';
import { UserProfile, Location } from '../types';
import { useLanguage } from '../translations';

interface SidebarProps {
  user: UserProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unlockedCount: number;
  totalCount: number;
  onReset: () => void;
  onUnlockNewRegion: () => void;
  onLogout: () => void;
  locations: Location[];
  selectedRouteId: string;
  onSelectRoute: (routeId: string) => void;
  lockedRouteIds?: string[];
}

export default function Sidebar({
  user,
  activeTab,
  setActiveTab,
  unlockedCount,
  totalCount,
  onReset,
  onUnlockNewRegion,
  onLogout,
  locations,
  selectedRouteId,
  onSelectRoute,
  lockedRouteIds = []
}: SidebarProps) {
  const { t, translateLocation } = useLanguage();
  
  // Simple calculation of progress width for level up
  const percentageToNextLevel = Math.min(100, Math.round((user.xp / user.xpToNextLevel) * 100));

  const navItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'exploration', label: t('exploration'), icon: Compass },
    { id: 'stamps', label: t('my_stamps'), icon: Layers },
    { id: 'leaderboard', label: t('leaderboard'), icon: Trophy },
    { id: 'settings', label: t('settings'), icon: Settings },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full flex flex-col py-8 pt-24 bg-surface-container-low border-r border-[#005049]/35 w-64 z-40 hidden md:flex">
      {/* Level Card */}
      <div className="px-6 mb-8 space-y-2 text-left">
        <div className="space-y-1">
          <p className="font-sans text-[10px] font-bold text-secondary/60 uppercase tracking-widest leading-none">
            {t('status')}
          </p>
          <h4 className="font-headline text-sm font-extrabold text-on-surface tracking-tight">
            {t('explorer_level').replace('{level}', String(user.level))}
          </h4>
          <p className="font-sans text-[11px] text-on-surface-variant/80 font-medium pb-1">
            {t('xp_to_level_up').replace('{xp}', String(user.xpToNextLevel - user.xp))}
          </p>
        </div>
        
        {/* Progress Bar Container */}
        <div className="w-full bg-[#001019] h-1.5 rounded-full overflow-hidden border border-[#005049]/20">
          <div 
            className="bg-secondary h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(67,229,212,0.4)]" 
            style={{ width: `${percentageToNextLevel}%` }}
          />
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <div key={item.id} className="space-y-1">
              <button
                id={`nav-link-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all relative ${
                  isActive
                    ? 'text-secondary font-bold bg-[#01262d] border-l-4 border-secondary shadow-[inset_0_0_12px_rgba(67,229,212,0.03)]'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-secondary'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-secondary' : 'text-on-surface-variant'}`} />
                <span className="font-sans text-sm font-medium">{item.label}</span>
                {item.id === 'exploration' && unlockedCount < totalCount && (
                  <span className="absolute right-3 bg-secondary/15 text-secondary text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                    {totalCount - unlockedCount}
                  </span>
                )}
              </button>

              {/* Exploration nested sub-menu for Route pages */}
              {item.id === 'exploration' && (
                <div className="pl-5 pr-1 py-1 space-y-1 border-l border-[#005049]/20 ml-6 animate-in slide-in-from-top-1 duration-150">
                  {locations.map((loc, idx) => {
                    const transLoc = translateLocation(loc);
                    const isSubActive = activeTab === 'exploration' && selectedRouteId === loc.id;
                    const completedPlaces = loc.places?.filter(p => p.isCheckedIn).length || 0;
                    const totalPlaces = loc.places?.length || 0;
                    const isLockedRouteState = lockedRouteIds.includes(loc.id);

                    return (
                      <button
                        key={loc.id}
                        id={`submenu-route-${loc.id}`}
                        disabled={isLockedRouteState}
                        onClick={() => {
                          if (isLockedRouteState) return;
                          setActiveTab('exploration');
                          onSelectRoute(loc.id);
                        }}
                        className={`w-full text-left py-1.5 px-2.5 rounded-lg text-[11px] leading-tight transition-all flex justify-between items-center ${
                          isLockedRouteState
                            ? 'opacity-40 cursor-not-allowed bg-black/10 text-on-surface-variant/50'
                            : isSubActive
                              ? 'text-secondary bg-[#001e2c] border border-secondary/35 shadow-[0_0_8px_rgba(67,229,212,0.1)] font-bold'
                              : 'text-on-surface-variant hover:text-secondary hover:bg-surface-container-high/50'
                        }`}
                      >
                        <span className="truncate pr-1 flex items-center gap-1">
                          {isLockedRouteState && <Lock className="w-3.5 h-3.5 text-secondary inline-block" />}
                          {t('ruta_prefix')} {idx + 1}: {transLoc.name}
                        </span>
                        <span className="text-[9px] font-mono opacity-80 shrink-0">
                          {isLockedRouteState ? '🔒' : `(${completedPlaces}/${totalPlaces})`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Action and Utility Buttons */}
      <div className="px-4 mt-auto pt-6 border-t border-[#005049]/20 space-y-1.5">
        <button 
          id="btn-unlock-region"
          onClick={onUnlockNewRegion}
          className="w-full bg-[#43e5d4] text-[#003732] font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 glow-mint hover:opacity-90 transform active:scale-95 transition-all text-xs uppercase tracking-wide cursor-pointer"
        >
          <Rocket className="w-4 h-4 fill-on-secondary/10" />
          {t('unlock_new_region')}
        </button>
        
        <button
          onClick={() => setActiveTab('settings')}
          className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-on-surface-variant hover:text-secondary transition-all text-left text-sm font-sans"
        >
          <HelpCircle className="w-5 h-5 text-on-surface-variant/80" />
          <span>{t('support')}</span>
        </button>
        
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-on-surface-variant hover:text-error transition-all text-left text-sm font-sans cursor-pointer"
        >
          <LogOut className="w-5 h-5 text-on-surface-variant/80" />
          <span>{t('cerrar_sesion')}</span>
        </button>
      </div>
    </aside>
  );
}
