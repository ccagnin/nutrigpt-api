import { Controller, Get, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { JwtGuard } from 'src/common/guards';

@Controller('users')
export class UserController {
  @UseGuards(JwtGuard)
  @Get('profile')
  getUser(@GetUser() user: User) {
    return user;
  }
}
