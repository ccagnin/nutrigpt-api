import { Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // /auth/signup
  @Post('signup')
  signup() {
    return 'Signed Up';
  }

  // /auth/signin
  @Post('signin')
  signin() {
    return 'Signed In';
  }
}
