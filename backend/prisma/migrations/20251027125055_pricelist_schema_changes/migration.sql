/*
  Warnings:

  - Added the required column `code` to the `PriceList` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isTaxable` to the `PriceList` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `PriceListEntry` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BillingFrequency" AS ENUM ('DAILY', 'MONTHLY', 'ONE_TIME', 'USAGE', 'WEEKLY', 'YEARLY');

-- AlterTable
ALTER TABLE "PriceBook" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "PriceList" ADD COLUMN     "accountType" TEXT,
ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "effectiveFrom" TIMESTAMP(3),
ADD COLUMN     "effectiveTo" TIMESTAMP(3),
ADD COLUMN     "isTaxable" BOOLEAN NOT NULL,
ADD COLUMN     "noofEntries" INTEGER;

-- AlterTable
ALTER TABLE "PriceListEntry" ADD COLUMN     "amount" INTEGER,
ADD COLUMN     "billingFrequency" "BillingFrequency",
ADD COLUMN     "currency" VARCHAR(3),
ADD COLUMN     "description" TEXT,
ADD COLUMN     "name" TEXT NOT NULL;
