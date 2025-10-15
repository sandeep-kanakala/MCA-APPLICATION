/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Opportunity` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Quote` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Account" DROP COLUMN "deletedAt",
ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Contact" DROP COLUMN "deletedAt",
ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "deletedAt",
ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Lead" DROP COLUMN "deletedAt",
ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Opportunity" DROP COLUMN "deletedAt",
ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "deletedAt",
ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "deletedAt",
ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Quote" DROP COLUMN "deletedAt",
ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "deletedAt",
ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;
