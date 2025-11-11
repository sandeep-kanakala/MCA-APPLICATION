/*
  Warnings:

  - Made the column `email` on table `Contact` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phone` on table `Contact` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "middleName" TEXT,
ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "phone" SET NOT NULL;
