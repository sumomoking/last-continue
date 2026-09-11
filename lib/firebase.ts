import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

const DEFAULT_FIREBASE_CONFIG: FirebaseConfig = {
  apiKey: "AIzaSyABPVa6h-CMWrCtaAXsG587eOO9m4kLszQ",
  authDomain: "last-continue.firebaseapp.com",
  projectId: "last-continue",
  storageBucket: "last-continue.firebasestorage.app",
  messagingSenderId: "568740954804",
  appId: "1:568740954804:web:6091a9a8956924e79bcde1",
  measurementId: "G-MBFCSX57F7"
};

// デフォルトは環境変数、無ければ組み込みデフォルトから取得
export const getEnvFirebaseConfig = (): FirebaseConfig => {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || DEFAULT_FIREBASE_CONFIG.apiKey,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || DEFAULT_FIREBASE_CONFIG.authDomain,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_CONFIG.projectId,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || DEFAULT_FIREBASE_CONFIG.storageBucket,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || DEFAULT_FIREBASE_CONFIG.messagingSenderId,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || DEFAULT_FIREBASE_CONFIG.appId,
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
