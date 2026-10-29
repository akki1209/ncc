# frozen_string_literal: true

class User < ApplicationRecord
  devise :database_authenticatable, :recoverable, :validatable
  enum :role, { student: 0, admin: 1 }
  has_one :student_profile, dependent: :restrict_with_error
  has_many :enrollments, dependent: :restrict_with_error
  has_many :certificates, through: :enrollments
  before_validation { self.email = email.to_s.strip.downcase }
  def active_for_authentication?
    super && active?
  end

  def name
    student_profile&.full_name || 'Academy Administrator'
  end
end
