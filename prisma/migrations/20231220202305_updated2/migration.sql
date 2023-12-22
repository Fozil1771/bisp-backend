/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `googleId` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "googleId",
ADD COLUMN     "googleId" INTEGER NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("googleId");
