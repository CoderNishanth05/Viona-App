import React, { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

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

function downloadTextFile(filename, text, mime = "text/plain") {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function toCsvRow(values) {
  return values
    .map((v) => {
      const s = v == null ? "" : String(v);
      const escaped = s.replaceAll('"', '""');
      return `"${escaped}"`;
    })
    .join(",");
}

export default function ReportDetail() {
  const { id } = useParams();
  const [db] = useState(() => loadDb());

  const record = useMemo(() => db.screenings.find((s) => s.id === id), [db, id]);
  const patient = useMemo(() => {
    if (!record) return null;
    return db.patients.find((p) => p.id === record.patientId) || null;
  }, [db, record]);

  if (!record) {
    return (
      <div className="p-6">
        <div className="max-w-5xl mx-auto bg-white border border-slate-200 rounded-xl p-6">
          <h1 className="text-xl font-semibold text-slate-900">Report not found</h1>
          <Link className="text-slate-700 underline" to="/reports">
            Back to Reports
          </Link>
        </div>
      </div>
    );
  }

  const breath = record.breath || {};
  const elisa = record.elisa || {};
  const scoring = record.scoring || {};

  function exportJson() {
    const payload = { patient, record };
    downloadTextFile(
      `viona_report_${record.id}.json`,
      JSON.stringify(payload, null, 2),
      "application/json"
    );
  }

  function exportCsv() {
    const headers = [
      "report_id",
      "timestamp",
      "patient_name",
      "dob",
      "sex",
      "scenario",
      "risk_level",
      "combined_score",
      "voc_score",
      "elisa_score",
      "mq3",
      "mq135",
      "mq138",
      "mq137",
      "temp",
      "humidity",
    ];

    const values = [
      record.id,
      record.timestamp,
      patient ? `${patient.firstName} ${patient.lastName}` : "",
      patient?.dob || "",
      patient?.sex || "",
      record.demoScenario || "",
      scoring.riskLevel || "",
      scoring.combinedScore ?? "",
      scoring.vocScore ?? "",
      scoring.elisaScore ?? "",
      breath.readings?.mq3 ?? breath.mq3 ?? "",
      breath.readings?.mq135 ?? breath.mq135 ?? "",
      breath.readings?.mq138 ?? breath.mq138 ?? "",
      breath.readings?.mq137 ?? breath.mq137 ?? "",
      breath.temp ?? "",
      breath.humidity ?? "",
    ];

    const csv = [toCsvRow(headers), toCsvRow(values)].join("\n");
    downloadTextFile(`viona_report_${record.id}.csv`, csv, "text/csv");
  }

  async function exportPdf() {
    // Optional PDF export. Requires: npm i jspdf html2canvas
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const el = document.getElementById("viona-report-print");
      const canvas = await html2canvas(el, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("landscape", "pt", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const y = Math.max(0, (pageHeight - imgHeight) / 2);

      pdf.addImage(imgData, "PNG", 0, y, imgWidth, imgHeight);
      pdf.save(`viona_report_${record.id}.pdf`);
    } catch (e) {
      alert(
        "PDF export needs dependencies. Run:\n\nnpm i jspdf html2canvas\n\nError: " +
          (e?.message || e)
      );
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Report Detail</h1>
          <p className="text-slate-600">
            {new Date(record.timestamp).toLocaleString()} • Scenario: {record.demoScenario || "—"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportJson}
            className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50"
          >
            Download JSON
          </button>
          <button
            onClick={exportCsv}
            className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50"
          >
            Download CSV
          </button>
          <button
            onClick={exportPdf}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
          >
            Export PDF
          </button>
          <Link
            to="/reports"
            className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50"
          >
            Back
          </Link>
        </div>
      </div>

      <div
        id="viona-report-print"
        className="max-w-6xl mx-auto mt-6 bg-white border border-slate-200 rounded-xl p-6"
      >
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1">
            <div className="text-sm text-slate-500">Patient</div>
            <div className="mt-1 font-semibold text-slate-900">
              {patient ? `${patient.firstName} ${patient.lastName}` : "Unknown"}
            </div>
            <div className="text-sm text-slate-700">
              DOB: {patient?.dob || "—"} • Sex: {patient?.sex || "—"}
            </div>

            <div className="mt-5 text-sm text-slate-500">Result</div>
            <div className="mt-1 text-lg font-semibold text-slate-900">
              {scoring.riskLevel || "—"} Risk
            </div>
            <div className="text-sm text-slate-700">
              Combined: {scoring.combinedScore ?? "—"} • VOC: {scoring.vocScore ?? "—"} • ELISA:{" "}
              {scoring.elisaScore ?? "—"}
            </div>
          </div>

          <div className="col-span-2">
            <div className="text-sm text-slate-500">Breath Sensor Readings</div>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {["mq3", "mq135", "mq138", "mq137"].map((k) => (
                <div key={k} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="text-xs uppercase text-slate-500">{k}</div>
                  <div className="text-lg font-semibold text-slate-900">
                    {breath.readings?.[k] ?? breath[k] ?? "—"}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 text-sm text-slate-700">
              Temp: {breath.temp ?? "—"} • Humidity: {breath.humidity ?? "—"}
            </div>

            <div className="mt-6 text-sm text-slate-500">ELISA</div>
            <div className="mt-2 grid grid-cols-2 gap-4 items-start">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <div className="text-xs text-slate-500">Plate image</div>
                {elisa.imageUrl ? (
                  <img
                    src={elisa.imageUrl}
                    alt="ELISA"
                    className="mt-2 w-full rounded-md border border-slate-200 object-contain"
                  />
                ) : (
                  <div className="mt-2 text-sm text-slate-600">No image saved.</div>
                )}
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <div className="text-xs text-slate-500">Well readings</div>

                {(elisa.wells || []).length === 0 ? (
                  <div className="mt-2 text-sm text-slate-600">No wells recorded.</div>
                ) : (
                  <div className="mt-2 grid grid-cols-4 gap-2 text-sm text-slate-700">
                    {elisa.wells.map((w) => (
                      <div key={w.wellId} className="px-2 py-1 rounded border border-slate-200">
                        <span className="font-medium">{w.wellId}</span>: {w.label || w.intensity}
                      </div>
                    ))}
                  </div>
                )}

                {elisa.cadImageUrl ? (
                  <>
                    <div className="mt-4 text-xs text-slate-500">CAD overlay image</div>
                    <img
                      src={elisa.cadImageUrl}
                      alt="CAD plate"
                      className="mt-2 w-full rounded-md border border-slate-200 object-contain"
                    />
                  </>
                ) : null}
              </div>
            </div>

            <div className="mt-6 text-xs text-slate-500">
              Prototype demo only — not clinically validated.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}