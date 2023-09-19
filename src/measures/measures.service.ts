import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserMeasuresDto } from './dto';

@Injectable()
export class MeasuresService {
  constructor(private prisma: PrismaService) {}

  async createUserMeasures(userId: number, dto: CreateUserMeasuresDto) {
    try {
      const userMeasures = await this.prisma.measure.create({
        data: {
          initWeight: dto.initWeight,
          height: dto.height,
          age: dto.age,
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
}
