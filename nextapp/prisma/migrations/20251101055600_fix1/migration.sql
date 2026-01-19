/*
  Warnings:

  - Made the column `victim_id` on table `match_kill` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."match_kill" DROP CONSTRAINT "match_kill_victim_id_fkey";

-- AlterTable
ALTER TABLE "match_kill" ALTER COLUMN "victim_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "match_kill" ADD CONSTRAINT "match_kill_victim_id_fkey" FOREIGN KEY ("victim_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
