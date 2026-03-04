import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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

function saveDb(db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

function makeId(prefix = "id") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

const DEFAULT_RISK_FACTORS = [
  "Smoking history",
  "Family history of cancer",
  "Chronic hepatitis (B/C)",
  "Heavy alcohol use",
  "Obesity / Diabetes",
  "Occupational exposure (asbestos/radon)",
];

export default function Patients() {
  const navigate = useNavigate();
  const [db, setDb] = useState(() => loadDb());
  const [query, setQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    sex: "Female",
    email: "",
    phone: "",
    riskFactors: [],
    notes: "",
  });

  const patients = db.patients;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter((p) => {
      const full = `${p.firstName} ${p.lastName}`.toLowerCase();
      return (
        full.includes(q) ||
        (p.dob || "").toLowerCase().includes(q) ||
        (p.email || "").toLowerCase().includes(q) ||
        (p.phone || "").toLowerCase().includes(q)
      );
    });
  }, [patients, query]);

  function toggleRiskFactor(rf) {
    setForm((prev) => {
      const exists = prev.riskFactors.includes(rf);
      return {
        ...prev,
        riskFactors: exists
          ? prev.riskFactors.filter((x) => x !== rf)
          : [...prev.riskFactors, rf],
      };
    });
  }

  function handleCreate(e) {
    e.preventDefault();

    if (!form.firstName.trim() || !form.lastName.trim()) {
      alert("Please enter first and last name.");
      return;
    }

    const patient = {
      id: makeId("pat"),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      dob: form.dob,
      sex: form.sex,
      email: form.email.trim(),
      phone: form.phone.trim(),
      riskFactors: form.riskFactors,
      notes: form.notes.trim(),
      createdAt: new Date().toISOString(),
    };

    const nextDb = { ...db, patients: [patient, ...db.patients] };
    setDb(nextDb);
    saveDb(nextDb);

    setIsCreating(false);
    setForm({
      firstName: "",
      lastName: "",
      dob: "",
      sex: "Female",
      email: "",
      phone: "",
      riskFactors: [],
      notes: "",
    });

    navigate(`/patients/${patient.id}`);
  }

  return (
    <div className="h-full w-full p-6">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Patients</h1>
          <p className="text-slate-600">
            Create patient profiles and run Viona screenings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
            onClick={() => setIsCreating((v) => !v)}
          >
            {isCreating ? "Close" : "Create Patient"}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-6">
        <div className="flex items-center gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, DOB, email, phone..."
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
          <Link
            to="/screening/new"
            className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 whitespace-nowrap"
          >
            New Screening
          </Link>
        </div>

        {isCreating && (
          <div className="mt-6 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Create Patient Profile
            </h2>

            <form onSubmit={handleCreate} className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-600">First Name *</label>
                <input
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200"
                  value={form.firstName}
                  onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm text-slate-600">Last Name *</label>
                <input
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200"
                  value={form.lastName}
                  onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                />
              </div>

              <div>
                  <label className="text-sm text-slate-600">Date of Birth</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="MM/DD/YYYY"
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200"
                    value={form.dob}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, dob: e.target.value }))
                    }
                  />
                  <div className="mt-1 text-xs text-slate-500">
                    Example: 03/04/2007
                  </div>
              </div>

              <div>
                <label className="text-sm text-slate-600">Sex</label>
                <select
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200"
                  value={form.sex}
                  onChange={(e) => setForm((p) => ({ ...p, sex: e.target.value }))}
                >
                  <option>Female</option>
                  <option>Male</option>
                  <option>Intersex</option>
                  <option>Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-slate-600">Email</label>
                <input
                  type="email"
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm text-slate-600">Phone</label>
                <input
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                />
              </div>

              <div className="col-span-2">
                <label className="text-sm text-slate-600">Risk Factors</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {DEFAULT_RISK_FACTORS.map((rf) => {
                    const active = form.riskFactors.includes(rf);
                    return (
                      <button
                        type="button"
                        key={rf}
                        onClick={() => toggleRiskFactor(rf)}
                        className={[
                          "px-3 py-1 rounded-full border text-sm",
                          active
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50",
                        ].join(" ")}
                      >
                        {rf}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="col-span-2">
                <label className="text-sm text-slate-600">Notes</label>
                <textarea
                  rows={3}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200"
                  value={form.notes}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                />
              </div>

              <div className="col-span-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50"
                  onClick={() => setIsCreating(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
                >
                  Save Patient
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="mt-6 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div className="font-semibold text-slate-900">Patient List</div>
            <div className="text-sm text-slate-600">{filtered.length} patients</div>
          </div>

          <div className="divide-y divide-slate-200">
            {filtered.length === 0 ? (
              <div className="p-5 text-slate-600">No patients found.</div>
            ) : (
              filtered.map((p) => (
                <Link
                  key={p.id}
                  to={`/patients/${p.id}`}
                  className="block px-5 py-4 hover:bg-slate-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-slate-900">
                        {p.firstName} {p.lastName}
                      </div>
                      <div className="text-sm text-slate-600">
                        DOB: {p.dob || "—"} • Sex: {p.sex || "—"}
                      </div>
                    </div>
                    <div className="text-sm text-slate-600">Open →</div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}