import { PageHeader } from "@/components/layout/PageHeader";
import { KundenFormular } from "@/components/kunden/KundenFormular";

export default function NeueKundinPage() {
  return (
    <div>
      <PageHeader title="Neue Kundin" />
      <KundenFormular />
    </div>
  );
}
