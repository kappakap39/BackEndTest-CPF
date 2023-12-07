-- CreateTable
CREATE TABLE "People" (
    "PeopleID" UUID NOT NULL,
    "Username" VARCHAR(255) NOT NULL,
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
    "FullName" VARCHAR(255) NOT NULL,
    "Address" JSON,
    "Tel" VARCHAR(10) NOT NULL,
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

-- CreateIndex
CREATE UNIQUE INDEX "People_Username_key" ON "People"("Username");

-- CreateIndex
CREATE UNIQUE INDEX "People_Email_key" ON "People"("Email");

-- CreateIndex
CREATE UNIQUE INDEX "User_Email_key" ON "User"("Email");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_CateGoryID_fkey" FOREIGN KEY ("CateGoryID") REFERENCES "ProductCategory"("CategoryID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "User"("UserID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderDetial" ADD CONSTRAINT "OrderDetial_OrderID_fkey" FOREIGN KEY ("OrderID") REFERENCES "Order"("OrderID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderDetial" ADD CONSTRAINT "OrderDetial_ProductID_fkey" FOREIGN KEY ("ProductID") REFERENCES "Product"("ProductID") ON DELETE RESTRICT ON UPDATE CASCADE;
