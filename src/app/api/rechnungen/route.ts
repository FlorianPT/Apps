import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

async function generateRechnungsnummer(): Promise<string> {
  const last = await prisma.rechnung.findFirst({
    orderBy: { createdAt: "desc" },
    select: { rechnungsnummer: true },
  });
  const year = new Date().getFullYear();
  let nextNum = 1;
  if (last) {
    const parts = last.rechnungsnummer.split("-");
    const lastNum = parseInt(parts[2] ?? "0");
    const lastYear = parseInt(parts[1] ?? "0");
    nextNum = lastYear === year ? lastNum + 1 : 1;
  }
  return `RE-${year}-${String(nextNum).padStart(4, "0")}`;
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Nicht autorisiert" }, { status: 401 });

  const status = req.nextUrl.searchParams.get("status");
  const rechnungen = await prisma.rechnung.findMany({
    where: status ? { status } : {},
    include: { kunde: true, posten: true },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(rechnungen);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Nicht autorisiert" }, { status: 401 });

  const body = await req.json();
  const { kundeId, terminId, posten, notizen, zahlungsart } = body;

  if (!kundeId || !posten?.length) {
    return Response.json({ error: "Kundin und mindestens ein Posten sind Pflichtfelder" }, { status: 400 });
  }

  const gesamtbetrag = posten.reduce(
    (sum: number, p: { gesamtpreis: number }) => sum + p.gesamtpreis,
    0
  );

  const rechnungsnummer = await generateRechnungsnummer();

  const rechnung = await prisma.rechnung.create({
    data: {
      rechnungsnummer,
      kundeId,
      terminId: terminId || null,
      gesamtbetrag,
      notizen: notizen || null,
      zahlungsart: zahlungsart || null,
      posten: {
        create: posten.map((p: {
          bezeichnung: string;
          menge: number;
          einzelpreis: number;
          gesamtpreis: number;
          leistungId?: string;
        }) => ({
          bezeichnung: p.bezeichnung,
          menge: p.menge,
          einzelpreis: p.einzelpreis,
          gesamtpreis: p.gesamtpreis,
          leistungId: p.leistungId || null,
        })),
      },
    },
    include: { posten: true, kunde: true },
  });
  return Response.json(rechnung, { status: 201 });
}
