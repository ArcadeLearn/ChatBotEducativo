/**
 * Servicio de autenticación JWT simple para usuarios seed.
 */
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { LoginDto } from "./dto/login.dto";
import { AuthResponse, JwtPayload } from "./auth.types";
import { UsersService } from "../users/users.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Valida credenciales y emite JWT.
   */
  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !user.active) {
      throw new UnauthorizedException("Credenciales inválidas");
    }
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException("Credenciales inválidas");
    }
    return this.buildAuthResponse(user);
  }

  /**
   * Valida token JWT y retorna payload.
   */
  async validateToken(token: string): Promise<JwtPayload | null> {
    try {
      return await this.jwtService.verifyAsync<JwtPayload>(token);
    } catch {
      return null;
    }
  }

  private buildAuthResponse(user: {
    id: string;
    externalId: string;
    email: string;
    name: string;
    role: string;
  }): AuthResponse {
    const payload: JwtPayload = {
      sub: user.id,
      externalId: user.externalId,
      email: user.email,
      role: user.role,
    };
    const token = this.jwtService.sign(payload);
    return {
      userId: user.id,
      externalId: user.externalId,
      email: user.email,
      name: user.name,
      role: user.role,
      token,
    };
  }
}
