# frozen_string_literal: true

class StudentProfile < ApplicationRecord
  belongs_to :user
  has_one_attached :photo
  validates :full_name, :date_of_birth, :gender, :mobile_number, :institution_name, :course_or_class, presence: true
  validates :user_id, uniqueness: true
  validates :gender, inclusion: { in: ['Female', 'Male', 'Other', 'Prefer not to say'] }
  validates :blood_group, inclusion: { in: %w[A+ A- B+ B- AB+ AB- O+ O-] }, allow_blank: true
  validates :mobile_number, format: { with: /\A\+?[1-9]\d{9,14}\z/ }
  validates :height_cm, numericality: { greater_than: 50, less_than: 251 }, allow_nil: true
  validates :weight_kg, numericality: { greater_than: 15, less_than: 301 }, allow_nil: true
  validate do
    errors.add(:date_of_birth, 'cannot be in the future') if date_of_birth && date_of_birth > Date.current
    errors.add(:user, 'must be a student') unless user&.student?
    errors.add(:photo, 'must be JPEG, PNG, or WebP under 5 MB') if photo.attached? && (!photo.content_type.in?(%w[image/jpeg image/png image/webp]) || photo.byte_size > 5.megabytes)
  end
end
