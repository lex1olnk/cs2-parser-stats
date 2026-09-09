// Проверки на входе в парсер.
//
// Сервис читает файлы с диска и ходит по сети от имени машины, поэтому он
// не должен доверять ни одному полю запроса: fileName проверяется на выход
// за пределы shared-demos, callbackUrl — на чужой origin, а сам запрос —
// на общий секрет с nextapp.

const path = require("path");
const crypto = require("crypto");

const ALLOWED_EXTENSIONS = new Set([".dem", ".zip", ".rar"]);
const FILE_NAME_PATTERN = /^[A-Za-z0-9._-]+$/;

/** Express-middleware: общий секрет с nextapp в заголовке X-Internal-Token. */
function requireInternalToken(req, res, next) {
  const expected = process.env.INTERNAL_SERVICE_TOKEN;

  if (!expected || expected.length < 16) {
    console.error(
      "❌ INTERNAL_SERVICE_TOKEN не задан или слишком короткий — все запросы отклоняются"
    );

    return res
      .status(500)
      .json({ success: false, error: "Server misconfigured" });
  }

  const provided = Buffer.from(req.get("x-internal-token") || "");
  const secret = Buffer.from(expected);

  if (
    provided.length !== secret.length ||
    !crypto.timingSafeEqual(provided, secret)
  ) {
    console.warn(`⛔ Rejected ${req.method} ${req.path}: invalid token`);

    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  next();
}

/**
 * Превращает присланное имя файла в безопасный абсолютный путь внутри
 * shared-demos. Бросает исключение на всё, что похоже на обход каталога.
 */
function resolveDemoPath(baseDir, fileName) {
  if (typeof fileName !== "string" || fileName.length === 0) {
    throw new Error("fileName is required");
  }

  // basename отбрасывает ../ и абсолютные пути; если после этого строка
  // изменилась — исходное имя пыталось выйти за пределы каталога.
  const base = path.basename(fileName);

  if (base !== fileName || !FILE_NAME_PATTERN.test(base)) {
    throw new Error("Invalid file name");
  }

  if (!ALLOWED_EXTENSIONS.has(path.extname(base).toLowerCase())) {
    throw new Error("Unsupported file extension");
  }

  const resolved = path.resolve(baseDir, base);

  if (path.dirname(resolved) !== path.resolve(baseDir)) {
    throw new Error("Resolved path escapes demos directory");
  }

  return resolved;
}

/**
 * Callback уходит только на заранее известный origin приложения — иначе
 * парсер превращается в инструмент для запросов во внутреннюю сеть.
 */
function assertAllowedCallbackUrl(callbackUrl) {
  const allowedOrigin = process.env.CALLBACK_ORIGIN;

  if (!allowedOrigin) {
    throw new Error("CALLBACK_ORIGIN не задан");
  }

  const url = new URL(callbackUrl);

  if (url.origin !== new URL(allowedOrigin).origin) {
    throw new Error(`Callback origin not allowed: ${url.origin}`);
  }

  return url.toString();
}

module.exports = {
  requireInternalToken,
  resolveDemoPath,
  assertAllowedCallbackUrl,
};
