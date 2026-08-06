/**
 * Servicio de chat: persiste mensajes y delega al AI Service.
 */
import { Injectable } from "@nestjs/common";
import { JwtPayload } from "../auth/auth.types";
import { MessagesService } from "../messages/messages.service";
import { SessionsService } from "../sessions/sessions.service";
import { AiProxyService } from "./ai-proxy.service";
import { SendChatDto } from "./dto/send-chat.dto";

@Injectable()
export class ChatService {
  constructor(
    private readonly sessionsService: SessionsService,
    private readonly messagesService: MessagesService,
    private readonly aiProxy: AiProxyService,
  ) {}

  /**
   * Procesa mensaje del alumno: guarda en BD, llama AI y persiste respuesta.
   */
  async sendMessage(user: JwtPayload, dto: SendChatDto) {
    const session = dto.sessionId
      ? await this.sessionsService.getById(dto.sessionId, user.sub)
      : await this.sessionsService.create(user.sub, { title: dto.message.slice(0, 80) });

    const history = await this.messagesService.getHistory(session.id);
    await this.messagesService.add(session.id, "user", dto.message);

    const aiResponse = await this.aiProxy.sendChat(dto.message, user.externalId, history);
    const assistantMessage = await this.messagesService.add(
      session.id,
      "assistant",
      aiResponse.response,
      aiResponse.payload ?? null,
    );
    await this.sessionsService.touch(session.id);

    return {
      sessionId: session.id,
      messageId: assistantMessage.id,
      response: aiResponse.response,
      model: aiResponse.model,
      toolsUsed: aiResponse.tools_used,
      studentId: user.externalId,
      payload: aiResponse.payload ?? null,
    };
  }
}
