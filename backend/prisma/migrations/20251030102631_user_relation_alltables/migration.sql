/*
  Warnings:

  - The values [OrderAmendment] on the enum `Subject` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `ownerId` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `ownerId` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `ownerId` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `ownerId` on the `Opportunity` table. All the data in the column will be lost.
  - You are about to drop the column `accountId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `ownerId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `trialDays` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `ownerId` on the `Quote` table. All the data in the column will be lost.
  - You are about to drop the `OrderAmendment` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[id,tenantId,name]` on the table `Account` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,tenantId,email]` on the table `Contact` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,tenantId,email]` on the table `Lead` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,tenantId,accountId,name]` on the table `Opportunity` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,tenantId,orderNumber]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,tenantId,name]` on the table `PriceBook` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,tenantId,priceBookId,productId]` on the table `PriceBookEntry` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,tenantId,name]` on the table `PriceList` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[accountId]` on the table `PriceList` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,tenantId,priceListId,productId,effectiveFrom]` on the table `PriceListEntry` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,tenantId,name]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,tenantId,sku]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,tenantId,parentProductId,name]` on the table `ProductBundle` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,bundleId,productId]` on the table `ProductBundleItem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `priceListId` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Attachment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `billingAccountId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Made the column `accountId` on table `PriceList` required. This step will fail if there are existing NULL values in that column.
  - Made the column `sku` on table `Product` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('PARTNER', 'CUSTOMER');

-- AlterEnum
BEGIN;
CREATE TYPE "Subject_new" AS ENUM ('Tenant', 'Team', 'User', 'Permission', 'UserTeam', 'Account', 'Contact', 'Lead', 'Opportunity', 'OpportunityContactRole', 'Product', 'PriceBook', 'PriceBookEntry', 'ProductBundle', 'ProductBundleItem', 'PriceList', 'PriceListEntry', 'Quote', 'QuoteLineItem', 'Order', 'OrderItem', 'Campaign', 'CampaignContactMember', 'CampaignLeadMember', 'Subscription', 'SubscriptionItem', 'Asset', 'Task', 'Event', 'EventParticipant', 'Note', 'Attachment');
ALTER TABLE "Permission" ALTER COLUMN "subject" TYPE "Subject_new" USING ("subject"::text::"Subject_new");
ALTER TYPE "Subject" RENAME TO "Subject_old";
ALTER TYPE "Subject_new" RENAME TO "Subject";
DROP TYPE "public"."Subject_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."Account" DROP CONSTRAINT "Account_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Contact" DROP CONSTRAINT "Contact_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Lead" DROP CONSTRAINT "Lead_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Opportunity" DROP CONSTRAINT "Opportunity_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Order" DROP CONSTRAINT "Order_accountId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Order" DROP CONSTRAINT "Order_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OrderAmendment" DROP CONSTRAINT "OrderAmendment_orderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OrderAmendment" DROP CONSTRAINT "OrderAmendment_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PriceList" DROP CONSTRAINT "PriceList_accountId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Quote" DROP CONSTRAINT "Quote_ownerId_fkey";

-- DropIndex
DROP INDEX "public"."Account_ownerId_idx";

-- DropIndex
DROP INDEX "public"."Account_tenantId_name_key";

-- DropIndex
DROP INDEX "public"."Contact_tenantId_email_key";

-- DropIndex
DROP INDEX "public"."Lead_ownerId_idx";

-- DropIndex
DROP INDEX "public"."Lead_tenantId_email_key";

-- DropIndex
DROP INDEX "public"."Opportunity_tenantId_accountId_name_key";

-- DropIndex
DROP INDEX "public"."Order_tenantId_orderNumber_key";

-- DropIndex
DROP INDEX "public"."PriceBook_tenantId_name_key";

-- DropIndex
DROP INDEX "public"."PriceBookEntry_tenantId_priceBookId_productId_key";

-- DropIndex
DROP INDEX "public"."PriceList_accountId_idx";

-- DropIndex
DROP INDEX "public"."PriceList_tenantId_name_key";

-- DropIndex
DROP INDEX "public"."PriceListEntry_tenantId_priceListId_productId_effectiveFrom_key";

-- DropIndex
DROP INDEX "public"."Product_tenantId_name_key";

-- DropIndex
DROP INDEX "public"."Product_tenantId_sku_key";

-- DropIndex
DROP INDEX "public"."ProductBundle_tenantId_parentProductId_name_key";

-- DropIndex
DROP INDEX "public"."ProductBundleItem_bundleId_productId_key";

-- AlterTable
ALTER TABLE "Account" DROP COLUMN "ownerId",
ADD COLUMN     "priceListId" TEXT NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "AccountType" NOT NULL;

-- AlterTable
ALTER TABLE "Attachment" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "Contact" DROP COLUMN "ownerId";

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "Lead" DROP COLUMN "ownerId";

-- AlterTable
ALTER TABLE "Note" ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "Opportunity" DROP COLUMN "ownerId";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "accountId",
DROP COLUMN "ownerId",
ADD COLUMN     "billingAccountId" TEXT NOT NULL,
ADD COLUMN     "customerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "Permission" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "PriceBook" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "PriceBookEntry" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "PriceList" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "updatedById" TEXT,
ALTER COLUMN "accountId" SET NOT NULL;

-- AlterTable
ALTER TABLE "PriceListEntry" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "trialDays",
ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "updatedById" TEXT,
ALTER COLUMN "sku" SET NOT NULL;

-- AlterTable
ALTER TABLE "ProductBundle" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "ProductBundleItem" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "Quote" DROP COLUMN "ownerId";

-- AlterTable
ALTER TABLE "QuoteLineItem" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "Role" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "SubscriptionItem" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "updatedById" TEXT;

-- DropTable
DROP TABLE "public"."OrderAmendment";

-- CreateIndex
CREATE UNIQUE INDEX "Account_id_tenantId_name_key" ON "Account"("id", "tenantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_id_tenantId_email_key" ON "Contact"("id", "tenantId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_id_tenantId_email_key" ON "Lead"("id", "tenantId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "Opportunity_id_tenantId_accountId_name_key" ON "Opportunity"("id", "tenantId", "accountId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Order_id_tenantId_orderNumber_key" ON "Order"("id", "tenantId", "orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "PriceBook_id_tenantId_name_key" ON "PriceBook"("id", "tenantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "PriceBookEntry_id_tenantId_priceBookId_productId_key" ON "PriceBookEntry"("id", "tenantId", "priceBookId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "PriceList_id_tenantId_name_key" ON "PriceList"("id", "tenantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "PriceList_accountId_key" ON "PriceList"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "PriceListEntry_id_tenantId_priceListId_productId_effectiveF_key" ON "PriceListEntry"("id", "tenantId", "priceListId", "productId", "effectiveFrom");

-- CreateIndex
CREATE UNIQUE INDEX "Product_id_tenantId_name_key" ON "Product"("id", "tenantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Product_id_tenantId_sku_key" ON "Product"("id", "tenantId", "sku");

-- CreateIndex
CREATE UNIQUE INDEX "ProductBundle_id_tenantId_parentProductId_name_key" ON "ProductBundle"("id", "tenantId", "parentProductId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "ProductBundleItem_id_bundleId_productId_key" ON "ProductBundleItem"("id", "bundleId", "productId");

-- AddForeignKey
ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceBook" ADD CONSTRAINT "PriceBook_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceBook" ADD CONSTRAINT "PriceBook_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceBookEntry" ADD CONSTRAINT "PriceBookEntry_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceBookEntry" ADD CONSTRAINT "PriceBookEntry_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductBundle" ADD CONSTRAINT "ProductBundle_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductBundle" ADD CONSTRAINT "ProductBundle_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductBundleItem" ADD CONSTRAINT "ProductBundleItem_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductBundleItem" ADD CONSTRAINT "ProductBundleItem_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceList" ADD CONSTRAINT "PriceList_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceList" ADD CONSTRAINT "PriceList_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceList" ADD CONSTRAINT "PriceList_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceListEntry" ADD CONSTRAINT "PriceListEntry_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceListEntry" ADD CONSTRAINT "PriceListEntry_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteLineItem" ADD CONSTRAINT "QuoteLineItem_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteLineItem" ADD CONSTRAINT "QuoteLineItem_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_billingAccountId_fkey" FOREIGN KEY ("billingAccountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionItem" ADD CONSTRAINT "SubscriptionItem_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionItem" ADD CONSTRAINT "SubscriptionItem_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
