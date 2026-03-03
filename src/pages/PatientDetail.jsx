import React, { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

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

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [db, setDb] = useState(() => loadDb());

  const patient = useMemo(() => db.patients.find((p) => p.id === id), [db, id]);

  const patientScreenings = useMemo(() => {
    return db.screenings
      .filter((s) => s.patientId === id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [db, id]);

  if (!patient) {
    return (
      <div className="p-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-xl font-semibold text-slate-900">Patient not found</h1>
          <Link className="text-slate-700 underline" to="/patients">
            Back to Patients
          </Link>
        </div>
      </div>
    );
  }

  function handleDeletePatient() {
    const ok = confirm("Delete this patient and all related screenings?");
    if (!ok) return;

    const nextDb = {
      patients: db.patients.filter((p) => p.id !== id),
      screenings: db.screenings.filter((s) => s.patientId !== id),
    };
    setDb(nextDb);
    saveDb(nextDb);
    navigate("/patients");
  }

  return (
    <div className="h-full w-full p-6">
      <div className="max-w-6xl mx-auto flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {patient.firstName} {patient.lastName}
          </h1>
          <p className="text-slate-600">
            DOB: {patient.dob || "—"} • Sex: {patient.sex || "—"}
          </p>
          <div className="mt-2 text-sm text-slate-600">
            {patient.email ? <div>Email: {patient.email}</div> : null}
            {patient.phone ? <div>Phone: {patient.phone}</div> : null}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/screening/new?patientId=${patient.id}`}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
          >
            New Screening
          </Link>
          <button
            onClick={handleDeletePatient}
            className="px-4 py-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-6 grid grid-cols-3 gap-4">
        <div className="col-span-1 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900">Risk Factors</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {(patient.riskFactors || []).length === 0 ? (
              <div className="text-slate-600">None recorded.</div>
            ) : (
              patient.riskFactors.map((rf) => (
                <span
                  key={rf}
                  className="px-3 py-1 rounded-full border border-slate-200 text-sm text-slate-700 bg-slate-50"
                >
                  {rf}
                </span>
              ))
            )}
          </div>

          <h2 className="mt-6 font-semibold text-slate-900">Notes</h2>
          <div className="mt-2 text-slate-700 whitespace-pre-wrap">
            {patient.notes || "—"}
          </div>
        </div>

        <div className="col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div className="font-semibold text-slate-900">Screening History</div>
            <div className="text-sm text-slate-600">
              {patientScreenings.length} tests
            </div>
          </div>

          <div className="divide-y divide-slate-200">
            {patientScreenings.length === 0 ? (
              <div className="p-5 text-slate-600">
                No screenings yet. Run a new screening to create the first record.
              </div>
            ) : (
              patientScreenings.map((s) => (
                <div key={s.id} className="px-5 py-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-900">
                      {new Date(s.timestamp).toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-600">
                      Risk: <span className="font-medium">{s.scoring?.riskLevel || "—"}</span>{" "}
                      • Score: {s.scoring?.combinedScore ?? "—"} • Scenario: {s.demoScenario || "—"}
                    </div>
                  </div>
                  <Link
                    to={`/reports/${s.id}`}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
                  >
                    View Report
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