/**
 * Tipos de chat y sesiones educativas.
 */
export type ChatRole = "user" | "assistant";

/** Tipos de payload UI rico según tool MCP invocada */
export type EduPayloadType =
  | "enrolled_courses"
  | "course_detail"
  | "course_catalog"
  | "student_stats"
  | "certificates"
  | "announcements"
  | "student_profile"
  | "learning_paths"
  | "planteles"
  | "invoices";

export interface EduPayload {
  type: EduPayloadType;
  data: unknown;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt?: string;
  payload?: EduPayload;
  feedback?: "positive" | "negative";
}

export interface SessionSummary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface BackendMessage {
  id: string;
  sessionId: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  payload?: EduPayload | null;
  /** 1 = bueno (👍), 0 = malo (👎) */
  feedback?: 0 | 1 | null;
}

export interface ChatApiResponse {
  sessionId: string;
  messageId?: string;
  response: unknown;
  model?: string;
  toolsUsed?: string[];
  studentId?: string;
  payload?: EduPayload | null;
}

/** Curso inscrito con progreso */
export interface EnrolledCourse {
  id: string;
  title: string;
  category?: string;
  description?: string;
  instructor?: string;
  durationHours?: number;
  progressPercentage: number;
  thumbnail?: string;
  level?: string;
  modules?: CourseModule[];
}

export interface CourseModule {
  id: string;
  title: string;
  lessons?: CourseLesson[];
}

export interface CourseLesson {
  id: string;
  title: string;
  duration?: string;
  completed?: boolean;
}

/** Stats RPG del alumno */
export interface StudentStatsData {
  student_id?: string;
  dimensions?: StatDimension[];
  summary?: {
    total_completed_courses?: number;
    total_xp?: number;
    certificates_count?: number;
    completed_hours?: number;
    streak_days?: number;
  };
}

export interface StatDimension {
  id: string;
  name: string;
  code?: string;
  score: number;
  totalPoints?: number;
  color?: string;
  description?: string;
}

/** Certificado */
export interface CertificateItem {
  certificate_id?: string;
  course_title: string;
  course_type?: string;
  accreditation_date?: string;
  grade?: number;
}

/** Curso del catálogo */
export interface CatalogCourse {
  id: string;
  title: string;
  category?: string;
  description?: string;
  instructor?: string;
  durationHours?: number;
  level?: string;
  price?: number;
  originalPrice?: number;
  rating?: number;
  studentsCount?: number;
  thumbnail?: string;
  badge?: string;
}

/** Aviso del campus */
export interface AnnouncementItem {
  id: string;
  title: string;
  type?: "promocion" | "evento" | "noticia" | string;
  summary?: string;
  content?: string;
  date?: string;
  badgeText?: string;
  imageUrl?: string;
  actionText?: string;
  actionUrl?: string;
}

/** Factura CFDI del alumno */
export interface InvoiceItem {
  id: string;
  folio?: string;
  concept?: string;
  date?: string;
  amount?: number;
  status?: string;
  rfc?: string;
  pdfUrl?: string;
  xmlUrl?: string;
}

/** Plantel / sede IECA con coordenadas para mapa */
export interface PlantelMapItem {
  id: string;
  nombre?: string;
  municipio?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  lat: number;
  lng: number;
  especialidades?: string[];
  equipamiento?: string;
  horario?: string;
}

export interface PlantelItem extends PlantelMapItem {
  director?: string;
}

/** Perfil del alumno */
export interface StudentProfileData {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  matricula?: string;
  specialty?: string;
  completedHours?: number;
  streakDays?: number;
  certificatesCount?: number;
  /** URL en JSON MCP (`avatar`) */
  avatar?: string;
  avatarUrl?: string;
}

/** Ruta de aprendizaje del campus */
export interface LearningPathItem {
  id: string;
  title: string;
  subtitle?: string;
  category?: string;
  description?: string;
  estimatedDurationMonths?: number;
  totalHours?: number;
  totalModules?: number;
  progressPercentage?: number;
  isActive?: boolean;
  certifiedBy?: string;
  badge?: string;
  colorGradient?: string;
  targetRoles?: string[];
  enrolledStudentsCount?: number;
}
