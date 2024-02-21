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
  // @UseGuards(JwtGuard)
  // @Patch('new-menu')
  // async updateUserMenu(@GetUser('id') userId: number) {
  //   console.log(`User ID: ${userId}`);
  //   return await this.menu.updateMenu(userId);
  // }

  @UseGuards(JwtGuard)
  @Get('get-menu')
  async getUserMenu(@GetUser('id') userId: number) {
    console.log(`User ID: ${userId}`);
    return await this.menu.getMenu(userId);
  }
}
