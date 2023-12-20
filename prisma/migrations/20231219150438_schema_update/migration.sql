/*
  Warnings:

  - You are about to drop the column `password` on the `Admin` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Admin" DROP COLUMN "password",
ALTER COLUMN "username" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Student" ALTER COLUMN "firstName" DROP NOT NULL,
ALTER COLUMN "lastName" DROP NOT NULL,
ALTER COLUMN "username" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Teacher" ALTER COLUMN "firstName" DROP NOT NULL,
ALTER COLUMN "lastName" DROP NOT NULL,
ALTER COLUMN "username" DROP NOT NULL;
