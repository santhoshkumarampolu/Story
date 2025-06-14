/*
  Warnings:

  - You are about to drop the column `generatedIdeas` on the `Project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Project" DROP COLUMN "generatedIdeas",
ADD COLUMN     "fullScript" TEXT;
