"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Leistung, User } from "@prisma/client";

interface Props {
  leistungen: Leistung[];
  mitarbeiter: User[];
  defaultKundeId?: string;
  defaultDate?: string;
}

interface KundeSuggestion {
  id: string;
  vorname: string;
  nachname: string;
  telefon: string | null;
}

export function TerminFormular({ leistungen, mitarbeiter, defaultKundeId, defaultDate }: Props) {
  const router = useRouter();

  const today = defaultDate ?? new Date().toISOString().split("T")[0];
  const [datum, setDatum] = useState(today);
  const [startzeit, setStartzeit] = useState("10:00");
  const [kundeId, setKundeId] = useState(defaultKundeId ?? "");
  const [kundeSearch, setKundeSearch] = useState("");
  const [kundeSuggestions, setKundeSuggestions] = useState<KundeSuggestion[]>([]);
  const [selectedKunde, setSelectedKunde] = useState<KundeSuggestion | null>(null);
  const [selectedLeistungen, setSelectedLeistungen] = useState<string[]>([]);
  const [mitarbeiterId, setMitarbeiterId] = useState("");
  const [notizen, setNotizen] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (defaultKundeId) {
      fetch(`/api/kunden/${defaultKundeId}`)
        .then((r) => r.json())
        .then((k) => {
          setSelectedKunde(k);
          setKundeSearch(`${k.vorname} ${k.nachname}`);
        })
        .catch(() => {});
    }
  }, [defaultKundeId]);

  useEffect(() => {
    if (kundeSearch.length < 2 || selectedKunde) return;
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/kunden?q=${encodeURIComponent(kundeSearch)}`);
      if (res.ok) setKundeSuggestions(await res.json());
    }, 300);
    return () => clearTimeout(timer);
  }, [kundeSearch, selectedKunde]);

  const totalDauer = leistungen
    .filter((l) => selectedLeistungen.includes(l.id))
    .reduce((sum, l) => sum + l.dauer, 0);

  function getEndzeit() {
    const [h, m] = startzeit.split(":").map(Number);
    const total = h * 60 + m + totalDauer;
    return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
  }

  function toggleLeistung(id: string) {
    setSelectedLeistungen((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedKunde && !kundeId) { setError("Bitte eine Kundin auswählen"); return; }
    if (selectedLeistungen.length === 0) { setError("Bitte mindestens eine Leistung wählen"); return; }

    setLoading(true);
    setError("");

    const startzeitISO = new Date(`${datum}T${startzeit}:00`).toISOString();
    const endzeitISO = new Date(`${datum}T${getEndzeit()}:00`).toISOString();

    const res = await fetch("/api/termine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kundeId: selectedKunde?.id ?? kundeId,
        mitarbeiterId: mitarbeiterId || null,
        startzeit: startzeitISO,
        endzeit: endzeitISO,
        leistungIds: selectedLeistungen,
        notizen,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/termine/${data.id}`);
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "Fehler beim Speichern");
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 max-w-xl">
      <div className="flex justify-end mb-4">
        <Link href="/termine" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft size={16} /> Zurück
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kundin *</label>
          <div className="relative">
            <input
              value={kundeSearch}
              onChange={(e) => { setKundeSearch(e.target.value); setSelectedKunde(null); setKundeId(""); }}
              placeholder="Name suchen…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {kundeSuggestions.length > 0 && !selectedKunde && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                {kundeSuggestions.map((k) => (
                  <button
                    key={k.id}
                    type="button"
                    onClick={() => { setSelectedKunde(k); setKundeId(k.id); setKundeSearch(`${k.vorname} ${k.nachname}`); setKundeSuggestions([]); }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    {k.vorname} {k.nachname}
                    {k.telefon && <span className="text-gray-400 ml-2 text-xs">{k.telefon}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Datum *</label>
            <input
              type="date"
              value={datum}
              onChange={(e) => setDatum(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Uhrzeit *</label>
            <input
              type="time"
              value={startzeit}
              onChange={(e) => setStartzeit(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {totalDauer > 0 && (
          <p className="text-xs text-gray-500 -mt-3">
            Ende: {getEndzeit()} Uhr ({totalDauer} min)
          </p>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Leistungen *</label>
          <div className="space-y-1.5 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2">
            {leistungen.filter((l) => l.aktiv).map((l) => (
              <label key={l.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedLeistungen.includes(l.id)}
                  onChange={() => toggleLeistung(l.id)}
                  className="accent-primary"
                />
                <span className="text-sm flex-1">{l.name}</span>
                <span className="text-xs text-gray-400">{l.dauer} min · {l.preis.toFixed(2)} €</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mitarbeiterin</label>
          <select
            value={mitarbeiterId}
            onChange={(e) => setMitarbeiterId(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">— Nicht zugewiesen —</option>
            {mitarbeiter.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notizen</label>
          <textarea
            value={notizen}
            onChange={(e) => setNotizen(e.target.value)}
            rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Besonderheiten, Wünsche…"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white rounded-lg py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? "Speichern…" : "Termin anlegen"}
        </button>
      </form>
    </div>
  );
}
