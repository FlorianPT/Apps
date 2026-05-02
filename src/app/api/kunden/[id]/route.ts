import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Nicht autorisiert" }, { status: 401 });

  const kunde = await prisma.kunde.findUnique({
    where: { id: params.id },
    include: {
      termine: {
        include: { leistungen: { include: { leistung: true } }, mitarbeiter: true },
        orderBy: { startzeit: "desc" },
      },
      rechnungen: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!kunde) return Response.json({ error: "Nicht gefunden" }, { status: 404 });
  return Response.json(kunde);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Nicht autorisiert" }, { status: 401 });

  const body = await req.json();
  const { vorname, nachname, email, telefon, geburtstag, notizen } = body;

  const kunde = await prisma.kunde.update({
    where: { id: params.id },
    data: {
      vorname,
      nachname,
      email: email || null,
      telefon: telefon || null,
      geburtstag: geburtstag ? new Date(geburtstag) : null,
      notizen: notizen || null,
    },
  });
  return Response.json(kunde);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Nicht autorisiert" }, { status: 401 });

  await prisma.kunde.delete({ where: { id: params.id } });
  return Response.json({ ok: true });
}
