-- DropForeignKey
ALTER TABLE "public"."match_kill" DROP CONSTRAINT "match_kill_killer_id_fkey";

-- AlterTable
ALTER TABLE "match_kill" ALTER COLUMN "killer_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "match_kill" ADD CONSTRAINT "match_kill_killer_id_fkey" FOREIGN KEY ("killer_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
