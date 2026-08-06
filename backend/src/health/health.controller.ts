/**
 * Health check del backend educativo.
 */
import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

@ApiTags("health")
@Controller("health")
export class HealthController {
  @Get()
  @ApiOperation({ summary: "Estado del backend educativo" })
  getHealth() {
    return { status: "ok", service: "backend-educativo" };
  }
}
