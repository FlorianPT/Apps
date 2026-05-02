export type TerminStatus = "GEPLANT" | "BESTAETIGT" | "ABGESCHLOSSEN" | "STORNIERT";
export type RechnungStatus = "OFFEN" | "BEZAHLT" | "STORNIERT";
export type Zahlungsart = "BAR" | "KARTE" | "UEBERWEISUNG";
export type UserRole = "ADMIN" | "MITARBEITER";

export const TERMIN_STATUS_LABELS: Record<TerminStatus, string> = {
  GEPLANT: "Geplant",
  BESTAETIGT: "Bestätigt",
  ABGESCHLOSSEN: "Abgeschlossen",
  STORNIERT: "Storniert",
};

export const RECHNUNG_STATUS_LABELS: Record<RechnungStatus, string> = {
  OFFEN: "Offen",
  BEZAHLT: "Bezahlt",
  STORNIERT: "Storniert",
};

export const ZAHLUNGSART_LABELS: Record<Zahlungsart, string> = {
  BAR: "Bar",
  KARTE: "Karte",
  UEBERWEISUNG: "Überweisung",
};
