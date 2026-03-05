import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import { Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider, useAuth } from "@/lib/AuthContext";
import Login from "@/pages/Login";

import Dashboard from "@/pages/Dashboard";
import Patients from "@/pages/Patients";
import PatientDetail from "@/pages/PatientDetail";
import Reports from "@/pages/Reports";
import ReportDetail from "@/pages/ReportDetail";
import NewScreening from "@/pages/NewScreening";
import Settings from "@/pages/Settings"; // If this file doesn't exist, remove this import + route below

import Layout from "./Layout";
import PageNotFound from "./lib/PageNotFound";

function AuthedRoutes() {
  return (
    <Layout currentPageName="">
      <Routes>
        {/* ✅ Compatibility redirects for old/capitalized routes */}
        <Route path="/Dashboard" element={<Navigate to="/" replace />} />
        <Route path="/Patients" element={<Navigate to="/patients" replace />} />
        <Route path="/Reports" element={<Navigate to="/reports" replace />} />
        <Route path="/NewScreening" element={<Navigate to="/screening/new" replace />} />
        <Route path="/Settings" element={<Navigate to="/settings" replace />} />

        {/* ✅ Main pages */}
        <Route path="/" element={<Dashboard />} />

        {/* ✅ Patients */}
        <Route path="/patients" element={<Patients />} />
        <Route path="/patients/:id" element={<PatientDetail />} />

        {/* ✅ Screening */}
        <Route path="/screening/new" element={<NewScreening />} />

        {/* ✅ Reports */}
        <Route path="/reports" element={<Reports />} />
        <Route path="/reports/:id" element={<ReportDetail />} />

        {/* ✅ Settings (optional) */}
        <Route path="/settings" element={<Settings />} />

        {/* Catch-all */}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Layout>
  );
}

function AppRoutes() {
  const { isLoadingAuth, isLoadingPublicSettings, isAuthenticated } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {!isAuthenticated ? (
        <Route path="*" element={<Navigate to="/login" replace />} />
      ) : (
        <Route path="/*" element={<AuthedRoutes />} />
      )}
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <AppRoutes />
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}