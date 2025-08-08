/*
  Warnings:

  - You are about to drop the column `isListed` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `propertyRules` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `propertySharedFeatures` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `leaseRules` on the `units` table. All the data in the column will be lost.
  - Made the column `unitId` on table `applications` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "PropertyType" ADD VALUE 'SINGLE_HOUSE';

-- DropForeignKey
ALTER TABLE "applications" DROP CONSTRAINT "applications_unitId_fkey";

-- AlterTable
ALTER TABLE "applications" ALTER COLUMN "unitId" SET NOT NULL;

-- AlterTable
ALTER TABLE "properties" DROP COLUMN "isListed",
DROP COLUMN "propertyRules",
DROP COLUMN "propertySharedFeatures",
ADD COLUMN     "leaseRules" JSONB,
ADD COLUMN     "propertyFeatures" JSONB;

-- AlterTable
ALTER TABLE "units" DROP COLUMN "leaseRules",
ADD COLUMN     "isListed" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units"("id") ON DELETE CASCADE ON UPDATE CASCADE;
