// services/download-service.ts
import fs from "fs/promises";
import path from "path";

import { graphqlMatch } from "./query";
import { prismaSessionStore } from "./prisma-session-store";

export interface DownloadResult {
  success: boolean;
  error?: string;
  demoPath?: string;
}

export class DownloadService {
  private readonly DEMOS_DIR = path.join(process.cwd(), "..", "shared-demos");

  constructor() {
    this.ensureDemosDir();
  }

  private async ensureDemosDir(): Promise<void> {
    try {
      await fs.access(this.DEMOS_DIR);
    } catch {
      await fs.mkdir(this.DEMOS_DIR, { recursive: true });
    }
  }
  async downloadDemo(
    sessionId: string,
    matchUrl: string,
    platform: "fastcup" | "cybershoke"
  ): Promise<DownloadResult> {
    try {
      // Обновляем статус - начинаем скачивание
      await prismaSessionStore.updateMatchProgress(sessionId, matchUrl, {
        status: "downloading",
        progress: 10,
        currentStep: "Getting demo URL from platform",
      });
      console.log(matchUrl, platform);
      // Получаем ссылку на демо в зависимости от платформы
      const demoUrl = await this.getDemoUrl(matchUrl, platform);

      if (!demoUrl) {
        throw new Error(`Failed to get demo URL from ${platform}`);
      }

      // Обновляем прогресс
      await prismaSessionStore.updateMatchProgress(sessionId, matchUrl, {
        progress: 30,
        currentStep: "Downloading demo file",
      });

      // Скачиваем файл
      const demoPath = await this.downloadFile(
        demoUrl,
        sessionId,
        matchUrl,
        platform
      );

      // Обновляем статус - скачивание завершено
      await prismaSessionStore.updateMatchProgress(sessionId, matchUrl, {
        progress: 50,
        currentStep: "Download completed",
        demoPath,
      });

      return { success: true, demoPath };
    } catch (error) {
      console.error(`Download failed for ${matchUrl}:`, error);

      await prismaSessionStore.updateMatchProgress(sessionId, matchUrl, {
        status: "error",
        error: "sessionError",
      });

      return { success: false, error: "sessionErro not setted" };
    }
  }

  private async getDemoUrl(
    matchUrl: string,
    platform: "fastcup" | "cybershoke"
  ): Promise<string> {
    switch (platform) {
      case "fastcup":
        return await this.getFastcupDemoUrl(matchUrl);
      case "cybershoke":
        return await this.getCybershokeDemoUrl(matchUrl);
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  private async getFastcupDemoUrl(matchUrl: string): Promise<string> {
    try {
      // Извлекаем ID матча из URL
      const matchId = this.extractFastcupMatchId(matchUrl);

      // GraphQL запрос к Fastcup API (как в твоем примере)
      const graphqlQuery = {
        query: graphqlMatch,
        variables: {
          matchId: parseInt(matchId),
          gameId: 3, // CS2
        },
      };

      const response = await fetch("https://hasura.fastcup.net/v1/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        body: JSON.stringify(graphqlQuery),
      });

      if (!response.ok) {
        throw new Error(`Fastcup API error: ${response.status}`);
      }

      const data = await response.json();

      // Извлекаем первую доступную ссылку на демо
      const demoUrl = data?.data?.match?.maps?.[0]?.replays?.[0]?.url;

      if (!demoUrl) {
        throw new Error("No demo URL found in Fastcup response");
      }

      return demoUrl;
    } catch (error) {
      throw new Error(`Failed to get Fastcup demo URL: ${error}`);
    }
  }

  private async getCybershokeDemoUrl(matchUrl: string): Promise<string> {
    try {
      // Извлекаем ID матча из URL
      // Регулярное выражение для извлечения ID матча из URL Cybershoke
      const match = matchUrl.match(/cybershoke\.net\/.*?\/match\/(\d+)/);

      if (!match || !match[1]) {
        throw new Error("Invalid Cybershoke match URL format");
      }

      const matchId = match[1];
      // Формируем URL для демо файла
      const demoUrl = `https://cdn-de-1.cybershoke.net/demos/${matchId}`;
      console.log(demoUrl);
      return demoUrl;
    } catch (error) {
      throw new Error(`Failed to get Cybershoke demo URL: ${error}`);
    }
  }

  async downloadFile(
    demoUrl: string,
    sessionId: string,
    matchUrl: string,
    platform: "fastcup" | "cybershoke"
  ): Promise<string> {
    const fileName = `demo_${sessionId}_${Date.now()}${
      platform == "fastcup" ? ".dem" : ".zip"
    }`;
    const filePath = path.join(this.DEMOS_DIR, fileName);
    const response = await fetch(demoUrl);

    if (!response.ok) {
      throw new Error(
        `Download failed: ${response.status} ${response.statusText}`
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await fs.writeFile(filePath, buffer);

    // ✅ Ждем 3 секунды чтобы файл гарантированно записался
    console.log(`⏳ Waiting for file to be fully written...`);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const stats = await fs.stat(filePath);
    if (stats.size === 0) {
      throw new Error("Downloaded file is empty");
    }

    console.log(`✅ Demo downloaded to: ${filePath}`);
    return filePath;
  }

  private extractFastcupMatchId(url: string): string {
    const match = url.match(/\/(\d+)$/);
    if (!match) {
      throw new Error("Invalid Fastcup URL format");
    }
    return match[1];
  }

  // Очистка временных файлов
  async cleanupDemoFile(demoPath: string): Promise<void> {
    try {
      await fs.unlink(demoPath);
      console.log(`Cleaned up demo file: ${demoPath}`);
    } catch (error) {
      console.error(`Failed to cleanup demo file ${demoPath}:`, error);
    }
  }
}

export const downloadService = new DownloadService();
