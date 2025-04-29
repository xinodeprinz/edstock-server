/*
  Warnings:

  - Added the required column `updatedAt` to the `Categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ExpenseByCategory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ExpenseSummary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Expenses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `PurchaseSummary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Purchases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Sales` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `SalesSummary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Categories" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ExpenseByCategory" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ExpenseSummary" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Expenses" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Products" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "sku" TEXT,
ADD COLUMN     "supplier" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "PurchaseSummary" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Purchases" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Sales" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "SalesSummary" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
