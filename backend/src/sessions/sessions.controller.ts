/**
 * Controlador CRUD de sesiones del alumno autenticado.
 */
import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { AuthGuard } from "../auth/guards/auth.guard";
import { JwtPayload } from "../auth/auth.types";
import { MessagesService } from "../messages/messages.service";
import { FeedbackService } from "../messages/feedback.service";
import { CreateSessionDto } from "./dto/create-session.dto";
import { SendFeedbackDto } from "./dto/send-feedback.dto";
import { SessionsService } from "./sessions.service";

@ApiTags("sessions")
@ApiBearerAuth("JWT")
@UseGuards(AuthGuard)
@Controller("sessions")
export class SessionsController {
  constructor(
    private readonly sessionsService: SessionsService,
    private readonly messagesService: MessagesService,
    private readonly feedbackService: FeedbackService,
  ) {}

  @Post()
  @ApiOperation({ summary: "Crear sesión de chat" })
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateSessionDto) {
    return this.sessionsService.create(user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: "Listar sesiones del usuario autenticado" })
  async list(@CurrentUser() user: JwtPayload) {
    return this.sessionsService.listByUser(user.sub);
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtener sesión por ID" })
  async getOne(@CurrentUser() user: JwtPayload, @Param("id") id: string) {
    return this.sessionsService.getById(id, user.sub);
  }

  @Get(":id/messages")
  @ApiOperation({ summary: "Historial de mensajes de la sesión" })
  async getMessages(@CurrentUser() user: JwtPayload, @Param("id") id: string) {
    await this.sessionsService.getById(id, user.sub);
    return this.messagesService.listBySession(id);
  }

  @Post(":id/feedback")
  @ApiOperation({ summary: "Valorar respuesta del asistente (1=bueno, 0=malo)" })
  async sendFeedback(
    @CurrentUser() user: JwtPayload,
    @Param("id") id: string,
    @Body() dto: SendFeedbackDto,
  ): Promise<{ ok: boolean }> {
    await this.sessionsService.getById(id, user.sub);
    return this.feedbackService.saveFeedback(id, user.sub, {
      messageId: dto.messageId,
      rating: dto.rating,
      userMessage: dto.userMessage,
      assistantContent: dto.assistantContent,
      toolInvoked: dto.toolInvoked,
    });
  }
}
