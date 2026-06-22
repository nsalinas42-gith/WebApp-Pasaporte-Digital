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
  sendPasswordResetEmail,
  updateProfile
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
  where,
  getDocFromCache,
  getDocsFromCache,
  enableIndexedDbPersistence,
  setLogLevel
} from 'firebase/firestore';
import { 
  getStorage, 
  ref as storageRef, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';
import { UserProfile, UserStats, Location } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

import stampAlhambra from '../assets/images/explorador_principiante.png';
import stampCordoba from '../assets/images/explorador_intermedio.png';
import stampSegovia from '../assets/images/explorador_avanzado.png';
import stampSevilla from '../assets/images/cazador_de_rutas.png';
import stampSagrada from '../assets/images/guia_local.png';
import stampOlite from '../assets/images/guia_local_experto.png';

// Initialize Firebase app safely
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Silence verbose connection failure logging from firestore internal SDK on sandboxed environments
try {
  setLogLevel('error');
} catch (e) {
  console.warn("Could not set Firestore log level:", e);
}

export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);

export const auth = getAuth(app);

export let storage: any = null;
try {
  storage = getStorage(app);
} catch (e) {
  console.warn("Firebase Storage is not available or has not been initialized. Inline base64 avatars will be used as a fallback:", e);
}

// Enable offline persistence if allowed in the current browser/iframe sandbox
try {
  enableIndexedDbPersistence(db).catch((err) => {
    console.warn("IndexedDB persistence could not be enabled/is already active (expected in some sandboxed containers):", err.code);
  });
} catch (e) {
  console.warn("IndexedDB persistence could not be initialized:", e);
}

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
    let userExists = false;
    let userDocSnap;
    try {
      userDocSnap = await getDoc(userDocRef);
      userExists = userDocSnap.exists();
    } catch (e) {
      console.warn("Could not check user profile existence online. Trying cache...");
      try {
        userDocSnap = await getDocFromCache(userDocRef);
        userExists = userDocSnap.exists();
      } catch (cacheErr) {
        console.warn("User profile cache miss.", cacheErr);
      }
    }

    if (userExists) {
      // Record user metadata profile (Update - Excluding createdAt to maintain immutability)
      await setDoc(userDocRef, {
        uid: userId,
        name: profile.name,
        email: profile.email,
        avatarUrl: profile.avatarUrl || '',
        title: profile.title || 'Explorador',
        bio: profile.bio || '',
        avatarConfig: profile.avatarConfig || null,
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
        avatarConfig: profile.avatarConfig || null,
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
      avatarConfig: profile.avatarConfig || null,
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
 * Uploads a profile avatar file (or Blob) to Firebase Storage and returns its download URL.
 * If Firebase Storage is not available, falls back to an inline base64 data URL.
 */
export async function uploadAvatarToStorage(userId: string, fileOrBlob: File | Blob): Promise<string> {
  const getBase64 = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(fileOrBlob);
    });
  };

  if (!storage) {
    console.warn("Storage service is not available. Saving avatar as inline base64 string.");
    return await getBase64();
  }

  try {
    const fileExtension = fileOrBlob instanceof File ? fileOrBlob.name.split('.').pop() || 'jpg' : 'jpg';
    const fileRef = storageRef(storage, `users/${userId}/avatar_${Date.now()}.${fileExtension}`);
    const snapshot = await uploadBytes(fileRef, fileOrBlob);
    return await getDownloadURL(snapshot.ref);
  } catch (error: any) {
    console.warn("Firebase Storage upload failed (perhaps unconfigured or blocked by rules). Falling back to inline base64 avatar:", error.message || error);
    return await getBase64();
  }
}

/**
 * Updates the Firebase Auth profile (displayName and photoURL) of the currently authenticated user.
 */
export async function updateUserProfileAuth(displayName: string, photoURL: string): Promise<void> {
  const currentUser = auth.currentUser;
  if (currentUser) {
    await updateProfile(currentUser, {
      displayName: displayName,
      photoURL: photoURL
    });
    console.log("Firebase Auth profile successfully updated.");
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
    let progressDoc;
    try {
      progressDoc = await getDoc(doc(db, 'user_progress', userId));
    } catch (err: any) {
      console.warn("Could not fetch user progress online. Falling back to cache...", err.message || err);
      progressDoc = await getDocFromCache(doc(db, 'user_progress', userId));
    }

    if (!progressDoc.exists()) {
      return null;
    }

    const data = progressDoc.data();
    
    // Attempt retrieving user profile metadata details
    let userDoc;
    try {
      userDoc = await getDoc(doc(db, 'users', userId));
    } catch (err) {
      console.warn("Could not fetch user profile online. Falling back to cache...");
      userDoc = await getDocFromCache(doc(db, 'users', userId));
    }
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
      avatarConfig: userData?.avatarConfig || data.avatarConfig || null,
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
    let usersSnap;
    try {
      usersSnap = await getDocs(collection(db, 'users'));
    } catch (err) {
      console.warn("Could not get users online. Trying cache...");
      usersSnap = await getDocsFromCache(collection(db, 'users'));
    }
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
    network: (cachedNetwork as 'MAINET' | 'DEVNET') || 'MAINET'
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
        network: (data.network as 'MAINET' | 'DEVNET') || 'MAINET',
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
  let userCredential;
  try {
    userCredential = await signInWithEmailAndPassword(auth, email, password);
  } catch (authError) {
    console.error("Firebase Auth sign-in failed:", authError);
    throw authError;
  }

  const userId = userCredential.user.uid;
  try {
    const userDocRef = doc(db, 'users', userId);
    
    // Check if user document exists
    let userSnap;
    try {
      userSnap = await getDoc(userDocRef);
    } catch (readErr) {
      console.warn("Could not read user profile during sign-in:", readErr);
    }

    if (userSnap && userSnap.exists()) {
      await setDoc(userDocRef, {
        lastLogin: serverTimestamp()
      }, { merge: true });
    } else {
      // Document is missing or unreadable - create a fallback profile that satisfies create rules
      await setDoc(userDocRef, {
        uid: userId,
        name: email.split('@')[0],
        email: email,
        avatarUrl: '',
        title: 'Explorador',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      });
    }
  } catch (firestoreError) {
    console.warn(
      "Sign-in Firestore profile sync failed (auth is still successful):", 
      firestoreError
    );
    // Do NOT throw or abort sign-in; the user is authenticated in Auth, and state listeners will sync later.
  }

  return userCredential.user;
}

/**
 * Register a new user using Firebase Auth with email and password.
 * Persist passwordHash (SHA-256 hashed) and secondaryEmail in Firestore.
 */
export async function signUpWithEmail(email: string, password: string, name: string, secondaryEmail: string) {
  let userCredential;
  try {
    userCredential = await createUserWithEmailAndPassword(auth, email, password);
  } catch (authError) {
    console.error("Firebase Auth sign-up failed:", authError);
    throw authError;
  }

  const userId = userCredential.user.uid;
  try {
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
  } catch (firestoreError) {
    console.warn(
      "Sign-up Firestore profile initialization deferred (auth is successful):", 
      firestoreError
    );
    // Do NOT throw on Firestore sync delay; onAuthSuccess and debounced syncs will create the files.
  }

  return userCredential.user;
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

export const DEFAULT_POSTCARDS_CLOUD = [
  { id: 'alhambra', name: 'Postales - Casco Histórico de Caracas', routeKey: 'alhambra', imageKey: 'alhambra' },
  { id: 'mezquita_cordoba', name: 'Postales - Circuito Museos de Caracas', routeKey: 'mezquita_cordoba', imageKey: 'mezquita_cordoba' },
  { id: 'acueducto_segovia', name: 'Postales - Casco Histórico Vol. 3', routeKey: 'acueducto_segovia', imageKey: 'acueducto_segovia' },
  { id: 'alcazar_sevilla', name: 'Postales - Casco Histórico Vol. 4', routeKey: 'alcazar_sevilla', imageKey: 'alcazar_sevilla' },
  { id: 'sagrada_familia', name: 'Postales - Casco Histórico Vol. 5', routeKey: 'sagrada_familia', imageKey: 'sagrada_familia' },
  { id: 'castillo_olite', name: 'Postales - Casco Histórico Vol. 6', routeKey: 'castillo_olite', imageKey: 'castillo_olite' }
];

export const POSTCARD_IMAGE_MAP: Record<string, string> = {
  'alhambra': stampAlhambra,
  'mezquita_cordoba': stampCordoba,
  'acueducto_segovia': stampSegovia,
  'alcazar_sevilla': stampSevilla,
  'sagrada_familia': stampSagrada,
  'castillo_olite': stampOlite,
};

/**
 * Real-time subscription to postcard cards list from Cloud Firestore
 */
export function subscribeCloudPostcards(
  callback: (postcards: any[]) => void,
  onError?: (err: any) => void
) {
  const collectionRef = collection(db, 'postcards');
  return onSnapshot(collectionRef, (snap) => {
    const list: any[] = [];
    snap.forEach((doc) => {
      list.push(doc.data());
    });
    
    // Sort postcards by ID (or custom field if desired)
    list.sort((a, b) => a.id.localeCompare(b.id));
    
    if (list.length > 0) {
      callback(list);
    } else {
      // If collection is empty, trigger callback with defaults so user gets standard postcard cards
      callback(DEFAULT_POSTCARDS_CLOUD);
    }
  }, (err) => {
    console.error("Error subscribing to cloud postcards: ", err);
    callback(DEFAULT_POSTCARDS_CLOUD);
    if (onError) onError(err);
  });
}

/**
 * Saves a new postcard to Cloud Firestore
 */
export async function saveCloudPostcard(postcard: { id: string; name: string; routeKey: string; imageKey: string; imageBase64?: string }) {
  const docRef = doc(db, 'postcards', postcard.id);
  try {
    await setDoc(docRef, {
      id: postcard.id,
      name: postcard.name,
      routeKey: postcard.routeKey,
      imageKey: postcard.imageKey,
      ...(postcard.imageBase64 ? { imageBase64: postcard.imageBase64 } : {}),
      createdAt: serverTimestamp(),
    });
    console.log(`Cloud postcard successfully saved: ${postcard.name}`);
  } catch (error) {
    handleFirestoreError(error, ReturnOperationType.WRITE, `postcards/${postcard.id}`);
  }
}

/**
 * Deletes a postcard from Cloud Firestore
 */
export async function deleteCloudPostcard(postcardId: string) {
  const docRef = doc(db, 'postcards', postcardId);
  try {
    await deleteDoc(docRef);
    console.log(`Cloud postcard deleted: ${postcardId}`);
  } catch (error) {
    handleFirestoreError(error, ReturnOperationType.DELETE, `postcards/${postcardId}`);
  }
}

/**
 * Resets cloud postcards to the 6 default postcards in Firestore
 */
export async function resetCloudPostcardsToDefault() {
  try {
    const collectionRef = collection(db, 'postcards');
    const snap = await getDocs(collectionRef);
    const deletePromises = snap.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    const addPromises = DEFAULT_POSTCARDS_CLOUD.map(async (card) => {
      const docRef = doc(db, 'postcards', card.id);
      await setDoc(docRef, {
        id: card.id,
        name: card.name,
        routeKey: card.routeKey,
        imageKey: card.imageKey,
        createdAt: serverTimestamp(),
      });
    });
    await Promise.all(addPromises);
    console.log("Cloud postcards collection successfully reset to defaults.");
  } catch (error) {
    handleFirestoreError(error, ReturnOperationType.WRITE, 'postcards');
  }
}

/**
 * NEW: Fetches all registered administrators from Firestore 'admins' collection
 */
export async function getCloudAdmins(): Promise<{ email: string; password: string; createdAt?: any }[]> {
  try {
    const Ref = collection(db, 'admins');
    let snap;
    try {
      snap = await getDocs(Ref);
    } catch {
      snap = await getDocsFromCache(Ref);
    }
    
    let list: any[] = [];
    snap.forEach((doc) => {
      list.push(doc.data());
    });

    if (list.length === 0) {
      // Auto-seed the first admin: nsalinas42@gmail.com / 009286
      const defaultAdmin = {
        email: 'nsalinas42@gmail.com',
        password: '009286',
        createdAt: new Date().toISOString()
      };
      await saveCloudAdmin(defaultAdmin.email, defaultAdmin.password);
      list.push(defaultAdmin);
    }
    return list;
  } catch (err) {
    console.warn("Could not get cloud admins:", err);
    // Return default local admin if failed/offline
    return [{ email: 'nsalinas42@gmail.com', password: '009286' }];
  }
}

/**
 * NEW: Saves a new administrator to Firestore 'admins' collection
 */
export async function saveCloudAdmin(email: string, password: string) {
  const docId = email.trim().toLowerCase();
  const docRef = doc(db, 'admins', docId);
  try {
    await setDoc(docRef, {
      email: email.trim().toLowerCase(),
      password: password,
      createdAt: serverTimestamp()
    });
    console.log(`Cloud admin successfully saved: ${email}`);
  } catch (error) {
    handleFirestoreError(error, ReturnOperationType.WRITE, `admins/${docId}`);
  }
}

/**
 * NEW: Deletes an administrator from Firestore 'admins' collection
 */
export async function deleteCloudAdmin(email: string) {
  const docId = email.trim().toLowerCase();
  const docRef = doc(db, 'admins', docId);
  try {
    await deleteDoc(docRef);
    console.log(`Cloud admin deleted: ${email}`);
  } catch (error) {
    handleFirestoreError(error, ReturnOperationType.DELETE, `admins/${docId}`);
  }
}

