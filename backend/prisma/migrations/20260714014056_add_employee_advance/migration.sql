-- CreateTable
CREATE TABLE "EmployeeAdvance" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "recovered" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmployeeAdvance_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EmployeeAdvance" ADD CONSTRAINT "EmployeeAdvance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
