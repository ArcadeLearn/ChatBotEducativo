/**
 * Utilidades para calcular estadísticas de curso desde módulos/lecciones.
 */
import type { EnrolledCourse } from "@/types/chat";

export interface CourseStats {
  completedLessons: number;
  totalLessons: number;
  completedModules: number;
  totalModules: number;
  pendingLessonTitle: string | null;
}

export function computeCourseStats(course: EnrolledCourse): CourseStats {
  const modules = course.modules ?? [];
  let completedLessons = 0;
  let totalLessons = 0;
  let completedModules = 0;
  let pendingLessonTitle: string | null = null;

  for (const mod of modules) {
    const lessons = mod.lessons ?? [];
    const done = lessons.filter((l) => l.completed).length;
    completedLessons += done;
    totalLessons += lessons.length;
    if (lessons.length > 0 && done === lessons.length) {
      completedModules += 1;
    }
    if (!pendingLessonTitle) {
      const pending = lessons.find((l) => !l.completed);
      if (pending) pendingLessonTitle = pending.title;
    }
  }

  return {
    completedLessons,
    totalLessons,
    completedModules,
    totalModules: modules.length,
    pendingLessonTitle,
  };
}

/** Estima calificación de avance según % completado (sin dato real en JSON). */
export function estimateProgressGrade(progressPercentage: number): number {
  return Math.min(100, Math.max(0, Math.round(progressPercentage * 0.95 + 5)));
}
