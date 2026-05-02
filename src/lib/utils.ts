import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return format(new Date(date), "dd.MM.yyyy", { locale: de });
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return format(new Date(date), "dd.MM.yyyy HH:mm", { locale: de });
}

export function formatTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return format(new Date(date), "HH:mm", { locale: de });
}

export function daysUntilBirthday(birthday: Date | string | null | undefined): number | null {
  if (!birthday) return null;
  const today = new Date();
  const bd = new Date(birthday);
  const next = new Date(today.getFullYear(), bd.getMonth(), bd.getDate());
  if (next < today) next.setFullYear(today.getFullYear() + 1);
  const diff = Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}
