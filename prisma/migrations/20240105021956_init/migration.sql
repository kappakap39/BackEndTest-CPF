-- CreateTable
CREATE TABLE "People" (
    "PeopleID" UUID NOT NULL,
    "Username" VARCHAR(255) NOT NULL,
    "Status" BOOLEAN DEFAULT true,
    "Email" VARCHAR(255) NOT NULL,
    "FirstName" VARCHAR(255) NOT NULL,
    "LastName" VARCHAR(255) NOT NULL,
    "Tel" VARCHAR(20) NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "People_pkey" PRIMARY KEY ("PeopleID")
);

-- CreateTable
CREATE TABLE "User" (
    "UserID" UUID NOT NULL,
    "Email" VARCHAR(255) NOT NULL,
    "Password" VARCHAR(255) NOT NULL,
    "FirstName" VARCHAR(255) NOT NULL,
    "LastName" VARCHAR(255) NOT NULL,
    "Level" TEXT,
    "Img" TEXT,
    "Address" JSON,
    "Tel" VARCHAR(10) NOT NULL,
    "Otp" TEXT,
    "OtpExpired" TIMESTAMP(3),
    "Status" BOOLEAN NOT NULL DEFAULT true,
    "Remove" BOOLEAN NOT NULL DEFAULT false,
    "Active" BOOLEAN NOT NULL DEFAULT false,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("UserID")
);

-- CreateTable
CREATE TABLE "ProductCategory" (
    "CategoryID" UUID NOT NULL,
    "CategoryName" VARCHAR(255) NOT NULL,
    "Description" VARCHAR(511),
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("CategoryID")
);

-- CreateTable
CREATE TABLE "Product" (
    "ProductID" UUID NOT NULL,
    "CateGoryID" UUID NOT NULL,
    "ProductName" VARCHAR(255) NOT NULL,
    "Description" VARCHAR(511),
    "Price" DOUBLE PRECISION NOT NULL,
    "Stock" INTEGER NOT NULL,
    "Status" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("ProductID")
);

-- CreateTable
CREATE TABLE "Order" (
    "OrderID" UUID NOT NULL,
    "UserID" UUID NOT NULL,
    "DeliveryStatus" BOOLEAN NOT NULL DEFAULT false,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("OrderID")
);

-- CreateTable
CREATE TABLE "OrderDetial" (
    "OrderDetailID" UUID NOT NULL,
    "OrderID" UUID NOT NULL,
    "ProductID" UUID NOT NULL,
    "Amount" INTEGER NOT NULL,
    "Price" DOUBLE PRECISION NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderDetial_pkey" PRIMARY KEY ("OrderDetailID")
);

-- CreateTable
CREATE TABLE "Token" (
    "TokenID" UUID NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,
    "Expiration" TIMESTAMP(3) NOT NULL,
    "UserID" UUID NOT NULL,
    "TokenValue" TEXT NOT NULL,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("TokenID")
);

-- CreateTable
CREATE TABLE "File" (
    "FileID" UUID NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,
    "UserID" UUID NOT NULL,
    "FileName" TEXT NOT NULL,
    "OriginalName" TEXT NOT NULL,
    "FilePath" TEXT NOT NULL,
    "FileKey" TEXT NOT NULL,
    "Mimetype" TEXT NOT NULL,
    "FileSize" TEXT NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("FileID")
);

-- CreateTable
CREATE TABLE "Loggets" (
    "LoggetID" UUID NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,
    "UserID" UUID NOT NULL,
    "TypeLogger" TEXT NOT NULL,

    CONSTRAINT "Loggets_pkey" PRIMARY KEY ("LoggetID")
);

-- CreateTable
CREATE TABLE "UserManagement" (
    "IDUserOrAdmin" UUID NOT NULL,
    "UserName" TEXT NOT NULL,
    "Password" TEXT NOT NULL,
    "Pincode" TEXT,
    "UserLevel" TEXT NOT NULL,
    "EffectiveDate" TIMESTAMP(3),
    "ExpiredDate" TIMESTAMP(3),
    "InvalidPasswordCount" INTEGER,
    "SecretQuestion" TEXT,
    "Answer" TEXT,
    "Status" BOOLEAN NOT NULL DEFAULT true,
    "Title" TEXT,
    "FirstName" TEXT,
    "LastName" TEXT,
    "AbbreviateName" TEXT,
    "Email" TEXT,
    "Telephone" VARCHAR(10),
    "CitiZenID" TEXT,
    "Picture" TEXT,
    "EmpNo" TEXT,
    "DeptCode" TEXT,
    "CompanyCode" TEXT,
    "OperationCode" TEXT,
    "SubOperationCode" TEXT,
    "CentralRefNo" TEXT,
    "BusinessType" TEXT,
    "DocIssueUnit" TEXT,
    "LockLocation" TEXT,
    "DeptFlag" TEXT,
    "GrpSubOperation" TEXT,
    "GrpOperationCode" TEXT,
    "DefaultLanguage" TEXT,
    "FontFamily" TEXT,
    "FontSize" DOUBLE PRECISION,
    "DateFormat" TIMESTAMP(3),
    "TimeZone" TIMESTAMP(3),
    "AmountFormat" INTEGER,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserManagement_pkey" PRIMARY KEY ("IDUserOrAdmin")
);

-- CreateTable
CREATE TABLE "SmsManagement" (
    "SmsID" UUID NOT NULL,
    "IDUserOrAdmin" UUID NOT NULL,
    "Sender" TEXT,
    "Tel" TEXT,
    "Result" TEXT,
    "Contact" TEXT,
    "ScheduleDate" TIMESTAMP(3),
    "Option" TEXT,
    "Description" TEXT DEFAULT '${SmsManagement.Result}',
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SmsManagement_pkey" PRIMARY KEY ("SmsID")
);

-- CreateTable
CREATE TABLE "SmsMessage" (
    "MessageID" UUID NOT NULL,
    "SmsID" UUID NOT NULL,
    "Message" VARCHAR(255),
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SmsMessage_pkey" PRIMARY KEY ("MessageID")
);

-- CreateTable
CREATE TABLE "TokenUser" (
    "TokenID" UUID NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,
    "Expiration" TIMESTAMP(3) NOT NULL,
    "IDUserOrAdmin" UUID NOT NULL,
    "TokenValue" TEXT NOT NULL,

    CONSTRAINT "TokenUser_pkey" PRIMARY KEY ("TokenID")
);

-- CreateTable
CREATE TABLE "LoggetsUser" (
    "LoggetID" UUID NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,
    "IDUserOrAdmin" UUID NOT NULL,
    "TypeLogger" TEXT NOT NULL,

    CONSTRAINT "LoggetsUser_pkey" PRIMARY KEY ("LoggetID")
);

-- CreateIndex
CREATE UNIQUE INDEX "People_Username_key" ON "People"("Username");

-- CreateIndex
CREATE UNIQUE INDEX "User_Email_key" ON "User"("Email");

-- CreateIndex
CREATE UNIQUE INDEX "File_FileName_key" ON "File"("FileName");

-- CreateIndex
CREATE UNIQUE INDEX "UserManagement_Email_key" ON "UserManagement"("Email");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_CateGoryID_fkey" FOREIGN KEY ("CateGoryID") REFERENCES "ProductCategory"("CategoryID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "User"("UserID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderDetial" ADD CONSTRAINT "OrderDetial_OrderID_fkey" FOREIGN KEY ("OrderID") REFERENCES "Order"("OrderID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderDetial" ADD CONSTRAINT "OrderDetial_ProductID_fkey" FOREIGN KEY ("ProductID") REFERENCES "Product"("ProductID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "User"("UserID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "User"("UserID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loggets" ADD CONSTRAINT "Loggets_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "User"("UserID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmsManagement" ADD CONSTRAINT "SmsManagement_IDUserOrAdmin_fkey" FOREIGN KEY ("IDUserOrAdmin") REFERENCES "UserManagement"("IDUserOrAdmin") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmsMessage" ADD CONSTRAINT "SmsMessage_SmsID_fkey" FOREIGN KEY ("SmsID") REFERENCES "SmsManagement"("SmsID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokenUser" ADD CONSTRAINT "TokenUser_IDUserOrAdmin_fkey" FOREIGN KEY ("IDUserOrAdmin") REFERENCES "UserManagement"("IDUserOrAdmin") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoggetsUser" ADD CONSTRAINT "LoggetsUser_IDUserOrAdmin_fkey" FOREIGN KEY ("IDUserOrAdmin") REFERENCES "UserManagement"("IDUserOrAdmin") ON DELETE RESTRICT ON UPDATE CASCADE;
