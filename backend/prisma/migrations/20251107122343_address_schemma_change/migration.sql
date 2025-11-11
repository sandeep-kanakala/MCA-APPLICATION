-- CreateEnum
CREATE TYPE "BillingModel" AS ENUM ('POD', 'ARC');

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "sameAsBilling" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Address" ALTER COLUMN "isDefault" DROP NOT NULL,
ALTER COLUMN "isDefault" DROP DEFAULT,
ALTER COLUMN "isPrimary" DROP NOT NULL,
ALTER COLUMN "isPrimary" DROP DEFAULT;
