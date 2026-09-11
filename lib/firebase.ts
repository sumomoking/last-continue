import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// デフォルトは環境変数から取得
export const getEnvFirebaseConfig = (): FirebaseConfig => {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  };
};

// ローカルストレージに保存されたカスタム設定の取得（キー手動入力用）
export const getStoredFirebaseConfig = (): FirebaseConfig | null => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('last_continue_firebase_config');
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

export const saveFirebaseConfig = (config: FirebaseConfig) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('last_continue_firebase_config', JSON.stringify(config));
  }
};

export const getEffectiveFirebaseConfig = (): FirebaseConfig => {
  const stored = getStoredFirebaseConfig();
  if (stored && stored.apiKey && stored.projectId) {
    return stored;
  }
  return getEnvFirebaseConfig();
};

export const isFirebaseConfigured = (config?: FirebaseConfig): boolean => {
  const target = config || getEffectiveFirebaseConfig();
  return Boolean(target.apiKey && target.projectId);
};

let cachedApp: FirebaseApp | null = null;
let cachedDb: Firestore | null = null;

export const getFirebaseInstance = (): { app: FirebaseApp | null; db: Firestore | null } => {
  const config = getEffectiveFirebaseConfig();

  if (!isFirebaseConfigured(config)) {
    return { app: null, db: null };
  }

  try {
    if (!getApps().length) {
      cachedApp = initializeApp(config);
    } else {
      cachedApp = getApp();
    }
    cachedDb = getFirestore(cachedApp);
    return { app: cachedApp, db: cachedDb };
  } catch (err) {
    console.error('Firebase initialization error:', err);
    return { app: null, db: null };
  }
};
