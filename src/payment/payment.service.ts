import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CreateUserPaymentDto } from './dto';
const mercadopago = require("mercadopago")


@Injectable()
export class PaymentService {
    constructor(private prisma: PrismaService) { }

    async getPaymentMethods(user: number, dto: CreateUserPaymentDto) {
        const expiration_date = dto.expiration_date.split('/')
        const cardData = {
            card_number: dto.card_number,
            expiration_year: expiration_date[1],
            expiration_month: expiration_date[0],
            security_code: dto.security_code,
            cardholder: {
                identification: {
                    type: dto.identificationType,
                    number: dto.identificationNumber
                },
                name: dto.name
            }
        }

        const cardToken = await fetch('https://api.mercadopago.com/v1/card_tokens/', {
            method: 'post',
            headers: {
                'Accept': 'application / json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer <ACCESS TOKEN>`
            },
            body: JSON.stringify(cardData)
        }).then(resp => resp.json())

        const date = new Date(Date.now())
        const dateEnd = new Date()
        dateEnd.setDate(date.getDate() + 30)
        const planPaymentData = {
            preapproval_plan_id: dto.planId,
            reason: "NOME DO APP",
            external_reference: "REFERÊNCIA DA ASSINATURA (QUALQUER)",
            payer_email: dto.email,
            card_token_id: String(cardToken.id),
            auto_recurring: {
                frequency: dto.frequency,
                frequency_type: dto.frequencyType,
                start_date: date,
                end_date: dateEnd,
                transaction_amount: dto.amount,
                currency_id: "BRL"
            },
            back_url: "URL DE RETORNO (ACONSELHO DEEPLINK)",
            status: "authorized"
        }

        const payment = await fetch('https://api.mercadopago.com/preapproval', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer <ACCESS TOKEN>`
            },
            body: JSON.stringify(planPaymentData)
        }).then(async resp => {
            const isJson = resp.headers.get('content-type')?.includes('application/json');
            const data = isJson && await resp.json();

            if (!resp.ok) {
                // get error message from body or default to response status
                const error = (data && data.message) || resp.status;
                return Promise.reject(error);
            }

            return resp
        }).catch(error => error)

        return payment
    }
}