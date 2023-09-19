import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { MeasuresService } from './measures.service';
import { CreateUserMeasuresDto } from './dto';
import { JwtGuard } from 'src/common/guards';
import { GetUser } from 'src/common/decorators/get-user.decorator';

@Controller('users/measures')
export class MeasuresController {
  constructor(private measures: MeasuresService) {}

  @UseGuards(JwtGuard)
  @Post('create')
  createUserMeasure(
    @GetUser('id') userId: number,
    @Body() dto: CreateUserMeasuresDto,
  ) {
    return this.measures.createUserMeasures(userId, dto);
  }
}
