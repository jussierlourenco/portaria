import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { AuthContext } from './AuthContext';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [status, setStatus] = useState(null); // 'pending', 'active', 'blocked'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let userRef = doc(db, 'users', firebaseUser.uid);
        let userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          setRole(data.role);
          setStatus(data.status || 'active'); // Fallback para usuários antigos
        } else {
          // Check if this is the very first user in the system
          const usersSnap = await getDoc(doc(db, 'system', 'metadata'));
          const isFirstUser = !usersSnap.exists();

          const initialRole = isFirstUser ? 'admin' : 'porteiro';
          const initialStatus = isFirstUser ? 'active' : 'pending';

          await setDoc(userRef, {
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || '',
            role: initialRole,
            status: initialStatus,
            createdAt: new Date()
          });

          if (isFirstUser) {
            await setDoc(doc(db, 'system', 'metadata'), { firstUserCreated: true });
          }

          setRole(initialRole);
          setStatus(initialStatus);
        }
        setUser(firebaseUser);
      } else {
        setUser(null);
        setRole(null);
        setStatus(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    role,
    status,
    loading
  };


  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
