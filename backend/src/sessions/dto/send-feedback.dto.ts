/**
 * DTO para feedback (thumbs up/down) en respuestas del asistente.
 * En BD se persiste como score: 1 = bueno, 0 = malo.
 */
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsOptional, IsString } from "class-validator";

export class SendFeedbackDto {
  @ApiProperty({ description: "Id del mensaje del asistente valorado" })
  @IsString()
  messageId!: string;

  @ApiProperty({ enum: ["positive", "negative"], description: "positive=1, negative=0" })
  @IsIn(["positive", "negative"])
  rating!: "positive" | "negative";

  @ApiPropertyOptional({ description: "Pregunta del usuario en ese turno (Golden Dataset)" })
  @IsOptional()
  @IsString()
  userMessage?: string;

  @ApiPropertyOptional({ description: "Respuesta del asistente valorada" })
  @IsOptional()
  @IsString()
  assistantContent?: string;

  @ApiPropertyOptional({ description: "Tool MCP invocada en ese turno" })
  @IsOptional()
  @IsString()
  toolInvoked?: string;
}
