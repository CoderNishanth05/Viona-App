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

export default function Reports() {
  const [db] = useState(() => loadDb());
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const all = db.screenings
      .slice()
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .map((s) => {
        const p = db.patients.find((x) => x.id === s.patientId);
        return {
          ...s,
          patientName: p ? `${p.firstName} ${p.lastName}` : "Unknown patient",
        };
      });

    if (!q) return all;
    return all.filter((r) => {
      return (
        (r.patientName || "").toLowerCase().includes(q) ||
        (r.scoring?.riskLevel || "").toLowerCase().includes(q) ||
        (r.demoScenario || "").toLowerCase().includes(q)
      );
    });
  }, [db, query]);

  return (
    <div className="h-full w-full p-6">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Reports</h1>
          <p className="text-slate-600">All saved screenings and exported reports.</p>
        </div>

        <Link
          to="/screening/new"
          className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
        >
          New Screening
        </Link>
      </div>

      <div className="max-w-6xl mx-auto mt-6">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by patient, risk, scenario..."
          className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300"
        />

        <div className="mt-4 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div className="font-semibold text-slate-900">Saved Screenings</div>
            <div className="text-sm text-slate-600">{rows.length} records</div>
          </div>

          <div className="divide-y divide-slate-200">
            {rows.length === 0 ? (
              <div className="p-5 text-slate-600">No reports found.</div>
            ) : (
              rows.map((r) => (
                <div key={r.id} className="px-5 py-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-900">{r.patientName}</div>
                    <div className="text-sm text-slate-600">
                      {new Date(r.timestamp).toLocaleString()} • Risk:{" "}
                      <span className="font-medium">{r.scoring?.riskLevel || "—"}</span> •
                      Score: {r.scoring?.combinedScore ?? "—"} • Scenario: {r.demoScenario || "—"}
                    </div>
                  </div>

                  <Link
                    to={`/reports/${r.id}`}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
                  >
                    Open
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}