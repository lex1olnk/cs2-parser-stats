#!/bin/bash
cd /opt/ulmixcup/nextapp
git pull
npx prisma migrate deploy
docker-compose restart nextapp
echo "✅ Обновлено + миграции!"