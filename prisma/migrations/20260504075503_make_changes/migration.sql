-- CreateEnum
CREATE TYPE "EnquiryStatus" AS ENUM ('PENDING', 'REVIEWED', 'COMPLETED');

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "image" TEXT;

-- AlterTable
ALTER TABLE "Coupon" ADD COLUMN     "isGlobal" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "minItemCount" INTEGER,
ADD COLUMN     "minOrderAmount" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "billing_config" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "gstPercent" DOUBLE PRECISION NOT NULL DEFAULT 18,
    "gstLabel" TEXT NOT NULL DEFAULT 'GST',
    "shippingCharge" DOUBLE PRECISION NOT NULL DEFAULT 150,
    "freeShippingThreshold" DOUBLE PRECISION NOT NULL DEFAULT 5000,
    "shippingLabel" TEXT NOT NULL DEFAULT 'Delivery Charges',
    "handlingCharge" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "handlingLabel" TEXT NOT NULL DEFAULT 'Production Handling',
    "extraCharges" JSONB NOT NULL DEFAULT '[]',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billing_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_enquiry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT NOT NULL,
    "images" TEXT[],
    "status" "EnquiryStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_enquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserWishlist" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserWishlist_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_UserWishlist_B_index" ON "_UserWishlist"("B");

-- AddForeignKey
ALTER TABLE "_UserWishlist" ADD CONSTRAINT "_UserWishlist_A_fkey" FOREIGN KEY ("A") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserWishlist" ADD CONSTRAINT "_UserWishlist_B_fkey" FOREIGN KEY ("B") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
