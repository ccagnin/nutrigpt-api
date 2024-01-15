-- DropForeignKey
ALTER TABLE "user_menu" DROP CONSTRAINT "user_menu_userId_fkey";

-- AddForeignKey
ALTER TABLE "user_menu" ADD CONSTRAINT "user_menu_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
