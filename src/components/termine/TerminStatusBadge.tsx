import { TERMIN_STATUS_LABELS, type TerminStatus } from "@/types";
import { cn } from "@/lib/utils";

const statusStyles: Record<TerminStatus, string> = {
  GEPLANT: "bg-blue-100 text-blue-700",
  BESTAETIGT: "bg-yellow-100 text-yellow-700",
  ABGESCHLOSSEN: "bg-green-100 text-green-700",
  STORNIERT: "bg-red-100 text-red-700",
};

export function TerminStatusBadge({ status }: { status: string }) {
  const s = status as TerminStatus;
  return (
    <span className={cn("text-xs px-2.5 py-0.5 rounded-full font-medium", statusStyles[s] ?? "bg-gray-100 text-gray-600")}>
      {TERMIN_STATUS_LABELS[s] ?? status}
    </span>
  );
}
