/*
  Warnings:

  - You are about to drop the column `category` on the `finance_entries` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `finance_entries` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('CLP', 'USD', 'EUR');

-- AlterTable
ALTER TABLE "finance_entries" DROP COLUMN "category",
ADD COLUMN     "categoryId" INTEGER NOT NULL,
ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'CLP';

-- CreateTable
CREATE TABLE "FinanceCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "FinanceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "finance_entries_date_idx" ON "finance_entries"("date");

-- CreateIndex
CREATE INDEX "finance_entries_type_idx" ON "finance_entries"("type");

-- CreateIndex
CREATE INDEX "finance_entries_categoryId_idx" ON "finance_entries"("categoryId");

-- CreateIndex
CREATE INDEX "finance_entries_type_date_idx" ON "finance_entries"("type", "date");

-- AddForeignKey
ALTER TABLE "finance_entries" ADD CONSTRAINT "finance_entries_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "FinanceCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
