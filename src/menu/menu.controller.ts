import { Controller, Get, UseGuards } from '@nestjs/common';
import { MenuService } from './menu.service';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { JwtGuard } from 'src/common/guards';

@Controller('menu')
export class MenuController {
  constructor(private menu: MenuService) {}

  @UseGuards(JwtGuard)
  @Get('weekly-menu')
  async createUserMenu(@GetUser('id') userId: number) {
    console.log(`User ID: ${userId}`);
    return await this.menu.createUserMenu(userId);
  }
}
