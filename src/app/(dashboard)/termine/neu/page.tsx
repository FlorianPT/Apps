import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/PageHeader";
import { TerminFormular } from "@/components/termine/TerminFormular";

export default async function NeuerTerminPage({
  searchParams,
}: {
  searchParams: { kundeId?: string; datum?: string };
}) {
  const leistungen = await prisma.leistung.findMany({
    where: { aktiv: true },
    orderBy: { name: "asc" },
  });
  const mitarbeiter = await prisma.user.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <PageHeader title="Neuer Termin" />
      <TerminFormular
        leistungen={leistungen}
        mitarbeiter={mitarbeiter}
        defaultKundeId={searchParams.kundeId}
        defaultDate={searchParams.datum}
      />
    </div>
  );
}
