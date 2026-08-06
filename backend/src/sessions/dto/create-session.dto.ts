/**
 * DTO para crear sesión.
 */
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength } from "class-validator";

export class CreateSessionDto {
  @ApiPropertyOptional({ example: "Consulta sobre mis cursos" })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;
}
