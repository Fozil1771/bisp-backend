-- CreateTable
CREATE TABLE "Session" (
    "sid" SERIAL NOT NULL,
    "data" TEXT,
    "expires" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("sid")
);
