import { PageHeader } from "@/components/layout/PageHeader";
import { TerminKalender } from "@/components/termine/TerminKalender";

export default function TerminePage() {
  return (
    <div>
      <PageHeader title="Termine" description="Kalenderübersicht" />
      <TerminKalender />
    </div>
  );
}
