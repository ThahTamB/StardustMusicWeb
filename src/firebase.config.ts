// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getDatabase } from 'firebase/database';
import { envConst } from 'Utils/Constanst';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: envConst.firebaseApiKey,
  authDomain: "stardust-music-5dfdd.firebaseapp.com",
  projectId: "stardust-music-5dfdd",
  storageBucket: "stardust-music-5dfdd.appspot.com",
  messagingSenderId: "517524931028",
  appId: "1:517524931028:web:e8ac911fb324e192ca1641",
  measurementId: "G-J2LV6XLD2Y",
  databaseURL: 'https://stardust-music-5dfdd-default-rtdb.asia-southeast1.firebasedatabase.app/',
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const analytics = getAnalytics(app);
