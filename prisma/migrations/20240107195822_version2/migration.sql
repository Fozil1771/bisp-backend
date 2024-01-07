/*
  Warnings:

  - You are about to drop the column `adminId` on the `Token` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `Token` table. All the data in the column will be lost.
  - You are about to drop the column `teacherId` on the `Token` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Token" DROP CONSTRAINT "Token_adminId_fkey";

-- DropForeignKey
ALTER TABLE "Token" DROP CONSTRAINT "Token_studentId_fkey";

-- DropForeignKey
ALTER TABLE "Token" DROP CONSTRAINT "Token_teacherId_fkey";

-- AlterTable
ALTER TABLE "Token" DROP COLUMN "adminId",
DROP COLUMN "studentId",
DROP COLUMN "teacherId";
