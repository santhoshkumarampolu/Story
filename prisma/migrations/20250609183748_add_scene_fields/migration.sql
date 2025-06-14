-- AlterTable
ALTER TABLE "Character" ADD COLUMN     "conflicts" TEXT,
ADD COLUMN     "goals" TEXT,
ADD COLUMN     "imagePath" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "personality" TEXT,
ADD COLUMN     "traits" TEXT[];

-- AlterTable
ALTER TABLE "Scene" ADD COLUMN     "conflicts" TEXT,
ADD COLUMN     "goals" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "timeOfDay" TEXT;
