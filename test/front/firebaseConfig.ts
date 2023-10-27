// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
// import { getFirestore } from 'firebase/firestore';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { getFunctions } from 'firebase/functions';
//import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_STRAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

//const firebaseApp = initializeApp(firebaseConfig);

//export const storage = getStorage(app);

const sitekey = process.env.NEXT_APP_CHECK_SITE_KEY;

const appCheck =
  typeof sitekey !== 'undefined' && typeof window !== 'undefined'
    ? initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(sitekey),
        isTokenAutoRefreshEnabled: true,
      })
    : undefined;

export const auth = !!appCheck ? getAuth(appCheck.app) : getAuth(app);

export const functions = !!appCheck
  ? getFunctions(appCheck.app)
  : getFunctions(app);
