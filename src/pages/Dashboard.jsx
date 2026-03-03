import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const STORAGE_KEY = "viona_demo_db_v1";

function loadDb() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { patients: [], screenings: [] };
    const parsed = JSON.parse(raw);
    return {
      patients: Array.isArray(parsed.patients) ? parsed.patients : [],
      screenings: Array.isArray(parsed.screenings) ? parsed.screenings : [],
    };
  } catch {
    return { patients: [], screenings: [] };
  }
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function Dashboard() {
  const [db] = useState(() => loadDb());

  const stats = useMemo(() => {
    const now = new Date();

    const screeningsSorted = db.screenings
      .slice()
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const screeningsToday = screeningsSorted.filter((s) =>
      isSameDay(new Date(s.timestamp), now)
    );

    const last7 = screeningsSorted.filter((s) => {
      const d = new Date(s.timestamp);
      const diffDays = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
  
      return diffDays <= 7;
    });

    const highRisk7 = last7.filter((s) => (s.scoring?.riskLevel || "") === "High");

    const recent = screeningsSorted.slice(0, 6).map((s) => {
      const p = db.patients.find((x) => x.id === s.patientId);
      return {
        ...s,
        patientName: p ? `${p.firstName} ${p.lastName}` : "Unknown patient",
      };
    });

    return {
      totalPatients: db.patients.length,
      screeningsToday: screeningsToday.length,
      highRisk7: highRisk7.length,
      recent,
    };
  }, [db]);

  return (
    <div className="h-full w-full p-6">
      <div className="max-w-6xl mx-auto flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="text-slate-600">
            Viona screening overview (demo mode).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/screening/new"
            className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
          >
            Start New Screening
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
      </div>

      <div className="max-w-6xl mx-auto mt-6 grid grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="text-sm text-slate-600">Patients</div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">
            {stats.totalPatients}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="text-sm text-slate-600">Screenings Today</div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">
            {stats.screeningsToday}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="text-sm text-slate-600">High Risk (7 days)</div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">
            {stats.highRisk7}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="text-sm text-slate-600">Prototype Status</div>
          <div className="mt-1 text-sm font-medium text-slate-900">
            Demo Mode Enabled
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Not clinically validated.
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-6 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="font-semibold text-slate-900">Recent Screenings</div>
          <Link to="/reports" className="text-sm text-slate-700 underline">
            View all
          </Link>
        </div>

        <div className="divide-y divide-slate-200">
          {stats.recent.length === 0 ? (
            <div className="p-5 text-slate-600">
              No screenings yet. Start a new screening to create your first record.
            </div>
          ) : (
            stats.recent.map((r) => (
              <div
                key={r.id}
                className="px-5 py-4 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium text-slate-900">{r.patientName}</div>
                  <div className="text-sm text-slate-600">
                    {new Date(r.timestamp).toLocaleString()} • Risk:{" "}
                    <span className="font-medium">{r.scoring?.riskLevel || "—"}</span>{" "}
                    • Score: {r.scoring?.combinedScore ?? "—"} • Scenario:{" "}
                    {r.demoScenario || "—"}
                  </div>
                </div>

                <Link
                  to={`/reports/${r.id}`}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
                >
                  Open Report
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}