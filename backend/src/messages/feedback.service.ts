/**
 * Persistencia de feedback: score 0|1 en PostgreSQL + backup JSONL (Golden Dataset).
 */
import * as fs from "fs";
import * as path from "path";
import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Message } from "./entities/message.entity";
import { ratingToScore, type FeedbackRating } from "./feedback.utils";

export interface SaveFeedbackPayload {
  messageId: string;
  rating: FeedbackRating;
  userMessage?: string;
  assistantContent?: string;
  toolInvoked?: string;
}

@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);

  constructor(
    @InjectRepository(Message)
    private readonly messagesRepo: Repository<Message>,
  ) {}

  /**
   * Guarda valoración del usuario: 1 (bueno) o 0 (malo) en BD y línea en chat-feedback.jsonl.
   */
  async saveFeedback(
    sessionId: string,
    userId: string,
    payload: SaveFeedbackPayload,
  ): Promise<{ ok: boolean }> {
    const score = ratingToScore(payload.rating);
    const dataDir = path.join(process.cwd(), "data");
    const filePath = path.join(dataDir, "chat-feedback.jsonl");
    const line =
      JSON.stringify({
        timestamp: new Date().toISOString(),
        sessionId,
        userId,
        messageId: payload.messageId,
        rating: payload.rating,
        score,
        userMessage: payload.userMessage,
        assistantContent: payload.assistantContent,
        toolInvoked: payload.toolInvoked,
      }) + "\n";

    try {
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.appendFileSync(filePath, line, "utf8");
      this.logger.log(
        `[saveFeedback] sessionId=${sessionId} messageId=${payload.messageId} score=${score}`,
      );
    } catch (err) {
      this.logger.warn(
        `[saveFeedback] Error escribiendo JSONL: ${err instanceof Error ? err.message : String(err)}`,
      );
      return { ok: false };
    }

    try {
      const message = await this.messagesRepo.findOne({
        where: { id: payload.messageId, sessionId, role: "assistant" },
      });
      if (!message) {
        this.logger.warn(
          `[saveFeedback] messageId=${payload.messageId} no encontrado en sesión ${sessionId}`,
        );
        return { ok: true };
      }
      message.feedback = score;
      await this.messagesRepo.save(message);
    } catch (dbErr) {
      this.logger.warn(
        `[saveFeedback] Error actualizando BD: ${dbErr instanceof Error ? dbErr.message : String(dbErr)}`,
      );
    }

    return { ok: true };
  }
}
