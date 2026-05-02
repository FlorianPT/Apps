import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatDate, formatDateTime, formatCurrency, daysUntilBirthday } from "@/lib/utils";
import { TERMIN_STATUS_LABELS, RECHNUNG_STATUS_LABELS } from "@/types";
import { Pencil, Plus, Phone, Mail, Cake, CalendarPlus } from "lucide-react";

export default async function KundeDetailPage({ params }: { params: { id: string } }) {
  const kunde = await prisma.kunde.findUnique({
    where: { id: params.id },
    include: {
      termine: {
        include: { leistungen: { include: { leistung: true } }, mitarbeiter: true },
        orderBy: { startzeit: "desc" },
      },
      rechnungen: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!kunde) notFound();

  const daysLeft = daysUntilBirthday(kunde.geburtstag);

  return (
    <div>
      <PageHeader
        title={`${kunde.vorname} ${kunde.nachname}`}
        action={
          <div className="flex gap-2">
            <Link
              href={`/termine/neu?kundeId=${kunde.id}`}
              className="flex items-center gap-1.5 border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50"
            >
              <CalendarPlus size={15} /> Termin buchen
            </Link>
            <Link
              href={`/kunden/${kunde.id}/bearbeiten`}
              className="flex items-center gap-1.5 bg-primary text-white px-3 py-1.5 rounded-lg text-sm hover:bg-primary/90"
            >
              <Pencil size={14} /> Bearbeiten
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
            <h2 className="font-semibold text-gray-900 text-sm mb-3">Kontaktdaten</h2>
            {kunde.telefon && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Phone size={14} className="text-gray-400" />
                {kunde.telefon}
              </div>
            )}
            {kunde.email && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Mail size={14} className="text-gray-400" />
                {kunde.email}
              </div>
            )}
            {kunde.geburtstag && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Cake size={14} className="text-gray-400" />
                {formatDate(kunde.geburtstag)}
                {daysLeft !== null && daysLeft <= 14 && (
                  <span className="text-xs text-pink-600 font-medium">
                    {daysLeft === 0 ? "🎉 Heute!" : `in ${daysLeft} Tagen`}
                  </span>
                )}
              </div>
            )}
            {kunde.notizen && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 font-medium mb-1">Notizen</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{kunde.notizen}</p>
              </div>
            )}
            <p className="text-xs text-gray-400 pt-2 border-t border-gray-100">
              Seit {formatDate(kunde.createdAt)}
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-900 text-sm">Termine ({kunde.termine.length})</h2>
              <Link href={`/termine/neu?kundeId=${kunde.id}`} className="flex items-center gap-1 text-xs text-primary hover:underline">
                <Plus size={13} /> Termin buchen
              </Link>
            </div>
            <div className="space-y-2">
              {kunde.termine.slice(0, 10).map((t) => (
                <Link
                  key={t.id}
                  href={`/termine/${t.id}`}
                  className="block bg-white rounded-lg border border-gray-100 px-4 py-3 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-900">{formatDateTime(t.startzeit)}</span>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {t.leistungen.map((tl) => tl.leistung.name).join(", ")}
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        t.status === "ABGESCHLOSSEN" ? "bg-green-100 text-green-700" :
                        t.status === "BESTAETIGT" ? "bg-yellow-100 text-yellow-700" :
                        t.status === "STORNIERT" ? "bg-red-100 text-red-700" :
                        "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {TERMIN_STATUS_LABELS[t.status as keyof typeof TERMIN_STATUS_LABELS] ?? t.status}
                    </span>
                  </div>
                </Link>
              ))}
              {kunde.termine.length === 0 && (
                <p className="text-sm text-gray-400 py-2">Noch keine Termine.</p>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-900 text-sm">Rechnungen ({kunde.rechnungen.length})</h2>
              <Link href={`/rechnungen/neu?kundeId=${kunde.id}`} className="flex items-center gap-1 text-xs text-primary hover:underline">
                <Plus size={13} /> Rechnung erstellen
              </Link>
            </div>
            <div className="space-y-2">
              {kunde.rechnungen.slice(0, 10).map((r) => (
                <Link
                  key={r.id}
                  href={`/rechnungen/${r.id}`}
                  className="block bg-white rounded-lg border border-gray-100 px-4 py-3 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-900">{r.rechnungsnummer}</span>
                      <span className="text-xs text-gray-500 ml-2">{formatDate(r.ausstellungsDatum)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{formatCurrency(r.gesamtbetrag)}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          r.status === "BEZAHLT" ? "bg-green-100 text-green-700" :
                          r.status === "STORNIERT" ? "bg-red-100 text-red-700" :
                          "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {RECHNUNG_STATUS_LABELS[r.status as keyof typeof RECHNUNG_STATUS_LABELS] ?? r.status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
              {kunde.rechnungen.length === 0 && (
                <p className="text-sm text-gray-400 py-2">Noch keine Rechnungen.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
