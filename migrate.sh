#!/bin/bash
# Обновление боевого сервера: код → зависимости → миграции → сборка → рестарт.
# Без Docker: процессами управляет pm2 (см. ecosystem.config.js и DEPLOY.md).

set -euo pipefail

APP_DIR="${APP_DIR:-/opt/ulmixcup}"

cd "$APP_DIR"
git pull

cd "$APP_DIR/nextapp"
npm ci
npx prisma migrate deploy
npx prisma generate
npm run build

cd "$APP_DIR/cs-parser"
npm ci

cd "$APP_DIR"
pm2 restart ecosystem.config.js

echo "✅ Обновлено + миграции!"
