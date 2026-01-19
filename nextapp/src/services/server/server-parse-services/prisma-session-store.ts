// lib/prisma-session-store.ts
import { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ProcessingSession } from "@/types/demo-processing";

export class PrismaSessionStore {
  async createSession(matches: any[]): Promise<any> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const sessionData = {
      sessionId,
      status: "processing",
      totalMatches: matches.length,
      processedMatches: 0,
      matches: matches,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const session = await prisma.processingSession.create({
      data: sessionData,
    });

    console.log(`✅ Session created in DB: ${sessionId}`);
    return this.mapToProcessingSession(session);
  }

  async getSession(sessionId: string): Promise<ProcessingSession | null> {
    try {
      const session = await prisma.processingSession.findUnique({
        where: { sessionId },
      });

      return session ? this.mapToProcessingSession(session) : null;
    } catch (error) {
      console.error("Error getting session from DB:", error);
      return null;
    }
  }

  async updateSession(sessionId: string, updates: any): Promise<boolean> {
    try {
      await prisma.processingSession.update({
        where: { sessionId },
        data: {
          ...updates,
          updatedAt: new Date(),
        },
      });
      return true;
    } catch (error) {
      console.error("Error updating session in DB:", error);
      return false;
    }
  }

  async updateMatchProgress(
    sessionId: string,
    matchUrl: string,
    updates: any
  ): Promise<boolean> {
    try {
      const session = await this.getSession(sessionId);
      if (!session) return false;

      const matchIndex = session.matches.findIndex(
        (m: any) => m.url === matchUrl
      );
      if (matchIndex === -1) return false;

      // Обновляем матч
      const updatedMatches = [...session.matches];
      updatedMatches[matchIndex] = {
        ...updatedMatches[matchIndex],
        ...updates,
      };

      // Пересчитываем общий прогресс
      const completedMatches = updatedMatches.filter(
        (m: any) => m.status === "completed"
      ).length;
      const totalProgress =
        updatedMatches.reduce(
          (sum: number, match: any) => sum + match.progress,
          0
        ) / session.totalMatches;

      // Сохраняем в БД
      await this.updateSession(sessionId, {
        matches: updatedMatches,
        processedMatches: completedMatches,
        status:
          completedMatches === session.totalMatches
            ? "completed"
            : "processing",
      });

      return true;
    } catch (error) {
      console.error("Error updating match progress:", error);
      return false;
    }
  }

  private mapToProcessingSession(dbSession: any): any {
    return {
      sessionId: dbSession.sessionId,
      status: dbSession.status,
      totalMatches: dbSession.totalMatches,
      processedMatches: dbSession.processedMatches,
      matches: dbSession.matches,
      createdAt: dbSession.createdAt,
      updatedAt: dbSession.updatedAt,
    };
  }

  // Очистка старых сессий (опционально)
  async cleanupOldSessions(hoursOld: number = 24): Promise<void> {
    try {
      const cutoffTime = new Date(Date.now() - hoursOld * 60 * 60 * 1000);

      await prisma.processingSession.deleteMany({
        where: {
          createdAt: {
            lt: cutoffTime,
          },
        },
      });

      console.log(`🧹 Cleaned up old sessions`);
    } catch (error) {
      console.error("Error cleaning up old sessions:", error);
    }
  }
}

export const prismaSessionStore = new PrismaSessionStore();
