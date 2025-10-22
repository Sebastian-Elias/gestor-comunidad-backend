/*
  Warnings:

  - You are about to drop the `finance_entries` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "finance_entries" DROP CONSTRAINT "finance_entries_createdById_fkey";

-- DropForeignKey
ALTER TABLE "finance_entries" DROP CONSTRAINT "finance_entries_updatedById_fkey";

-- DropTable
DROP TABLE "finance_entries";

-- DropEnum
DROP TYPE "FinanceType";

-- DropEnum
DROP TYPE "PaymentMethod";

-- CreateTable
CREATE TABLE "financial_transactions" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "referenceNumber" TEXT,
    "donorName" TEXT,
    "donorContact" TEXT,
    "beneficiary" TEXT,
    "accountNumber" TEXT,
    "bankName" TEXT,
    "invoiceNumber" TEXT,
    "subItem" TEXT,
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_transactions_pkey" PRIMARY KEY ("id")
);
