/*
  Warnings:

  - You are about to drop the column `noofEntries` on the `PriceList` table. All the data in the column will be lost.
  - You are about to drop the column `defaultBillingPeriod` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `defaultTermMonths` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `isTaxable` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `sku` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `isRequired` on the `ProductBundleItem` table. All the data in the column will be lost.
  - You are about to drop the column `overridePrice` on the `ProductBundleItem` table. All the data in the column will be lost.
  - You are about to drop the column `pricingMode` on the `ProductBundleItem` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[priceBookId]` on the table `PriceList` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,tenantId,productCode]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `priceBookId` to the `PriceList` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recurringFrequency` to the `PriceListEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `billingModel` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productCode` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currency` to the `ProductBundleItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxquantity` to the `ProductBundleItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minquantity` to the `ProductBundleItem` table without a default value. This is not possible if the table is not empty.
  - The required column `name` was added to the `ProductBundleItem` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `parentProductId` to the `ProductBundleItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sequence` to the `ProductBundleItem` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'ACTIVE');

-- CreateEnum
CREATE TYPE "RecurringFrequency" AS ENUM ('DAILY', 'MONTHLY', 'ONE_TIME', 'USAGE', 'WEEKLY', 'YEARLY');

-- DropIndex
DROP INDEX "public"."Product_id_tenantId_sku_key";

-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Contact" ALTER COLUMN "segment" DROP NOT NULL;

-- AlterTable
ALTER TABLE "PriceBook" ADD COLUMN     "currency" TEXT;

-- AlterTable
ALTER TABLE "PriceList" DROP COLUMN "noofEntries",
ADD COLUMN     "priceBookId" TEXT NOT NULL,
ALTER COLUMN "isTaxable" DROP NOT NULL;

-- AlterTable
ALTER TABLE "PriceListEntry" ADD COLUMN     "recurringFrequency" "RecurringFrequency" NOT NULL,
ADD COLUMN     "type" TEXT,
ADD COLUMN     "virtualPrice" BOOLEAN;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "defaultBillingPeriod",
DROP COLUMN "defaultTermMonths",
DROP COLUMN "isTaxable",
DROP COLUMN "sku",
DROP COLUMN "type",
ADD COLUMN     "billingFrequency" INTEGER,
ADD COLUMN     "billingModel" "BillingModel" NOT NULL,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "commercialName" TEXT,
ADD COLUMN     "commitmentDuration" INTEGER,
ADD COLUMN     "commitmentDurationUoM" TEXT,
ADD COLUMN     "currency" TEXT,
ADD COLUMN     "endOfLifeDate" DATE,
ADD COLUMN     "fulfilmentStartDate" DATE,
ADD COLUMN     "isOrderable" BOOLEAN DEFAULT true,
ADD COLUMN     "productCode" VARCHAR(64) NOT NULL,
ADD COLUMN     "productSpecName" TEXT,
ADD COLUMN     "sellingEndDate" DATE,
ADD COLUMN     "sellingStartDate" DATE,
ADD COLUMN     "specificationType" TEXT,
ADD COLUMN     "status" "ProductStatus" NOT NULL,
ADD COLUMN     "subFamily" VARCHAR(64);

-- AlterTable
ALTER TABLE "ProductBundleItem" DROP COLUMN "isRequired",
DROP COLUMN "overridePrice",
DROP COLUMN "pricingMode",
ADD COLUMN     "currency" TEXT NOT NULL,
ADD COLUMN     "maxquantity" INTEGER NOT NULL,
ADD COLUMN     "minquantity" INTEGER NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "parentProductId" TEXT NOT NULL,
ADD COLUMN     "sequence" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PriceList_priceBookId_key" ON "PriceList"("priceBookId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_id_tenantId_productCode_key" ON "Product"("id", "tenantId", "productCode");

-- AddForeignKey
ALTER TABLE "PriceList" ADD CONSTRAINT "PriceList_priceBookId_fkey" FOREIGN KEY ("priceBookId") REFERENCES "PriceBook"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
