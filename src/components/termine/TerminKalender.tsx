"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { format, addDays, startOfWeek, isSameDay, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import { formatTime, formatCurrency } from "@/lib/utils";
import { TerminStatusBadge } from "./TerminStatusBadge";

interface TerminItem {
  id: string;
  startzeit: string;
  endzeit: string;
  status: string;
  kunde: { vorname: string; nachname: string };
  leistungen: { leistung: { name: string; preis: number }; preisSnapshot: number }[];
}

export function TerminKalender() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [termine, setTermine] = useState<TerminItem[]>([]);
  const [loading, setLoading] = useState(false);
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    setLoading(true);
    const von = format(weekStart, "yyyy-MM-dd");
    const bis = format(addDays(weekStart, 6), "yyyy-MM-dd");
    fetch(`/api/termine?von=${von}T00:00:00&bis=${bis}T23:59:59`)
      .then((r) => r.json())
      .then((data) => { setTermine(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [weekStart.toISOString()]);

  const dayTermine = termine.filter((t) => isSameDay(parseISO(t.startzeit), selectedDate));

  const hours = Array.from({ length: 13 }, (_, i) => i + 8);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <button
            onClick={() => setSelectedDate((d) => addDays(d, -7))}
            className="p-1.5 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="font-semibold text-sm text-gray-900">
            {format(weekStart, "dd. MMM", { locale: de })} –{" "}
            {format(addDays(weekStart, 6), "dd. MMM yyyy", { locale: de })}
          </span>
          <button
            onClick={() => setSelectedDate((d) => addDays(d, 7))}
            className="p-1.5 hover:bg-gray-100 rounded-lg"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="grid grid-cols-7 divide-x divide-gray-100">
          {weekDays.map((day) => {
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            const count = termine.filter((t) => isSameDay(parseISO(t.startzeit), day)).length;
            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={`py-3 text-center transition-colors ${isSelected ? "bg-primary/10" : "hover:bg-gray-50"}`}
              >
                <div className={`text-xs font-medium mb-1 ${isToday ? "text-primary" : "text-gray-500"}`}>
                  {format(day, "EEE", { locale: de })}
                </div>
                <div
                  className={`text-sm font-bold w-7 h-7 rounded-full flex items-center justify-center mx-auto ${
                    isSelected ? "bg-primary text-white" : isToday ? "text-primary" : "text-gray-900"
                  }`}
                >
                  {format(day, "d")}
                </div>
                {count > 0 && (
                  <div className="mt-1 text-xs text-gray-400">{count}</div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-sm text-gray-900">
          {format(selectedDate, "EEEE, d. MMMM", { locale: de })}
          {isSameDay(selectedDate, new Date()) && (
            <span className="ml-2 text-xs text-primary font-normal">Heute</span>
          )}
        </h2>
        <Link
          href={`/termine/neu?datum=${format(selectedDate, "yyyy-MM-dd")}`}
          className="flex items-center gap-1.5 bg-primary text-white px-3 py-1.5 rounded-lg text-sm hover:bg-primary/90"
        >
          <Plus size={15} /> Neuer Termin
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400 py-4">Lade Termine…</p>
      ) : dayTermine.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 py-10 text-center">
          <p className="text-gray-400 text-sm">Keine Termine an diesem Tag.</p>
          <Link
            href={`/termine/neu?datum=${format(selectedDate, "yyyy-MM-dd")}`}
            className="mt-3 inline-flex items-center gap-1.5 text-primary text-sm hover:underline"
          >
            <Plus size={14} /> Termin anlegen
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {dayTermine.map((t) => (
            <Link
              key={t.id}
              href={`/termine/${t.id}`}
              className="block bg-white rounded-xl border border-gray-100 px-4 py-3 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-900">
                      {formatTime(t.startzeit)} – {formatTime(t.endzeit)}
                    </span>
                    <TerminStatusBadge status={t.status} />
                  </div>
                  <p className="text-sm text-gray-700 font-medium">
                    {t.kunde.vorname} {t.kunde.nachname}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {t.leistungen.map((tl) => tl.leistung.name).join(", ")}
                  </p>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(t.leistungen.reduce((s, tl) => s + tl.preisSnapshot, 0))}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
