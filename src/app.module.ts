import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MeasuresModule } from './measures/measures.module';

@Module({
  imports: [AuthModule, UserModule, MeasuresModule],
})
export class AppModule {}
