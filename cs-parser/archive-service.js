// demo-server/archive-service.js
const AdmZip = require("adm-zip");
const fs = require("fs");
const path = require("path");

class ArchiveService {
  constructor() {
    this.tempDir = "./temp_demos";
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  // Основная функция: получаем путь к .dem файлу (распаковываем если нужно)
  async getDemoPath(filePath) {
    if (filePath.endsWith(".dem")) {
      return filePath; // Уже .dem файл
    } else if (filePath.endsWith(".zip")) {
      return this.extractFromZip(filePath); // Распаковываем ZIP
    } else {
      throw new Error("Unsupported file format");
    }
  }

  // Распаковка ZIP
  extractFromZip(zipPath) {
    const zip = new AdmZip(zipPath);
    const entries = zip.getEntries();

    // Ищем .dem файл в архиве
    const demoEntry = entries.find((entry) =>
      entry.entryName.toLowerCase().endsWith(".dem")
    );

    if (!demoEntry) {
      throw new Error("No .dem file found in ZIP archive");
    }

    // Сохраняем временный .dem файл
    const demoPath = path.join(this.tempDir, `extracted_${Date.now()}.dem`);
    fs.writeFileSync(demoPath, demoEntry.getData());

    return demoPath;
  }

  // Очистка временных файлов
  cleanupTempFile(demoPath) {
    if (demoPath.includes(this.tempDir) && fs.existsSync(demoPath)) {
      fs.unlinkSync(demoPath);
    }
  }
}

module.exports = ArchiveService;
