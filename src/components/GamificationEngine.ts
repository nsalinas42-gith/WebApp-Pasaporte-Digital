/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import { Location } from '../types';

import stampAlhambra from '../assets/images/explorador_principiante.png';
import stampCordoba from '../assets/images/explorador_intermedio.png';
import stampSegovia from '../assets/images/explorador_avanzado.png';
import stampSevilla from '../assets/images/cazador_de_rutas.png';
import stampSagrada from '../assets/images/guia_local.png';
import stampOlite from '../assets/images/guia_local_experto.png';

export interface GamifiedBadge {
  id: string; // badge_01 to badge_06
  key: string; // 01-explorador principiante, etc.
  titleKey: string; // Translation dictionary key for the name
  subtitleKey: string; // Translation dictionary key for the rank description
  requiredChips: number; // Required completed chips inside a single route
  imageUrl: string;
}

export interface UnlockedBadgeState {
  badge: GamifiedBadge;
  isUnlocked: boolean;
  multiplier: number; // n in X(n)
  unlockedRouteNames: string[]; // List of routes where this badge was earned
  progressPercent: number; // Highest progress towards unlocking in any pending route
}

// The 6 base achievements/badges consecutive system
export const BASE_GAMIFIED_BADGES: GamifiedBadge[] = [
  {
    id: 'badge_01',
    key: '01-explorador principiante',
    titleKey: 'badge_1_name',
    subtitleKey: 'badge_1_title',
    requiredChips: 2,
    imageUrl: stampAlhambra,
  },
  {
    id: 'badge_02',
    key: '02-explorador intermedio',
    titleKey: 'badge_2_name',
    subtitleKey: 'badge_2_title',
    requiredChips: 3,
    imageUrl: stampCordoba,
  },
  {
    id: 'badge_03',
    key: '03-explorador avanzado',
    titleKey: 'badge_3_name',
    subtitleKey: 'badge_3_title',
    requiredChips: 4,
    imageUrl: stampSegovia,
  },
  {
    id: 'badge_04',
    key: '04-cazador de rutas',
    titleKey: 'badge_4_name',
    subtitleKey: 'badge_4_title',
    requiredChips: 5,
    imageUrl: stampSevilla,
  },
  {
    id: 'badge_05',
    key: '05-guia local',
    titleKey: 'badge_5_name',
    subtitleKey: 'badge_5_title',
    requiredChips: 6,
    imageUrl: stampSagrada,
  },
  {
    id: 'badge_06',
    key: '06-guia local experto',
    titleKey: 'badge_6_name',
    subtitleKey: 'badge_6_title',
    requiredChips: 8,
    imageUrl: stampOlite,
  }
];

export interface DynamicProgressResults {
  totalXP: number;
  level: number;
  xpInLevel: number;
  xpToNextLevel: number;
  percentageToNextLevel: number;
  unlockedBadges: UnlockedBadgeState[];
  totalUniqueUnlocked: number; // Max 6 Unique badges
  overallCompletedPlaces: number; // Sum of all checked in places
  completedRoutesCount: number; // How many routes have all 8 items done
}

/**
 * Calculates user's total XP, checks when to unlock achievements, 
 * and updates X(n) multiplier according to business rules.
 */
export function calculateUserProgress(locations: Location[]): DynamicProgressResults {
  // 1. Each completed place (fiche) rewards exactly 500 XP
  let overallCompletedPlaces = 0;
  let completedRoutesCount = 0;

  const unlockedBadges: UnlockedBadgeState[] = BASE_GAMIFIED_BADGES.map((badge) => {
    let multiplier = 0;
    const unlockedRouteNames: string[] = [];
    let maxProgressPercent = 0;

    locations.forEach((loc) => {
      const checkedInPlaces = loc.places ? loc.places.filter((p) => p.isCheckedIn) : [];
      const completedCount = checkedInPlaces.length;

      // Track high-level completed stats
      if (badge.id === 'badge_01') {
        overallCompletedPlaces += completedCount;
        if (completedCount === 8) {
          completedRoutesCount++;
        }
      }

      // Check badge unlock rule within each route
      if (completedCount >= badge.requiredChips) {
        multiplier++;
        unlockedRouteNames.push(loc.name);
      } else {
        // Find maximum progress percentage towards this badge across locked routes
        const currentPercent = Math.round((completedCount / badge.requiredChips) * 100);
        if (currentPercent > maxProgressPercent) {
          maxProgressPercent = currentPercent;
        }
      }
    });

    return {
      badge,
      isUnlocked: multiplier > 0,
      multiplier,
      unlockedRouteNames,
      progressPercent: multiplier > 0 ? 100 : maxProgressPercent,
    };
  });

  // Calculate special badge XP:
  // Bronze (2 routes) = 2000 XP
  // Silver (4 routes) = 3000 XP
  // Gold (6 routes) = 6000 XP
  let specialXP = 0;
  if (completedRoutesCount >= 2) specialXP += 2000;
  if (completedRoutesCount >= 4) specialXP += 3000;
  if (completedRoutesCount >= 6) specialXP += 6000;

  // Calculate overall XP: each chip verified is 500 XP + special badge bonus XP
  const totalXP = (overallCompletedPlaces * 500) + specialXP;

  // Level Progression: Level is calculated from XP dynamically
  // Each level up takes 2,000 XP
  const XP_PER_LEVEL = 2000;
  const level = Math.floor(totalXP / XP_PER_LEVEL) + 1;
  const xpInLevel = totalXP % XP_PER_LEVEL;
  const xpToNextLevel = XP_PER_LEVEL;
  const percentageToNextLevel = Math.min(100, Math.round((xpInLevel / xpToNextLevel) * 100));

  const totalUniqueUnlocked = unlockedBadges.filter((b) => b.isUnlocked).length;

  return {
    totalXP,
    level,
    xpInLevel,
    xpToNextLevel,
    percentageToNextLevel,
    unlockedBadges,
    totalUniqueUnlocked,
    overallCompletedPlaces,
    completedRoutesCount,
  };
}
