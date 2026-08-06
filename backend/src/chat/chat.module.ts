/**
 * Módulo de chat educativo.
 */
import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { MessagesModule } from "../messages/messages.module";
import { SessionsModule } from "../sessions/sessions.module";
import { AiProxyService } from "./ai-proxy.service";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.service";

@Module({
  imports: [AuthModule, SessionsModule, MessagesModule],
  controllers: [ChatController],
  providers: [ChatService, AiProxyService],
})
export class ChatModule {}
