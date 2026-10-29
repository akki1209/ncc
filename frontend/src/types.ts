export interface Profile {
  id: number;
  full_name: string;
  date_of_birth: string;
  gender: string;
  blood_group: string;
  mobile_number: string;
  institution_name: string;
  course_or_class: string;
  height_cm?: number;
  weight_kg?: number;
}
export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'student';
  active: boolean;
  profile: Profile | null;
}
export interface Program {
  id: number;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  eligibility_criteria: string;
  start_date: string;
  end_date: string;
  location: string;
  capacity: number | null;
  status: string;
  enrollment_count: number;
}
export interface Enrollment {
  id: number;
  user_id: number;
  student_name: string;
  program_title: string;
  status: string;
  progress_percent: number;
  program: Program;
  remarks: string;
}
export interface Certificate {
  id: number;
  certificate_number: string;
  student_name_snapshot: string;
  program_title_snapshot: string;
  issued_at: string;
  status: string;
  pdf_ready: boolean;
  generation_status: string;
}
export interface Dashboard {
  students: number;
  active_students: number;
  programs: number;
  ongoing_programs: number;
  enrollments: number;
  certificates: number;
  completed: number;
  pending_certificates: number;
  failed_certificates: number;
  revoked_certificates: number;
  program_stats: { name: string; enrolled: number; completed: number }[];
  recent_activity: {
    id: number;
    action: string;
    actor: string;
    created_at: string;
  }[];
}
export interface StudentDashboard {
  name: string;
  enrollments: Enrollment[];
  certificates: number;
}
export interface Envelope<T> {
  data: T;
  meta: {
    invitation_sent?: boolean;
    page?: number;
    per_page?: number;
    total?: number;
  };
}
