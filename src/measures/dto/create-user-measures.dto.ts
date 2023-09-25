import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateUserMeasuresDto {
  @IsNotEmpty()
  @IsNumber()
  initWeight: number;

  @IsNotEmpty()
  @IsNumber()
  height: number;

  @IsNotEmpty()
  @IsNumber()
  age: number;

  @IsNumber()
  objective: number;
}
