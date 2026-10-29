# frozen_string_literal: true

class ApplicationPolicy
  attr_reader :user, :record

  def initialize(user, record)
    @user = user
    @record = record
  end

  def manage?
    user&.admin? && user.active?
  end

  def access?
    user&.active? && (user.admin? || record == user || (record.respond_to?(:user_id) && record.user_id == user.id) || (record.is_a?(Certificate) && record.enrollment.user_id == user.id))
  end

  class Scope
    def initialize(user, scope)
      @user = user
      @scope = scope
    end

    def resolve
      return @scope.all if @user.admin?

      case @scope.name
      when 'User' then @scope.where(id: @user.id)
      when 'StudentProfile', 'Enrollment' then @scope.where(user_id: @user.id)
      when 'Program' then @scope.joins(:enrollments).where(enrollments: { user_id: @user.id }).distinct
      when 'Certificate' then @scope.joins(:enrollment).where(enrollments: { user_id: @user.id })
      else @scope.none
      end
    end
  end
end
