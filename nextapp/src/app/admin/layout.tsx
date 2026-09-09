import { redirect } from "next/navigation";

import { LogoutButton } from "@/components/features/auth/LogoutButton";
import { getSessionUser } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // middleware.ts уже отсеял запросы без валидной cookie, но там проверяется
  // только claim из токена. Здесь — актуальный is_admin из БД.
  const user = await getSessionUser();

  if (!user) redirect("/login?next=/admin");
  if (!user.isAdmin) redirect("/login?error=forbidden");

  return (
    <div>
      <div className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center justify-between text-xs">
          <span>
            Вход выполнен: <span className="text-white">{user.nickname}</span>{" "}
            <span className="text-gray-500">({user.steamId})</span>
          </span>
          <LogoutButton className="px-3 py-1 text-xs font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded transition-colors disabled:opacity-40" />
        </div>
      </div>
      {children}
    </div>
  );
}
