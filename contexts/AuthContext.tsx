import React, { createContext, useState, useEffect, useContext } from "react";
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { User, RolePreference } from "../types";

interface AuthContextType {
  user: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🔥 Setting up auth state listener");

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("🔥 Auth state changed:", firebaseUser?.uid || "No user");

      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          console.log("📄 Fetching user data from Firestore...");
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const data = userDoc.data();
            console.log("✅ User data loaded:", {
              fullName: data.fullName,
              phoneNumber: data.phoneNumber,
              rolePreference: data.rolePreference,
            });

            setUserData({
              ...data,
              createdAt: data.createdAt?.toDate(),
              updatedAt: data.updatedAt?.toDate(),
            } as User);
          } else {
            console.log("❌ No user document found in Firestore");
            setUserData(null);
          }
        } catch (error) {
          console.error("❌ Error fetching user data:", error);
          setUserData(null);
        }
      } else {
        console.log("👤 No user logged in");
        setUserData(null);
      }

      setLoading(false);
      console.log("✅ Auth loading complete");
    });

    return () => {
      console.log("🔥 Cleaning up auth listener");
      unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);

    // Create initial user document with minimal data (no city)
    await setDoc(doc(db, "users", result.user.uid), {
      uid: result.user.uid,
      email: result.user.email,
      phoneNumber: null,
      fullName: "",
      rolePreference: "consumer",
      isAdmin: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateUserProfile = async (data: Partial<User>) => {
    if (!user) return;

    const updateData = {
      ...data,
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, "users", user.uid), updateData, { merge: true });

    // Update local state
    setUserData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        ...data,
        updatedAt: new Date(),
      };
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        loading,
        signIn,
        signUp,
        logout,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
