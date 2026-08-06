/**
 * Tipos de autenticación JWT del backend educativo.
 */
export interface AuthUser {
  id: string;
  externalId: string;
  email: string;
  name: string;
  role: string;
}

export interface LoginResponse {
  userId: string;
  externalId: string;
  email: string;
  name: string;
  role: string;
  token: string;
}
