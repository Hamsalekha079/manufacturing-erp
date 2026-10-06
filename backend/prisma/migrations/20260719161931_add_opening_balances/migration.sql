-- CreateTable
CREATE TABLE "SupplierOpeningBalance" (
    "id" SERIAL NOT NULL,
    "supplierId" INTEGER NOT NULL,
    "orderedKg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "receivedKg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pendingKg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paidAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastDate" TIMESTAMP(3),
    "lastPaymentType" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupplierOpeningBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CastingOpeningBalance" (
    "id" SERIAL NOT NULL,
    "centerId" INTEGER NOT NULL,
    "type" "CastingType" NOT NULL DEFAULT 'ROUND1',
    "sentKg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "returnedKg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pendingKg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paidAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastDate" TIMESTAMP(3),
    "lastPaymentType" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CastingOpeningBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerOpeningBalance" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "totalBilled" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "amountReceived" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastDate" TIMESTAMP(3),
    "lastPaymentType" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerOpeningBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeOpeningBalance" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "pendingSalary" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pendingAdvance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastDate" TIMESTAMP(3),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmployeeOpeningBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinanceOpeningBalance" (
    "id" SERIAL NOT NULL,
    "cashInHand" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "bankBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinanceOpeningBalance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SupplierOpeningBalance_supplierId_key" ON "SupplierOpeningBalance"("supplierId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerOpeningBalance_customerId_key" ON "CustomerOpeningBalance"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeOpeningBalance_employeeId_key" ON "EmployeeOpeningBalance"("employeeId");

-- AddForeignKey
ALTER TABLE "SupplierOpeningBalance" ADD CONSTRAINT "SupplierOpeningBalance_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CastingOpeningBalance" ADD CONSTRAINT "CastingOpeningBalance_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "CastingCenter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerOpeningBalance" ADD CONSTRAINT "CustomerOpeningBalance_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeOpeningBalance" ADD CONSTRAINT "EmployeeOpeningBalance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
