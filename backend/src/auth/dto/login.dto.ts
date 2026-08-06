/**
 * DTO de login educativo.
 */
import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class LoginDto {
  @ApiProperty({ example: "carlos.ramirez@ieca.edu.mx" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "1234" })
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  password!: string;
}
