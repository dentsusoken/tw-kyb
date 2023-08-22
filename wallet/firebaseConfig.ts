// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
//import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBGD1O8tMPIQzZsTSNKSDt5wmbxN4kjA20',
  authDomain: 'tw-wallet.firebaseapp.com',
  projectId: 'tw-wallet',
  storageBucket: 'tw-wallet.appspot.com',
  messagingSenderId: '730375941657',
  appId: '1:730375941657:web:7fcad93079a24b4c814488',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

//const firebaseApp = initializeApp(firebaseConfig);

//export const storage = getStorage(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
