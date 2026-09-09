// Сессионная cookie: компактный HS256-JWT, подписанный через Web Crypto.
//
// Web Crypto доступен и в Node-рантайме роутов, и в Edge-рантайме middleware,
// поэтому один и тот же код проверяет сессию в обоих местах без зависимостей
// (jose/next-auth) и без серверного хранилища сессий.

export const SESSION_COOKIE = "cs2_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 дней

export interface SessionPayload {
  /** User.id */
  uid: number;
  /** steamid64 */
  sid: string;
  name: string;
  avatar: string | null;
  /**
   * Признак админа на момент выдачи токена. Пригоден для дешёвой проверки в
   * middleware, но может устареть — авторитетная проверка живёт в requireAdmin().
   */
  admin: boolean;
  /** Unix-время истечения, в секундах */
  exp: number;
}

const HEADER = { alg: "HS256", typ: "JWT" } as const;

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET не задан или короче 32 символов. " +
        'Сгенерируй: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"',
    );
  }

  return new TextEncoder().encode(secret);
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

  return bytes;
}

function encodeSegment(value: unknown): string {
  return bytesToBase64Url(new TextEncoder().encode(JSON.stringify(value)));
}

async function importKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    getSecret() as unknown as BufferSource,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function signSession(
  payload: Omit<SessionPayload, "exp">,
  maxAgeSeconds: number = SESSION_MAX_AGE,
): Promise<string> {
  const body: SessionPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + maxAgeSeconds,
  };

  const data = `${encodeSegment(HEADER)}.${encodeSegment(body)}`;
  const signature = await crypto.subtle.sign(
    "HMAC",
    await importKey(),
    new TextEncoder().encode(data) as unknown as BufferSource,
  );

  return `${data}.${bytesToBase64Url(new Uint8Array(signature))}`;
}

/**
 * Проверяет подпись и срок действия. Возвращает null на любой некорректный
 * токен — вызывающая сторона трактует это как «не залогинен».
 */
export async function verifySession(
  token: string | undefined | null,
): Promise<SessionPayload | null> {
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, encodedSignature] = parts;

  try {
    const isValid = await crypto.subtle.verify(
      "HMAC",
      await importKey(),
      base64UrlToBytes(encodedSignature) as unknown as BufferSource,
      new TextEncoder().encode(
        `${encodedHeader}.${encodedPayload}`,
      ) as unknown as BufferSource,
    );

    if (!isValid) return null;

    const payload = JSON.parse(
      new TextDecoder().decode(base64UrlToBytes(encodedPayload)),
    ) as SessionPayload;

    if (typeof payload.exp !== "number" || payload.exp < Date.now() / 1000) {
      return null;
    }

    if (typeof payload.uid !== "number" || typeof payload.sid !== "string") {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function sessionCookieOptions(maxAge: number = SESSION_MAX_AGE) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}
