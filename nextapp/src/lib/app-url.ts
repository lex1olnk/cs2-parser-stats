/**
 * Публичный origin приложения. Используется там, где нужен абсолютный URL:
 * return_to для Steam OpenID и callback-URL, который отдаётся парсеру.
 *
 * NEXTAUTH_URL поддерживается как legacy-имя переменной.
 */
export function getAppUrl(): string {
  const url =
    process.env.APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";

  return url.replace(/\/$/, "");
}
