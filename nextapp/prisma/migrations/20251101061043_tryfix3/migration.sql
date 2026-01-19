/*
  Warnings:

  - A unique constraint covering the columns `[victim_id,match_id,round_id]` on the table `match_kill` will be added. If there are existing duplicate values, this will fail.
  - Made the column `victim_id` on table `match_kill` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."match_kill" DROP CONSTRAINT "match_kill_victim_id_fkey";

-- AlterTable
ALTER TABLE "match_kill" ALTER COLUMN "victim_id" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "match_kill_victim_id_match_id_round_id_key" ON "match_kill"("victim_id", "match_id", "round_id");

-- AddForeignKey
ALTER TABLE "match_kill" ADD CONSTRAINT "match_kill_victim_id_fkey" FOREIGN KEY ("victim_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
