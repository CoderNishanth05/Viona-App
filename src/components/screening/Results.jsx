import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ShieldCheck, Shield, Activity, Save } from "lucide-react";
import {
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Tooltip,
} from "recharts";

// --- helpers (safe reads) ---
function getReading(breathData, key) {
  if (!breathData) return 0;
  if (typeof breathData[key] === "number") return breathData[key];
  if (breathData.readings && typeof breathData.readings[key] === "number")
    return breathData.readings[key];
  return 0;
}

// Simple demo algorithm (offline, judge-friendly)
// Converts breath sensor intensity + ELISA score into a 0–100 combined score
function calculateCombinedRiskSafe(breathData, elisaScore = 0) {
  const mq3 = getReading(breathData, "mq3");
  const mq135 = getReading(breathData, "mq135");
  const mq138 = getReading(breathData, "mq138");
  const mq137 = getReading(breathData, "mq137");

  // Normalize 0–1023 -> 0–100
  const vocAvg =
    (mq3 + mq135 + mq138 + mq137) / 4;
  const vocScore = Math.max(0, Math.min(100, (vocAvg / 1023) * 100));

  // ELISA score in our UI is typically 0–3 (Clear..Dark) average
  const elisaNorm = Math.max(0, Math.min(100, (Number(elisaScore) / 3) * 100));

  // Weighting (you can adjust): VOC 60%, ELISA 40%
  const combinedScore = vocScore * 0.6 + elisaNorm * 0.4;

  let riskLevel = "Low";
  if (combinedScore >= 70) riskLevel = "High";
  else if (combinedScore >= 40) riskLevel = "Medium";

  // Very simple “pattern label” based on strongest sensor (demo-only)
  const strongest = [
    { k: "MQ-3", v: mq3, cancer: "Lung (VOC pattern)" },
    { k: "MQ-135", v: mq135, cancer: "Liver (VOC pattern)" },
    { k: "MQ-138", v: mq138, cancer: "Pancreatic / PDAC (VOC pattern)" },
    { k: "MQ-137", v: mq137, cancer: "Breast (VOC pattern)" },
  ].sort((a, b) => b.v - a.v)[0];

  const likelyCancer = strongest?.cancer || "No dominant pattern";

  // “Activated sensors” (simple threshold)
  const threshold = 450; // demo threshold
  const activated = [
    { sensor: "MQ-3", value: mq3, activated: mq3 >= threshold, linked: "Lung" },
    { sensor: "MQ-135", value: mq135, activated: mq135 >= threshold, linked: "Liver" },
    { sensor: "MQ-138", value: mq138, activated: mq138 >= threshold, linked: "PDAC" },
    { sensor: "MQ-137", value: mq137, activated: mq137 >= threshold, linked: "Breast" },
  ].filter((s) => s.activated);

  return {
    combinedScore,
    riskLevel,
    likelyCancer,
    vocScore,
    elisaNorm,
    activatedSensors: activated,
  };
}

export default function Results({ breathData, elisaData, patientId, onSave }) {
  const elisaScore = elisaData?.elisaScore ?? 0;
  const wells = Array.isArray(elisaData?.wells) ? elisaData.wells : [];

  const {
    combinedScore,
    riskLevel,
    likelyCancer,
    vocScore,
    elisaNorm,
    activatedSensors,
  } = useMemo(
    () => calculateCombinedRiskSafe(breathData, elisaScore),
    [breathData, elisaScore]
  );

  const radarData = useMemo(
    () => [
      { subject: "MQ-3", A: getReading(breathData, "mq3"), fullMark: 1023 },
      { subject: "MQ-135", A: getReading(breathData, "mq135"), fullMark: 1023 },
      { subject: "MQ-138", A: getReading(breathData, "mq138"), fullMark: 1023 },
      { subject: "MQ-137", A: getReading(breathData, "mq137"), fullMark: 1023 },
    ],
    [breathData]
  );

  const RiskIcon =
    riskLevel === "High" ? ShieldAlert : riskLevel === "Medium" ? Shield : ShieldCheck;

  const riskColor =
    riskLevel === "High"
      ? "text-rose-600"
      : riskLevel === "Medium"
      ? "text-amber-600"
      : "text-emerald-600";

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div
        className={[
          "p-6 rounded-2xl flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border",
          riskLevel === "High"
            ? "border-rose-200 bg-rose-50/60"
            : riskLevel === "Medium"
            ? "border-amber-200 bg-amber-50/60"
            : "border-emerald-200 bg-emerald-50/60",
        ].join(" ")}
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-white shadow-sm border border-slate-200">
            <RiskIcon className={`w-10 h-10 ${riskColor}`} />
          </div>

          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900">
              {riskLevel} Risk Detected
            </h2>
            <p className="text-slate-600">
              Combined Score:{" "}
              <span className="font-bold text-slate-900">
                {combinedScore.toFixed(1)} / 100
              </span>{" "}
              <span className="text-slate-400">•</span>{" "}
              VOC: {vocScore.toFixed(1)}{" "}
              <span className="text-slate-400">•</span>{" "}
              ELISA: {elisaNorm.toFixed(1)}
            </p>
          </div>
        </div>

        <div className="lg:text-right">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Associated Pattern
          </p>
          <p className="text-lg lg:text-2xl font-bold text-slate-900 bg-white px-4 py-2 rounded-lg border border-slate-200 inline-block shadow-sm">
            {likelyCancer}
          </p>
        </div>
      </div>

      {/* Tablet-friendly grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Radar */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b border-slate-100">
            <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
              <Activity className="w-5 h-5 text-teal-600" />
              E-Nose Fingerprint
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 lg:p-6">
            <div className="h-[220px] lg:h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <Radar name="Sensor Value" dataKey="A" fillOpacity={0.25} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b border-slate-100">
            <CardTitle className="text-base lg:text-lg">Screening Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-4 lg:p-6 space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <div className="text-xs text-slate-500">ELISA Wells</div>
                <div className="text-lg font-bold text-slate-900">{wells.length}</div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <div className="text-xs text-slate-500">ELISA Avg Intensity</div>
                <div className="text-lg font-bold text-slate-900">
                  {Number(elisaScore).toFixed(2)}
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold text-slate-900 mb-2">
                Activated Sensors
              </div>
              {activatedSensors.length === 0 ? (
                <div className="text-sm text-slate-600">
                  No sensors exceeded the activation threshold in this run.
                </div>
              ) : (
                <div className="space-y-2">
                  {activatedSensors.map((s) => (
                    <div
                      key={s.sensor}
                      className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-3 py-2"
                    >
                      <div className="text-sm font-medium text-slate-900">
                        {s.sensor}
                        <span className="text-slate-400"> • </span>
                        <span className="text-slate-700">Linked: {s.linked}</span>
                      </div>
                      <div className="text-sm text-slate-700">{s.value}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Next Steps</h4>
              <ul className="space-y-2 text-sm">
                {riskLevel === "Low" && (
                  <li className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    Routine follow-up; repeat screening in 12 months if needed.
                  </li>
                )}
                {riskLevel === "Medium" && (
                  <>
                    <li className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      Recommend confirmatory lab testing within 30 days.
                    </li>
                    <li className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      Review history for risk factors and symptoms.
                    </li>
                  </>
                )}
                {riskLevel === "High" && (
                  <>
                    <li className="bg-rose-50 p-3 rounded-lg border border-rose-200 text-rose-800 font-medium">
                      Urgent: order follow-up imaging / diagnostics aligned with {likelyCancer}.
                    </li>
                    <li className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      Refer to specialist consultation.
                    </li>
                  </>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <Button
          size="lg"
          className="px-8"
          onClick={() =>
            onSave?.({
              scoring: {
                combinedScore,
                riskLevel,
                vocScore,
                elisaScore,
              },
              cancerSignals: {
                likelyCancer,
                activatedSensors,
              },
            })
          }
        >
          <Save className="w-5 h-5 mr-2" /> Save to Record
        </Button>
      </div>
    </div>
  );
}