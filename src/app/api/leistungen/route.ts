import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Nicht autorisiert" }, { status: 401 });

  const nurAktiv = req.nextUrl.searchParams.get("nurAktiv") === "true";
  const leistungen = await prisma.leistung.findMany({
    where: nurAktiv ? { aktiv: true } : {},
    orderBy: { name: "asc" },
  });
  return Response.json(leistungen);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Nicht autorisiert" }, { status: 401 });

  const body = await req.json();
  const { name, beschreibung, dauer, preis } = body;

  if (!name || !dauer || preis === undefined) {
    return Response.json({ error: "Name, Dauer und Preis sind Pflichtfelder" }, { status: 400 });
  }

  const leistung = await prisma.leistung.create({
    data: { name, beschreibung, dauer: Number(dauer), preis: Number(preis) },
  });
  return Response.json(leistung, { status: 201 });
}
