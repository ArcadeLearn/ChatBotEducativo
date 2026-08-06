/**
 * Constantes del frontend educativo.
 */
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

export const SESSION_STORAGE_KEY = "edu-chat-session-id";

/** Usuarios seed para acceso rápido en /login */
export const SEED_USERS = [
  {
    email: "carlos.ramirez@ieca.edu.mx",
    name: "Carlos Eduardo Ramírez",
    role: "Estudiante",
    password: "1234",
  },
  {
    email: "alejandro.morales@ieca.edu.mx",
    name: "Ing. Alejandro Morales",
    role: "Instructor",
    password: "1234",
  },
  {
    email: "elena.gutierrez@ieca.gob.mx",
    name: "Dra. María Elena Gutiérrez",
    role: "Admin",
    password: "1234",
  },
] as const;

export const SUGGESTED_QUESTIONS = [
  "¿Cuál es mi progreso en el curso de Yaskawa?",
  "¿Qué cursos de automatización están disponibles?",
  "¿Cuándo es el próximo evento?",
  "¿Cuántos cursos tengo inscritos?",
] as const;
