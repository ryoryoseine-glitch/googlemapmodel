-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "passwordHash" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "phoneNumber" TEXT,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "profileComplete" BOOLEAN NOT NULL DEFAULT false,
    "avatarUrl" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtpCode" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FarmProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cropCategoryIds" TEXT NOT NULL,
    "cropItemIds" TEXT NOT NULL,
    "primaryCropItemId" TEXT NOT NULL,
    "prefCode" TEXT NOT NULL,
    "areaQuadrant" TEXT NOT NULL,
    "areaScale" TEXT NOT NULL,

    CONSTRAINT "FarmProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CropCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "CropCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CropItem" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "nameJa" TEXT NOT NULL,
    "synonyms" TEXT,

    CONSTRAINT "CropItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pesticide" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "maker" TEXT,
    "category" TEXT,
    "specSummary" TEXT,
    "externalSource" TEXT,
    "externalId" TEXT,
    "cropAffinityJson" TEXT,
    "regionAffinityJson" TEXT,
    "seasonAffinityJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pesticide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pesticideId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "season" TEXT NOT NULL DEFAULT '',
    "locationLat" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "locationLng" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "areaCode" TEXT,
    "capturedMainCrop" TEXT,
    "capturedAreaScale" TEXT,
    "capturedRegion" TEXT,
    "capturedCityCode" TEXT,
    "visibility" TEXT NOT NULL DEFAULT 'PUBLIC',
    "isDraft" BOOLEAN NOT NULL DEFAULT false,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "isPickedUp" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewPhoto" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "ReviewPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewLike" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ReviewLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "reporterUserId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "detail" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Badge" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconEmoji" TEXT NOT NULL,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBadge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBadge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPesticide" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pesticideId" TEXT NOT NULL,
    "acquiredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "photoUrl" TEXT,
    "lastUsedSeason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPesticide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsageLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pesticideId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT NOT NULL,
    "rating" INTEGER,
    "areaCode" TEXT,
    "cropType" TEXT,
    "visibility" TEXT NOT NULL DEFAULT 'PRIVATE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UsageLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaffPesticide" (
    "id" TEXT NOT NULL,
    "regNumber" TEXT NOT NULL,
    "pesticideType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "activeIngredient" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "formulation" TEXT NOT NULL,
    "regDate" TEXT NOT NULL,

    CONSTRAINT "MaffPesticide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaffApplication" (
    "id" TEXT NOT NULL,
    "regNumber" TEXT NOT NULL,
    "cropName" TEXT NOT NULL,
    "pestName" TEXT NOT NULL,
    "dilution" TEXT NOT NULL,
    "sprayVolume" TEXT NOT NULL,
    "timing" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "usageCount" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,

    CONSTRAINT "MaffApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "FarmProfile_userId_key" ON "FarmProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CropCategory_name_key" ON "CropCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewLike_reviewId_userId_key" ON "ReviewLike"("reviewId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Badge_key_key" ON "Badge"("key");

-- CreateIndex
CREATE UNIQUE INDEX "UserBadge_userId_badgeId_key" ON "UserBadge"("userId", "badgeId");

-- CreateIndex
CREATE UNIQUE INDEX "UserPesticide_userId_pesticideId_key" ON "UserPesticide"("userId", "pesticideId");

-- CreateIndex
CREATE UNIQUE INDEX "MaffPesticide_regNumber_key" ON "MaffPesticide"("regNumber");

-- CreateIndex
CREATE INDEX "MaffApplication_cropName_idx" ON "MaffApplication"("cropName");

-- CreateIndex
CREATE INDEX "MaffApplication_pestName_idx" ON "MaffApplication"("pestName");

-- CreateIndex
CREATE INDEX "MaffApplication_regNumber_idx" ON "MaffApplication"("regNumber");

-- AddForeignKey
ALTER TABLE "FarmProfile" ADD CONSTRAINT "FarmProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropItem" ADD CONSTRAINT "CropItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CropCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_pesticideId_fkey" FOREIGN KEY ("pesticideId") REFERENCES "Pesticide"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewPhoto" ADD CONSTRAINT "ReviewPhoto_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewLike" ADD CONSTRAINT "ReviewLike_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewLike" ADD CONSTRAINT "ReviewLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterUserId_fkey" FOREIGN KEY ("reporterUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPesticide" ADD CONSTRAINT "UserPesticide_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPesticide" ADD CONSTRAINT "UserPesticide_pesticideId_fkey" FOREIGN KEY ("pesticideId") REFERENCES "Pesticide"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageLog" ADD CONSTRAINT "UsageLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageLog" ADD CONSTRAINT "UsageLog_pesticideId_fkey" FOREIGN KEY ("pesticideId") REFERENCES "Pesticide"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaffApplication" ADD CONSTRAINT "MaffApplication_regNumber_fkey" FOREIGN KEY ("regNumber") REFERENCES "MaffPesticide"("regNumber") ON DELETE RESTRICT ON UPDATE CASCADE;
