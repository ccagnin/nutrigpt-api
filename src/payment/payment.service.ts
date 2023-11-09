import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserPaymentDto } from './dto';
import { MercadoPagoConfigService } from './mercado-pago-config.service';
import axios from 'axios';

@Injectable()
export class PaymentService {
  constructor(
    private prisma: PrismaService,
    private mercadoPagoConfigService: MercadoPagoConfigService,
  ) {}

  async getPaymentMethods(user: number, dto: CreateUserPaymentDto) {
    const { accessToken } = this.mercadoPagoConfigService.getConfig();
    console.log(accessToken);

    const expiration_month = dto.expiration_date.substring(0, 2);
    const expiration_year = '20' + dto.expiration_date.substring(2);
    console.log(expiration_month, expiration_year);
    const cardData = {
      card_number: dto.card_number,
      expiration_year: expiration_year,
      expiration_month: expiration_month,
      security_code: dto.security_code.toString(),
      cardholder: {
        identification: {
          type: dto.identificationType,
          number: dto.identificationNumber,
        },
        name: dto.name,
      },
    };

    console.log(cardData);

    try {
      const cardTokenResponse = await axios.post(
        'https://api.mercadopago.com/v1/card_tokens/',
        cardData,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const cardToken = cardTokenResponse.data;
      console.log(cardToken);

      const date = new Date(Date.now());
      const dateEnd = new Date();
      dateEnd.setDate(date.getDate() + 30);
      const planPaymentData = {
        preapproval_plan_id: dto.planId,
        reason: 'NOME DO APP',
        external_reference: 'REFERÊNCIA DA ASSINATURA (QUALQUER)',
        payer_email: dto.email,
        card_token_id: String(cardToken.id),
        auto_recurring: {
          frequency: dto.frequency,
          frequency_type: dto.frequencyType,
          start_date: date,
          end_date: dateEnd,
          transaction_amount: dto.amount,
          currency_id: 'BRL',
        },
        back_url: 'URL DE RETORNO (ACONSELHO DEEPLINK)',
        status: 'authorized',
      };

      // Faça a solicitação de pagamento usando o Axios e o token de acesso
      const paymentResponse = await axios.post(
        'https://api.mercadopago.com/preapproval',
        planPaymentData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      console.log(paymentResponse.data);

      const payment = paymentResponse.data;
      console.log(payment);

      return payment;
    } catch (error) {
      console.log(error.message);
      console.log(error.response.data);
      throw new Error(error.message);
    }
  }
}
