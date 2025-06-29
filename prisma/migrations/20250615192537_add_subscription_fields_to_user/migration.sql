-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "blurb" TEXT,
ADD COLUMN     "genre" TEXT,
ADD COLUMN     "keyVisualMoments" TEXT,
ADD COLUMN     "targetLength" INTEGER,
ADD COLUMN     "theme" TEXT,
ADD COLUMN     "tone" TEXT,
ADD COLUMN     "visualStyle" TEXT,
ADD COLUMN     "worldBuilding" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "imageUsageThisMonth" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isAdmin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "subscriptionStatus" TEXT DEFAULT 'free',
ADD COLUMN     "tokenUsageThisMonth" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "OutlineBeat" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT,
    "summary" TEXT NOT NULL,
    "beatType" TEXT,
    "act" TEXT,
    "notes" TEXT,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutlineBeat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chapter" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "content" TEXT,
    "wordCount" INTEGER,
    "goals" TEXT,
    "conflicts" TEXT,
    "notes" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chapter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NarrativeDraft" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "wordCount" INTEGER,
    "notes" TEXT,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NarrativeDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OutlineBeat_projectId_idx" ON "OutlineBeat"("projectId");

-- CreateIndex
CREATE INDEX "Chapter_projectId_idx" ON "Chapter"("projectId");

-- CreateIndex
CREATE INDEX "NarrativeDraft_projectId_idx" ON "NarrativeDraft"("projectId");

-- AddForeignKey
ALTER TABLE "OutlineBeat" ADD CONSTRAINT "OutlineBeat_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NarrativeDraft" ADD CONSTRAINT "NarrativeDraft_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
