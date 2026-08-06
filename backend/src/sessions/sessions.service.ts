/**
 * Servicio de sesiones conversacionales.
 */
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateSessionDto } from "./dto/create-session.dto";
import { Session } from "./entities/session.entity";

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionsRepo: Repository<Session>,
  ) {}

  async create(userId: string, dto: CreateSessionDto): Promise<Session> {
    const session = this.sessionsRepo.create({
      userId,
      title: dto.title?.trim() || "Nueva conversación",
    });
    return this.sessionsRepo.save(session);
  }

  async listByUser(userId: string): Promise<Session[]> {
    return this.sessionsRepo.find({
      where: { userId },
      order: { updatedAt: "DESC" },
    });
  }

  async getById(sessionId: string, userId: string): Promise<Session> {
    const session = await this.sessionsRepo.findOne({ where: { id: sessionId, userId } });
    if (!session) {
      throw new NotFoundException("Sesión no encontrada");
    }
    return session;
  }

  async touch(sessionId: string): Promise<void> {
    await this.sessionsRepo.update(sessionId, { updatedAt: new Date() });
  }
}
