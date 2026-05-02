"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { ArrowLeft } from "lucide-react";

export default function NeueLeistungPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", beschreibung: "", dauer: "", preis: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/leistungen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, dauer: Number(form.dauer), preis: Number(form.preis) }),
    });

    if (res.ok) {
      router.push("/leistungen");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "Fehler beim Speichern");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg">
      <PageHeader
        title="Neue Leistung"
        action={
          <Link href="/leistungen" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft size={16} /> Zurück
          </Link>
        }
      />

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bezeichnung *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="z.B. Gesichtsbehandlung"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
            <textarea
              value={form.beschreibung}
              onChange={(e) => setForm({ ...form, beschreibung: e.target.value })}
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Optionale Beschreibung"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dauer (Minuten) *</label>
              <input
                type="number"
                min="1"
                value={form.dauer}
                onChange={(e) => setForm({ ...form, dauer: e.target.value })}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preis (€) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.preis}
                onChange={(e) => setForm({ ...form, preis: e.target.value })}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="65.00"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white rounded-lg py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Speichern…" : "Leistung anlegen"}
          </button>
        </form>
      </div>
    </div>
  );
}
