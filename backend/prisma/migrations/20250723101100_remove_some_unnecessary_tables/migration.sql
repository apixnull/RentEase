/*
  Warnings:

  - You are about to drop the column `chargePerHead` on the `units` table. All the data in the column will be lost.
  - You are about to drop the column `pricePerHead` on the `units` table. All the data in the column will be lost.
  - You are about to drop the column `pricePerUnit` on the `units` table. All the data in the column will be lost.
  - You are about to drop the `PropertyAmenity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PropertyFeature` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PropertyPhoto` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UnitFeature` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UnitPhoto` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `targetPrice` to the `units` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `units` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PropertyAmenity" DROP CONSTRAINT "PropertyAmenity_propertyId_fkey";

-- DropForeignKey
ALTER TABLE "PropertyFeature" DROP CONSTRAINT "PropertyFeature_propertyId_fkey";

-- DropForeignKey
ALTER TABLE "PropertyPhoto" DROP CONSTRAINT "PropertyPhoto_propertyId_fkey";

-- DropForeignKey
ALTER TABLE "UnitFeature" DROP CONSTRAINT "UnitFeature_unitId_fkey";

-- DropForeignKey
ALTER TABLE "UnitPhoto" DROP CONSTRAINT "UnitPhoto_unitId_fkey";

-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "amenityTags" JSONB,
ADD COLUMN     "propertyFeatureTags" JSONB,
ADD COLUMN     "propertyImageUrls" JSONB;

-- AlterTable
ALTER TABLE "units" DROP COLUMN "chargePerHead",
DROP COLUMN "pricePerHead",
DROP COLUMN "pricePerUnit",
ADD COLUMN     "floorNumber" INTEGER,
ADD COLUMN     "hasPrivateBathroom" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "numberOfBeds" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "squareMeters" DOUBLE PRECISION,
ADD COLUMN     "targetPrice" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "unitFeatureTags" JSONB,
ADD COLUMN     "unitImageUrls" JSONB,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "PropertyAmenity";

-- DropTable
DROP TABLE "PropertyFeature";

-- DropTable
DROP TABLE "PropertyPhoto";

-- DropTable
DROP TABLE "UnitFeature";

-- DropTable
DROP TABLE "UnitPhoto";
