/*
  Warnings:

  - You are about to drop the column `archivedAt` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `isArchived` on the `OrderItem` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'INPROGRESS';

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "archivedAt",
DROP COLUMN "isArchived";
