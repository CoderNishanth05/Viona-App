import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

// These imports assume your Base44 export already has them.
// If your paths differ, tell me and I’ll adjust.
import BreathScan from "../components/screening/BreathScan";
import ElisaInput from "../components/screening/ElisaInput";
import Results from "../components/screening/Results";

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

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

const SCENARIOS = ["Healthy", "Lung-like", "Liver-like", "PDAC-like", "Breast-like"];

export default function NewScreening() {
  const navigate = useNavigate();
  const query = useQuery();

  const [db, setDb] = useState(() => loadDb());

  const patients = db.patients;

  const [step, setStep] = useState(1);

  const [patientId, setPatientId] = useState(() => query.get("patientId") || "");
  const [operatorName, setOperatorName] = useState("Demo Operator");
  const [scenario, setScenario] = useState("Healthy");

  // Breath + ELISA data is collected from child components
  const [breathData, setBreathData] = useState(null);
  const [elisaData, setElisaData] = useState(null);

  const selectedPatient = useMemo(
    () => patients.find((p) => p.id === patientId),
    [patients, patientId]
  );

  function canGoNext() {
    if (step === 1) return !!patientId && !!scenario;
    if (step === 2) return !!breathData;
    if (step === 3) return !!elisaData;
    return true;
  }

  function handleNext() {
    if (!canGoNext()) return;
    setStep((s) => Math.min(4, s + 1));
  }

  function handleBack() {
    setStep((s) => Math.max(1, s - 1));
  }

  function handleSave(finalResultPayload) {
    if (!patientId) {
      alert("Pick a patient first.");
      return;
    }

    const test = {
      id: makeId("test"),
      patientId,
      operatorName,
      timestamp: new Date().toISOString(),
      demoScenario: scenario,
      breath: breathData,
      elisa: elisaData,
      scoring: finalResultPayload?.scoring || null,
      cancerSignals: finalResultPayload?.cancerSignals || null,
    };

    const nextDb = { ...db, screenings: [test, ...db.screenings] };
    setDb(nextDb);
    saveDb(nextDb);

    navigate(`/reports/${test.id}`);
  }

  return (
    <div className="h-full w-full p-6">
      <div className="max-w-6xl mx-auto flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">New Screening</h1>
          <p className="text-slate-600">
            Run a 3-step Viona screening (Breath VOC + ELISA + Results).
          </p>
        </div>

        <div className="flex items-center gap-2">
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

      <div className="max-w-6xl mx-auto mt-6 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <span className={step === 1 ? "font-semibold text-slate-900" : "text-slate-600"}>
              1) Setup
            </span>
            <span className="text-slate-400">→</span>
            <span className={step === 2 ? "font-semibold text-slate-900" : "text-slate-600"}>
              2) Breath Scan
            </span>
            <span className="text-slate-400">→</span>
            <span className={step === 3 ? "font-semibold text-slate-900" : "text-slate-600"}>
              3) ELISA
            </span>
            <span className="text-slate-400">→</span>
            <span className={step === 4 ? "font-semibold text-slate-900" : "text-slate-600"}>
              4) Results
            </span>
          </div>

          <div className="text-sm text-slate-600">
            {selectedPatient ? (
              <span>
                Patient:{" "}
                <span className="font-medium text-slate-900">
                  {selectedPatient.firstName} {selectedPatient.lastName}
                </span>
              </span>
            ) : (
              <span>Pick a patient</span>
            )}
          </div>
        </div>

        <div className="p-5">
          {step === 1 && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-600">Patient *</label>
                <select
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                >
                  <option value="">Select a patient…</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName} ({p.dob || "DOB—"})
                    </option>
                  ))}
                </select>
                {patients.length === 0 && (
                  <div className="mt-2 text-sm text-amber-700">
                    No patients yet. Create one first in the Patients page.
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm text-slate-600">Demo Scenario *</label>
                <select
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200"
                  value={scenario}
                  onChange={(e) => setScenario(e.target.value)}
                >
                  {SCENARIOS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <div className="mt-2 text-xs text-slate-500">
                  Prototype demo mode — generates simulated readings.
                </div>
              </div>

              <div className="col-span-2">
                <label className="text-sm text-slate-600">Operator name</label>
                <input
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200"
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <BreathScan
              onComplete={(data) => setBreathData(data)}
            />
          )}

          {step === 3 && (
            <ElisaInput
              onComplete={(data) => setElisaData(data)}
            />
          )}

          {step === 4 && (
            <Results
              patientId={patientId}
              breathData={breathData}
              elisaData={elisaData}
              onSave={handleSave}
            />
          )}

          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className={[
                "px-4 py-2 rounded-lg border",
                step === 1
                  ? "border-slate-200 text-slate-400 cursor-not-allowed"
                  : "border-slate-200 hover:bg-slate-50",
              ].join(" ")}
            >
              Back
            </button>

            {step < 4 ? (
              <button
                onClick={handleNext}
                disabled={!canGoNext()}
                className={[
                  "px-4 py-2 rounded-lg text-white",
                  canGoNext() ? "bg-slate-900 hover:bg-slate-800" : "bg-slate-300",
                ].join(" ")}
              >
                Next
              </button>
            ) : (
              <div className="text-xs text-slate-500">
                Tip: Click “Save / Export” on the Results screen.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-3 text-xs text-slate-500">
        Disclaimer: Prototype demo only — not clinically validated.
      </div>
    </div>
  );
}