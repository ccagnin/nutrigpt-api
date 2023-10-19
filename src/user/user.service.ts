import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EditUserDto } from './dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async editUser(userId: number, dto: EditUserDto) {
    const user = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...dto,
      },
    });

    return user;
  }

  async deleteUser(userId: number) {
    try {
      const user = await this.prisma.user.delete({
        where: {
          id: userId,
        },
      });

      return user;
    } catch (error) {
      if (error instanceof PrismaService) {
        throw new NotFoundException('User not found');
      }

      return error;
    }
  }

  async checkEmail(email: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email,
        },
      });
      return !!user;
    } catch (error) {
      if (error instanceof PrismaService) {
        throw new NotFoundException('User not found');
      }

      return error;
    }
  }

  async getUserByEmail(email: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email,
        },
        select: {
          email: true,
          name: true,
        },
      });

      return user;
    } catch (error) {
      if (error instanceof PrismaService) {
        throw new NotFoundException('User not found');
      }

      return error;
    }
  }
}
