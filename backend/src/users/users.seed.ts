/**
 * Seed de usuarios educativos (students.json).
 */
export interface SeedUser {
  externalId: string;
  email: string;
  name: string;
  role: string;
  matricula?: string;
  password: string;
}

export const SEED_USERS: SeedUser[] = [
  {
    externalId: "user-01",
    email: "carlos.ramirez@ieca.edu.mx",
    name: "Carlos Eduardo Ramírez",
    role: "estudiante",
    matricula: "IECA-2026-8842",
    password: "1234",
  },
  {
    externalId: "user-02",
    email: "alejandro.morales@ieca.edu.mx",
    name: "Ing. Alejandro Morales",
    role: "instructor",
    password: "1234",
  },
  {
    externalId: "user-03",
    email: "elena.gutierrez@ieca.gob.mx",
    name: "Dra. María Elena Gutiérrez",
    role: "admin",
    password: "1234",
  },
];
