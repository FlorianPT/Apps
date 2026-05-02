import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminHash = await bcrypt.hash("admin123", 12);
  const janaHash = await bcrypt.hash("jana123", 12);

  await prisma.user.upsert({
    where: { email: "admin@studio.de" },
    update: {},
    create: {
      id: "user-admin-001",
      name: "Sarah Müller",
      email: "admin@studio.de",
      passwordHash: adminHash,
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "jana@studio.de" },
    update: {},
    create: {
      id: "user-jana-001",
      name: "Jana Schmidt",
      email: "jana@studio.de",
      passwordHash: janaHash,
      role: "MITARBEITER",
    },
  });

  const l1 = await prisma.leistung.upsert({
    where: { id: "leis-001" },
    update: {},
    create: { id: "leis-001", name: "Klassische Gesichtsbehandlung", beschreibung: "Tiefenreinigung, Peeling, Maske", dauer: 60, preis: 65.0 },
  });
  const l2 = await prisma.leistung.upsert({
    where: { id: "leis-002" },
    update: {},
    create: { id: "leis-002", name: "Microneedling", beschreibung: "Hautstraffung und Verjüngung", dauer: 75, preis: 120.0 },
  });
  await prisma.leistung.upsert({
    where: { id: "leis-003" },
    update: {},
    create: { id: "leis-003", name: "Augenbrauen Styling", beschreibung: "Zupfen, Färben, Formen", dauer: 30, preis: 35.0 },
  });
  await prisma.leistung.upsert({
    where: { id: "leis-004" },
    update: {},
    create: { id: "leis-004", name: "Wimpernverlängerung Klassisch", beschreibung: "Einzelwimpern in klassischer Technik", dauer: 120, preis: 85.0 },
  });
  await prisma.leistung.upsert({
    where: { id: "leis-005" },
    update: {},
    create: { id: "leis-005", name: "Peeling Behandlung", beschreibung: "Fruchtsäure- oder Enzympeeling", dauer: 45, preis: 55.0 },
  });

  const k1 = await prisma.kunde.upsert({
    where: { id: "kund-001" },
    update: {},
    create: {
      id: "kund-001",
      vorname: "Maria",
      nachname: "Weber",
      email: "maria.weber@example.de",
      telefon: "0151 23456789",
      geburtstag: new Date("1985-03-15"),
      notizen: "Empfindliche Haut, keine Parfümstoffe",
    },
  });

  const k2 = await prisma.kunde.upsert({
    where: { id: "kund-002" },
    update: {},
    create: {
      id: "kund-002",
      vorname: "Anna",
      nachname: "Fischer",
      email: "anna.fischer@example.de",
      telefon: "0176 98765432",
      geburtstag: new Date("1992-07-22"),
    },
  });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);
  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setMinutes(tomorrowEnd.getMinutes() + 60);

  const existingTermin = await prisma.termin.findFirst({ where: { kundeId: k1.id } });
  if (!existingTermin) {
    const termin = await prisma.termin.create({
      data: {
        startzeit: tomorrow,
        endzeit: tomorrowEnd,
        status: "BESTAETIGT",
        kundeId: k1.id,
        mitarbeiterId: "user-admin-001",
        leistungen: {
          create: [{ leistungId: l1.id, preisSnapshot: l1.preis }],
        },
      },
    });

    const today = new Date();
    today.setHours(11, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setMinutes(todayEnd.getMinutes() + 75);

    const terminHeute = await prisma.termin.create({
      data: {
        startzeit: today,
        endzeit: todayEnd,
        status: "GEPLANT",
        kundeId: k2.id,
        mitarbeiterId: "user-jana-001",
        leistungen: {
          create: [{ leistungId: l2.id, preisSnapshot: l2.preis }],
        },
      },
    });

    const existingRechnung = await prisma.rechnung.findFirst({ where: { kundeId: k1.id } });
    if (!existingRechnung) {
      await prisma.rechnung.create({
        data: {
          rechnungsnummer: "RE-2024-0001",
          status: "BEZAHLT",
          zahlungsart: "BAR",
          gesamtbetrag: 65.0,
          kundeId: k1.id,
          posten: {
            create: [{
              bezeichnung: "Klassische Gesichtsbehandlung",
              menge: 1,
              einzelpreis: 65.0,
              gesamtpreis: 65.0,
              leistungId: l1.id,
            }],
          },
        },
      });
    }
  }

  console.log("✅ Seed abgeschlossen.");
  console.log("   Login: admin@studio.de / admin123");
  console.log("   Login: jana@studio.de  / jana123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
