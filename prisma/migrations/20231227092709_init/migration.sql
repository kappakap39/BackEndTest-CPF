/*
  Warnings:

  - A unique constraint covering the columns `[Email]` on the table `UserManagement` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "UserManagement" ADD COLUMN     "AbbreviateName" TEXT,
ADD COLUMN     "AmountFormat" INTEGER,
ADD COLUMN     "BusinessType" TEXT,
ADD COLUMN     "CentralRefNo" TEXT,
ADD COLUMN     "CitiZenID" TEXT,
ADD COLUMN     "CompanyCode" TEXT,
ADD COLUMN     "DateFormat" TIMESTAMP(3),
ADD COLUMN     "DefaultLanguage" TEXT,
ADD COLUMN     "DeptCode" TEXT,
ADD COLUMN     "DeptFlag" TEXT,
ADD COLUMN     "DocIssueUnit" TEXT,
ADD COLUMN     "Email" TEXT,
ADD COLUMN     "EmpNo" TEXT,
ADD COLUMN     "FontFamily" TEXT,
ADD COLUMN     "FontSize" DOUBLE PRECISION,
ADD COLUMN     "GrpOperationCode" TEXT,
ADD COLUMN     "GrpSubOperation" TEXT,
ADD COLUMN     "InvalidPasswordCount" INTEGER,
ADD COLUMN     "LockLocation" TEXT,
ADD COLUMN     "OperationCode" TEXT,
ADD COLUMN     "Picture" TEXT,
ADD COLUMN     "SubOperationCode" TEXT,
ADD COLUMN     "Telephone" VARCHAR(10),
ADD COLUMN     "TimeZone" TIMESTAMP(3),
ADD COLUMN     "Title" TEXT,
ALTER COLUMN "Pincode" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UserManagement_Email_key" ON "UserManagement"("Email");
