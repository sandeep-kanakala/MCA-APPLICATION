/*
  Warnings:

  - Added the required column `updatedAt` to the `PriceBookEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `PriceList` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `PriceListEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ProductBundle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ProductBundleItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PriceBookEntry" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "PriceList" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "PriceListEntry" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ProductBundle" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ProductBundleItem" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
