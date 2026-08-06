/**
 * Punto de entrada NestJS — ChatBot Educativo.
 * Configura CORS, validación, Swagger y arranca en :4001.
 */
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import axios from "axios";
import { AppModule } from "./app.module";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const corsOrigins = (process.env.CORS_ORIGINS ?? "http://localhost:3001")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: corsOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swagger = new DocumentBuilder()
    .setTitle("ChatBot Educativo API")
    .setDescription("Auth JWT, sesiones, mensajes y proxy al AI Service")
    .setVersion("0.1.0")
    .addBearerAuth({ type: "http", scheme: "bearer", bearerFormat: "JWT" }, "JWT")
    .build();
  SwaggerModule.setup("api/docs", app, SwaggerModule.createDocument(app, swagger));

  const port = Number(process.env.PORT ?? 4001);
  await app.listen(port);

  const aiUrl = (process.env.AI_SERVICE_URL ?? "http://127.0.0.1:8001").replace(/\/+$/, "");
  try {
    await axios.get(`${aiUrl}/health`, { timeout: 3000 });
    console.log(`AI Service: OK (${aiUrl})`);
  } catch {
    console.warn(`AI Service: no responde en ${aiUrl}`);
  }

  console.log(`Backend educativo: http://localhost:${port}`);
  console.log(`Swagger: http://localhost:${port}/api/docs`);
}

bootstrap().catch((error: unknown) => {
  console.error("Failed to start backend:", error);
  process.exit(1);
});
