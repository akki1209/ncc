# frozen_string_literal: true

class Program < ApplicationRecord
  belongs_to :created_by, class_name: 'User'
  has_many :enrollments, dependent: :restrict_with_error
  has_one_attached :image
  enum :status, { draft: 0, published: 1, ongoing: 2, completed: 3, cancelled: 4 }
  validates :title, :start_date, :end_date, :location, presence: true
  validates :slug, presence: true, uniqueness: true
  validates :capacity, numericality: { only_integer: true, greater_than: 0 }, allow_nil: true
  before_validation(on: :create) { self.slug ||= "#{title.to_s.parameterize}-#{SecureRandom.hex(3)}" }
  validate do
    errors.add(:end_date, 'must be on or after start date') if start_date && end_date && end_date < start_date
    errors.add(:base, 'Dates cannot change after enrollment; create a replacement program') if persisted? && enrollments.exists? && (will_save_change_to_start_date? || will_save_change_to_end_date?)
    errors.add(:created_by, 'must be an admin') unless created_by&.admin?
  end
  TRANSITIONS = { 'draft' => %w[published cancelled], 'published' => %w[ongoing cancelled], 'ongoing' => %w[completed cancelled] }.freeze
  def transition!(target, actor)
    with_lock do
      unless TRANSITIONS.fetch(status, []).include?(target)
        errors.add(:status, 'transition is not allowed')
        raise ActiveRecord::RecordInvalid, self
      end
      update!(status: target)
      AuditLog.record!(actor, "program.#{target}", self)
      enrollments.completed.find_each { |e| CertificateGenerationJob.perform_later(e.id, actor.id) } if completed?
    end
  end
end
