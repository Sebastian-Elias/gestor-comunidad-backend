/*
  Warnings:

  - A unique constraint covering the columns `[passport]` on the table `members` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "members" ADD COLUMN     "passport" TEXT,
ALTER COLUMN "rut" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "members_passport_key" ON "members"("passport");
