"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface KundeFormData {
  vorname: string;
  nachname: string;
  email: string;
  telefon: string;
  geburtstag: string;
  notizen: string;
}

interface Props {
  defaultValues?: Partial<KundeFormData>;
  kundeId?: string;
}

export function KundenFormular({ defaultValues, kundeId }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<KundeFormData>({
    vorname: defaultValues?.vorname ?? "",
    nachname: defaultValues?.nachname ?? "",
    email: defaultValues?.email ?? "",
    telefon: defaultValues?.telefon ?? "",
    geburtstag: defaultValues?.geburtstag ?? "",
    notizen: defaultValues?.notizen ?? "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const url = kundeId ? `/api/kunden/${kundeId}` : "/api/kunden";
    const method = kundeId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/kunden/${kundeId ?? data.id}`);
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "Fehler beim Speichern");
      setLoading(false);
    }
  }

  const backHref = kundeId ? `/kunden/${kundeId}` : "/kunden";

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 max-w-lg">
      <div className="flex justify-end mb-4">
        <Link href={backHref} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft size={16} /> Zurück
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vorname *</label>
            <input
              value={form.vorname}
              onChange={(e) => setForm({ ...form, vorname: e.target.value })}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nachname *</label>
            <input
              value={form.nachname}
              onChange={(e) => setForm({ ...form, nachname: e.target.value })}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
          <input
            value={form.telefon}
            onChange={(e) => setForm({ ...form, telefon: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Geburtstag</label>
          <input
            type="date"
            value={form.geburtstag}
            onChange={(e) => setForm({ ...form, geburtstag: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notizen</label>
          <textarea
            value={form.notizen}
            onChange={(e) => setForm({ ...form, notizen: e.target.value })}
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="z.B. Allergien, Besonderheiten…"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white rounded-lg py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? "Speichern…" : kundeId ? "Änderungen speichern" : "Kunden anlegen"}
        </button>
      </form>
    </div>
  );
}
