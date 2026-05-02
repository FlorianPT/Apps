import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/PageHeader";
import { LeistungenTabelle } from "@/components/leistungen/LeistungenTabelle";

export default async function LeistungenPage() {
  const leistungen = await prisma.leistung.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <PageHeader
        title="Leistungen"
        description="Behandlungen und Preise verwalten"
        action={
          <Link
            href="/leistungen/neu"
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus size={16} />
            Neue Leistung
          </Link>
        }
      />
      <LeistungenTabelle leistungen={leistungen} />
    </div>
  );
}
