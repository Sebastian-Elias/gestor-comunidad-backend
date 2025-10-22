/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `FinanceCategory` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "FinanceCategory_name_key" ON "FinanceCategory"("name");
