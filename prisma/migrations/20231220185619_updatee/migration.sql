-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "verfied" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN     "verifiedTeacher" BOOLEAN NOT NULL DEFAULT false;
