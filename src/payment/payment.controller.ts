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
import { loadMercadoPago } from "@mercadopago/sdk-js";
import { PaymentService } from './payment.service';
import { JwtGuard } from 'src/common/guards';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { CreateUserPaymentDto } from './dto';

@Controller('users/payment')
export class PaymentController {
  constructor(private payment: PaymentService) { }

  @UseGuards(JwtGuard)
  @Post('create')
  getPaymentMethods(
      @GetUser('id') userId: number,
      @Body() dto: CreateUserPaymentDto,
  ) {
    return this.payment.getPaymentMethods(userId, dto)
  }
}
