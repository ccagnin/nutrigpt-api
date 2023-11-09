import { Injectable } from '@nestjs/common';
import { MercadoPagoConfig } from 'mercadopago';

@Injectable()
export class MercadoPagoConfigService {
  getConfig(): MercadoPagoConfig {
    return {
      accessToken:
        'APP_USR-8885514618504695-101908-f637f5960b2189a30368496fb726c871-20177416',
    };
  }
}
