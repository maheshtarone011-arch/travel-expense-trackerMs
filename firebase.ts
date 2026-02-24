
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, getDocs, query, limit, where } from "firebase/firestore";

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

// Diagnostic: Test Firestore connectivity and rules
export const testFirestoreConnection = async (uid?: string): Promise<{ ok: boolean; error?: string; code?: string }> => {
  try {
    const toursCollection = collection(db, 'tours');
    // If we have a uid, use it to filter the test query so it satisfies security rules
    const testQuery = uid
      ? query(toursCollection, where('userId', '==', uid), limit(1))
      : query(toursCollection, limit(1));

    await getDocs(testQuery);
    return { ok: true };
  } catch (error: any) {
    const code = error?.code || 'unknown';
    let message = 'Firebase connection failed.';
    if (code === 'permission-denied') {
      message = 'Firestore permission denied — Security rules may have expired or query is not filtered. Please update Firestore rules in Firebase Console.';
    } else if (code === 'unavailable') {
      message = 'Firebase is unreachable — Please check your internet connection.';
    } else if (code === 'not-found') {
      message = 'Firestore database not found — Check Firebase project configuration.';
    } else {
      message = `Firebase error: ${error?.message || code}`;
    }
    return { ok: false, error: message, code };
  }
};

export { auth, db };
