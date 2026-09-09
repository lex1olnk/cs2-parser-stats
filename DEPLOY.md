# Развёртывание

Без Docker: два Node-процесса под pm2, внешний Postgres, TLS через Caddy или Cloudflare Tunnel.
Целевая топология описана в [architecture.md](architecture.md).

## Требования

| Что | Версия | Зачем |
|---|---|---|
| Node.js | ≥ 20.6 | `--env-file` в cs-parser, Web Crypto в сессиях |
| PostgreSQL | ≥ 15 | Основная БД + материализованные вьюшки |
| pm2 | любая | Держит процессы живыми и поднимает их после перезагрузки |
| Caddy **или** cloudflared | любая | Публичный вход и TLS |

```bash
node -v                 # проверить, что ≥ 20.6
npm install -g pm2
```

## 1. База данных

Рекомендуется managed-Postgres (Neon, Supabase, облачный Postgres хостера): бэкапы и обновления
перестают быть твоей заботой. Нужен только connection string в `DATABASE_URL`.

Если Postgres ставится на ту же машину:

```bash
sudo apt install postgresql-15
sudo -u postgres createuser --pwprompt cs2
sudo -u postgres createdb --owner=cs2 cs2stats
```

Слушать он должен только localhost (`listen_addresses = 'localhost'` в `postgresql.conf`) —
наружу база не публикуется.

## 2. Код и зависимости

```bash
git clone <repo> cs2-parser-stats
cd cs2-parser-stats

cd nextapp && npm ci && cd ..
cd cs-parser && npm ci && cd ..
```

## 3. Переменные окружения

```bash
cp cs-parser/.env.example cs-parser/.env
cp nextapp/.env.example nextapp/.env
```

Заполнить оба файла. Секреты генерируются так:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Важно:

- `INTERNAL_SERVICE_TOKEN` должен **совпадать** в обоих файлах — это общий секрет служебных запросов.
- `APP_URL` — публичный адрес сайта (`https://example.com`), иначе Steam вернёт пользователя не туда.
- `CALLBACK_ORIGIN` в cs-parser — тот же публичный адрес: только на него парсеру разрешено слать результаты.
- `ADMIN_STEAM_IDS` — свой steamid64, иначе в админку не пустит никого.

## 4. Миграции и сборка

```bash
cd nextapp
npx prisma migrate deploy      # применить миграции
npx prisma generate            # сгенерировать клиент в prisma/generated
npm run build
cd ..
```

Миграции создают материализованные вьюшки со статистикой. Пайплайн загрузки
матчей пересчитывает их сам в конце каждой пачки, а вручную это нужно только
для данных, попавших в базу мимо него — тогда проще дёрнуть
`POST /api/stats/refresh` из-под админа. SQL-эквивалент:

```sql
REFRESH MATERIALIZED VIEW kill_stats_per_match;
REFRESH MATERIALIZED VIEW death_stats_per_match;
REFRESH MATERIALIZED VIEW assist_stats_per_match;
REFRESH MATERIALIZED VIEW damage_stats_per_match;
REFRESH MATERIALIZED VIEW rounds_played_per_match;
REFRESH MATERIALIZED VIEW kast_per_match;
REFRESH MATERIALIZED VIEW player_rating_components_per_match;
REFRESH MATERIALIZED VIEW match_kill_with_trade;
```

Одной командой:

```bash
psql "$DATABASE_URL" -Atc "SELECT 'REFRESH MATERIALIZED VIEW ' || quote_ident(matviewname) || ';' FROM pg_matviews" | psql "$DATABASE_URL"
```

## 5. Запуск процессов

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup        # выполнить напечатанную команду, чтобы процессы поднимались после ребута
```

Проверка:

```bash
pm2 status
pm2 logs nextapp --lines 50
curl -I http://localhost:3000
```

## 6. Публичный вход

Наружу выставляется **только** nextapp (порт 3000). cs-parser слушает `127.0.0.1:3001` и наружу не публикуется никогда.

### Вариант A: Caddy (свой домен, автоматический TLS)

`/etc/caddy/Caddyfile`:

```
example.com {
    reverse_proxy localhost:3000
}
```

```bash
sudo systemctl reload caddy
```

### Вариант B: Cloudflare Tunnel (без открытых портов наружу)

```bash
cloudflared service install <TUNNEL_TOKEN>
```

В настройках туннеля указать public hostname → `http://localhost:3000`.

### Файрвол

```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

Порты 3000, 3001 и 5432 наружу не открываются — к ним ходят только процессы на самой машине.

## 7. Первый вход

1. Открыть `https://example.com/login`.
2. Войти через Steam.
3. Если steamid попал в `ADMIN_STEAM_IDS`, появится кнопка «Админка» и откроется `/admin`.

Права снимаются или выдаются вручную в БД — окружение только выдаёт их при первом входе:

```sql
UPDATE "user" SET is_admin = true  WHERE steam_id = '765611980...';
UPDATE "user" SET is_admin = false WHERE steam_id = '765611980...';
```

## 8. Заливка матчей

Два пути, оба из админки, вкладка «Матчи»:

**По ссылке** — кнопка «Добавить матчи», принимаются ссылки Fastcup и Cybershoke.
Приложение само скачает демку, разберёт и удалит временный файл.

**Готовым файлом** — положить `.dem` (или `.zip`/`.rar`) в папку `shared-demos/`
рядом с кодом, затем в блоке «Импорт демок из папки» обновить список, выбрать
файлы и турнир и нажать «Импортировать». Требования к имени: только латиница,
цифры, `.`, `_`, `-` — без пробелов и подкаталогов.

Такие файлы после разбора **остаются на диске**: удаляется только то, что
приложение скачало само. Повторный импорт того же файла отсекается.

Прогресс виден там же в «Сессиях обработки». Матчи идут по одному, на каждый
отводится до `PARSE_TIMEOUT_MS` (по умолчанию 5 минут). Статистика
пересчитывается автоматически в конце пачки.

## 9. Обновление

```bash
git pull
cd nextapp && npm ci && npx prisma migrate deploy && npx prisma generate && npm run build && cd ..
cd cs-parser && npm ci && cd ..
pm2 restart ecosystem.config.js
```

## Windows

pm2 работает и на Windows, но автозапуск настраивается иначе: `pm2-startup install`
(пакет `pm2-windows-startup`) либо регистрация службы через NSSM. Всё остальное — идентично.

## Диагностика

| Симптом | Причина |
|---|---|
| `/login` отдаёт 500 | Не задан `SESSION_SECRET` или он короче 32 символов |
| После Steam редиректит на `/login?error=invalid_state` | Не совпадает `APP_URL` с реальным адресом сайта |
| `/login?error=forbidden` | Вход прошёл, но `is_admin = false` — добавь steamid в `ADMIN_STEAM_IDS` или обнови поле в БД |
| Парсинг падает с 401 | `INTERNAL_SERVICE_TOKEN` различается в nextapp и cs-parser |
| Callback не доходит | `CALLBACK_ORIGIN` не совпадает с `APP_URL` |
