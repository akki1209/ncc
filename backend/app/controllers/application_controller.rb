# frozen_string_literal: true

class ApplicationController < ActionController::Base
  include Pundit::Authorization

  protect_from_forgery with: :exception
  rescue_from ActionController::ParameterMissing, ActionController::BadRequest do |e|
    render json: { error: { code: 'BAD_REQUEST', message: e.message } }, status: :bad_request
  end
  rescue_from ActiveRecord::RecordNotFound do
    render json: { error: { code: 'NOT_FOUND', message: 'Record not found.' } }, status: :not_found
  end
  rescue_from ActiveRecord::RecordInvalid do |e|
    render json: { error: { code: 'VALIDATION_FAILED', message: e.record.errors.full_messages.join(', '), details: e.record.errors.to_hash } }, status: :unprocessable_entity
  end
  rescue_from ActiveRecord::RecordNotUnique do
    render json: { error: { code: 'CONFLICT', message: 'This record already exists.' } }, status: :conflict
  end
  rescue_from Pundit::NotAuthorizedError do
    render json: { error: { code: 'FORBIDDEN', message: 'You do not have permission for this action.' } }, status: :forbidden
  end
  rescue_from ActionController::InvalidAuthenticityToken do
    render json: { error: { code: 'CSRF_INVALID', message: 'Your session has expired. Refresh and try again.' } }, status: :unprocessable_entity
  end
end
