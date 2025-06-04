-- AlterTable
ALTER TABLE "Scene" ALTER COLUMN "order" SET DEFAULT 0;

-- CreateIndex
CREATE INDEX "Scene_projectId_idx" ON "Scene"("projectId");
