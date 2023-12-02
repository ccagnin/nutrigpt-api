import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { MercadoPagoConfigService } from './mercado-pago-config.service';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService, MercadoPagoConfigService],
})
export class PaymentModule {}
