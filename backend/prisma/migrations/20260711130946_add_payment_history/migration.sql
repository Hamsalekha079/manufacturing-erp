-- CreateTable
CREATE TABLE "MaterialPayment" (
    "id" SERIAL NOT NULL,
    "purchaseId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MaterialPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CastingPayment" (
    "id" SERIAL NOT NULL,
    "entryId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CastingPayment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MaterialPayment" ADD CONSTRAINT "MaterialPayment_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "RawMaterialPurchase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CastingPayment" ADD CONSTRAINT "CastingPayment_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "CastingEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
