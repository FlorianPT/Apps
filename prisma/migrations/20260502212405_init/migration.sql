-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MITARBEITER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Kunde" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vorname" TEXT NOT NULL,
    "nachname" TEXT NOT NULL,
    "email" TEXT,
    "telefon" TEXT,
    "geburtstag" DATETIME,
    "notizen" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Leistung" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "beschreibung" TEXT,
    "dauer" INTEGER NOT NULL,
    "preis" REAL NOT NULL,
    "aktiv" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Termin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "startzeit" DATETIME NOT NULL,
    "endzeit" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'GEPLANT',
    "notizen" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "kundeId" TEXT NOT NULL,
    "mitarbeiterId" TEXT,
    CONSTRAINT "Termin_kundeId_fkey" FOREIGN KEY ("kundeId") REFERENCES "Kunde" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Termin_mitarbeiterId_fkey" FOREIGN KEY ("mitarbeiterId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TerminLeistung" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "terminId" TEXT NOT NULL,
    "leistungId" TEXT NOT NULL,
    "preisSnapshot" REAL NOT NULL,
    CONSTRAINT "TerminLeistung_terminId_fkey" FOREIGN KEY ("terminId") REFERENCES "Termin" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TerminLeistung_leistungId_fkey" FOREIGN KEY ("leistungId") REFERENCES "Leistung" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Rechnung" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rechnungsnummer" TEXT NOT NULL,
    "ausstellungsDatum" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "faelligkeitsDatum" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'OFFEN',
    "zahlungsart" TEXT,
    "gesamtbetrag" REAL NOT NULL,
    "notizen" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "kundeId" TEXT NOT NULL,
    "terminId" TEXT,
    CONSTRAINT "Rechnung_kundeId_fkey" FOREIGN KEY ("kundeId") REFERENCES "Kunde" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Rechnung_terminId_fkey" FOREIGN KEY ("terminId") REFERENCES "Termin" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RechnungsPosten" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bezeichnung" TEXT NOT NULL,
    "menge" INTEGER NOT NULL DEFAULT 1,
    "einzelpreis" REAL NOT NULL,
    "gesamtpreis" REAL NOT NULL,
    "rechnungId" TEXT NOT NULL,
    "leistungId" TEXT,
    CONSTRAINT "RechnungsPosten_rechnungId_fkey" FOREIGN KEY ("rechnungId") REFERENCES "Rechnung" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RechnungsPosten_leistungId_fkey" FOREIGN KEY ("leistungId") REFERENCES "Leistung" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TerminLeistung_terminId_leistungId_key" ON "TerminLeistung"("terminId", "leistungId");

-- CreateIndex
CREATE UNIQUE INDEX "Rechnung_rechnungsnummer_key" ON "Rechnung"("rechnungsnummer");

-- CreateIndex
CREATE UNIQUE INDEX "Rechnung_terminId_key" ON "Rechnung"("terminId");
