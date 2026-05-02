import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Nicht autorisiert" }, { status: 401 });

  const datum = req.nextUrl.searchParams.get("datum");
  const von = req.nextUrl.searchParams.get("von");
  const bis = req.nextUrl.searchParams.get("bis");

  const where: Record<string, unknown> = {};
  if (datum) {
    const d = new Date(datum);
    const start = new Date(d); start.setHours(0, 0, 0, 0);
    const end = new Date(d); end.setHours(23, 59, 59, 999);
    where.startzeit = { gte: start, lte: end };
  } else if (von && bis) {
    where.startzeit = { gte: new Date(von), lte: new Date(bis) };
  }

  const termine = await prisma.termin.findMany({
    where,
    include: {
      kunde: true,
      mitarbeiter: true,
      leistungen: { include: { leistung: true } },
      rechnung: true,
    },
    orderBy: { startzeit: "asc" },
  });
  return Response.json(termine);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Nicht autorisiert" }, { status: 401 });

  const body = await req.json();
  const { kundeId, mitarbeiterId, startzeit, endzeit, notizen, leistungIds, status } = body;

  if (!kundeId || !startzeit || !endzeit) {
    return Response.json({ error: "Kundin, Startzeit und Endzeit sind Pflichtfelder" }, { status: 400 });
  }

  const leistungen = leistungIds?.length
    ? await prisma.leistung.findMany({ where: { id: { in: leistungIds } } })
    : [];

  const termin = await prisma.termin.create({
    data: {
      kundeId,
      mitarbeiterId: mitarbeiterId || null,
      startzeit: new Date(startzeit),
      endzeit: new Date(endzeit),
      notizen: notizen || null,
      status: status ?? "GEPLANT",
      leistungen: {
        create: leistungen.map((l) => ({
          leistungId: l.id,
          preisSnapshot: l.preis,
        })),
      },
    },
    include: {
      kunde: true,
      leistungen: { include: { leistung: true } },
    },
  });
  return Response.json(termin, { status: 201 });
}
