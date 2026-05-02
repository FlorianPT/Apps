import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatDate, formatCurrency } from "@/lib/utils";
import { RECHNUNG_STATUS_LABELS } from "@/types";

export default async function RechnungenPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const status = searchParams.status;
  const rechnungen = await prisma.rechnung.findMany({
    where: status ? { status } : {},
    include: { kunde: true },
    orderBy: { createdAt: "desc" },
  });

  const tabs = [
    { label: "Alle", value: undefined },
    { label: "Offen", value: "OFFEN" },
    { label: "Bezahlt", value: "BEZAHLT" },
    { label: "Storniert", value: "STORNIERT" },
  ];

  return (
    <div>
      <PageHeader
        title="Rechnungen"
        action={
          <Link
            href="/rechnungen/neu"
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus size={16} />
            Neue Rechnung
          </Link>
        }
      />

      <div className="flex gap-2 mb-4">
        {tabs.map((tab) => (
          <Link
            key={tab.label}
            href={tab.value ? `/rechnungen?status=${tab.value}` : "/rechnungen"}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              status === tab.value || (!status && !tab.value)
                ? "bg-primary text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 text-left">Nummer</th>
              <th className="px-4 py-3 text-left">Kundin</th>
              <th className="px-4 py-3 text-left">Datum</th>
              <th className="px-4 py-3 text-right">Betrag</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rechnungen.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium">
                  <Link href={`/rechnungen/${r.id}`} className="text-primary hover:underline">
                    {r.rechnungsnummer}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-700">
                  <Link href={`/kunden/${r.kundeId}`} className="hover:text-primary">
                    {r.kunde.vorname} {r.kunde.nachname}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-600">{formatDate(r.ausstellungsDatum)}</td>
                <td className="px-4 py-3 text-right font-semibold">{formatCurrency(r.gesamtbetrag)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                      r.status === "BEZAHLT" ? "bg-green-100 text-green-700" :
                      r.status === "STORNIERT" ? "bg-red-100 text-red-700" :
                      "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {RECHNUNG_STATUS_LABELS[r.status as keyof typeof RECHNUNG_STATUS_LABELS] ?? r.status}
                  </span>
                </td>
              </tr>
            ))}
            {rechnungen.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  Keine Rechnungen gefunden.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
