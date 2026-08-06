/**
 * Cliente HTTP hacia el AI Service educativo.
 */
import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import { HistoryItem } from "../messages/messages.service";

export interface AiChatResponse {
  response: string;
  model: string;
  student_id: string;
  tools_used: string[];
  payload?: Record<string, unknown> | null;
}

@Injectable()
export class AiProxyService {
  constructor(private readonly config: ConfigService) {}

  private baseUrl(): string {
    return (this.config.get<string>("AI_SERVICE_URL") ?? "http://127.0.0.1:8001").replace(/\/+$/, "");
  }

  /**
   * Envía pregunta al AI Service con historial y student_id.
   */
  async sendChat(
    message: string,
    studentId: string,
    history: HistoryItem[],
  ): Promise<AiChatResponse> {
    try {
      const { data } = await axios.post<AiChatResponse>(
        `${this.baseUrl()}/chat`,
        {
          message,
          student_id: studentId,
          history: history.map((item) => ({ role: item.role, content: item.content })),
        },
        { timeout: 180_000 },
      );
      return data;
    } catch (error) {
      throw new ServiceUnavailableException(
        "AI Service no disponible. Verifica que esté corriendo en :8001",
      );
    }
  }
}
