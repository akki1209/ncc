# frozen_string_literal: true

class Enrollment < ApplicationRecord
  belongs_to :user
  belongs_to :program
  has_one :certificate, dependent: :restrict_with_error
  enum :status, { assigned: 0, in_progress: 1, completed: 2, failed: 3, withdrawn: 4 }
  validates :user_id, uniqueness: { scope: :program_id }
  validates :progress_percent, numericality: { only_integer: true, in: 0..100 }
  validates :eligibility_confirmed, acceptance: { accept: true }
  validate do
    errors.add(:user, 'must be an active student') unless user&.student? && user.active?
    errors.add(:base, 'Completion requires 100% progress and approval date') if completed? && (progress_percent != 100 || completed_at.nil?)
  end
end
