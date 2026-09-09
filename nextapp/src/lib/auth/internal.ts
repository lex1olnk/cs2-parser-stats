// Аутентификация служебных запросов между nextapp и cs-parser.
//
// Оба процесса живут на одной машине за localhost, поэтому общего секрета
// достаточно — mTLS избыточен. Секрет один на оба направления:
// nextapp → cs-parser (/parse-demo) и cs-parser → nextapp (/api/parse/callback).

export const INTERNAL_TOKEN_HEADER = "x-internal-token";

export function getInternalToken(): string {
  const token = process.env.INTERNAL_SERVICE_TOKEN;

  if (!token || token.length < 16) {
    throw new Error(
      "INTERNAL_SERVICE_TOKEN не задан или слишком короткий. " +
        "Он должен совпадать в nextapp/.env и cs-parser/.env",
    );
  }

  return token;
}

/** Сравнение за постоянное время: длина утекает, содержимое — нет. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);

  return diff === 0;
}

export function isValidInternalRequest(request: Request): boolean {
  const provided = request.headers.get(INTERNAL_TOKEN_HEADER);
  if (!provided) return false;

  return timingSafeEqual(provided, getInternalToken());
}
