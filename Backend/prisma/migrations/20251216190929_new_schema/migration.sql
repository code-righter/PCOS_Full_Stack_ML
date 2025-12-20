-- CreateEnum
CREATE TYPE "CycleType" AS ENUM ('REGULAR', 'IRREGULAR');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "userType" TEXT NOT NULL,
    "isLoggedIn" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailVerification" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientPersonalInfo" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "cycleLength" INTEGER NOT NULL,
    "cycleType" "CycleType" NOT NULL,
    "skinDarkening" BOOLEAN NOT NULL,
    "hairGrowth" BOOLEAN NOT NULL,
    "pimples" BOOLEAN NOT NULL,
    "hairLoss" BOOLEAN NOT NULL,
    "weightGain" BOOLEAN NOT NULL,
    "fastFood" BOOLEAN NOT NULL,
    "hip" DOUBLE PRECISION NOT NULL,
    "waist" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientPersonalInfo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerification_email_key" ON "EmailVerification"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PatientPersonalInfo_userId_key" ON "PatientPersonalInfo"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PatientPersonalInfo_email_key" ON "PatientPersonalInfo"("email");

-- CreateIndex
CREATE INDEX "PatientPersonalInfo_email_idx" ON "PatientPersonalInfo"("email");

-- AddForeignKey
ALTER TABLE "PatientPersonalInfo" ADD CONSTRAINT "PatientPersonalInfo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
