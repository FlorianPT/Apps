"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDate, daysUntilBirthday } from "@/lib/utils";
import { Search, Pencil, Trash2, Eye, Cake } from "lucide-react";

interface Kunde {
  id: string;
  vorname: string;
  nachname: string;
  email: string | null;
  telefon: string | null;
  geburtstag: string | null;
  _count: { termine: number };
}

export function KundenTabelle({ kunden: initial }: { kunden: Kunde[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filtered = initial.filter((k) => {
    const q = search.toLowerCase();
    return (
      k.vorname.toLowerCase().includes(q) ||
      k.nachname.toLowerCase().includes(q) ||
      (k.email ?? "").toLowerCase().includes(q) ||
      (k.telefon ?? "").includes(q)
    );
  });

  async function handleDelete(id: string, name: string) {
    if (!confirm(`${name} wirklich löschen?`)) return;
    await fetch(`/api/kunden/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div>
      <div className="mb-4 relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Kunden suchen…"
          className="w-full max-w-sm border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Telefon</th>
              <th className="px-4 py-3 text-left">E-Mail</th>
              <th className="px-4 py-3 text-left">Geburtstag</th>
              <th className="px-4 py-3 text-left">Termine</th>
              <th className="px-4 py-3 text-right">Aktionen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((k) => {
              const daysLeft = daysUntilBirthday(k.geburtstag);
              return (
                <tr key={k.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    <Link href={`/kunden/${k.id}`} className="hover:text-primary">
                      {k.vorname} {k.nachname}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{k.telefon ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{k.email ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">
                    <div className="flex items-center gap-1.5">
                      {k.geburtstag ? formatDate(k.geburtstag) : "—"}
                      {daysLeft !== null && daysLeft <= 14 && (
                        <span className="flex items-center gap-0.5 text-xs text-pink-600 font-medium">
                          <Cake size={12} />
                          {daysLeft === 0 ? "Heute!" : `in ${daysLeft}d`}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{k._count.termine}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Link
                        href={`/kunden/${k.id}`}
                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded"
                      >
                        <Eye size={14} />
                      </Link>
                      <Link
                        href={`/kunden/${k.id}/bearbeiten`}
                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded"
                      >
                        <Pencil size={14} />
                      </Link>
                      <button
                        onClick={() => handleDelete(k.id, `${k.vorname} ${k.nachname}`)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  Keine Kunden gefunden.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
