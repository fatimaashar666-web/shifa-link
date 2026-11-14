-- DropIndex
DROP INDEX "diagnostic_service_locations_serviceId_organizationId_key";

-- AlterTable
ALTER TABLE "diagnostic_bookings" ADD COLUMN     "diagnosticLocationId" TEXT;

-- AlterTable
ALTER TABLE "diagnostic_service_locations" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'PKR',
ADD COLUMN     "locationId" TEXT;

-- AlterTable
ALTER TABLE "diagnostic_services" ADD COLUMN     "code" TEXT,
ADD COLUMN     "fastingHours" INTEGER,
ADD COLUMN     "fastingRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPopular" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "modality" TEXT,
ADD COLUMN     "sampleType" TEXT,
ADD COLUMN     "searchKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "shortDescription" TEXT,
ALTER COLUMN "basePrice" DROP NOT NULL;

-- CreateTable
CREATE TABLE "diagnostic_locations" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT 'Karachi',
    "area" TEXT,
    "postalCode" TEXT,
    "phone" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "supportsHomeCollection" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diagnostic_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnostic_packages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "type" "OrgType" NOT NULL,
    "imageUrl" TEXT,
    "basePrice" DECIMAL(10,2) NOT NULL,
    "discountedPrice" DECIMAL(10,2),
    "totalTests" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diagnostic_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnostic_package_items" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,

    CONSTRAINT "diagnostic_package_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "diagnostic_locations_organizationId_idx" ON "diagnostic_locations"("organizationId");

-- CreateIndex
CREATE INDEX "diagnostic_locations_city_area_idx" ON "diagnostic_locations"("city", "area");

-- CreateIndex
CREATE UNIQUE INDEX "diagnostic_packages_slug_key" ON "diagnostic_packages"("slug");

-- CreateIndex
CREATE INDEX "diagnostic_packages_type_category_idx" ON "diagnostic_packages"("type", "category");

-- CreateIndex
CREATE INDEX "diagnostic_packages_isActive_isFeatured_idx" ON "diagnostic_packages"("isActive", "isFeatured");

-- CreateIndex
CREATE INDEX "diagnostic_package_items_serviceId_idx" ON "diagnostic_package_items"("serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "diagnostic_package_items_packageId_serviceId_key" ON "diagnostic_package_items"("packageId", "serviceId");

-- CreateIndex
CREATE INDEX "diagnostic_bookings_diagnosticLocationId_idx" ON "diagnostic_bookings"("diagnosticLocationId");

-- CreateIndex
CREATE INDEX "diagnostic_service_locations_locationId_idx" ON "diagnostic_service_locations"("locationId");

-- CreateIndex
CREATE UNIQUE INDEX "diagnostic_service_locations_serviceId_locationId_key" ON "diagnostic_service_locations"("serviceId", "locationId");

-- CreateIndex
CREATE UNIQUE INDEX "diagnostic_services_code_key" ON "diagnostic_services"("code");

-- CreateIndex
CREATE INDEX "diagnostic_services_isActive_isPopular_idx" ON "diagnostic_services"("isActive", "isPopular");

-- CreateIndex
CREATE INDEX "diagnostic_services_modality_idx" ON "diagnostic_services"("modality");

-- AddForeignKey
ALTER TABLE "diagnostic_locations" ADD CONSTRAINT "diagnostic_locations_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_service_locations" ADD CONSTRAINT "diagnostic_service_locations_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "diagnostic_locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_package_items" ADD CONSTRAINT "diagnostic_package_items_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "diagnostic_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_package_items" ADD CONSTRAINT "diagnostic_package_items_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "diagnostic_services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_bookings" ADD CONSTRAINT "diagnostic_bookings_diagnosticLocationId_fkey" FOREIGN KEY ("diagnosticLocationId") REFERENCES "diagnostic_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
