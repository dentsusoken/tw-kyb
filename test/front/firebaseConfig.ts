// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
//import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
//import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBXx1B2_Zoz2B_OlTAS4w3e2Ty42ZxHmOo',
  authDomain: 'tw-isid-test.firebaseapp.com',
  projectId: 'tw-isid-test',
  storageBucket: 'tw-isid-test.appspot.com',
  messagingSenderId: '177473457033',
  appId: '1:177473457033:web:9f774b15693888bbf0ef58',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

//const firebaseApp = initializeApp(firebaseConfig);

//export const storage = getStorage(app);
//export const auth = getAuth(app);
export const db = getFirestore(app);
