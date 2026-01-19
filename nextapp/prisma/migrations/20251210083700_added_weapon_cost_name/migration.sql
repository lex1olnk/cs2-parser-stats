/*
  Warnings:

  - The primary key for the `match_clutch` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `cost` to the `weapon` table without a default value. This is not possible if the table is not empty.
  - Added the required column `inventory_name` to the `weapon` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "match_clutch" DROP CONSTRAINT "match_clutch_pkey",
ADD CONSTRAINT "match_clutch_pkey" PRIMARY KEY ("user_id", "round_id");

-- AlterTable
ALTER TABLE "weapon" ADD COLUMN     "cost" INTEGER NOT NULL,
ADD COLUMN     "inventory_name" TEXT NOT NULL;
