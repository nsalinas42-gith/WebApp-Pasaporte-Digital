/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  initializeFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  deleteDoc,
  collection,
  serverTimestamp, 
  getDocFromServer,
  onSnapshot,
  query,
  where
} from 'firebase/firestore';
import { UserProfile, UserStats, Location } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase app safely
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Test database connection on boot as required by Firebase SDK Verification guidelines
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase Database connection successfully verified.");
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorCode = error && typeof error === 'object' && 'code' in error ? error.code : '';
    
    // Gracefully logs any standard connectivity delay/offline states
    if (
      errorCode === 'unavailable' || 
      errorMessage.toLowerCase().includes('offline') || 
      errorMessage.toLowerCase().includes('could not reach') ||
      errorMessage.toLowerCase().includes('unavailable')
    ) {
      console.warn(
        "Firebase Firestore connection is temporarily in offline/disconnected mode. " +
        "Progress syncing and cloud saves will automatically resume and sync once the connection re-establishes."
      );
    } else if (errorCode === 'permission-denied') {
      console.log(
        "Firebase connection verified (replaces offline query checks). " +
        "Database is reachable, but direct test connection metadata read access is restricted by secure firestore.rules."
      );
    } else {
      console.warn("Firebase connection status info:", errorMessage);
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
        bio: profile.bio || '',
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
        bio: profile.bio || '',
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
      bio: profile.bio || '',
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
      bio: userData?.bio || data.bio || '',
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

/**
 * Saves and updates the global Solana configurations in Firestore settings/solana
 */
export async function saveSolanaGlobalSettings(walletEnabled: boolean, network: 'MAINET' | 'DEVNET') {
  // Update local storage first to achieve perfect local reactivity and fallback
  localStorage.setItem('solana_global_wallet_enabled', String(walletEnabled));
  localStorage.setItem('solana_global_network', network);
  
  // Dispatch custom event to notify other local subscribers instantly
  window.dispatchEvent(new CustomEvent('solana-global-settings-changed', {
    detail: { walletEnabled, network }
  }));

  try {
    const settingsDocPath = 'settings/solana';
    await setDoc(doc(db, 'settings', 'solana'), {
      walletEnabled,
      network,
      updatedAt: serverTimestamp(),
    });
    console.log("Global Solana settings successfully updated in Firestore.");
  } catch (error) {
    console.warn("Could not save to Cloud Firestore (permissions/offline). Falling back to operational local storage config.", error);
    handleFirestoreError(error, ReturnOperationType.WRITE, 'settings/solana');
  }
}

/**
 * Subscribes to real-time changes of the global Solana settings in Firestore
 */
export function subscribeSolanaGlobalSettings(
  callback: (settings: { walletEnabled: boolean; network: 'MAINET' | 'DEVNET' }) => void,
  onError?: (error: any) => void
) {
  // 1. Core initialization from localStorage/defaults
  const cachedEnabled = localStorage.getItem('solana_global_wallet_enabled');
  const cachedNetwork = localStorage.getItem('solana_global_network');
  const initialSettings = {
    walletEnabled: cachedEnabled === null ? true : cachedEnabled === 'true',
    network: (cachedNetwork as 'MAINET' | 'DEVNET') || 'DEVNET'
  };
  callback(initialSettings);

  // 2. Set up local window event listener for instant reactivity across components
  const handleLocalUpdate = (e: Event) => {
    const customEvent = e as CustomEvent;
    if (customEvent && customEvent.detail) {
      callback(customEvent.detail);
    }
  };
  window.addEventListener('solana-global-settings-changed', handleLocalUpdate);

  // 3. Set up Firestore real-time listener
  const settingsDocRef = doc(db, 'settings', 'solana');
  const unsubscribeFirestore = onSnapshot(settingsDocRef, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      const nextSettings = {
        walletEnabled: data.walletEnabled !== false,
        network: (data.network as 'MAINET' | 'DEVNET') || 'DEVNET',
      };
      
      // Keep local cache in sync with cloud
      localStorage.setItem('solana_global_wallet_enabled', String(nextSettings.walletEnabled));
      localStorage.setItem('solana_global_network', nextSettings.network);
      
      callback(nextSettings);
    }
  }, (err) => {
    console.warn("Settings subscription active offline / read denied: ", err.message);
    if (onError) onError(err);
  });

  // Return a combined hybrid cleanup function
  return () => {
    window.removeEventListener('solana-global-settings-changed', handleLocalUpdate);
    unsubscribeFirestore();
  };
}

/**
 * Lightweight helper to secure and hash passwords using the browser's native subtle Web Crypto APIs without bloating libraries
 */
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Sign in using Firebase Auth with email and password first, and then retrieve user metadata.
 */
export async function signInWithEmail(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userId = userCredential.user.uid;
    
    // Update lastLogin in Firestore
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, {
      lastLogin: serverTimestamp()
    }, { merge: true });

    return userCredential.user;
  } catch (error) {
    console.error("Sign-In with email failed:", error);
    throw error;
  }
}

/**
 * Register a new user using Firebase Auth with email and password.
 * Persist passwordHash (SHA-256 hashed) and secondaryEmail in Firestore.
 */
export async function signUpWithEmail(email: string, password: string, name: string, secondaryEmail: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const userId = userCredential.user.uid;
    const hashHex = await sha256(password);

    // Save initial user profile with optional recovery fields
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, {
      uid: userId,
      name: name,
      email: email,
      avatarUrl: '',
      title: 'Explorador',
      secondaryEmail: secondaryEmail,
      passwordHash: hashHex,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    });

    return userCredential.user;
  } catch (error) {
    console.error("Sign-Up with email failed:", error);
    throw error;
  }
}

/**
 * Option A: Recover Password
 * Verify if the email exists in Firestore (searching by email).
 * Generates a safe temporary token, stores in user doc, and triggers Firebase Auth's password reset.
 */
export async function recoverPassword(email: string): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    // 1. Check if user document exists with this email
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const snap = await getDocs(q);

    if (snap.empty) {
      return { success: false, error: "El correo ingresado no está registrado en el sistema." };
    }

    const userDoc = snap.docs[0];
    const userUid = userDoc.id;

    // 2. Generate a secure random token (using Web Crypto)
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    const token = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Set 1-hour expiration
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 1);
    const expiryStr = expiry.toISOString();

    // 3. Save token & expiration to student's user profile in Firestore
    const userDocRef = doc(db, 'users', userUid);
    const existingData = userDoc.data();
    await setDoc(userDocRef, {
      ...existingData,
      recoveryToken: token,
      recoveryTokenExpires: expiryStr,
      lastLogin: serverTimestamp() // triggers lastLogin criteria for update validation rules
    });

    // 4. Trigger built-in Firebase reset email
    await sendPasswordResetEmail(auth, email);

    return { success: true, token };
  } catch (error: any) {
    console.error("Password recovery failed:", error);
    return { success: false, error: error?.message || String(error) };
  }
}

/**
 * Option B: Recover Email
 * Locates the account where secondaryEmail === secondaryEmail.
 * Returns the primary email of the matched user or error.
 */
export async function recoverEmail(secondaryEmailInput: string): Promise<{ success: boolean; primaryEmail?: string; error?: string }> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('secondaryEmail', '==', secondaryEmailInput));
    const snap = await getDocs(q);

    if (snap.empty) {
      return { success: false, error: "No se encontró ninguna cuenta asociada con ese correo secundario." };
    }

    const userDoc = snap.docs[0];
    const data = userDoc.data();
    return { success: true, primaryEmail: data.email };
  } catch (error: any) {
    console.error("Email recovery failed:", error);
    return { success: false, error: error?.message || String(error) };
  }
}
