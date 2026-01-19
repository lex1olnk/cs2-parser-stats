/*
  Warnings:

  - You are about to drop the column `match_id` on the `round` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."match_kill" DROP CONSTRAINT "match_kill_round_id_fkey";

-- AlterTable
ALTER TABLE "match_kill" ALTER COLUMN "round_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "round" DROP COLUMN "match_id";

-- AddForeignKey
ALTER TABLE "match_kill" ADD CONSTRAINT "match_kill_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "round"("id") ON DELETE SET NULL ON UPDATE CASCADE;
