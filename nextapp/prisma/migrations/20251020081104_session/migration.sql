-- CreateTable
CREATE TABLE "processing_sessions" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "totalMatches" INTEGER NOT NULL,
    "processedMatches" INTEGER NOT NULL,
    "matches" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "processing_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "processing_sessions_sessionId_key" ON "processing_sessions"("sessionId");
