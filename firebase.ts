
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCGzA_DFO_mnMoZTC4Rshzhoeidd_JSkkc",
  authDomain: "travel-expense-tracker-040898.firebaseapp.com",
  projectId: "travel-expense-tracker-040898",
  storageBucket: "travel-expense-tracker-040898.firebasestorage.app",
  messagingSenderId: "561193976326",
  appId: "1:561193976326:web:b6666d9fddc9e25cd6f987",
  measurementId: "G-SNLXRH902H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
