"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatDateTime, formatCurrency } from "@/lib/utils";
import { TerminStatusBadge } from "@/components/termine/TerminStatusBadge";
import { TERMIN_STATUS_LABELS } from "@/types";
import { ArrowLeft, Receipt, Trash2 } from "lucide-react";

interface TerminData {
  id: string;
  startzeit: string;
  endzeit: string;
  status: string;
  notizen: string | null;
  kunde: { id: string; vorname: string; nachname: string };
  mitarbeiter: { name: string } | null;
  leistungen: { preisSnapshot: number; leistung: { name: string; dauer: number } }[];
  rechnung: { id: string; rechnungsnummer: string } | null;
}

const statusOptions = Object.entries(TERMIN_STATUS_LABELS);

export default function TerminDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [termin, setTermin] = useState<TerminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/termine/${params.id}`)
      .then((r) => r.json())
      .then((data) => { setTermin(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [params.id]);

  async function updateStatus(status: string) {
    setSaving(true);
    const res = await fetch(`/api/termine/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) setTermin(await res.json());
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm("Termin wirklich löschen?")) return;
    await fetch(`/api/termine/${params.id}`, { method: "DELETE" });
    router.push("/termine");
    router.refresh();
  }

  if (loading) return <div className="text-gray-400 text-sm py-8">Lade…</div>;
  if (!termin) return <div className="text-gray-400 text-sm py-8">Termin nicht gefunden.</div>;

  const gesamtbetrag = termin.leistungen.reduce((s, tl) => s + tl.preisSnapshot, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/termine" className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Termindetail</h1>
        </div>
        <button
          onClick={handleDelete}
          className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg"
        >
          <Trash2 size={14} /> Löschen
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-lg font-semibold text-gray-900">{formatDateTime(termin.startzeit)}</p>
                <p className="text-sm text-gray-500">bis {formatDateTime(termin.endzeit)}</p>
              </div>
              <TerminStatusBadge status={termin.status} />
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Kundin</p>
                <Link href={`/kunden/${termin.kunde.id}`} className="text-sm font-medium text-primary hover:underline">
                  {termin.kunde.vorname} {termin.kunde.nachname}
                </Link>
              </div>
              {termin.mitarbeiter && (
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Mitarbeiterin</p>
                  <p className="text-sm">{termin.mitarbeiter.name}</p>
                </div>
              )}
              {termin.notizen && (
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Notizen</p>
                  <p className="text-sm text-gray-700">{termin.notizen}</p>
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 pt-4 mt-4">
              <p className="text-xs text-gray-500 mb-2">Leistungen</p>
              <div className="space-y-1.5">
                {termin.leistungen.map((tl, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-700">{tl.leistung.name} ({tl.leistung.dauer} min)</span>
                    <span className="font-medium">{formatCurrency(tl.preisSnapshot)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-semibold pt-2 border-t border-gray-100">
                  <span>Gesamt</span>
                  <span>{formatCurrency(gesamtbetrag)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-sm font-semibold text-gray-900 mb-3">Status ändern</p>
            <div className="space-y-2">
              {statusOptions.map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => updateStatus(value)}
                  disabled={saving || termin.status === value}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    termin.status === value
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-sm font-semibold text-gray-900 mb-3">Abrechnung</p>
            {termin.rechnung ? (
              <Link
                href={`/rechnungen/${termin.rechnung.id}`}
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Receipt size={15} />
                {termin.rechnung.rechnungsnummer}
              </Link>
            ) : (
              <Link
                href={`/rechnungen/neu?terminId=${termin.id}`}
                className="flex items-center gap-2 w-full bg-primary text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 justify-center"
              >
                <Receipt size={15} /> Rechnung erstellen
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
