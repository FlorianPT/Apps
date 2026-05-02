import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Nicht autorisiert" }, { status: 401 });

  const body = await req.json();
  const { name, beschreibung, dauer, preis, aktiv } = body;

  const leistung = await prisma.leistung.update({
    where: { id: params.id },
    data: {
      ...(name !== undefined && { name }),
      ...(beschreibung !== undefined && { beschreibung }),
      ...(dauer !== undefined && { dauer: Number(dauer) }),
      ...(preis !== undefined && { preis: Number(preis) }),
      ...(aktiv !== undefined && { aktiv }),
    },
  });
  return Response.json(leistung);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Nicht autorisiert" }, { status: 401 });

  await prisma.leistung.delete({ where: { id: params.id } });
  return Response.json({ ok: true });
}
