"use client";

import { useSession } from "next-auth/react";

export function Topbar() {
  const { data: session } = useSession();
  const user = session?.user as { name?: string | null; role?: string } | undefined;

  return (
    <header className="h-14 border-b border-gray-100 bg-white flex items-center justify-end px-6">
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">{user?.name}</p>
          <p className="text-xs text-gray-500">
            {user?.role === "ADMIN" ? "Admin" : "Mitarbeiterin"}
          </p>
        </div>
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
          {user?.name?.[0] ?? "?"}
        </div>
      </div>
    </header>
  );
}
