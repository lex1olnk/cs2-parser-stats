import { LogoutButton } from "@/components/features/auth/LogoutButton";
import { getSessionUser } from "@/lib/auth/guards";
import { safeNextPath } from "@/lib/auth/steam";

export const dynamic = "force-dynamic";

const ERROR_MESSAGES: Record<string, string> = {
  invalid_state:
    "Сессия входа истекла или была начата не с этой страницы. Повтори попытку.",
  invalid_assertion: "Steam не подтвердил вход. Утверждение отклонено.",
  forbidden: "Вход выполнен, но у аккаунта нет прав администратора.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const user = await getSessionUser();

  const nextPath = safeNextPath(next);
  const loginHref = nextPath
    ? `/api/auth/steam?next=${encodeURIComponent(nextPath)}`
    : "/api/auth/steam";

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white pt-32 pb-20 selection:bg-white selection:text-black relative overflow-hidden">
      {/* Watermark */}
      <div className="absolute -bottom-10 -right-6 text-[15vw] font-black italic uppercase text-white/5 leading-none pointer-events-none select-none">
        Auth
      </div>

      <div className="max-w-7xl mx-auto px-12 relative z-10">
        <header className="mb-20 border-l-4 border-white pl-8">
          <div className="flex items-center gap-4 mb-2">
            <span className="text-zinc-600 font-mono text-xs tracking-[0.5em]">
              ACCESS_CONTROL // STEAM_OPENID
            </span>
            <div className="h-px w-24 bg-zinc-800" />
          </div>
          <h1 className="text-8xl font-black italic tracking-tighter uppercase leading-none">
            Auth_Gate <br />
            <span className="text-zinc-800">[{user ? "LINKED" : "—"}]</span>
          </h1>
        </header>

        <div className="grid grid-cols-12 gap-16">
          <div className="col-span-12 lg:col-span-7 space-y-8">
            {error && (
              <div className="border border-zinc-900 bg-zinc-900/10 p-6">
                <span className="text-[10px] font-mono tracking-[0.4em] uppercase text-yellow-400">
                  [ REJECTED ]
                </span>
                <p className="mt-3 font-mono text-[11px] text-zinc-400 leading-relaxed">
                  {ERROR_MESSAGES[error] ?? "Неизвестная ошибка входа."}
                </p>
              </div>
            )}

            {user ? (
              <div className="group border border-zinc-900 bg-zinc-900/10 p-10 relative overflow-hidden">
                <div className="absolute -top-[1px] -left-[1px] w-4 h-4 border-t border-l border-zinc-600" />
                <div className="absolute -bottom-[1px] -right-[1px] w-4 h-4 border-b border-r border-zinc-600" />

                <span className="text-[10px] font-mono tracking-[0.4em] uppercase text-zinc-500">
                  SESSION_ACTIVE
                </span>
                <p className="text-5xl font-black italic tracking-tighter uppercase mt-4">
                  {user.nickname}
                </p>

                <div className="mt-8 space-y-3 font-mono text-[11px]">
                  <div className="flex justify-between border-b border-zinc-900 pb-2">
                    <span className="text-zinc-600">STEAM_ID:</span>
                    <span className="text-zinc-400">{user.steamId}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-900 pb-2">
                    <span className="text-zinc-600">ROLE:</span>
                    <span
                      className={
                        user.isAdmin ? "text-green-500" : "text-zinc-400"
                      }
                    >
                      {user.isAdmin ? "[ ADMIN ]" : "[ VIEWER ]"}
                    </span>
                  </div>
                </div>

                <div className="mt-10 flex gap-4">
                  {user.isAdmin && (
                    <a
                      href="/admin"
                      className="relative overflow-hidden px-6 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-white border border-zinc-800 hover:border-white transition-colors group/btn"
                    >
                      <span className="relative z-10 group-hover/btn:text-black transition-colors">
                        В_админку
                      </span>
                      <div className="absolute inset-0 bg-white translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                    </a>
                  )}
                  <LogoutButton />
                </div>
              </div>
            ) : (
              <a
                href={loginHref}
                className="group block border border-zinc-900 bg-zinc-900/10 p-10 hover:bg-white hover:text-black transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute left-0 top-0 h-full w-0.5 bg-white scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />

                <span className="text-[10px] font-mono tracking-[0.4em] uppercase text-zinc-500 group-hover:text-black/50">
                  {"// INITIATE_HANDSHAKE"}
                </span>
                <p className="text-6xl font-black italic tracking-tighter uppercase mt-4 leading-none">
                  Sign_in <br /> Through_Steam
                </p>
                <p className="mt-6 font-mono text-[10px] tracking-widest uppercase text-zinc-600 group-hover:text-black/50">
                  Пароль не запрашивается — вход выполняется на стороне Valve
                </p>
              </a>
            )}
          </div>

          <aside className="col-span-4 hidden lg:block space-y-12">
            <div>
              <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-6 italic">
                Auth_Protocol
              </h4>
              <div className="space-y-4 font-mono text-[10px]">
                <div className="flex justify-between border-b border-zinc-900 pb-2">
                  <span className="text-zinc-600">METHOD:</span>
                  <span className="text-zinc-400">OPENID_2.0</span>
                </div>
                <div className="flex justify-between border-b border-zinc-900 pb-2">
                  <span className="text-zinc-600">PROVIDER:</span>
                  <span className="text-zinc-400">STEAMCOMMUNITY</span>
                </div>
                <div className="flex justify-between border-b border-zinc-900 pb-2">
                  <span className="text-zinc-600">SESSION:</span>
                  <span className="text-zinc-400">HS256_COOKIE</span>
                </div>
              </div>
            </div>

            <div className="p-6 border border-zinc-900 bg-zinc-900/10">
              <p className="text-[9px] leading-relaxed text-zinc-500 font-mono italic">
                Сайт не хранит пароли и персональные данные. Из Steam берутся
                только steamid64, ник и аватар — они и так публичны в профиле
                игрока.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
