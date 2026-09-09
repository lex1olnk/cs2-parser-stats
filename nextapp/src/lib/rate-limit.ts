// Ограничители для дорогих операций. Состояние живёт в памяти процесса:
// nextapp запускается одним инстансом под pm2, внешнего Redis в архитектуре
// нет и заводить его ради этого не нужно. При переезде на несколько
// инстансов оба механизма придётся вынести в общее хранилище.

interface Window {
  count: number;
  resetAt: number;
}

const windows = new Map<string, Window>();

export interface RateLimitResult {
  allowed: boolean;
  /** Через сколько секунд можно повторить (только когда allowed = false). */
  retryAfter: number;
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const existing = windows.get(key);

  if (!existing || existing.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfter: 0 };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      retryAfter: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  existing.count++;
  return { allowed: true, retryAfter: 0 };
}

/**
 * Пайплайн обработки демок пишет и удаляет файлы в общей папке shared-demos,
 * поэтому двух одновременных прогонов быть не должно: они затирают файлы
 * друг друга. Флаг держится в памяти и снимается в finally.
 */
let pipelineBusy = false;

export function tryAcquirePipeline(): boolean {
  if (pipelineBusy) return false;

  pipelineBusy = true;
  return true;
}

export function releasePipeline(): void {
  pipelineBusy = false;
}

export function isPipelineBusy(): boolean {
  return pipelineBusy;
}
