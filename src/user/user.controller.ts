import {
  Controller,
  Get,
  UseGuards,
  Body,
  Patch,
  Delete,
  Post,
  Query,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { JwtGuard } from 'src/common/guards';
import { UserService } from './user.service';
import { EditUserDto } from './dto';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}
  @UseGuards(JwtGuard)
  @Get('profile')
  getUser(@GetUser() user: User) {
    return user;
  }

  @UseGuards(JwtGuard)
  @Patch('profile/edit')
  editUser(@GetUser('id') userId: number, @Body() dto: EditUserDto) {
    return this.userService.editUser(userId, dto);
  }

  @UseGuards(JwtGuard)
  @Delete('profile/delete')
  deleteUser(@GetUser('id') userId: number) {
    return this.userService.deleteUser(userId);
  }

  @Post('checkEmail')
  async checkEmail(@Body('email') email: string) {
    const user = await this.userService.checkEmail(email);
    const emailExists = !!user;
    return { emailExists };
  }

  @Get('getUserByEmail')
  async getUserByEmail(@Query('email') email: string) {
    const user = await this.userService.getUserByEmail(email);
    return user;
  }
}
