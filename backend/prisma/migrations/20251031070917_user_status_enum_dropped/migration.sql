/*
  Warnings:

  - The `pricingMode` column on the `ProductBundleItem` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `status` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PricingMode" AS ENUM ('INHERIT', 'OVERRIDE', 'INCLUDED');

-- AlterTable
ALTER TABLE "ProductBundleItem" DROP COLUMN "pricingMode",
ADD COLUMN     "pricingMode" "PricingMode" NOT NULL DEFAULT 'INHERIT';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "status",
ALTER COLUMN "password" DROP NOT NULL;

-- DropEnum
DROP TYPE "public"."UserStatus";
