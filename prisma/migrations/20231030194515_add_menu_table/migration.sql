-- CreateTable
CREATE TABLE "user_menu" (
    "menuId" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "menu" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_menu_pkey" PRIMARY KEY ("menuId")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_menu_userId_key" ON "user_menu"("userId");

-- AddForeignKey
ALTER TABLE "user_menu" ADD CONSTRAINT "user_menu_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
