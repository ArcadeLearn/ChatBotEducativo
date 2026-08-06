/**
 * Lookup de payload.type → componente UI rico educativo.
 */
"use client";

import type { EduPayload } from "@/types/chat";
import { AnnouncementsCard } from "@/components/edu/AnnouncementsCard";
import { CertificatesCard } from "@/components/edu/CertificatesCard";
import { CourseCatalogCard } from "@/components/edu/CourseCatalogCard";
import { CourseDetailCard } from "@/components/edu/CourseDetailCard";
import { EnrolledCoursesCard } from "@/components/edu/EnrolledCoursesCard";
import { InvoicesCard } from "@/components/edu/InvoicesCard";
import { LearningPathsCard } from "@/components/edu/LearningPathsCard";
import { MainMenuCard } from "@/components/edu/MainMenuCard";
import { NotFoundCard } from "@/components/edu/NotFoundCard";
import { PlantelesCard } from "@/components/edu/PlantelesCard";
import { StudentProfileCard } from "@/components/edu/StudentProfileCard";
import { StudentStatsCard } from "@/components/edu/StudentStatsCard";

interface EduPayloadRendererProps {
  payload?: EduPayload | null;
  onMenuOptionClick?: (question: string) => void;
  menuDisabled?: boolean;
}

export function EduPayloadRenderer({
  payload,
  onMenuOptionClick,
  menuDisabled = false,
}: EduPayloadRendererProps) {
  if (!payload?.type || payload.data === undefined) return null;

  const content = (() => {
    switch (payload.type) {
    case "enrolled_courses":
      return <EnrolledCoursesCard data={payload.data as Parameters<typeof EnrolledCoursesCard>[0]["data"]} />;
    case "course_detail":
      return <CourseDetailCard data={payload.data as Parameters<typeof CourseDetailCard>[0]["data"]} />;
    case "student_stats":
      return <StudentStatsCard data={payload.data as Parameters<typeof StudentStatsCard>[0]["data"]} />;
    case "certificates":
      return <CertificatesCard data={payload.data as Parameters<typeof CertificatesCard>[0]["data"]} />;
    case "course_catalog":
      return <CourseCatalogCard data={payload.data as Parameters<typeof CourseCatalogCard>[0]["data"]} />;
    case "announcements":
      return <AnnouncementsCard data={payload.data as Parameters<typeof AnnouncementsCard>[0]["data"]} />;
    case "student_profile":
      return <StudentProfileCard data={payload.data as Parameters<typeof StudentProfileCard>[0]["data"]} />;
    case "learning_paths":
      return <LearningPathsCard data={payload.data as Parameters<typeof LearningPathsCard>[0]["data"]} />;
    case "planteles":
      return <PlantelesCard data={payload.data as Parameters<typeof PlantelesCard>[0]["data"]} />;
    case "invoices":
      return <InvoicesCard data={payload.data as Parameters<typeof InvoicesCard>[0]["data"]} />;
    case "course_not_found":
    case "not_found":
      return <NotFoundCard data={payload.data as Parameters<typeof NotFoundCard>[0]["data"]} />;
    case "main_menu":
      return (
        <MainMenuCard
          data={payload.data as Parameters<typeof MainMenuCard>[0]["data"]}
          onOptionClick={onMenuOptionClick}
          disabled={menuDisabled}
        />
      );
      default:
        return null;
    }
  })();

  return <div className="chat-payload-theme">{content}</div>;
}
