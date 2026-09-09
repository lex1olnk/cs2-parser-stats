// app/api/matches/progress/[sessionId]/route.ts
import { prismaSessionStore } from "@/services/server/server-parse-services/prisma-session-store";
import { NextRequest, NextResponse } from "next/server";

// В Next 15 params приходит промисом — его нужно дожидаться.
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await context.params;

    // ✅ Ждем получения сессии
    const session = await prismaSessionStore.getSession(sessionId);

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({
      sessionId: session.sessionId,
      status: session.status,
      totalMatches: session.totalMatches,
      processedMatches: session.processedMatches,
      overallProgress: Math.round(
        session.matches.reduce((sum, match) => sum + match.progress, 0) /
          session.totalMatches
      ),
      matches: session.matches.map((match) => ({
        url: match.url,
        platform: match.platform,
        status: match.status,
        progress: match.progress,
        currentStep: match.currentStep,
        error: match.error,
      })),
    });
  } catch (error) {
    console.error("Error getting progress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
