/**
 * Entidad de mensaje persistido por sesión.
 */
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("messages")
export class Message {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  sessionId!: string;

  @Column({ type: "varchar", length: 32 })
  role!: "user" | "assistant";

  @Column({ type: "text" })
  content!: string;

  /** Payload UI rico (tarjetas) serializado; solo en mensajes assistant. */
  @Column({ type: "jsonb", nullable: true })
  payload!: Record<string, unknown> | null;

  /** Valoración numérica: 1 = bueno (👍), 0 = malo (👎). */
  @Column({ type: "smallint", nullable: true })
  feedback!: 0 | 1 | null;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;
}
