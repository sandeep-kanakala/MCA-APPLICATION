/*
  Warnings:

  - You are about to alter the column `autoNumber` on the `Account` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `VarChar(10)`.

*/
-- AlterTable
ALTER TABLE "Account" ALTER COLUMN "autoNumber" SET DATA TYPE VARCHAR(10);
