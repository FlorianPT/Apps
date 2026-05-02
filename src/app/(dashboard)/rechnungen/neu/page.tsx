import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/PageHeader";
import { RechnungFormular } from "@/components/rechnungen/RechnungFormular";

export default async function NeueRechnungPage({
  searchParams,
}: {
  searchParams: { kundeId?: string; terminId?: string };
}) {
  const leistungen = await prisma.leistung.findMany({
    where: { aktiv: true },
    orderBy: { name: "asc" },
  });

  let defaultKundeId = searchParams.kundeId;
  let defaultTerminId = searchParams.terminId;
  let defaultPosten: { bezeichnung: string; menge: number; einzelpreis: number; gesamtpreis: number; leistungId?: string }[] = [];
  let defaultKundeName = "";

  if (defaultTerminId) {
    const termin = await prisma.termin.findUnique({
      where: { id: defaultTerminId },
      include: {
        kunde: true,
        leistungen: { include: { leistung: true } },
      },
    });
    if (termin) {
      defaultKundeId = termin.kundeId;
      defaultKundeName = `${termin.kunde.vorname} ${termin.kunde.nachname}`;
      defaultPosten = termin.leistungen.map((tl) => ({
        bezeichnung: tl.leistung.name,
        menge: 1,
        einzelpreis: tl.preisSnapshot,
        gesamtpreis: tl.preisSnapshot,
        leistungId: tl.leistungId,
      }));
    }
  }

  return (
    <div>
      <PageHeader title="Neue Rechnung" />
      <RechnungFormular
        leistungen={leistungen}
        defaultKundeId={defaultKundeId}
        defaultTerminId={defaultTerminId}
        defaultPosten={defaultPosten.length ? defaultPosten : undefined}
        defaultKundeName={defaultKundeName || undefined}
      />
    </div>
  );
}
