"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Leistung } from "@prisma/client";

interface Posten {
  bezeichnung: string;
  menge: number;
  einzelpreis: number;
  gesamtpreis: number;
  leistungId?: string;
}

interface Props {
  leistungen: Leistung[];
  defaultKundeId?: string;
  defaultTerminId?: string;
  defaultPosten?: Posten[];
  defaultKundeName?: string;
}

interface KundeSuggestion {
  id: string;
  vorname: string;
  nachname: string;
}

export function RechnungFormular({ leistungen, defaultKundeId, defaultTerminId, defaultPosten, defaultKundeName }: Props) {
  const router = useRouter();
  const [kundeId, setKundeId] = useState(defaultKundeId ?? "");
  const [kundeSearch, setKundeSearch] = useState(defaultKundeName ?? "");
  const [kundeSuggestions, setKundeSuggestions] = useState<KundeSuggestion[]>([]);
  const [selectedKunde, setSelectedKunde] = useState<KundeSuggestion | null>(null);
  const [posten, setPosten] = useState<Posten[]>(defaultPosten ?? [{ bezeichnung: "", menge: 1, einzelpreis: 0, gesamtpreis: 0 }]);
  const [zahlungsart, setZahlungsart] = useState("");
  const [notizen, setNotizen] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!defaultKundeId || defaultKundeName) return;
    fetch(`/api/kunden/${defaultKundeId}`)
      .then((r) => r.json())
      .then((k) => {
        setSelectedKunde(k);
        setKundeSearch(`${k.vorname} ${k.nachname}`);
      })
      .catch(() => {});
  }, [defaultKundeId, defaultKundeName]);

  useEffect(() => {
    if (kundeSearch.length < 2 || selectedKunde) return;
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/kunden?q=${encodeURIComponent(kundeSearch)}`);
      if (res.ok) setKundeSuggestions(await res.json());
    }, 300);
    return () => clearTimeout(timer);
  }, [kundeSearch, selectedKunde]);

  function updatePosten(index: number, field: keyof Posten, value: string | number) {
    setPosten((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      if (field === "menge" || field === "einzelpreis") {
        updated[index].gesamtpreis = updated[index].menge * updated[index].einzelpreis;
      }
      return updated;
    });
  }

  function addPosten() {
    setPosten((prev) => [...prev, { bezeichnung: "", menge: 1, einzelpreis: 0, gesamtpreis: 0 }]);
  }

  function removePosten(index: number) {
    setPosten((prev) => prev.filter((_, i) => i !== index));
  }

  function addLeistung(leistung: Leistung) {
    setPosten((prev) => [
      ...prev,
      {
        bezeichnung: leistung.name,
        menge: 1,
        einzelpreis: leistung.preis,
        gesamtpreis: leistung.preis,
        leistungId: leistung.id,
      },
    ]);
  }

  const gesamtbetrag = posten.reduce((s, p) => s + p.gesamtpreis, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const kId = selectedKunde?.id ?? kundeId;
    if (!kId) { setError("Bitte eine Kundin auswählen"); return; }
    if (posten.every((p) => !p.bezeichnung)) { setError("Bitte mindestens einen Posten eingeben"); return; }

    setLoading(true);
    setError("");

    const res = await fetch("/api/rechnungen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kundeId: kId,
        terminId: defaultTerminId || null,
        posten: posten.filter((p) => p.bezeichnung),
        zahlungsart: zahlungsart || null,
        notizen,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/rechnungen/${data.id}`);
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "Fehler beim Speichern");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex justify-end mb-4">
        <Link href="/rechnungen" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft size={16} /> Zurück
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
          <h2 className="font-semibold text-sm text-gray-900">Kundin</h2>
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
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Zahlungsart</label>
            <select
              value={zahlungsart}
              onChange={(e) => setZahlungsart(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">— Noch offen —</option>
              <option value="BAR">Bar</option>
              <option value="KARTE">Karte</option>
              <option value="UEBERWEISUNG">Überweisung</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm text-gray-900">Positionen</h2>
            <div className="flex gap-2">
              <select
                onChange={(e) => {
                  const l = leistungen.find((l) => l.id === e.target.value);
                  if (l) { addLeistung(l); e.target.value = ""; }
                }}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600"
              >
                <option value="">+ Leistung hinzufügen</option>
                {leistungen.map((l) => (
                  <option key={l.id} value={l.id}>{l.name} ({l.preis.toFixed(2)} €)</option>
                ))}
              </select>
              <button
                type="button"
                onClick={addPosten}
                className="flex items-center gap-1 text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600 hover:bg-gray-50"
              >
                <Plus size={12} /> Manuell
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {posten.map((p, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <input
                  value={p.bezeichnung}
                  onChange={(e) => updatePosten(i, "bezeichnung", e.target.value)}
                  placeholder="Bezeichnung"
                  className="col-span-5 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <input
                  type="number"
                  min="1"
                  value={p.menge}
                  onChange={(e) => updatePosten(i, "menge", Number(e.target.value))}
                  className="col-span-2 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={p.einzelpreis}
                  onChange={(e) => updatePosten(i, "einzelpreis", Number(e.target.value))}
                  className="col-span-2 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <span className="col-span-2 text-sm text-right font-medium text-gray-900">
                  {formatCurrency(p.gesamtpreis)}
                </span>
                <button
                  type="button"
                  onClick={() => removePosten(i)}
                  className="col-span-1 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-3 mt-3 border-t border-gray-100">
            <div className="text-right">
              <span className="text-sm text-gray-500 mr-4">Gesamtbetrag</span>
              <span className="text-lg font-bold text-gray-900">{formatCurrency(gesamtbetrag)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">Notizen</label>
          <textarea
            value={notizen}
            onChange={(e) => setNotizen(e.target.value)}
            rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white rounded-lg py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? "Speichern…" : "Rechnung erstellen"}
        </button>
      </form>
    </div>
  );
}
