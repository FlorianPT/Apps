import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/PageHeader";
import { KundenFormular } from "@/components/kunden/KundenFormular";
import { format } from "date-fns";

export default async function KundeBearbeitenPage({ params }: { params: { id: string } }) {
  const kunde = await prisma.kunde.findUnique({ where: { id: params.id } });
  if (!kunde) notFound();

  return (
    <div>
      <PageHeader title={`${kunde.vorname} ${kunde.nachname} bearbeiten`} />
      <KundenFormular
        kundeId={kunde.id}
        defaultValues={{
          vorname: kunde.vorname,
          nachname: kunde.nachname,
          email: kunde.email ?? "",
          telefon: kunde.telefon ?? "",
          geburtstag: kunde.geburtstag ? format(new Date(kunde.geburtstag), "yyyy-MM-dd") : "",
          notizen: kunde.notizen ?? "",
        }}
      />
    </div>
  );
}
