import {
  Body,
  Controller,
  Post,
  UseGuards,
  HttpStatus,
  Res,
  Param,
  Put,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtGuard } from 'src/common/guards';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { CreateUserPaymentDto } from './dto';

@Controller('users/payment')
export class PaymentController {
  constructor(private payment: PaymentService) {}

  @UseGuards(JwtGuard)
  @Post('create')
  async getPaymentMethods(
    @GetUser('id') userId: number,
    @Body() dto: CreateUserPaymentDto,
    @Res() res,
  ) {
    try {
      const response = await this.payment.getPaymentMethods(userId, dto);
      console.log(response);

      if (response.payment && response.payment.error === false) {
        return res.status(HttpStatus.OK).json({
          message: 'Pagamento bem-sucedido',
          payment: response.payment,
        });
      } else {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: 'Erro ao processar pagamento' });
      }
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Erro interno do servidor' });
    }
  }

  @UseGuards(JwtGuard)
  @Put('cancel-subscription/:preApprovalId')
  async cancelSubscription(
    @Param('preApprovalId') preApprovalId: string,
    @Res() res,
  ) {
    try {
      // Chame o método de cancelamento no serviço
      const response = await this.payment.cancelSubscription(preApprovalId);

      // Verifique se a assinatura foi cancelada com sucesso
      if (response.status === 'cancelled') {
        return res
          .status(HttpStatus.OK)
          .json({ message: 'Assinatura cancelada com sucesso' });
      } else {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: 'Erro ao cancelar assinatura' });
      }
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Erro interno do servidor' });
    }
  }
}
