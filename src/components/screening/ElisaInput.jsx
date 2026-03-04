import React, { useMemo, useState } from "react";

const CAD_SRC = "/elisa-cad.png";

const WELL_LAYOUT = [
  { id: "A1", top: 27.5, left: 22 },
  { id: "A2", top: 27.5, left: 50 },
  { id: "A3", top: 27.5, left: 78 },
  { id: "B1", top: 68.5, left: 22 },
  { id: "B2", top: 68.5, left: 50 },
  { id: "B3", top: 68.5, left: 78 },
];

const COLOR_OPTIONS = [
  { label: "Clear", value: 0, swatch: "bg-white" },
  { label: "Light", value: 1, swatch: "bg-yellow-200" },
  { label: "Medium", value: 2, swatch: "bg-yellow-400" },
  { label: "Dark", value: 3, swatch: "bg-yellow-600" },
];

function getSwatch(label) {
  const opt = COLOR_OPTIONS.find((o) => o.label === label);
  return opt ? opt.swatch : "bg-white";
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

export default function ElisaInput({
  value = { wells: [], elisaScore: undefined, cadImageUrl: CAD_SRC, imageUrl: undefined },
  onChange,
}) {
  const [selectedWell, setSelectedWell] = useState(null);
  const wells = Array.isArray(value?.wells) ? value.wells : [];

  const wellMap = useMemo(() => {
    const map = {};
    for (const w of wells) if (w?.wellId) map[w.wellId] = w;
    return map;
  }, [wells]);

  function pushChange(updatedWells, extra = {}) {
    const score =
      updatedWells.length > 0
        ? updatedWells.reduce((sum, w) => sum + (Number(w.value) || 0), 0) / updatedWells.length
        : undefined;

    onChange?.({
      ...value,
      ...extra,
      wells: updatedWells,
      elisaScore: score,
      cadImageUrl: CAD_SRC,
    });
  }

  function updateWell(wellId, option) {
    const updated = wells.filter((w) => w.wellId !== wellId);
    updated.push({ wellId, label: option.label, value: option.value });
    pushChange(updated);
    setSelectedWell(null);
  }

  function clearWell(wellId) {
    const updated = wells.filter((w) => w.wellId !== wellId);
    pushChange(updated);
    setSelectedWell(null);
  }

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Keep file size reasonable for offline storage
    if (file.size > 2_500_000) {
      alert("Image is too large. Please upload an image under ~2.5MB.");
      return;
    }

    try {
      const base64 = await toBase64(file);
      onChange?.({
        ...value,
        imageUrl: base64,      // ✅ stored offline
        cadImageUrl: CAD_SRC,
      });
    } catch {
      alert("Could not read that image file. Try again.");
    }
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-slate-900">ELISA Plate Analysis</h3>
      <p className="text-sm text-slate-600">
        Upload a photo (optional), then click each well to record the observed color intensity.
      </p>

      {/* Upload */}
      <div className="mt-4 bg-white border border-slate-200 rounded-xl p-4">
        <div className="text-sm font-medium text-slate-900">Upload ELISA Photo</div>
        <input
          type="file"
          accept="image/*"
          className="mt-2 block w-full text-sm"
          onChange={handleUpload}
        />

        {value?.imageUrl ? (
          <img
            src={value.imageUrl}
            alt="Uploaded ELISA"
            className="mt-3 w-full max-w-3xl rounded-lg border border-slate-200 object-contain"
          />
        ) : (
          <div className="mt-2 text-xs text-slate-500">
            No image uploaded yet (demo works fine without it).
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-700">
        {COLOR_OPTIONS.map((o) => (
          <div
            key={o.label}
            className="flex items-center gap-2 px-2 py-1 rounded-full border border-slate-200 bg-white"
          >
            <span className={`inline-block w-4 h-4 rounded ${o.swatch} border border-slate-200`} />
            <span>{o.label}</span>
          </div>
        ))}
      </div>

      {/* CAD + wells */}
      <div className="relative mt-4 w-full max-w-3xl">
        <img
          src={CAD_SRC}
          alt="ELISA CAD"
          className="w-full rounded-xl border border-slate-200 bg-white"
          draggable={false}
        />

        {WELL_LAYOUT.map((well) => {
          const current = wellMap[well.id];
          const swatch = current ? getSwatch(current.label) : "bg-white";

          return (
            <button
              key={well.id}
              type="button"
              onClick={() => setSelectedWell(well.id)}
              className={[
                "absolute rounded-full border-2 border-slate-900",
                "flex items-center justify-center font-semibold shadow-md",
                "w-11 h-11 sm:w-12 sm:h-12 text-[10px] sm:text-xs",
                "hover:scale-[1.03] transition",
                swatch,
              ].join(" ")}
              style={{
                top: `${well.top}%`,
                left: `${well.left}%`,
                transform: "translate(-50%, -50%)",
              }}
              title={current ? `${well.id}: ${current.label}` : `${well.id}: not set`}
            >
              {well.id}
            </button>
          );
        })}
      </div>

      {/* Picker */}
      {selectedWell && (
        <div className="mt-4 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-medium text-slate-900">
              Select color for <span className="font-semibold">{selectedWell}</span>
            </div>
            <button
              type="button"
              onClick={() => clearWell(selectedWell)}
              className="text-sm px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
            >
              Clear well
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-3">
            {COLOR_OPTIONS.map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => updateWell(selectedWell, option)}
                className={`px-4 py-2 rounded-lg border border-slate-200 hover:opacity-90 transition ${option.swatch}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {value?.elisaScore !== undefined && (
        <div className="mt-4 text-sm text-slate-700">
          Calculated ELISA Score:{" "}
          <span className="font-semibold">{Number(value.elisaScore).toFixed(2)}</span>
        </div>
      )}
    </div>
  );
}