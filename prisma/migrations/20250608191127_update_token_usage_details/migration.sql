-- AlterTable
ALTER TABLE "TokenUsage" ADD COLUMN     "completionTokens" INTEGER,
ADD COLUMN     "modelUsed" TEXT,
ADD COLUMN     "operationName" TEXT,
ADD COLUMN     "promptTokens" INTEGER;
