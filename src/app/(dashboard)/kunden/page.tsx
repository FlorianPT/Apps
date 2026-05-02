import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/PageHeader";
import { KundenTabelle } from "@/components/kunden/KundenTabelle";

export default async function KundenPage() {
  const kunden = await prisma.kunde.findMany({
    orderBy: [{ nachname: "asc" }, { vorname: "asc" }],
    include: { _count: { select: { termine: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Kunden"
        description={`${kunden.length} Kund${kunden.length === 1 ? "in" : "innen"} gesamt`}
        action={
          <Link
            href="/kunden/neu"
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus size={16} />
            Neue Kundin
          </Link>
        }
      />
      <KundenTabelle kunden={kunden as Parameters<typeof KundenTabelle>[0]["kunden"]} />
    </div>
  );
}
