import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MeasuresModule } from './measures/measures.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { MenuModule } from './menu/menu.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UserModule,
    MeasuresModule,
    PrismaModule,
    MenuModule,
  ],
})
export class AppModule {}
