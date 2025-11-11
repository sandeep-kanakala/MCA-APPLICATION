/*
  Warnings:

  - Changed the type of `autoNumber` on the `Account` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Account" DROP COLUMN "autoNumber",
ADD COLUMN     "autoNumber" INTEGER NOT NULL;
