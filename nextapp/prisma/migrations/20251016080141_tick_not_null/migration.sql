/*
  Warnings:

  - Made the column `tick` on table `round` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "round" ALTER COLUMN "tick" SET NOT NULL;
