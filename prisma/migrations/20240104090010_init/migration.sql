-- DropForeignKey
ALTER TABLE "SmsManagement" DROP CONSTRAINT "SmsManagement_IDUserOrAdmin_fkey";

-- AlterTable
ALTER TABLE "SmsManagement" ALTER COLUMN "IDUserOrAdmin" DROP NOT NULL,
ALTER COLUMN "IDUserOrAdmin" SET DATA TYPE TEXT;
