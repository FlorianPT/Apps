"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { Pencil, Trash2, Check, X } from "lucide-react";
import type { Leistung } from "@prisma/client";

interface Props {
  leistungen: Leistung[];
}

export function LeistungenTabelle({ leistungen: initial }: Props) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Leistung>>({});

  async function saveEdit(id: string) {
    const res = await fetch(`/api/leistungen/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editData),
    });
    if (res.ok) {
      const updated = await res.json();
      setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
      setEditId(null);
    }
  }

  async function toggleAktiv(id: string, aktiv: boolean) {
    const res = await fetch(`/api/leistungen/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aktiv: !aktiv }),
    });
    if (res.ok) {
      const updated = await res.json();
      setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Leistung wirklich löschen?")) return;
    const res = await fetch(`/api/leistungen/${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      router.refresh();
    }
  }

  function startEdit(item: Leistung) {
    setEditId(item.id);
    setEditData({ name: item.name, dauer: item.dauer, preis: item.preis, beschreibung: item.beschreibung ?? "" });
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
          <tr>
            <th className="px-4 py-3 text-left">Bezeichnung</th>
            <th className="px-4 py-3 text-left">Dauer</th>
            <th className="px-4 py-3 text-left">Preis</th>
            <th className="px-4 py-3 text-left">Aktiv</th>
            <th className="px-4 py-3 text-right">Aktionen</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {items.map((item) =>
            editId === item.id ? (
              <tr key={item.id} className="bg-yellow-50">
                <td className="px-4 py-2">
                  <input
                    value={editData.name ?? ""}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="border rounded px-2 py-1 text-sm w-full"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    value={editData.dauer ?? ""}
                    onChange={(e) => setEditData({ ...editData, dauer: Number(e.target.value) })}
                    className="border rounded px-2 py-1 text-sm w-20"
                  />
                  <span className="ml-1 text-gray-500">min</span>
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    step="0.01"
                    value={editData.preis ?? ""}
                    onChange={(e) => setEditData({ ...editData, preis: Number(e.target.value) })}
                    className="border rounded px-2 py-1 text-sm w-24"
                  />
                  <span className="ml-1 text-gray-500">€</span>
                </td>
                <td className="px-4 py-2">—</td>
                <td className="px-4 py-2 text-right flex justify-end gap-2">
                  <button onClick={() => saveEdit(item.id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded">
                    <Check size={15} />
                  </button>
                  <button onClick={() => setEditId(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded">
                    <X size={15} />
                  </button>
                </td>
              </tr>
            ) : (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">
                  {item.name}
                  {item.beschreibung && (
                    <span className="block text-xs text-gray-400 font-normal">{item.beschreibung}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-600">{item.dauer} min</td>
                <td className="px-4 py-3 text-gray-900 font-medium">{formatCurrency(item.preis)}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleAktiv(item.id, item.aktiv)}
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      item.aktiv
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {item.aktiv ? "Aktiv" : "Inaktiv"}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => startEdit(item)}
                      className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            )
          )}
          {items.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                Noch keine Leistungen angelegt.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
