import { Injectable } from '@nestjs/common';
import { MercadoPagoConfig } from 'mercadopago';

@Injectable()
export class MercadoPagoConfigService {
  getConfig(): MercadoPagoConfig {
    return {
      accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || '',
    };
  }
}
