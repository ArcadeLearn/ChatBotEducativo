/**
 * Controlador de chat educativo (proxy al AI Service).
 */
import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtPayload } from "../auth/auth.types";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { AuthGuard } from "../auth/guards/auth.guard";
import { ChatService } from "./chat.service";
import { SendChatDto } from "./dto/send-chat.dto";

@ApiTags("chat")
@ApiBearerAuth("JWT")
@UseGuards(AuthGuard)
@Controller("chat")
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @ApiOperation({ summary: "Enviar mensaje al chatbot educativo" })
  async sendMessage(@CurrentUser() user: JwtPayload, @Body() dto: SendChatDto) {
    return this.chatService.sendMessage(user, dto);
  }
}
