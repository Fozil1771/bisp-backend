/*
  Warnings:

  - You are about to drop the column `verfied` on the `Student` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Student" DROP COLUMN "verfied",
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false;
