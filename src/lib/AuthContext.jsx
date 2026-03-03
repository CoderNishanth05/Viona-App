import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

/**
 * Demo AuthContext (NO Base44)
 * Provides the same fields your App.jsx expects:
 * - isLoadingAuth
 * - isLoadingPublicSettings
 * - authError
 * - navigateToLogin
 */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Keep names aligned with your existing App.jsx
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);

  // authError is always null in demo mode (no registration / login needed)
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Simulate a short "loading" phase so UI looks realistic
    const t = setTimeout(() => {
      setUser({
        id: "demo_user",
        name: "Demo Operator",
        email: "demo@viona.local",
        role: "operator",
      });

      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
      setAuthError(null);
    }, 250);

    return () => clearTimeout(t);
  }, []);

  const value = useMemo(() => {
    return {
      user,
      isAuthenticated: !!user,

      // match expected names
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,

      // Demo login redirect – does nothing
      navigateToLogin: () => {
        // In demo mode we don't redirect anywhere.
        // If you later add a /login page, we can navigate there.
        console.log("[Viona] Demo mode: navigateToLogin called (ignored).");
      },

      // optional helpers if you want them later
      login: async (name = "Demo Operator") => {
        setUser({
          id: "demo_user",
          name,
          email: "demo@viona.local",
          role: "operator",
        });
      },
      logout: async () => {
        setUser(null);
      },
    };
  }, [user, isLoadingAuth, isLoadingPublicSettings, authError]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}