import {
  Body,
  Controller,
  Post,
  UseGuards,
  Get,
  Param,
  Patch,
  ParseIntPipe,
} from '@nestjs/common';
import { MeasuresService } from './measures.service';
import { CreateUserMeasuresDto, EditUserMeasureDto } from './dto';
import { JwtGuard } from 'src/common/guards';
import { GetUser } from 'src/common/decorators/get-user.decorator';

@Controller('users/measures')
export class MeasuresController {
  constructor(private measures: MeasuresService) {}

  @UseGuards(JwtGuard)
  @Patch('edit/:measureId')
  editUserMeasureById(
    @GetUser('id') userId: number,
    @Param('measureId', ParseIntPipe) measureId: number,
    @Body() dto: EditUserMeasureDto,
  ) {
    return this.measures.editUserMeasureById(userId, measureId, dto);
  }

  @UseGuards(JwtGuard)
  @Post('create')
  createUserMeasure(
    @GetUser('id') userId: number,
    @Body() dto: CreateUserMeasuresDto,
  ) {
    return this.measures.createUserMeasures(userId, dto);
  }

  @UseGuards(JwtGuard)
  @Get('measure')
  getMeasureByUserId(@GetUser('id') userId: number) {
    return this.measures.getMeasureByUserId(userId);
  }
}
