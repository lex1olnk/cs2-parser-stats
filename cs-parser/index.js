// demo-server/index.js (обновленная версия)
const express = require("express");
const fs = require("fs");
const path = require("path");
const { parseAllData } = require("./parser-functions");
const { analyzeMatchData } = require("./demo-analyzer"); // <--- ДОБАВЛЕНО
const {
  requireInternalToken,
  resolveDemoPath,
  assertAllowedCallbackUrl,
} = require("./security");

const ArchiveService = require("./archive-service");

const archiveService = new ArchiveService();

const app = express();
const PORT = process.env.PORT || 3001;
// Парсер — служебный сервис. Наружу он не публикуется: слушаем только
// локальный интерфейс, снаружи к нему ходит исключительно nextapp.
const BIND_HOST = process.env.BIND_HOST || "127.0.0.1";

// Абсолютный путь к общей папке демо
const PROJECT_ROOT = path.join(__dirname, "..");
const SHARED_DEMOS_DIR = path.join(PROJECT_ROOT, "shared-demos");

// CORS намеренно не подключаем: браузер сюда не ходит, только сервер.
app.use(express.json({ limit: "1mb" }));
app.use(requireInternalToken);

// -------------------------------------------------------------
// 💡 СИНХРОННЫЙ МАРШРУТ: /parse-demo-sync
// Ждет завершения парсинга и возвращает JSON с данными
// -------------------------------------------------------------
app.post("/parse-demo-sync", async (req, res) => {
  const { fileName } = req.body;
  console.log(`📨 Received SYNC parse request for file: ${fileName}`);

  let demoPath;

  try {
    demoPath = resolveDemoPath(SHARED_DEMOS_DIR, fileName);
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }

  try {
    let fileExists = false;
    let attempts = 0;
    const maxAttempts = 5;

    // --- ЛОГИКА ОЖИДАНИЯ И ПРОВЕРКИ ФАЙЛА ---
    while (!fileExists && attempts < maxAttempts) {
      try {
        // Использование синхронных методов для проверки в асинхронной функции
        fs.accessSync(demoPath);
        const stats = fs.statSync(demoPath);

        if (stats.size > 0) {
          fileExists = true;
          break;
        }
      } catch (fileError) {
        console.log(
          `⏳ File not ready (attempt ${attempts + 1}/${maxAttempts})...`
        );
        attempts++;
        if (attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }
    }

    if (!fileExists) {
      throw new Error(`File not found or empty after checks: ${fileName}.`);
    }
    // --- КОНЕЦ ЛОГИКИ ОЖИДАНИЯ ---

    // Используем ArchiveService для обработки .zip/.rar и получения пути к .dem
    const actualDemoPath = await archiveService.getDemoPath(demoPath);
    console.log("🔄 Parsing demo...");

    // 🚨 ЗАПУСК СИНХРОННОГО ПАРСИНГА
    const parsedData = await parseAllData(actualDemoPath);

    // 2. ЗАПУСК АНАЛИЗА
    //console.log("📊 Starting data analysis...");
    //const analysisResult = analyzeMatchData(parsedData); // <--- ВЫЗОВ АНАЛИЗАТОРА
    // Очистка временных файлов, если демо было распаковано
    if (actualDemoPath !== demoPath) {
      archiveService.cleanupTempFile(actualDemoPath);
    }

    console.log(`✅ Demo parsed successfully. Returning data.`);

    // 📢 ОТВЕТ С ДАННЫМИ
    return res.json({
      success: true,
      data: parsedData,
      //analysis: analysisResult,
    });
  } catch (error) {
    console.error(`❌ SYNC Parse failed: ${error.message}`);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.post("/parse-demo", async (req, res) => {
  const { fileName, callbackUrl } = req.body;
  console.log(`📨 Received parse request for file: ${fileName}`);

  // Оба поля из тела запроса валидируем ДО ответа, чтобы вызывающий получил
  // внятную 400, а не «принято» с последующим молчаливым падением.
  let demoPath;
  let safeCallbackUrl = null;

  try {
    demoPath = resolveDemoPath(SHARED_DEMOS_DIR, fileName);
    if (callbackUrl) safeCallbackUrl = assertAllowedCallbackUrl(callbackUrl);
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }

  // Немедленный ответ
  res.json({
    success: true,
    status: "parsing_started",
  });

  try {
    console.log(`🔍 Looking for file: ${demoPath}`);

    // Проверяем что файл существует
    let fileExists = false;
    let attempts = 0;
    const maxAttempts = 5;

    while (!fileExists && attempts < maxAttempts) {
      try {
        await fs.accessSync(demoPath);
        const stats = await fs.statSync(demoPath);

        if (stats.size > 0) {
          fileExists = true;
          console.log(
            `✅ File exists: ${demoPath} (${(
              stats.size /
              (1024 * 1024)
            ).toFixed(2)} MB)`
          );
          break;
        }
      } catch (fileError) {
        console.log(
          `⏳ File not ready (attempt ${attempts + 1}/${maxAttempts})...`
        );
        attempts++;
        if (attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }
    }

    if (!fileExists) {
      // Покажем какие файлы есть в папке для дебага
      try {
        const files = await fs.readdirSync(SHARED_DEMOS_DIR);
        console.log("📂 Available files in shared-demos:");
        files.forEach((file) => {
          const filePath = path.join(SHARED_DEMOS_DIR, file);
          fs.statSync(filePath).then((stats) => {
            console.log(
              `   - ${file} (${(stats.size / (1024 * 1024)).toFixed(2)} MB)`
            );
          });
        });
      } catch (readError) {
        console.log("Cannot read shared-demos dir:", readError.message);
      }

      throw new Error(
        `File not found: ${fileName}. Looking in: ${SHARED_DEMOS_DIR}`
      );
    }

    // Получаем путь к .dem файлу (распаковываем если нужно)
    const actualDemoPath = await archiveService.getDemoPath(demoPath);

    console.log("🔄 Parsing demo...");
    const parsedData = await parseAllData(actualDemoPath);
    if (actualDemoPath !== demoPath) {
      archiveService.cleanupTempFile(actualDemoPath);
    }
    // Отправляем callback
    if (safeCallbackUrl) {
      console.log("📤 Sending callback...");
      await sendCallbackWithRetry(safeCallbackUrl, {
        success: true,
        data: parsedData,
      });
    }

    console.log(`✅ Demo parsed successfully`);
  } catch (error) {
    console.error(`❌ Parse failed: ${error.message}`);

    if (safeCallbackUrl) {
      await sendCallbackWithRetry(safeCallbackUrl, {
        success: false,
        error: error.message,
      });
    }
  }
});

// Задержки между попытками. Укладываемся примерно в 10 секунд, потому что
// nextapp ждёт callback не дольше 60 секунд — ретраи дольше этого бессмысленны.
const CALLBACK_RETRY_DELAYS_MS = [1000, 3000, 6000];

async function sendCallbackWithRetry(callbackUrl, data, maxRetries = 3) {
  const attempts = Math.min(maxRetries, CALLBACK_RETRY_DELAYS_MS.length + 1);

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      console.log(`📞 Sending callback (попытка ${attempt}/${attempts})...`);

      const response = await fetch(callbackUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Тот же секрет, что и во входящих запросах: nextapp принимает
          // результаты парсинга только от парсера.
          "x-internal-token": process.env.INTERNAL_SERVICE_TOKEN || "",
        },
        body: JSON.stringify(data),
        // У fetch нет опции timeout — нужен AbortSignal, иначе запрос висит вечно.
        signal: AbortSignal.timeout(10000),
      });

      if (response.ok) {
        console.log("✅ Callback sent successfully");
        return true;
      }

      // 4xx (кроме 429) — постоянная ошибка: неверный токен или битый URL.
      // Повторять бессмысленно, только зря потратим окно ожидания.
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        console.error(
          `❌ Callback отклонён навсегда: ${response.status}. Проверь INTERNAL_SERVICE_TOKEN.`
        );
        return false;
      }

      console.log(`⚠️ Callback failed with status ${response.status}`);
    } catch (error) {
      console.log(`⚠️ Callback failed: ${error.message}`);
    }

    if (attempt < attempts) {
      const delay = CALLBACK_RETRY_DELAYS_MS[attempt - 1];
      console.log(`⏳ Повтор через ${delay} мс...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  console.error(
    `❌ Callback не доставлен за ${attempts} попыток — результат парсинга потерян`
  );
  return false;
}

app.get("/debug/files", async (req, res) => {
  try {
    const files = await fs.readdir(SHARED_DEMOS_DIR);
    const filesWithStats = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(SHARED_DEMOS_DIR, file);
        const stats = await fs.stat(filePath);
        return {
          name: file,
          size: stats.size,
          sizeMB: (stats.size / (1024 * 1024)).toFixed(2),
          modified: stats.mtime,
        };
      })
    );

    res.json({
      demosDir: SHARED_DEMOS_DIR,
      totalFiles: files.length,
      files: filesWithStats,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      demosDir: SHARED_DEMOS_DIR,
    });
  }
});

app.listen(PORT, BIND_HOST, () => {
  console.log(`🚀 Demo parsing server running on ${BIND_HOST}:${PORT}`);

  if (BIND_HOST !== "127.0.0.1" && BIND_HOST !== "localhost") {
    console.warn(
      `⚠️  Парсер слушает ${BIND_HOST} — убедись, что порт закрыт файрволом снаружи`
    );
  }
});
