/*
  Warnings:

  - You are about to drop the column `currency` on the `Contact` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Account" ALTER COLUMN "currencyCode" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Address" ALTER COLUMN "icxAddressNumber" DROP NOT NULL,
ALTER COLUMN "province" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Contact" DROP COLUMN "currency",
ADD COLUMN     "currencyCode" VARCHAR(3),
ALTER COLUMN "phone" DROP NOT NULL,
ALTER COLUMN "status" DROP NOT NULL,
ALTER COLUMN "gender" DROP NOT NULL;
