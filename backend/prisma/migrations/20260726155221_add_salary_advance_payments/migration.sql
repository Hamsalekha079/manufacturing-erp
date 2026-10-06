-- AlterTable
ALTER TABLE "EmployeeAdvance" ADD COLUMN     "remainingAmount" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "SalaryRecord" ADD COLUMN     "paidAmount" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "SalaryPayment" (
    "id" SERIAL NOT NULL,
    "salaryId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "method" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SalaryPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdvanceRepayment" (
    "id" SERIAL NOT NULL,
    "advanceId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "method" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdvanceRepayment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SalaryPayment" ADD CONSTRAINT "SalaryPayment_salaryId_fkey" FOREIGN KEY ("salaryId") REFERENCES "SalaryRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvanceRepayment" ADD CONSTRAINT "AdvanceRepayment_advanceId_fkey" FOREIGN KEY ("advanceId") REFERENCES "EmployeeAdvance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
