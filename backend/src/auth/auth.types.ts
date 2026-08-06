/**
 * Respuesta de autenticación JWT.
 */
export interface AuthResponse {
  userId: string;
  externalId: string;
  email: string;
  name: string;
  role: string;
  token: string;
}

export interface JwtPayload {
  sub: string;
  externalId: string;
  email: string;
  role: string;
}
