/*
  Warnings:

  - The primary key for the `finance_entries` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `finance_entries` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "finance_entries" DROP CONSTRAINT "finance_entries_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "finance_entries_pkey" PRIMARY KEY ("id");
