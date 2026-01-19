/*
  Warnings:

  - Added the required column `draft_order` to the `tournament_participant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tournament_participant" ADD COLUMN     "draft_order" INTEGER NOT NULL;
