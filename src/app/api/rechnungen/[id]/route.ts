import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Nicht autorisiert" }, { status: 401 });

  const rechnung = await prisma.rechnung.findUnique({
    where: { id: params.id },
    include: {
      kunde: true,
      posten: { include: { leistung: true } },
      termin: { include: { leistungen: { include: { leistung: true } } } },
    },
  });
  if (!rechnung) return Response.json({ error: "Nicht gefunden" }, { status: 404 });
  return Response.json(rechnung);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Nicht autorisiert" }, { status: 401 });

  const body = await req.json();
  const { status, zahlungsart, notizen } = body;

  const rechnung = await prisma.rechnung.update({
    where: { id: params.id },
    data: {
      ...(status !== undefined && { status }),
      ...(zahlungsart !== undefined && { zahlungsart }),
      ...(notizen !== undefined && { notizen }),
    },
    include: { posten: true, kunde: true },
  });
  return Response.json(rechnung);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Nicht autorisiert" }, { status: 401 });

  await prisma.rechnung.delete({ where: { id: params.id } });
  return Response.json({ ok: true });
}
