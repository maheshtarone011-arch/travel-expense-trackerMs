
import React, { useState, useEffect, useMemo } from 'react';
import { Tour, Expense } from './types';
import TourSetup from './components/TourSetup';
import ActiveTour from './components/ActiveTour';
import PastTours from './components/PastTours';
import Login from './components/Login';
import { PlaneTakeoff, LogOut, User as UserIcon, AlertTriangle, X, RefreshCw } from 'lucide-react';

import { auth, db, testFirestoreConnection } from './firebase';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const App: React.FC = () => {
  // --- State ---
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [firebaseError, setFirebaseError] = useState('');
  const [activeTour, setActiveTour] = useState<Tour | null>(null);
  const [completedTours, setCompletedTours] = useState<Tour[]>([]);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);

  // --- Auth Effect ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Test Firebase connection first with the current user's UID
        const connectionTest = await testFirestoreConnection(currentUser.uid);
        if (!connectionTest.ok) {
          setFirebaseError(connectionTest.error || 'Firebase connection failed');
        } else {
          setFirebaseError('');
        }
        await fetchTours(currentUser.uid);
      } else {
        setActiveTour(null);
        setCompletedTours([]);
        setFirebaseError('');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- Data Fetching ---
  const getFirebaseErrorMessage = (error: any, context: string): string => {
    const code = error?.code || '';
    if (code === 'permission-denied') {
      return `${context}: Permission denied — Firestore security rules may have expired. Please update rules in Firebase Console.`;
    } else if (code === 'unavailable') {
      return `${context}: Firebase is unreachable — Check your internet connection.`;
    } else if (code === 'unauthenticated') {
      return `${context}: Authentication expired — Please log out and log in again.`;
    }
    return `${context}: ${error?.message || 'Unknown error occurred'}`;
  };

  const fetchTours = async (uid: string) => {
    try {
      const toursCollection = collection(db, 'tours');
      const q = query(toursCollection, where('userId', '==', uid));
      const querySnapshot = await getDocs(q);

      let active: Tour | null = null;
      const completed: Tour[] = [];

      querySnapshot.forEach((doc) => {
        const tourData = { id: doc.id, ...doc.data() } as Tour;
        if (tourData.status === 'active') {
          active = tourData;
        } else {
          completed.push(tourData);
        }
      });

      setActiveTour(active);
      setCompletedTours(completed.sort((a, b) => new Date(b.completionDate!).getTime() - new Date(a.completionDate!).getTime()));
      if (!active) {
        setIsHistoryVisible(true);
      }
    } catch (error: any) {
      console.error("Error fetching tours: ", error);
      setFirebaseError(getFirebaseErrorMessage(error, 'Failed to load tours'));
    }
  };


  // --- Handlers: Auth ---
  const handleLogin = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setAuthError('');
    } catch (error: any) {
      if (['auth/user-not-found', 'auth/wrong-password', 'auth/invalid-credential'].includes(error.code)) {
        setAuthError('Invalid email or password.');
      } else if (error.code === 'auth/unauthorized-domain') {
        setAuthError('This domain is not authorized. Please add this domain to Firebase Auth → Authorized Domains.');
      } else if (error.code === 'auth/network-request-failed') {
        setAuthError('Network error — Check your internet connection.');
      } else if (error.code === 'auth/too-many-requests') {
        setAuthError('Too many failed attempts. Please try again later.');
      } else {
        setAuthError(`Login error: ${error.message || error.code || 'Unknown error'}`);
      }
    }
  };

  const handleSignup = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setAuthError('');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setAuthError('An account with this email already exists.');
      } else if (error.code === 'auth/weak-password') {
        setAuthError('Password is too weak. Please use at least 6 characters.');
      } else if (error.code === 'auth/unauthorized-domain') {
        setAuthError('This domain is not authorized. Please add this domain to Firebase Auth → Authorized Domains.');
      } else if (error.code === 'auth/network-request-failed') {
        setAuthError('Network error — Check your internet connection.');
      } else {
        setAuthError(`Signup error: ${error.message || error.code || 'Failed to create account'}`);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // --- Handlers: Active Tour ---
  const totalExpenses = useMemo(() => {
    return activeTour?.expenses.reduce((sum, expense) => sum + expense.amount, 0) ?? 0;
  }, [activeTour]);

  const handleStartTour = async (tourData: Omit<Tour, 'id' | 'expenses' | 'userId' | 'status'>) => {
    if (!user) return;
    const newTour: Omit<Tour, 'id'> = {
      ...tourData,
      userId: user.uid,
      status: 'active',
      expenses: [],
    };
    try {
      const docRef = await addDoc(collection(db, 'tours'), newTour);
      setActiveTour({ ...newTour, id: docRef.id });
      setIsHistoryVisible(false);
      setFirebaseError('');
    } catch (error: any) {
      console.error("Error starting tour: ", error);
      setFirebaseError(getFirebaseErrorMessage(error, 'Failed to create tour'));
    }
  };

  const updateActiveTourExpenses = async (updatedExpenses: Expense[]) => {
    if (!activeTour) return;
    try {
      const tourRef = doc(db, "tours", activeTour.id);
      await updateDoc(tourRef, { expenses: updatedExpenses });
      setActiveTour({ ...activeTour, expenses: updatedExpenses });
      setFirebaseError('');
    } catch (error: any) {
      console.error("Error updating expenses: ", error);
      setFirebaseError(getFirebaseErrorMessage(error, 'Failed to save expense'));
    }
  };

  const handleAddExpense = (expense: Omit<Expense, 'id'>) => {
    if (activeTour) {
      const newExpense: Expense = { ...expense, id: Date.now().toString() };
      updateActiveTourExpenses([...activeTour.expenses, newExpense]);
    }
  };

  const handleUpdateExpense = (updatedExpense: Expense) => {
    if (activeTour) {
      updateActiveTourExpenses(activeTour.expenses.map(exp => exp.id === updatedExpense.id ? updatedExpense : exp));
    }
  };

  const handleDeleteExpense = (expenseId: string) => {
    if (activeTour) {
      updateActiveTourExpenses(activeTour.expenses.filter(exp => exp.id !== expenseId));
    }
  };

  const handleCompleteTour = async (completionDate: string) => {
    if (activeTour) {
      // FIX: Add `as const` to ensure TypeScript infers 'completed' as a literal type,
      // not a general string, which satisfies the 'active' | 'completed' constraint of the Tour type.
      const completedTourData = {
        status: 'completed' as const,
        completionDate,
        totalExpenses
      };
      try {
        const tourRef = doc(db, "tours", activeTour.id);
        await updateDoc(tourRef, completedTourData);

        const completedTour = { ...activeTour, ...completedTourData };
        setCompletedTours(prev => [completedTour, ...prev]);
        setActiveTour(null);
        setFirebaseError('');
      } catch (error: any) {
        console.error("Error completing tour: ", error);
        setFirebaseError(getFirebaseErrorMessage(error, 'Failed to complete tour'));
      }
    }
  };

  // --- Handlers: Completed Tour ---
  const handleUpdateCompletedTour = async (updatedTour: Tour) => {
    try {
      const newTotal = updatedTour.expenses.reduce((sum, e) => sum + e.amount, 0);
      const finalTour = { ...updatedTour, totalExpenses: newTotal };
      const tourRef = doc(db, "tours", finalTour.id);
      await updateDoc(tourRef, finalTour);
      setCompletedTours(prev => prev.map(t => t.id === finalTour.id ? finalTour : t));
      setFirebaseError('');
    } catch (error: any) {
      console.error("Error updating completed tour: ", error);
      setFirebaseError(getFirebaseErrorMessage(error, 'Failed to update tour'));
    }
  };

  const handleDeleteCompletedTour = async (tourId: string) => {
    try {
      await deleteDoc(doc(db, "tours", tourId));
      setCompletedTours(prev => prev.filter(t => t.id !== tourId));
      setFirebaseError('');
    } catch (error: any) {
      console.error("Error deleting tour: ", error);
      setFirebaseError(getFirebaseErrorMessage(error, 'Failed to delete tour'));
    }
  };


  // --- Render Logic ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4 text-indigo-600">
          <PlaneTakeoff className="h-10 w-10 animate-bounce" />
          <span className="text-lg font-semibold">Loading your trips...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} onSignup={handleSignup} error={authError} clearError={() => setAuthError('')} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <header className="bg-gradient-to-r from-indigo-700 to-indigo-900 shadow-lg text-white p-3 sticky top-0 z-40">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlaneTakeoff className="h-6 w-6" />
            <h1 className="text-lg md:text-xl font-bold tracking-tight hidden md:block">Travel Expense Tracker</h1>
            <h1 className="text-lg font-bold tracking-tight md:hidden">Travel Tracker</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-indigo-200 text-sm">
              <UserIcon size={15} />
              <span className="hidden sm:inline">{user.email}</span>
            </div>
            <button onClick={handleLogout} className="bg-indigo-800 hover:bg-indigo-600 px-3 py-1.5 rounded-lg transition text-sm font-medium flex items-center gap-1.5">
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Firebase Error Banner */}
      {firebaseError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-4 mt-4 rounded-r-lg shadow-md">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="font-semibold text-red-800 text-sm">Firebase Error</p>
              <p className="text-red-700 text-sm mt-1">{firebaseError}</p>
              <button
                onClick={async () => {
                  setFirebaseError('');
                  if (user) {
                    const result = await testFirestoreConnection(user.uid);
                    if (result.ok) {
                      await fetchTours(user.uid);
                    } else {
                      setFirebaseError(result.error || 'Still failing');
                    }
                  }
                }}
                className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-red-700 hover:text-red-900 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-lg transition"
              >
                <RefreshCw size={14} /> Retry Connection
              </button>
            </div>
            <button onClick={() => setFirebaseError('')} className="text-red-400 hover:text-red-600 transition">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        {!activeTour ? (
          <TourSetup onStartTour={handleStartTour} />
        ) : (
          <ActiveTour
            tour={activeTour}
            totalExpenses={totalExpenses}
            onAddExpense={handleAddExpense}
            onUpdateExpense={handleUpdateExpense}
            onDeleteExpense={handleDeleteExpense}
            onCompleteTour={handleCompleteTour}
            isHistoryVisible={isHistoryVisible}
            onToggleHistory={() => setIsHistoryVisible(v => !v)}
            hasHistory={completedTours.length > 0}
          />
        )}

        {((!activeTour && completedTours.length > 0) || (activeTour && isHistoryVisible)) && (
          <PastTours
            tours={completedTours}
            onUpdateTour={handleUpdateCompletedTour}
            onDeleteTour={handleDeleteCompletedTour}
          />
        )}
      </main>
    </div>
  );
};

export default App;
