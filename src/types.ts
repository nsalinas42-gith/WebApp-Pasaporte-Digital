/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SubLocation {
  id: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  points: number;
  isCheckedIn: boolean;
  description: string;
}

export interface Location {
  id: string;
  name: string;
  city: string;
  category: string;
  latitude: number;
  longitude: number;
  points: number;
  badgeId: string;
  badgeName: string;
  badgeTitle: string;
  badgeIcon: string;
  badgeImageUrl?: string;
  imageUrl: string;
  review: string[]; // Two paragraphs as requested
  isCheckedIn: boolean;
  places: SubLocation[];
}

export interface UserStats {
  regionsVisited: number;
  momentsCaptured: number;
  sharedAchievements: number;
}

export interface UserProfile {
  name: string;
  title: string;
  email: string;
  avatarUrl: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  joinedDate: string;
  linkedWallet: string;
  bio?: string;
  avatarConfig?: any;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  title: string;
  avatarUrl: string;
  points: number;
  badgesUnlocked: number;
  isCurrentUser?: boolean;
}
