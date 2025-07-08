
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBUL06uE0YsNgQ9jI1_68PIzQpSuJlJtoE",
  authDomain: "sample-car-b69ff.firebaseapp.com",
  projectId: "sample-car-b69ff",
  storageBucket: "sample-car-b69ff.firebasestorage.app",
  messagingSenderId: "146081052640",
  appId: "1:146081052640:web:2c54046731dd5029c99d85",
  measurementId: "G-9HG0TJD77J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, analytics, db, auth };
