# frozen_string_literal: true

class Certificate < ApplicationRecord
  belongs_to :enrollment
  belongs_to :issued_by, class_name: 'User'
  has_one_attached :pdf_file
  enum :status, { active: 0, revoked: 1 }
  validates :enrollment_id, :certificate_number, uniqueness: true
  validates :certificate_number, :student_name_snapshot, :program_title_snapshot, :issued_at, presence: true
  validate do
    errors.add(:enrollment, 'must be successfully completed in a completed program') unless enrollment&.completed? && enrollment.program.completed?
    errors.add(:issued_by, 'must be an admin') unless issued_by&.admin?
  end
end
