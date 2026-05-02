import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Nicht autorisiert" }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q") ?? "";
  const kunden = await prisma.kunde.findMany({
    where: q
      ? {
          OR: [
            { vorname: { contains: q } },
            { nachname: { contains: q } },
            { email: { contains: q } },
            { telefon: { contains: q } },
          ],
        }
      : {},
    orderBy: [{ nachname: "asc" }, { vorname: "asc" }],
    include: {
      _count: { select: { termine: true } },
    },
  });
  return Response.json(kunden);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Nicht autorisiert" }, { status: 401 });

  const body = await req.json();
  const { vorname, nachname, email, telefon, geburtstag, notizen } = body;

  if (!vorname || !nachname) {
    return Response.json({ error: "Vor- und Nachname sind Pflichtfelder" }, { status: 400 });
  }

  const kunde = await prisma.kunde.create({
    data: {
      vorname,
      nachname,
      email: email || null,
      telefon: telefon || null,
      geburtstag: geburtstag ? new Date(geburtstag) : null,
      notizen: notizen || null,
    },
  });
  return Response.json(kunde, { status: 201 });
}
