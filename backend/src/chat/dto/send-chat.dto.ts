/**
 * DTO para enviar mensaje al chat educativo.
 */
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from "class-validator";

export class SendChatDto {
  @ApiProperty({ example: "¿Cuántos cursos tengo inscritos?" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  message!: string;

  @ApiPropertyOptional({ description: "UUID de sesión existente; si no se envía, se crea una nueva" })
  @IsOptional()
  @IsUUID()
  sessionId?: string;
}
