import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Nicht autorisiert" }, { status: 401 });

  const termin = await prisma.termin.findUnique({
    where: { id: params.id },
    include: {
      kunde: true,
      mitarbeiter: true,
      leistungen: { include: { leistung: true } },
      rechnung: { include: { posten: true } },
    },
  });
  if (!termin) return Response.json({ error: "Nicht gefunden" }, { status: 404 });
  return Response.json(termin);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Nicht autorisiert" }, { status: 401 });

  const body = await req.json();
  const { status, notizen, mitarbeiterId } = body;

  const termin = await prisma.termin.update({
    where: { id: params.id },
    data: {
      ...(status !== undefined && { status }),
      ...(notizen !== undefined && { notizen }),
      ...(mitarbeiterId !== undefined && { mitarbeiterId }),
    },
    include: {
      kunde: true,
      leistungen: { include: { leistung: true } },
      rechnung: true,
    },
  });
  return Response.json(termin);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Nicht autorisiert" }, { status: 401 });

  await prisma.termin.delete({ where: { id: params.id } });
  return Response.json({ ok: true });
}
