import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function PageNotFound() {
  const location = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-slate-50">
      <div className="max-w-xl w-full bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="text-sm text-slate-500">Viona</div>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">
          Page not found
        </h1>
        <p className="mt-2 text-slate-600">
          We couldn’t find <span className="font-mono">{location.pathname}</span>.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            to="/"
            className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
          >
            Go to Dashboard
          </Link>
          <Link
            to="/patients"
            className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50"
          >
            Patients
          </Link>
          <Link
            to="/reports"
            className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50"
          >
            Reports
          </Link>
        </div>

        <div className="mt-6 text-xs text-slate-500">
          Prototype demo only — not clinically validated.
        </div>
      </div>
    </div>
  );
}