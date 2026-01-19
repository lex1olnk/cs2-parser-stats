/*
  Warnings:

  - The primary key for the `match_clutch` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `inflictor_team` on the `match_damage` table. All the data in the column will be lost.
  - You are about to drop the column `killer_team` on the `match_kill` table. All the data in the column will be lost.
  - You are about to drop the column `win_team_num` on the `round` table. All the data in the column will be lost.
  - You are about to drop the column `nickname` on the `user` table. All the data in the column will be lost.
  - Added the required column `match_id` to the `match_clutch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `match_id` to the `match_grenade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `match_id` to the `match_kill` table without a default value. This is not possible if the table is not empty.
  - Made the column `round_id` on table `match_kill` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `match_id` to the `round` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nick_name` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."match_kill" DROP CONSTRAINT "match_kill_round_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."match_kill" DROP CONSTRAINT "match_kill_victim_id_fkey";

-- DropIndex
DROP INDEX "public"."match_damage_inflictor_id_victim_id_round_id_hitbox_group_w_key";

-- DropIndex
DROP INDEX "public"."match_kill_killer_id_victim_id_round_id_key";

-- AlterTable
ALTER TABLE "match_clutch" DROP CONSTRAINT "match_clutch_pkey",
ADD COLUMN     "match_id" UUID NOT NULL,
ADD CONSTRAINT "match_clutch_pkey" PRIMARY KEY ("user_id", "match_id", "round_id");

-- AlterTable
ALTER TABLE "match_damage" DROP COLUMN "inflictor_team";

-- AlterTable
ALTER TABLE "match_grenade" ADD COLUMN     "match_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "match_kill" DROP COLUMN "killer_team",
ADD COLUMN     "match_id" UUID NOT NULL,
ALTER COLUMN "victim_id" DROP NOT NULL,
ALTER COLUMN "round_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "match_member" ADD COLUMN     "match_id" UUID;

-- AlterTable
ALTER TABLE "round" DROP COLUMN "win_team_num",
ADD COLUMN     "match_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "nickname",
ADD COLUMN     "nick_name" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "tournament_participant" ADD CONSTRAINT "tournament_participant_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_member" ADD CONSTRAINT "match_member_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "match"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "round" ADD CONSTRAINT "round_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_kill" ADD CONSTRAINT "match_kill_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_kill" ADD CONSTRAINT "match_kill_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_kill" ADD CONSTRAINT "match_kill_victim_id_fkey" FOREIGN KEY ("victim_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_damage" ADD CONSTRAINT "match_damage_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_clutch" ADD CONSTRAINT "match_clutch_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_grenade" ADD CONSTRAINT "match_grenade_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
