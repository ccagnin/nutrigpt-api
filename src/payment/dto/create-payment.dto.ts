import { IsNotEmpty, IsString, IsNumber, IsObject } from 'class-validator';

export class CreateUserPaymentDto {
    @IsNotEmpty()
    @IsString()
    card_number: string;

    @IsNotEmpty()
    @IsNumber()
    security_code: number;

    @IsNotEmpty()
    @IsString()
    expiration_date: string;

    @IsNotEmpty()
    @IsString()
    identificationNumber: string;

    @IsNotEmpty()
    @IsString()
    identificationType: string;

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsNumber()
    amount: number;

    @IsNotEmpty()
    @IsString()
    frequencyType: string;

    @IsNotEmpty()
    @IsString()
    frequency: string;

    @IsNotEmpty()
    @IsString()
    planId: string;

    @IsNotEmpty()
    @IsString()
    email: string;
}
