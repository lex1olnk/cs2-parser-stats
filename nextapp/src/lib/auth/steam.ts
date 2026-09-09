// Steam OpenID 2.0 + Steam Web API.
//
// Steam не поддерживает OAuth/OIDC — только старый OpenID 2.0, где мы получаем
// в query-параметрах подписанное утверждение и ОБЯЗАНЫ проверить его обратным
// запросом в Steam (openid.mode=check_authentication). Параметры в редиректе
// подделываются тривиально, поэтому доверять им без проверки нельзя.

import { getAppUrl } from "@/lib/app-url";

/** Короткоживущие cookie самого процесса логина. */
export const STATE_COOKIE = "cs2_auth_state";
export const NEXT_COOKIE = "cs2_auth_next";
export const LOGIN_FLOW_MAX_AGE = 60 * 10; // 10 минут на прохождение логина

const STEAM_OPENID_ENDPOINT = "https://steamcommunity.com/openid/login";
const STEAM_IDENTIFIER_SELECT =
  "http://specs.openid.net/auth/2.0/identifier_select";
const CLAIMED_ID_PATTERN =
  /^https:\/\/steamcommunity\.com\/openid\/id\/(\d{17})$/;

export { getAppUrl };

/**
 * Куда вернуть пользователя после логина. Принимаем только относительные пути:
 * абсолютный URL здесь означал бы open redirect. Проверять нужно и при записи
 * в cookie, и при чтении — cookie не подписана.
 */
export function safeNextPath(value: string | null | undefined): string | null {
  if (!value) return null;
  if (!value.startsWith("/") || value.startsWith("//")) return null;

  return value;
}

/** return_to с одноразовым state — он же защита от навязанного логина. */
export function buildReturnToUrl(state: string): string {
  return `${getAppUrl()}/api/auth/steam/callback?state=${encodeURIComponent(state)}`;
}

export function buildSteamLoginUrl(state: string): string {
  const appUrl = getAppUrl();
  const params = new URLSearchParams({
    "openid.ns": "http://specs.openid.net/auth/2.0",
    "openid.mode": "checkid_setup",
    "openid.return_to": buildReturnToUrl(state),
    "openid.realm": appUrl,
    "openid.identity": STEAM_IDENTIFIER_SELECT,
    "openid.claimed_id": STEAM_IDENTIFIER_SELECT,
  });

  return `${STEAM_OPENID_ENDPOINT}?${params.toString()}`;
}

/**
 * Проверяет ответ Steam и возвращает steamid64, либо null если утверждение
 * невалидно. Никаких данных из параметров, кроме проверенного steamid,
 * использовать нельзя.
 */
export async function verifySteamAssertion(
  params: URLSearchParams,
  expectedReturnTo: string,
): Promise<string | null> {
  if (params.get("openid.mode") !== "id_res") return null;

  // Утверждение должно быть выписано для нашего же return_to, а не для чужого сайта.
  if (params.get("openid.return_to") !== expectedReturnTo) return null;

  const claimedId = params.get("openid.claimed_id");
  const claimedMatch = claimedId?.match(CLAIMED_ID_PATTERN);
  if (!claimedMatch) return null;

  // Возвращаем Steam ровно те же параметры, поменяв только mode.
  const verification = new URLSearchParams(params);
  verification.set("openid.mode", "check_authentication");

  const response = await fetch(STEAM_OPENID_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: verification.toString(),
  });

  if (!response.ok) return null;

  const body = await response.text();
  const isValid = body
    .split("\n")
    .some((line) => line.trim() === "is_valid:true");

  return isValid ? claimedMatch[1] : null;
}

export interface SteamProfile {
  nickname: string;
  avatar: string | null;
}

/**
 * Ник и аватар через Steam Web API. Необязательно: без STEAM_API_KEY логин
 * продолжает работать, просто ник останется прежним (или станет steamid).
 */
export async function fetchSteamProfile(
  steamId: string,
): Promise<SteamProfile | null> {
  const key = process.env.STEAM_API_KEY;
  if (!key) return null;

  try {
    const url = new URL(
      "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/",
    );
    url.searchParams.set("key", key);
    url.searchParams.set("steamids", steamId);

    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return null;

    const data = await response.json();
    const player = data?.response?.players?.[0];
    if (!player) return null;

    return {
      nickname: player.personaname || steamId,
      avatar: player.avatarfull || player.avatarmedium || null,
    };
  } catch (error) {
    console.error("Steam profile fetch failed:", error);
    return null;
  }
}

/** Бутстрап админов: steamid64 через запятую в ADMIN_STEAM_IDS. */
export function isBootstrapAdmin(steamId: string): boolean {
  return (process.env.ADMIN_STEAM_IDS || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .includes(steamId);
}
