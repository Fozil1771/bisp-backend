-- DropForeignKey
ALTER TABLE "Teacher" DROP CONSTRAINT "Teacher_adminId_fkey";

-- AlterTable
ALTER TABLE "Teacher" ALTER COLUMN "adminId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Teacher" ADD CONSTRAINT "Teacher_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
