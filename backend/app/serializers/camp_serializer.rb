# frozen_string_literal: true

module CampSerializer
  def serialize(record)
    case record
    when User
      { id: record.id, email: record.email, role: record.role, active: record.active, name: record.name, profile: record.student_profile&.attributes&.except('user_id') }
    when Program
      record.attributes.merge('status' => record.status, 'enrollment_count' => record.enrollments.count)
    when Enrollment
      record.attributes.merge('status' => record.status, 'student_name' => record.user.name, 'program_title' => record.program.title,
                              'program' => serialize(record.program))
    when Certificate
      record.attributes.except('generation_error').merge('status' => record.status, 'pdf_ready' => record.pdf_file.attached?, 'student_id' => record.enrollment.user_id)
    else record.as_json
    end
  end
end
