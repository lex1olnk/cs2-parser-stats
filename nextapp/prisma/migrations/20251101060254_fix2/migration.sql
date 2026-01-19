/*
  Warnings:

  - You are about to drop the column `nick_name` on the `user` table. All the data in the column will be lost.
  - Added the required column `inflictor_team` to the `match_damage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `killer_team` to the `match_kill` table without a default value. This is not possible if the table is not empty.
  - Added the required column `win_team_num` to the `round` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nickname` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "match_damage" ADD COLUMN     "inflictor_team" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "match_kill" ADD COLUMN     "killer_team" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "round" ADD COLUMN     "win_team_num" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "nick_name",
ADD COLUMN     "nickname" TEXT NOT NULL;
