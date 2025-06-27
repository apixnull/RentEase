/*
  Warnings:

  - You are about to drop the column `name` on the `PropertyTag` table. All the data in the column will be lost.
  - The `status` column on the `units` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `addresses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `photos` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[propertyId,tagId]` on the table `PropertyTag` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tagId` to the `PropertyTag` table without a default value. This is not possible if the table is not empty.
  - Added the required column `barangay` to the `properties` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `properties` table without a default value. This is not possible if the table is not empty.
  - Added the required column `listedPrice` to the `properties` table without a default value. This is not possible if the table is not empty.
  - Added the required column `municipality` to the `properties` table without a default value. This is not possible if the table is not empty.
  - Added the required column `province` to the `properties` table without a default value. This is not possible if the table is not empty.
  - Added the required column `street` to the `properties` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zipCode` to the `properties` table without a default value. This is not possible if the table is not empty.
  - Made the column `tenantId` on table `scheduled_payments` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "UnitStatus" AS ENUM ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'REVIEWED', 'APPROVED', 'REJECTED', 'WITHDRAWN');

-- DropForeignKey
ALTER TABLE "addresses" DROP CONSTRAINT "addresses_propertyId_fkey";

-- DropForeignKey
ALTER TABLE "photos" DROP CONSTRAINT "photos_propertyId_fkey";

-- DropForeignKey
ALTER TABLE "photos" DROP CONSTRAINT "photos_unitId_fkey";

-- DropForeignKey
ALTER TABLE "scheduled_payments" DROP CONSTRAINT "scheduled_payments_tenantId_fkey";

-- DropIndex
DROP INDEX "PropertyTag_propertyId_name_key";

-- DropIndex
DROP INDEX "refresh_tokens_tokenHash_idx";

-- DropIndex
DROP INDEX "users_passwordHash_idx";

-- AlterTable
ALTER TABLE "PropertyTag" DROP COLUMN "name",
ADD COLUMN     "tagId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "barangay" TEXT NOT NULL,
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "isNegotiable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "listedPrice" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "municipality" TEXT NOT NULL,
ADD COLUMN     "province" TEXT NOT NULL,
ADD COLUMN     "street" TEXT NOT NULL,
ADD COLUMN     "zipCode" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "scheduled_payments" ALTER COLUMN "tenantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "units" DROP COLUMN "status",
ADD COLUMN     "status" "UnitStatus" NOT NULL DEFAULT 'AVAILABLE';

-- DropTable
DROP TABLE "addresses";

-- DropTable
DROP TABLE "photos";

-- CreateTable
CREATE TABLE "PropertyPhoto" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropertyPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnitPhoto" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UnitPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatbotSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "transcript" TEXT NOT NULL,

    CONSTRAINT "ChatbotSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "unitId" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "supportingDocUrl" TEXT,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyTag_propertyId_tagId_key" ON "PropertyTag"("propertyId", "tagId");

-- AddForeignKey
ALTER TABLE "PropertyPhoto" ADD CONSTRAINT "PropertyPhoto_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyTag" ADD CONSTRAINT "PropertyTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitPhoto" ADD CONSTRAINT "UnitPhoto_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduled_payments" ADD CONSTRAINT "scheduled_payments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatbotSession" ADD CONSTRAINT "ChatbotSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units"("id") ON DELETE CASCADE ON UPDATE CASCADE;
