import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [pin, setPin] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    await login({ name, pin });
    navigate("/", { replace: true });
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Viona
        </div>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">
          Operator Login
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Offline mode — works without Wi-Fi.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm text-slate-600">Operator name</label>
            <input
              className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200"
              placeholder="e.g., Hima / Team Viona"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm text-slate-600">PIN</label>
            <input
              className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200"
              placeholder="4 digits"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
          >
            Enter Viona
          </button>
        </form>

        <div className="mt-6 text-xs text-slate-500">
          Prototype demo only — not clinically validated.
        </div>
      </div>
    </div>
  );
}