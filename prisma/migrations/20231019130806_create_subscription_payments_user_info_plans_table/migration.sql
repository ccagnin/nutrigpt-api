-- CreateTable
CREATE TABLE "payments" (
    "paymentId" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "planId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("paymentId")
);

-- CreateTable
CREATE TABLE "plans" (
    "planId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("planId")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "subscriptionId" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "planId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("subscriptionId")
);

-- CreateTable
CREATE TABLE "user_info" (
    "infoId" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "last_6_digits" TEXT NOT NULL,
    "card_brand" TEXT NOT NULL,
    "subscriptionType" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_info_pkey" PRIMARY KEY ("infoId")
);

-- CreateIndex
CREATE UNIQUE INDEX "payments_userId_key" ON "payments"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_planId_key" ON "payments"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_userId_key" ON "subscriptions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_planId_key" ON "subscriptions"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "user_info_userId_key" ON "user_info"("userId");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("planId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("planId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_info" ADD CONSTRAINT "user_info_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
