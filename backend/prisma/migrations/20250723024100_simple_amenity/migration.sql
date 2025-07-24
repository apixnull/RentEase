/*
  Warnings:

  - You are about to drop the column `amenityId` on the `PropertyAmenity` table. All the data in the column will be lost.
  - You are about to drop the `Amenity` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `name` to the `PropertyAmenity` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PropertyAmenity" DROP CONSTRAINT "PropertyAmenity_amenityId_fkey";

-- DropIndex
DROP INDEX "PropertyAmenity_propertyId_amenityId_key";

-- AlterTable
ALTER TABLE "PropertyAmenity" DROP COLUMN "amenityId",
ADD COLUMN     "name" TEXT NOT NULL;

-- DropTable
DROP TABLE "Amenity";
