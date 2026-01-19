/*
  Warnings:

  - The primary key for the `match_clutch` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `match_id` on the `match_clutch` table. All the data in the column will be lost.
  - You are about to drop the column `match_id` on the `match_grenade` table. All the data in the column will be lost.
  - You are about to drop the column `match_id` on the `match_kill` table. All the data in the column will be lost.
  - You are about to drop the column `match_id` on the `match_member` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."match_clutch" DROP CONSTRAINT "match_clutch_match_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."match_damage" DROP CONSTRAINT "match_damage_match_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."match_grenade" DROP CONSTRAINT "match_grenade_match_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."match_kill" DROP CONSTRAINT "match_kill_match_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."match_member" DROP CONSTRAINT "match_member_match_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."round" DROP CONSTRAINT "round_match_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."tournament_participant" DROP CONSTRAINT "tournament_participant_tournament_id_fkey";

-- AlterTable
ALTER TABLE "match_clutch" DROP CONSTRAINT "match_clutch_pkey",
DROP COLUMN "match_id",
ADD CONSTRAINT "match_clutch_pkey" PRIMARY KEY ("user_id", "round_id");

-- AlterTable
ALTER TABLE "match_grenade" DROP COLUMN "match_id";

-- AlterTable
ALTER TABLE "match_kill" DROP COLUMN "match_id";

-- AlterTable
ALTER TABLE "match_member" DROP COLUMN "match_id";
