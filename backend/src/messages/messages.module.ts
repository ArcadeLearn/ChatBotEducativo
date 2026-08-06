/**
 * Módulo de mensajes conversacionales.
 */
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FeedbackService } from "./feedback.service";
import { Message } from "./entities/message.entity";
import { MessagesService } from "./messages.service";

@Module({
  imports: [TypeOrmModule.forFeature([Message])],
  providers: [MessagesService, FeedbackService],
  exports: [MessagesService, FeedbackService, TypeOrmModule],
})
export class MessagesModule {}
