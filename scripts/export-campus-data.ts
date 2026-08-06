/**
 * Exporta datos educativos desde campusdemo hacia mcp-server/data/*.json
 * Ejecutar: npx tsx --tsconfig scripts/tsconfig.json scripts/export-campus-data.ts
 */
import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import {
  mockUsers,
  mockCourses,
  mockInvoices,
  mockNotices,
} from '../../campusdemo/src/data/mockData';
import { mockStoreCourses } from '../../campusdemo/src/data/catalogStoreData';
import { initialLearningPaths } from '../../campusdemo/src/data/learningPathsData';
import { plantelesData } from '../../campusdemo/src/data/plantelesData';
import {
  rawCompletedCourses,
  primaryRPGDimensions,
  subSkillsList,
  completedCoursesHistory,
} from '../../campusdemo/src/data/userStatsData';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '../mcp-server/data');

function writeJson(filename: string, data: unknown): void {
  const path = join(DATA_DIR, filename);
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`, 'utf-8');
  console.log(`✓ ${filename}`);
}

mkdirSync(DATA_DIR, { recursive: true });

// 1. students.json — todos los perfiles (estudiante, instructor, admin)
const students = Object.values(mockUsers);
writeJson('students.json', { students });

// 2. enrolled_courses.json — cursos inscritos por alumno (user-01 tiene mockCourses)
writeJson('enrolled_courses.json', {
  enrollments: [
    {
      student_id: 'user-01',
      courses: mockCourses,
    },
  ],
});

// 3. course_catalog.json — tienda de cursos disponibles
writeJson('course_catalog.json', { courses: mockStoreCourses });

// 4. learning_paths.json — rutas de aprendizaje
writeJson('learning_paths.json', { paths: initialLearningPaths });

// 5. student_stats.json — progreso RPG del alumno principal
writeJson('student_stats.json', {
  student_id: 'user-01',
  dimensions: primaryRPGDimensions,
  sub_skills: subSkillsList,
  completed_courses: rawCompletedCourses,
  completed_courses_history: completedCoursesHistory,
  summary: {
    total_completed_courses: rawCompletedCourses.length,
    total_xp: subSkillsList.reduce((acc, skill) => acc + skill.currentExp, 0),
    certificates_count: mockUsers.estudiante.certificatesCount,
    completed_hours: mockUsers.estudiante.completedHours,
    streak_days: mockUsers.estudiante.streakDays,
  },
});

// 6. certificates.json — constancias derivadas de cursos acreditados
const certificates = completedCoursesHistory.map((course) => ({
  student_id: 'user-01',
  certificate_id: course.certificateId,
  course_title: course.title,
  course_type: course.type,
  accreditation_date: course.accreditationDate,
  grade: course.grade,
}));
writeJson('certificates.json', { certificates });

// 7. announcements.json — avisos, eventos y promociones
writeJson('announcements.json', { announcements: mockNotices });

// 8. planteles.json — sedes IECA
writeJson('planteles.json', { planteles: plantelesData });

// 9. invoices.json — facturas por alumno
writeJson('invoices.json', {
  invoices: mockInvoices.map((invoice) => ({
    ...invoice,
    student_id: 'user-01',
  })),
});

console.log('\nExportación completada en mcp-server/data/');
