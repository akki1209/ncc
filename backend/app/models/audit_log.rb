# frozen_string_literal: true

class AuditLog < ApplicationRecord
  belongs_to :actor, class_name: 'User'
  belongs_to :auditable, polymorphic: true
  def self.record!(actor, action, record, metadata = {})
    create!(actor: actor, action: action, auditable: record, metadata: metadata.slice(:status, :progress_percent, :previous_number))
  end

  def readonly?
    persisted?
  end
end
