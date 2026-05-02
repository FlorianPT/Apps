"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatDate, formatCurrency } from "@/lib/utils";
import { RECHNUNG_STATUS_LABELS, ZAHLUNGSART_LABELS } from "@/types";
import { ArrowLeft, Printer, CheckCircle, Trash2 } from "lucide-react";

interface RechnungData {
  id: string;
  rechnungsnummer: string;
  ausstellungsDatum: string;
  status: string;
  zahlungsart: string | null;
  gesamtbetrag: number;
  notizen: string | null;
  kunde: { id: string; vorname: string; nachname: string; email: string | null; telefon: string | null };
  posten: { id: string; bezeichnung: string; menge: number; einzelpreis: number; gesamtpreis: number }[];
  termin: { id: string } | null;
}

export default function RechnungDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [rechnung, setRechnung] = useState<RechnungData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/rechnungen/${params.id}`)
      .then((r) => r.json())
      .then((data) => { setRechnung(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [params.id]);

  async function markAsPaid(zahlungsart: string) {
    setSaving(true);
    const res = await fetch(`/api/rechnungen/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "BEZAHLT", zahlungsart }),
    });
    if (res.ok) setRechnung(await res.json());
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm("Rechnung wirklich löschen?")) return;
    await fetch(`/api/rechnungen/${params.id}`, { method: "DELETE" });
    router.push("/rechnungen");
    router.refresh();
  }

  if (loading) return <div className="text-gray-400 text-sm py-8">Lade…</div>;
  if (!rechnung) return <div className="text-gray-400 text-sm py-8">Rechnung nicht gefunden.</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 no-print">
        <div className="flex items-center gap-3">
          <Link href="/rechnungen" className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">{rechnung.rechnungsnummer}</h1>
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
              rechnung.status === "BEZAHLT" ? "bg-green-100 text-green-700" :
              rechnung.status === "STORNIERT" ? "bg-red-100 text-red-700" :
              "bg-orange-100 text-orange-700"
            }`}
          >
            {RECHNUNG_STATUS_LABELS[rechnung.status as keyof typeof RECHNUNG_STATUS_LABELS] ?? rechnung.status}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 text-sm border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50"
          >
            <Printer size={14} /> Drucken
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg"
          >
            <Trash2 size={14} /> Löschen
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-100 p-6" id="rechnung-druck">
            <div className="flex justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Rechnung</h2>
                <p className="text-sm text-gray-500">{rechnung.rechnungsnummer}</p>
              </div>
              <div className="text-right text-sm text-gray-600">
                <p>Datum: {formatDate(rechnung.ausstellungsDatum)}</p>
                {rechnung.zahlungsart && (
                  <p>Zahlung: {ZAHLUNGSART_LABELS[rechnung.zahlungsart as keyof typeof ZAHLUNGSART_LABELS] ?? rechnung.zahlungsart}</p>
                )}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-xs text-gray-500 mb-1">Kundin</p>
              <p className="font-medium">{rechnung.kunde.vorname} {rechnung.kunde.nachname}</p>
              {rechnung.kunde.email && <p className="text-sm text-gray-600">{rechnung.kunde.email}</p>}
              {rechnung.kunde.telefon && <p className="text-sm text-gray-600">{rechnung.kunde.telefon}</p>}
            </div>

            <table className="w-full mb-4">
              <thead>
                <tr className="border-b border-gray-200 text-xs text-gray-500 text-left">
                  <th className="pb-2 font-medium">Bezeichnung</th>
                  <th className="pb-2 font-medium text-center">Menge</th>
                  <th className="pb-2 font-medium text-right">Einzelpreis</th>
                  <th className="pb-2 font-medium text-right">Gesamt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rechnung.posten.map((p) => (
                  <tr key={p.id}>
                    <td className="py-2.5 text-sm">{p.bezeichnung}</td>
                    <td className="py-2.5 text-sm text-center">{p.menge}</td>
                    <td className="py-2.5 text-sm text-right">{formatCurrency(p.einzelpreis)}</td>
                    <td className="py-2.5 text-sm text-right font-medium">{formatCurrency(p.gesamtpreis)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200">
                  <td colSpan={3} className="pt-3 text-sm font-bold text-right pr-4">Gesamtbetrag</td>
                  <td className="pt-3 text-base font-bold text-right text-primary">{formatCurrency(rechnung.gesamtbetrag)}</td>
                </tr>
              </tfoot>
            </table>

            {rechnung.notizen && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Notizen</p>
                <p className="text-sm text-gray-700">{rechnung.notizen}</p>
              </div>
            )}
          </div>
        </div>

        {rechnung.status === "OFFEN" && (
          <div className="no-print">
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <p className="text-sm font-semibold text-gray-900 mb-3">Als bezahlt markieren</p>
              <div className="space-y-2">
                {(["BAR", "KARTE", "UEBERWEISUNG"] as const).map((art) => (
                  <button
                    key={art}
                    onClick={() => markAsPaid(art)}
                    disabled={saving}
                    className="w-full flex items-center gap-2 text-sm border border-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-green-50 hover:border-green-300 hover:text-green-700 disabled:opacity-50 transition-colors"
                  >
                    <CheckCircle size={15} />
                    {ZAHLUNGSART_LABELS[art]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
