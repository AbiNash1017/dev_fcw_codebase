"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userStatus, setUserStatus] = useState(null);
    const router = useRouter();

    // Function to check user status
    const checkUserStatus = async (token) => {
        try {
            const response = await fetch('/api/auth/status', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const status = await response.json();
                setUserStatus(status);
                return status;
            }
        } catch (error) {
            console.error("Error checking user status:", error);
        }
        return null;
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Get the ID token
                const token = await firebaseUser.getIdToken();

                // Set cookie for middleware
                document.cookie = `token=${token}; path=/; max-age=3600; SameSite=Strict`;

                // Fetch user data from MongoDB
                try {
                    const response = await fetch('/api/user/me', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.ok) {
                        const userData = await response.json();

                        // Set user with combined data
                        setUser({
                            ...userData,
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            phoneNumber: firebaseUser.phoneNumber,
                            photoURL: firebaseUser.photoURL,
                            getIdToken: (forceRefresh) => firebaseUser.getIdToken(forceRefresh),
                        });

                        // Check user status for routing
                        await checkUserStatus(token);
                    } else {
                        // If user not found in DB, just set firebase user (might be first login/onboarding)
                        setUser(firebaseUser);
                        await checkUserStatus(token);
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    setUser(firebaseUser);
                }
            } else {
                // Remove cookie
                document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                setUser(null);
                setUserStatus(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        try {
            await signOut(auth);
            setUser(null);
            setUserStatus(null);
            router.push("/login");
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout, userStatus, checkUserStatus }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
