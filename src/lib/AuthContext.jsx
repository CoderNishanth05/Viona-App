import React, { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);
const AUTH_KEY = "viona_offline_auth_v1";

function makeOperatorId(name) {
  const cleaned = (name || "operator")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return `op_${cleaned || "operator"}`;
}

function loadSession() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveSession(session) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(session));
}

function clearSession() {
  localStorage.removeItem(AUTH_KEY);
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => loadSession());

  const value = useMemo(() => {
    return {
      isLoadingAuth: false,
      isLoadingPublicSettings: false,
      authError: null,

      isAuthenticated: !!session,
      operator: session,
      operatorId: session?.operatorId || null,

      login: async ({ name, pin }) => {
        const next = {
          operatorId: makeOperatorId(name),
          name: (name || "Operator").trim(),
          pin: String(pin || "0000"),
        };
        setSession(next);
        saveSession(next);
      },

      logout: async () => {
        setSession(null);
        clearSession();
      },
    };
  }, [session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}