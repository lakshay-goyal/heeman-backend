-- CreateEnum
CREATE TYPE "VerificationChannel" AS ENUM ('EMAIL', 'PHONE');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'FAILED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "EnquiryType" AS ENUM ('PRODUCT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ProductEnquiryStatus" AS ENUM ('NEW', 'VERIFIED', 'WHATSAPP_SENT', 'REPLIED', 'QUOTED', 'FOLLOW_UP', 'CLOSED', 'SPAM');

-- CreateEnum
CREATE TYPE "WhatsAppConversationStatus" AS ENUM ('NOT_SENT', 'QUEUED', 'SENT', 'DELIVERED', 'READ', 'REPLIED', 'FAILED');

-- CreateEnum
CREATE TYPE "WhatsAppMessageDirection" AS ENUM ('OUTBOUND', 'INBOUND', 'STATUS');

-- CreateTable
CREATE TABLE "enquiry_verification" (
    "id" TEXT NOT NULL,
    "channel" "VerificationChannel" NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "otpHash" TEXT,
    "tokenHash" TEXT,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enquiry_verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_enquiry" (
    "id" TEXT NOT NULL,
    "type" "EnquiryType" NOT NULL DEFAULT 'PRODUCT',
    "userId" TEXT,
    "verificationId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "message" TEXT,
    "sourcePage" TEXT,
    "status" "ProductEnquiryStatus" NOT NULL DEFAULT 'NEW',
    "whatsappStatus" "WhatsAppConversationStatus" NOT NULL DEFAULT 'NOT_SENT',
    "whatsappConsent" BOOLEAN NOT NULL DEFAULT false,
    "whatsappConsentText" TEXT,
    "whatsappConsentAt" TIMESTAMP(3),
    "whatsappConsentIp" TEXT,
    "whatsappConsentUserAgent" TEXT,
    "verificationTokenHash" TEXT,
    "emailVerifiedAt" TIMESTAMP(3),
    "phoneVerifiedAt" TIMESTAMP(3),
    "referenceImages" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_enquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_enquiry_item" (
    "id" TEXT NOT NULL,
    "enquiryId" TEXT NOT NULL,
    "productId" TEXT,
    "productName" TEXT NOT NULL,
    "productPrice" DOUBLE PRECISION,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "productImage" TEXT,
    "productCategory" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_enquiry_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_message" (
    "id" TEXT NOT NULL,
    "enquiryId" TEXT,
    "providerMessageId" TEXT,
    "phone" TEXT NOT NULL,
    "direction" "WhatsAppMessageDirection" NOT NULL,
    "status" "WhatsAppConversationStatus",
    "body" TEXT,
    "raw" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whatsapp_message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "enquiry_verification_tokenHash_key" ON "enquiry_verification"("tokenHash");

-- CreateIndex
CREATE INDEX "enquiry_verification_email_channel_status_idx" ON "enquiry_verification"("email", "channel", "status");

-- CreateIndex
CREATE INDEX "enquiry_verification_phone_channel_status_idx" ON "enquiry_verification"("phone", "channel", "status");

-- CreateIndex
CREATE INDEX "product_enquiry_status_idx" ON "product_enquiry"("status");

-- CreateIndex
CREATE INDEX "product_enquiry_whatsappStatus_idx" ON "product_enquiry"("whatsappStatus");

-- CreateIndex
CREATE INDEX "product_enquiry_email_idx" ON "product_enquiry"("email");

-- CreateIndex
CREATE INDEX "product_enquiry_phone_idx" ON "product_enquiry"("phone");

-- CreateIndex
CREATE INDEX "product_enquiry_item_enquiryId_idx" ON "product_enquiry_item"("enquiryId");

-- CreateIndex
CREATE INDEX "product_enquiry_item_productId_idx" ON "product_enquiry_item"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_message_providerMessageId_key" ON "whatsapp_message"("providerMessageId");

-- CreateIndex
CREATE INDEX "whatsapp_message_enquiryId_idx" ON "whatsapp_message"("enquiryId");

-- CreateIndex
CREATE INDEX "whatsapp_message_phone_idx" ON "whatsapp_message"("phone");

-- AddForeignKey
ALTER TABLE "product_enquiry" ADD CONSTRAINT "product_enquiry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_enquiry" ADD CONSTRAINT "product_enquiry_verificationId_fkey" FOREIGN KEY ("verificationId") REFERENCES "enquiry_verification"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_enquiry_item" ADD CONSTRAINT "product_enquiry_item_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "product_enquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_enquiry_item" ADD CONSTRAINT "product_enquiry_item_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_message" ADD CONSTRAINT "whatsapp_message_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "product_enquiry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
