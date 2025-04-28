/*
  Warnings:

  - Added the required column `categoryId` to the `Products` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'INVENTORY_MANAGER', 'PURCHASER', 'SALES', 'WAREHOUSE_STAFF', 'ANALYST', 'GUEST');

-- AlterTable
ALTER TABLE "Products" ADD COLUMN     "categoryId" TEXT NOT NULL,
ADD COLUMN     "photo" TEXT,
ALTER COLUMN "stockQuantity" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "password" TEXT,
ADD COLUMN     "photo" TEXT,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'GUEST';

-- CreateTable
CREATE TABLE "Categories" (
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Categories_pkey" PRIMARY KEY ("categoryId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Categories_name_key" ON "Categories"("name");

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "Products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Categories"("categoryId") ON DELETE RESTRICT ON UPDATE CASCADE;
