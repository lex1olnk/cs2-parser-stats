// demo-server/index.js (обновленная версия)
const express = require("express");
const fs = require("fs");
const cors = require("cors");
const path = require("path");
const { parseAllData } = require("./parser-functions");
const { analyzeMatchData } = require("./demo-analyzer"); // <--- ДОБАВЛЕНО

const ArchiveService = require("./archive-service");

const archiveService = new ArchiveService();

const app = express();
const PORT = process.env.PORT || 3001;

// Абсолютный путь к общей папке демо
const PROJECT_ROOT = path.join(__dirname, "..");
const SHARED_DEMOS_DIR = path.join(PROJECT_ROOT, "shared-demos");
app.use(cors());
app.use(express.json());

// -------------------------------------------------------------
// 💡 СИНХРОННЫЙ МАРШРУТ: /parse-demo-sync
// Ждет завершения парсинга и возвращает JSON с данными
// -------------------------------------------------------------
app.post("/parse-demo-sync", async (req, res) => {
  const { fileName } = req.body;
  console.log(`📨 Received SYNC parse request for file: ${fileName}`);

  if (!fileName) {
    return res.status(400).json({
      success: false,
      error: "fileName is required in request body.",
    });
  }

  try {
    const demoPath = path.join(SHARED_DEMOS_DIR, fileName);
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
  console.log(callbackUrl, "a");
  console.log(`📨 Received parse request for file: ${fileName}`);

  if (!fileName) {
    return res.status(400).json({
      success: false,
      error: "fileName is required",
    });
  }

  // Немедленный ответ
  res.json({
    success: true,
    status: "parsing_started",
  });

  try {
    // ✅ Строим правильный путь к файлу
    const demoPath = path.join(SHARED_DEMOS_DIR, fileName);
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
    if (callbackUrl) {
      console.log("📤 Sending callback...");
      await sendCallbackWithRetry(callbackUrl, {
        success: true,
        data: parsedData,
      });
    }

    console.log(`✅ Demo parsed successfully`);
  } catch (error) {
    console.error(`❌ Parse failed: ${error.message}`);

    if (callbackUrl) {
      await sendCallbackWithRetry(callbackUrl, {
        success: false,
        error: error.message,
      });
    }
  }
});

async function sendCallbackWithRetry(callbackUrl, data, maxRetries = 3) {
  console.log(callbackUrl);

  try {
    console.log(`📞 Sending callback...`);

    const response = await fetch(callbackUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      timeout: 10000,
    });

    if (response.ok) {
      console.log("✅ Callback sent successfully");
      return;
    } else {
      console.log(
        `⚠️ Callback failed with status ${response.status}, retrying...`
      );
    }
  } catch (error) {
    console.log(`⚠️ Callback failed: ${error.message}`);
  }
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

app.listen(PORT, () => {
  console.log(`🚀 Demo parsing server running on port ${PORT}`);
});
