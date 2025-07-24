/*
  Warnings:

  - You are about to drop the column `propertyFeatureTags` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `hasPrivateBathroom` on the `units` table. All the data in the column will be lost.
  - You are about to drop the column `numberOfBeds` on the `units` table. All the data in the column will be lost.
  - You are about to drop the column `squareMeters` on the `units` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "properties" DROP COLUMN "propertyFeatureTags",
ADD COLUMN     "propertyRules" JSONB,
ADD COLUMN     "propertySharedFeatures" JSONB;

-- AlterTable
ALTER TABLE "units" DROP COLUMN "hasPrivateBathroom",
DROP COLUMN "numberOfBeds",
DROP COLUMN "squareMeters",
ADD COLUMN     "leaseRules" JSONB;
