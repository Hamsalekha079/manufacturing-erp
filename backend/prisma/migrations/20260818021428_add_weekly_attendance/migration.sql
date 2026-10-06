/*
  Warnings:

  - You are about to drop the `AttendanceLog` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AttendanceLog" DROP CONSTRAINT "AttendanceLog_employeeId_fkey";

-- DropTable
DROP TABLE "AttendanceLog";

-- CreateTable
CREATE TABLE "WeeklyAttendance" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "weekLabel" TEXT NOT NULL,
    "dateFrom" TIMESTAMP(3) NOT NULL,
    "dateTo" TIMESTAMP(3) NOT NULL,
    "fullDays" INTEGER NOT NULL DEFAULT 0,
    "halfDays" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeeklyAttendance_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WeeklyAttendance" ADD CONSTRAINT "WeeklyAttendance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
