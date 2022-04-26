// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API,
  authDomain: "cse437-productivity-app-cc18b.firebaseapp.com",
  databaseURL: "https://cse437-productivity-app-cc18b-default-rtdb.firebaseio.com",
  projectId: "cse437-productivity-app-cc18b",
  storageBucket: "cse437-productivity-app-cc18b.appspot.com",
  messagingSenderId: "478742194675",
  appId: process.env.REACT_APP_FIREBASE_APPID,
  measurementId: "G-SHXMHNJCXE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore();
export const storage = getStorage();
