# frozen_string_literal: true

class CertificateGenerationJob < ApplicationJob
  queue_as :default
  retry_on StandardError, wait: :polynomially_longer, attempts: 5
  def perform(enrollment_id, actor_id)
    Certificates::Issue.call(enrollment: Enrollment.find(enrollment_id), actor: User.find(actor_id))
  rescue StandardError => e
    Certificate.find_by(enrollment_id: enrollment_id)&.update_columns(generation_status: 'failed', generation_error: e.class.name)
    raise
  end
end
