/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithCredential, signInWithPopup, signOut } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  deleteDoc,
  collection,
  serverTimestamp, 
  getDocFromServer 
} from 'firebase/firestore';
import { UserProfile, UserStats, Location } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase app safely
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Test database connection on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('offline')) {
      console.warn("Firebase client is offline. Progress syncing will auto-resume once connection re-establishes.");
    }
  }
}
testConnection().catch(() => {});

// Operation Types & Error Handlers conforming to Firebase skill specs
export enum ReturnOperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: ReturnOperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: ReturnOperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error details: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Sign in user into Firebase Auth securely using the Google Credentials provided by the Google Identity Services button
 */
export async function authenticateWithGoogleCredential(rawToken: string) {
  try {
    const credential = GoogleAuthProvider.credential(rawToken);
    const userCredential = await signInWithCredential(auth, credential);
    return userCredential.user;
  } catch (error) {
    console.error("Firebase Sign-In failed using decrypted Google credential:", error);
    throw error;
  }
}

/**
 * Sign in user into Firebase Auth securely using standard Firebase Google Pop-up (No Client ID required in client code)
 */
export async function signInWithGooglePopup() {
  try {
    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    const userCredential = await signInWithPopup(auth, provider);
    return userCredential.user;
  } catch (error) {
    console.error("Firebase Popup Sign-In failed:", error);
    throw error;
  }
}

/**
 * Complete Sign Out from Firebase Auth
 */
export async function logoutFirebase() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Firebase Sign-Out failed:", error);
  }
}

/**
 * Persists the user profile structure and level/xp progress checkpoints into Firestore
 * STRICT RULE: If the guest user is active (default Felix profile or no logged email),
 * this function will skip backend storage entirely (keeps progress strictly volatile/local).
 */
export async function saveUserProfileAndProgress(
  userId: string,
  profile: UserProfile,
  stats: UserStats,
  locations: Location[]
) {
  // Strict rule: Volatile/Guest check (avoid cloud save for mock guest mail or unauthenticated)
  if (!userId || profile.email === 'felix.voyager@gmail.com' || !profile.email) {
    console.log("Guest Session active. Volatile local execution engaged, skipping backend storage.");
    return;
  }

  const userDocPath = `users/${userId}`;
  const progressDocPath = `user_progress/${userId}`;

  try {
    const userDocRef = doc(db, 'users', userId);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      // Record user metadata profile (Update - Excluding createdAt to maintain immutability)
      await setDoc(userDocRef, {
        uid: userId,
        name: profile.name,
        email: profile.email,
        avatarUrl: profile.avatarUrl || '',
        title: profile.title || 'Explorador',
        lastLogin: serverTimestamp(),
      }, { merge: true });
    } else {
      // Record user metadata profile (Create - Including createdAt serverTimestamp)
      await setDoc(userDocRef, {
        uid: userId,
        name: profile.name,
        email: profile.email,
        avatarUrl: profile.avatarUrl || '',
        title: profile.title || 'Explorador',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, ReturnOperationType.WRITE, userDocPath);
  }

  try {
    // Persist full-featured progress checkpoint details
    await setDoc(doc(db, 'user_progress', userId), {
      uid: userId,
      level: profile.level,
      xp: profile.xp,
      xpToNextLevel: profile.xpToNextLevel,
      linkedWallet: profile.linkedWallet || '',
      title: profile.title || 'Explorador',
      stats: {
        regionsVisited: stats.regionsVisited,
        momentsCaptured: stats.momentsCaptured,
        sharedAchievements: stats.sharedAchievements,
      },
      locations: JSON.stringify(locations),
      updatedAt: serverTimestamp(),
    }, { merge: true });
    
    console.log(`Cloud progress successfully synced to Firestore for verified UID: ${userId}`);
  } catch (error) {
    handleFirestoreError(error, ReturnOperationType.WRITE, progressDocPath);
  }
}

/**
 * Retrieves the stored profile and checklist details from Firestore
 */
export async function getUserProfileAndProgress(userId: string): Promise<{
  profile: UserProfile;
  stats: UserStats;
  locations: Location[];
} | null> {
  if (!userId) return null;

  const progressDocPath = `user_progress/${userId}`;

  try {
    const progressDoc = await getDoc(doc(db, 'user_progress', userId));
    if (!progressDoc.exists()) {
      return null;
    }

    const data = progressDoc.data();
    
    // Attempt retrieving user profile metadata details
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userData = userDoc.exists() ? userDoc.data() : null;

    const profile: UserProfile = {
      name: userData?.name || data.name || '',
      email: userData?.email || data.email || '',
      avatarUrl: userData?.avatarUrl || data.avatarUrl || '',
      title: data.title || userData?.title || 'Explorador',
      level: Number(data.level) || 1,
      xp: Number(data.xp) || 0,
      xpToNextLevel: Number(data.xpToNextLevel) || 2000,
      joinedDate: data.joinedDate || 'Miembro reciente',
      linkedWallet: data.linkedWallet || '',
    };

    const stats: UserStats = {
      regionsVisited: data.stats?.regionsVisited ?? 3,
      momentsCaptured: data.stats?.momentsCaptured ?? 12,
      sharedAchievements: data.stats?.sharedAchievements ?? 8,
    };

    let locations: Location[] = [];
    if (data.locations) {
      try {
        locations = JSON.parse(data.locations);
      } catch (e) {
        console.error("Error decoding locations JSON snapshot from user_progress:", e);
      }
    }

    return { profile, stats, locations };
  } catch (error) {
    handleFirestoreError(error, ReturnOperationType.GET, progressDocPath);
    return null;
  }
}

/**
 * NEW: Fetches all registered users from Firestore for the admin user management list
 */
export async function getAllRegisteredUsers(): Promise<{ uid: string; name: string; email: string; avatarUrl?: string; createdAt?: any; lastLogin?: any }[]> {
  try {
    const usersSnap = await getDocs(collection(db, 'users'));
    const list: any[] = [];
    usersSnap.forEach((doc) => {
      const data = doc.data();
      list.push({
        uid: doc.id,
        name: data.name || 'Sin Nombre',
        email: data.email || 'Sin Email',
        avatarUrl: data.avatarUrl || '',
        createdAt: data.createdAt,
        lastLogin: data.lastLogin
      });
    });
    return list;
  } catch (error) {
    const isPermissionError = error && (
      (error as any).code === 'permission-denied' || 
      (error instanceof Error && error.message.toLowerCase().includes('permission'))
    );
    if (isPermissionError) {
      console.log("Registered users listing skipped: Insufficient permissions (expected for non-admins).");
    } else {
      console.error("Error getting all registered users:", error);
    }
    // Suppress throwing error for guest/offline setups
    return [];
  }
}

/**
 * NEW: Resets progress of a specific user to level 1, 0 XP and default locations state
 */
export async function resetUserProgress(userId: string, defaultLocations: Location[]) {
  try {
    const progressDocPath = `user_progress/${userId}`;
    const clearedLocations = defaultLocations.map(loc => ({
      ...loc,
      isCheckedIn: false,
      places: (loc.places || []).map(p => ({ ...p, isCheckedIn: false }))
    }));

    await setDoc(doc(db, 'user_progress', userId), {
      uid: userId,
      level: 1,
      xp: 0,
      xpToNextLevel: 2000,
      stats: {
        regionsVisited: 0,
        momentsCaptured: 0,
        sharedAchievements: 0,
      },
      locations: JSON.stringify(clearedLocations),
      updatedAt: serverTimestamp(),
    }, { merge: true });

    console.log(`User ${userId} progress successfully hard-reset to Initial State.`);
  } catch (error) {
    handleFirestoreError(error, ReturnOperationType.WRITE, `user_progress/${userId}`);
  }
}

/**
 * NEW: Deletes a user completely from both users and user_progress collections in Firestore
 */
export async function deleteUserEntirely(userId: string) {
  try {
    await deleteDoc(doc(db, 'users', userId));
    await deleteDoc(doc(db, 'user_progress', userId));
    console.log(`User ${userId} completely deleted from Firestore database.`);
  } catch (error) {
    console.error(`Failed to delete user doc:`, error);
    throw error;
  }
}
