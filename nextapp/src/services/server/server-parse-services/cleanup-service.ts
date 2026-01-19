// services/cleanup-service.ts
import { downloadService } from "./download-service";
import { prismaSessionStore } from "./prisma-session-store";

export class CleanupService {
  async cleanupSession(sessionId: string): Promise<void> {
    const session = await prismaSessionStore.getSession(sessionId);
    if (!session) return;

    for (const match of session.matches) {
      if (match.demoPath) {
        await downloadService.cleanupDemoFile(match.demoPath);
      }
    }

    console.log(`Cleaned up session: ${sessionId}`);
  }

  // Периодическая очистка старых файлов
  async cleanupOldFiles(): Promise<void> {
    try {
      // Логика очистки файлов старше 1 часа
      console.log("Running cleanup of old demo files...");
    } catch (error) {
      console.error("Cleanup error:", error);
    }
  }
}

export const cleanupService = new CleanupService();
