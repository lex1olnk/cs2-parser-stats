// pm2: два обычных процесса вместо контейнеров.
//
//   pm2 start ecosystem.config.js
//   pm2 save && pm2 startup   — автозапуск после перезагрузки
//   pm2 logs cs-parser        — логи одного процесса
//
// Переменные окружения берутся из nextapp/.env и cs-parser/.env
// (см. .env.example рядом с каждым сервисом), поэтому секретов здесь нет.

module.exports = {
  apps: [
    {
      name: "nextapp",
      cwd: "./nextapp",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      max_memory_restart: "1G",
      autorestart: true,
    },
    {
      name: "cs-parser",
      cwd: "./cs-parser",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
      },
      // Парсинг демок — тяжёлая операция с нативным модулем: один процесс,
      // без кластеризации, с запасом по памяти.
      max_memory_restart: "2G",
      autorestart: true,
    },
  ],
};
