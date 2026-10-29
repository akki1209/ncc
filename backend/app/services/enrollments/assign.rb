# frozen_string_literal: true

module Enrollments
  class Assign
    def self.call(program:, user:, actor:, eligibility_confirmed:)
      program.with_lock do
        unless program.published? || program.ongoing?
          program.errors.add(:base, 'Only published or ongoing programs accept enrollments')
          raise ActiveRecord::RecordInvalid, program
        end
        if program.capacity && program.enrollments.where.not(status: :withdrawn).count >= program.capacity
          program.errors.add(:capacity, 'has been reached')
          raise ActiveRecord::RecordInvalid, program
        end
        enrollment = program.enrollments.create!(user: user, eligibility_confirmed: eligibility_confirmed, enrolled_at: Time.current)
        AuditLog.record!(actor, 'enrollment.created', enrollment)
        enrollment
      end
    end
  end
end
