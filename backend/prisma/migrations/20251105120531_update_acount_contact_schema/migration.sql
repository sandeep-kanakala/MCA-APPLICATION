/*
  Warnings:

  - You are about to drop the column `billingCity` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `billingCountry` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `billingPostal` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `billingState` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `billingStreet` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `industry` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `shippingCity` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `shippingCountry` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `shippingPostal` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `shippingState` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `shippingStreet` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `website` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Contact` table. All the data in the column will be lost.
  - Added the required column `autoNumber` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `countryCode` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currencyCode` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `euid` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `autoNumber` to the `Contact` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactNumber` to the `Contact` table without a default value. This is not possible if the table is not empty.
  - Added the required column `countryCode` to the `Contact` table without a default value. This is not possible if the table is not empty.
  - Added the required column `salutation` to the `Contact` table without a default value. This is not possible if the table is not empty.
  - Added the required column `segment` to the `Contact` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Contact` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AddressType" AS ENUM ('SHIPPING', 'BILLING');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PENDING_CONTRACT_APPROVAL', 'ACTIVE', 'CLOSED', 'DORMANT', 'FORGET_ME', 'FRAUD', 'FRAUD_INVESTIGATION', 'PIRACY', 'PIRACY_INVESTIGATION', 'PROSPECT', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "ContactStatus" AS ENUM ('ACTIVE', 'DECEASED', 'EMIGRATED', 'FORGET_ME', 'POTENTIAL', 'FRAUD_INVESTIGATION', 'FRAUD', 'CLOSED', 'SUSPENDED');

-- AlterTable
ALTER TABLE "Account" DROP COLUMN "billingCity",
DROP COLUMN "billingCountry",
DROP COLUMN "billingPostal",
DROP COLUMN "billingState",
DROP COLUMN "billingStreet",
DROP COLUMN "industry",
DROP COLUMN "phone",
DROP COLUMN "shippingCity",
DROP COLUMN "shippingCountry",
DROP COLUMN "shippingPostal",
DROP COLUMN "shippingState",
DROP COLUMN "shippingStreet",
DROP COLUMN "website",
ADD COLUMN     "autoNumber" TEXT NOT NULL,
ADD COLUMN     "countryCode" TEXT NOT NULL,
ADD COLUMN     "currencyCode" VARCHAR(3) NOT NULL,
ADD COLUMN     "euid" TEXT NOT NULL,
ADD COLUMN     "icxAccountNumber" TEXT,
ADD COLUMN     "partnerCustomerNumber" TEXT,
ADD COLUMN     "preferredLanguage" TEXT,
ADD COLUMN     "recordTypeDevName" TEXT,
ADD COLUMN     "segment" TEXT,
ADD COLUMN     "signupOrigin" TEXT,
ADD COLUMN     "status" "AccountStatus" NOT NULL,
ADD COLUMN     "type_c" TEXT,
ADD COLUMN     "viewingPlatform" TEXT;

-- AlterTable
ALTER TABLE "Contact" DROP COLUMN "title",
ADD COLUMN     "age" INTEGER,
ADD COLUMN     "autoNumber" TEXT NOT NULL,
ADD COLUMN     "birthDate" DATE,
ADD COLUMN     "communicationPreference" TEXT,
ADD COLUMN     "contactNumber" TEXT NOT NULL,
ADD COLUMN     "countryCode" TEXT NOT NULL,
ADD COLUMN     "currency" VARCHAR(3),
ADD COLUMN     "icxContactNumber" TEXT,
ADD COLUMN     "idType" TEXT NOT NULL DEFAULT 'Passport Number',
ADD COLUMN     "language" TEXT,
ADD COLUMN     "partnerCustomerNumber" TEXT,
ADD COLUMN     "passportExpirationDate" TIMESTAMP(3),
ADD COLUMN     "passportNumber" TEXT,
ADD COLUMN     "salutation" TEXT NOT NULL,
ADD COLUMN     "segment" TEXT NOT NULL,
ADD COLUMN     "signupOrigin" TEXT,
ADD COLUMN     "status" "ContactStatus" NOT NULL;

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT true,
    "isPrimary" BOOLEAN NOT NULL DEFAULT true,
    "postalCode" TEXT NOT NULL,
    "addressType" "AddressType" NOT NULL,
    "icxAddressNumber" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
