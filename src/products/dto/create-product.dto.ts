import { Type } from 'class-transformer'
import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator'

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  public name: string

  @IsNumber({
    maxDecimalPlaces: 4
  })
  @IsNotEmpty()
  @IsPositive()
  @Type(() => Number)
  public price: number
}
