/*
  Warnings:

  - Added the required column `age` to the `measures` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "measures" ADD COLUMN     "age" INTEGER NOT NULL;
