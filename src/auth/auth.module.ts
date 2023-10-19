import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: async (
        configService: ConfigService,
      ): Promise<JwtModuleOptions> => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, ConfigService, JwtStrategy],
})
export class AuthModule {}
