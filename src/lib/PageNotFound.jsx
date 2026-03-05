import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function PageNotFound() {
  const location = useLocation();

  return (
    <div className="h-full w-full p-6">
      <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <div className="text-slate-600 text-sm mb-2">Viona</div>

        <h1 className="text-3xl font-bold text-slate-900">Page not found</h1>
        <p className="mt-2 text-slate-600">
          We couldn’t find <span className="font-mono">{location.pathname}</span>.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/"
            className="px-5 py-2.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
          >
            Go to Dashboard
          </Link>

          <Link
            to="/patients"
            className="px-5 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-50"
          >
            Patients
          </Link>

          <Link
            to="/reports"
            className="px-5 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-50"
          >
            Reports
          </Link>

          <Link
            to="/screening/new"
            className="px-5 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-50"
          >
            New Screening
          </Link>
        </div>

        <div className="mt-6 text-xs text-slate-500">
          Prototype demo only — not clinically validated.
        </div>
      </div>
    </div>
  );
}