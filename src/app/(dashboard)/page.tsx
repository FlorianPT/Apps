import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatTime, formatCurrency, daysUntilBirthday } from "@/lib/utils";
import { TerminStatusBadge } from "@/components/termine/TerminStatusBadge";
import { Users, CalendarDays, Receipt, Cake, Plus } from "lucide-react";

export default async function DashboardPage() {
  const today = new Date();
  const startOfDay = new Date(today); startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today); endOfDay.setHours(23, 59, 59, 999);

  const [termineHeute, offeneRechnungen, kundenGesamt, kundenMitGeburtstag] = await Promise.all([
    prisma.termin.findMany({
      where: { startzeit: { gte: startOfDay, lte: endOfDay } },
      include: {
        kunde: true,
        leistungen: { include: { leistung: true } },
        mitarbeiter: true,
      },
      orderBy: { startzeit: "asc" },
    }),
    prisma.rechnung.count({ where: { status: "OFFEN" } }),
    prisma.kunde.count(),
    prisma.kunde.findMany({
      where: { geburtstag: { not: null } },
      select: { id: true, vorname: true, nachname: true, geburtstag: true },
    }),
  ]);

  const geburtstageNaechste14Tage = kundenMitGeburtstag
    .map((k) => ({ ...k, daysLeft: daysUntilBirthday(k.geburtstag) }))
    .filter((k) => k.daysLeft !== null && k.daysLeft <= 14)
    .sort((a, b) => (a.daysLeft ?? 99) - (b.daysLeft ?? 99));

  const umsatzHeute = termineHeute
    .filter((t) => t.status === "ABGESCHLOSSEN")
    .reduce((sum, t) => sum + t.leistungen.reduce((s, tl) => s + tl.preisSnapshot, 0), 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Guten Tag! 👋</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          {today.toLocaleDateString("de-DE", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-1">
            <CalendarDays size={16} className="text-blue-500" />
            <span className="text-xs text-gray-500">Heute</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{termineHeute.length}</p>
          <p className="text-xs text-gray-400">Termine</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Receipt size={16} className="text-orange-500" />
            <span className="text-xs text-gray-500">Offen</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{offeneRechnungen}</p>
          <p className="text-xs text-gray-400">Rechnungen</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users size={16} className="text-purple-500" />
            <span className="text-xs text-gray-500">Gesamt</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{kundenGesamt}</p>
          <p className="text-xs text-gray-400">Kundinnen</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Receipt size={16} className="text-green-500" />
            <span className="text-xs text-gray-500">Heute</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(umsatzHeute)}</p>
          <p className="text-xs text-gray-400">Umsatz</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm text-gray-900">Heutige Termine ({termineHeute.length})</h2>
            <Link href="/termine/neu" className="flex items-center gap-1 text-xs text-primary hover:underline">
              <Plus size={13} /> Termin anlegen
            </Link>
          </div>
          {termineHeute.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 py-10 text-center">
              <CalendarDays size={32} className="text-gray-200 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Heute keine Termine.</p>
              <Link href="/termine/neu" className="mt-2 inline-block text-xs text-primary hover:underline">
                Termin anlegen
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {termineHeute.map((t) => (
                <Link
                  key={t.id}
                  href={`/termine/${t.id}`}
                  className="block bg-white rounded-xl border border-gray-100 px-4 py-3 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatTime(t.startzeit)} – {formatTime(t.endzeit)}
                        </span>
                        <TerminStatusBadge status={t.status} />
                      </div>
                      <p className="text-sm text-gray-700">{t.kunde.vorname} {t.kunde.nachname}</p>
                      <p className="text-xs text-gray-400">
                        {t.leistungen.map((tl) => tl.leistung.name).join(", ")}
                        {t.mitarbeiter && ` · ${t.mitarbeiter.name}`}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(t.leistungen.reduce((s, tl) => s + tl.preisSnapshot, 0))}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="font-semibold text-sm text-gray-900 mb-3">
            Geburtstage (nächste 14 Tage)
          </h2>
          {geburtstageNaechste14Tage.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 py-6 text-center">
              <Cake size={24} className="text-gray-200 mx-auto mb-1" />
              <p className="text-gray-400 text-xs">Keine Geburtstage in den nächsten 14 Tagen.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {geburtstageNaechste14Tage.map((k) => (
                <Link
                  key={k.id}
                  href={`/kunden/${k.id}`}
                  className="flex items-center justify-between bg-white rounded-xl border border-gray-100 px-4 py-3 hover:border-pink-200 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Cake size={14} className="text-pink-400" />
                    <span className="text-sm font-medium text-gray-900">
                      {k.vorname} {k.nachname}
                    </span>
                  </div>
                  <span className="text-xs text-pink-600 font-medium">
                    {k.daysLeft === 0 ? "🎉 Heute!" : `in ${k.daysLeft}d`}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
