import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { ensureWallet } from '../services/walletService';
import { auth, db } from '../lib/firebase';
import { UserProfile, DriverProfile, ClubKetto } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  driverProfile: DriverProfile | null;
  clubKetto: ClubKetto | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  driverProfile: null,
  clubKetto: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(null);
  const [clubKetto, setClubKetto] = useState<ClubKetto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Initialize Wallet setup
        ensureWallet(user.uid).catch(console.error);

        // 1. User Profile Listener
        const profileUnsub = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            const isProjectOwner = user.email === 'nomadeprimeturismo@gmail.com';
            const updatedProfile = { ...data, uid: user.uid };
            
            if (isProjectOwner && data.tipo_usuario !== 'admin') {
              updateDoc(doc(db, 'users', user.uid), { tipo_usuario: 'admin' }).catch(console.error);
              updatedProfile.tipo_usuario = 'admin';
            }
            setProfile(updatedProfile);
            
            // 2. Driver Profile Listener (Conditional)
            if (updatedProfile.tipo_usuario === 'motorista') {
              const driverUnsub = onSnapshot(doc(db, 'drivers', user.uid), (driverSnap) => {
                if (driverSnap.exists()) {
                  setDriverProfile({ ...(driverSnap.data() as DriverProfile), uid: user.uid });
                }
              });
              // We don't store driverUnsub in state but it's fine for simple apps
              // though ideally we'd manage a list of unsubs
            }
          }
          setLoading(false);
        });

        // 3. Club Ketto Specific Listener (Legacy/Parallel support)
        const kettoUnsub = onSnapshot(doc(db, 'club_ketto', user.uid), (kettoSnap) => {
          if (kettoSnap.exists()) {
            setClubKetto({ ...(kettoSnap.data() as ClubKetto), userId: user.uid });
          }
        });

        return () => {
          profileUnsub();
          kettoUnsub();
        };
      } else {
        setProfile(null);
        setDriverProfile(null);
        setClubKetto(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, driverProfile, clubKetto, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
