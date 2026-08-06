/**
 * Servicio de persistencia de mensajes por sesión.
 */
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Message } from "./entities/message.entity";

export interface HistoryItem {
  role: "user" | "assistant";
  content: string;
}

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messagesRepo: Repository<Message>,
  ) {}

  async add(
    sessionId: string,
    role: "user" | "assistant",
    content: string,
    payload?: Record<string, unknown> | null,
  ): Promise<Message> {
    const message = this.messagesRepo.create({
      sessionId,
      role,
      content,
      payload: payload ?? null,
    });
    return this.messagesRepo.save(message);
  }

  async listBySession(sessionId: string): Promise<Message[]> {
    return this.messagesRepo.find({
      where: { sessionId },
      order: { createdAt: "ASC" },
    });
  }

  async getHistory(sessionId: string, limit = 15): Promise<HistoryItem[]> {
    const rows = await this.messagesRepo.find({
      where: { sessionId },
      order: { createdAt: "DESC" },
      take: limit,
    });
    return rows
      .reverse()
      .map((row) => ({ role: row.role, content: row.content }));
  }
}
