import { IsNumber, IsNotEmpty, IsOptional } from 'class-validator';

export class EditUserMeasureDto {
  @IsNotEmpty()
  @IsNumber()
  updatedWeight: number;

  @IsNumber()
  @IsOptional()
  age?: number;
}
