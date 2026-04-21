import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? 'AIzaSyDkW9TJRBTaOlAUMNSJ1op2W7ItqLYuwSE',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? 'nataka-hii.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'nataka-hii',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? 'nataka-hii.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '263182854593',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '1:263182854593:web:4750f816061dd9e9172740',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? 'G-RV45ZH2ZMC',
};

export const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
export const googleAuthProvider = new GoogleAuthProvider();

googleAuthProvider.setCustomParameters({
  prompt: 'select_account',
});

export async function initializeFirebaseAnalytics() {
  if (typeof window === 'undefined' || !firebaseConfig.measurementId) {
    return null;
  }

  const analyticsSupported = await isSupported();

  if (!analyticsSupported) {
    return null;
  }

  return getAnalytics(firebaseApp);
}
