/*
  Warnings:

  - You are about to drop the column `currency` on the `PriceBook` table. All the data in the column will be lost.
  - You are about to drop the column `billingFrequency` on the `PriceListEntry` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `PriceListEntry` table. All the data in the column will be lost.
  - You are about to drop the column `unitPrice` on the `PriceListEntry` table. All the data in the column will be lost.
  - You are about to drop the column `unitPrice` on the `Product` table. All the data in the column will be lost.
  - Made the column `accountType` on table `PriceList` required. This step will fail if there are existing NULL values in that column.
  - Made the column `country` on table `PriceList` required. This step will fail if there are existing NULL values in that column.
  - Made the column `effectiveFrom` on table `PriceListEntry` required. This step will fail if there are existing NULL values in that column.
  - Made the column `amount` on table `PriceListEntry` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Account" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "PriceBook" DROP COLUMN "currency",
ADD COLUMN     "countryCode" TEXT,
ADD COLUMN     "currencyCode" VARCHAR(3);

-- AlterTable
ALTER TABLE "PriceList" ALTER COLUMN "accountType" SET NOT NULL,
ALTER COLUMN "country" SET NOT NULL;

-- AlterTable
ALTER TABLE "PriceListEntry" DROP COLUMN "billingFrequency",
DROP COLUMN "currency",
DROP COLUMN "unitPrice",
ADD COLUMN     "currencyCode" VARCHAR(3),
ADD COLUMN     "override" BOOLEAN,
ALTER COLUMN "effectiveFrom" SET NOT NULL,
ALTER COLUMN "amount" SET NOT NULL,
ALTER COLUMN "recurringFrequency" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "unitPrice",
ALTER COLUMN "billingModel" DROP NOT NULL;

-- DropEnum
DROP TYPE "public"."BillingFrequency";
