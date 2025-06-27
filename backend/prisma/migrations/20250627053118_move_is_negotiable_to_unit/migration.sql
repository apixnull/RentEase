/*
  Warnings:

  - You are about to drop the column `isNegotiable` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `listedPrice` on the `properties` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "properties" DROP COLUMN "isNegotiable",
DROP COLUMN "listedPrice";

-- AlterTable
ALTER TABLE "units" ADD COLUMN     "chargePerHead" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isNegotiable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pricePerHead" DOUBLE PRECISION,
ADD COLUMN     "pricePerUnit" DOUBLE PRECISION;
