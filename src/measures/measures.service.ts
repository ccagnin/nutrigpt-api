import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserMeasuresDto, EditUserMeasureDto } from './dto';

@Injectable()
export class MeasuresService {
  constructor(private prisma: PrismaService) {}

  async createUserMeasures(userId: number, dto: CreateUserMeasuresDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const userMeasures = await this.prisma.measure.create({
        data: {
          initWeight: dto.initWeight,
          height: dto.height,
          age: dto.age,
          objective: dto.objective,
          user: {
            connect: {
              id: userId,
            },
          },
        } as any,
      });

      return userMeasures;
    } catch (error) {
      return error;
    }
  }

  async getMeasureByUserId(userId: number) {
    try {
      const measure = await this.prisma.measure.findUnique({
        where: {
          userId,
        },
      });

      return measure;
    } catch (error) {
      return error;
    }
  }

  async editUserMeasureById(
    userId: number,
    measureId: number,
    dto: EditUserMeasureDto,
  ) {
    try {
      const measure = await this.prisma.measure.findUnique({
        where: {
          measureId: measureId,
        },
      });

      if (!measure || measure.userId !== userId)
        throw new ForbiddenException('Access Denied');

      return await this.prisma.measure.update({
        where: {
          measureId: measureId,
        },
        data: {
          updatedWeight: dto.updatedWeight,
          ...dto,
        },
      });
    } catch (error) {
      return error;
    }
  }
}
