/*
  Warnings:

  - You are about to drop the column `type` on the `Token` table. All the data in the column will be lost.
  - Added the required column `password` to the `Admin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `Teacher` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "password" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "password" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN     "password" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Token" DROP COLUMN "type";
