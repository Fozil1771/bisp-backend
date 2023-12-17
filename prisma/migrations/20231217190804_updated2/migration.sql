/*
  Warnings:

  - Made the column `adminId` on table `Teacher` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Teacher" DROP CONSTRAINT "Teacher_adminId_fkey";

-- AlterTable
ALTER TABLE "Teacher" ALTER COLUMN "adminId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Teacher" ADD CONSTRAINT "Teacher_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
