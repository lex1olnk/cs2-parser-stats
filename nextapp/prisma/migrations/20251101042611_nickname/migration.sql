/*
  Warnings:

  - You are about to drop the column `nick_name` on the `user` table. All the data in the column will be lost.
  - Added the required column `nickname` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "nick_name",
ADD COLUMN     "nickname" TEXT NOT NULL;
