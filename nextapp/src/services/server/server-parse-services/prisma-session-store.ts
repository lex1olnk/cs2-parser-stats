// lib/prisma-session-store.ts
import { prisma } from "@/lib/prisma";
import {
  Prisma,
  type ProcessingSession as ProcessingSessionRow,
} from "@/../prisma/generated/client";
import type { MatchProgress, ProcessingSession } from "@/types/demo-processing";

/** Поля сессии, которые обновляет этот сервис. */
type SessionUpdate = {
  status?: ProcessingSession["status"];
  processedMatches?: number;
  matches?: MatchProgress[];
};

export class PrismaSessionStore {
  async createSession(matches: MatchProgress[]): Promise<ProcessingSession> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const sessionData = {
      sessionId,
      status: "processing",
      totalMatches: matches.length,
      processedMatches: 0,
      // Prisma принимает Json-колонку как InputJsonValue; форму этих
      // данных задаёт MatchProgress, читаются они обратно там же.
      matches: matches as unknown as Prisma.InputJsonValue,
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

  async updateSession(
    sessionId: string,
    updates: SessionUpdate
  ): Promise<boolean> {
    try {
      // matches отделяем от остальных полей: это Json-колонка, и Prisma
      // ждёт для неё InputJsonValue, а не массив MatchProgress.
      const { matches, ...rest } = updates;

      await prisma.processingSession.update({
        where: { sessionId },
        data: {
          ...rest,
          ...(matches
            ? { matches: matches as unknown as Prisma.InputJsonValue }
            : {}),
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
    updates: Partial<MatchProgress>
  ): Promise<boolean> {
    try {
      const session = await this.getSession(sessionId);
      if (!session) return false;

      const matchIndex = session.matches.findIndex(
        (m) => m.url === matchUrl
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
        (m) => m.status === "completed"
      ).length;
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

  private mapToProcessingSession(
    dbSession: ProcessingSessionRow
  ): ProcessingSession {
    return {
      sessionId: dbSession.sessionId,
      status: dbSession.status as ProcessingSession["status"],
      totalMatches: dbSession.totalMatches,
      processedMatches: dbSession.processedMatches,
      // matches лежит в JSON-колонке: её форму гарантирует только этот
      // сервис, он же её и записывает.
      matches: (dbSession.matches ?? []) as unknown as MatchProgress[],
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
