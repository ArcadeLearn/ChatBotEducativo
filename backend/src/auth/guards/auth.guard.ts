/**
 * Guard JWT para rutas protegidas.
 */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthService } from "../auth.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{ headers: { authorization?: string }; user?: unknown }>();
    const header = request.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Token requerido");
    }
    const token = header.slice(7);
    const payload = await this.authService.validateToken(token);
    if (!payload) {
      throw new UnauthorizedException("Token inválido o expirado");
    }
    request.user = payload;
    return true;
  }
}
