# frozen_string_literal: true

module Api
  module V1
    class AuthController < ApplicationController
      include CampSerializer

      def csrf
        render json: { data: { csrf_token: form_authenticity_token } }
      end

      def login
        user = User.find_for_database_authentication(email: params[:email].to_s.strip.downcase)
        if user&.active_for_authentication? && user.valid_password?(params[:password].to_s)
          reset_session
          sign_in(:user, user)
          session[:session_version] = user.session_version
          render json: { data: serialize(user) }
        else
          render json: { error: { code: 'INVALID_CREDENTIALS', message: 'Email or password is incorrect, or your account is inactive.' } }, status: :unauthorized
        end
      end

      def me
        if current_user&.active? && session.fetch(:session_version, 0) == current_user.session_version
          render json: { data: serialize(current_user) }
        else
          render json: { error: { code: 'UNAUTHENTICATED', message: 'Please sign in.' } }, status: :unauthorized
        end
      end

      def logout
        current_user&.increment!(:session_version)
        sign_out(:user)
        reset_session
        head :no_content
      end

      def password
        if request.post?
          user = User.find_by(email: params[:email].to_s.strip.downcase)
          user&.send_reset_password_instructions
          render json: { data: { message: 'If the account exists, a secure setup link has been sent.' } }
        else
          user = User.reset_password_by_token(reset_password_token: params[:token], password: params[:password], password_confirmation: params[:password_confirmation])
          raise ActiveRecord::RecordInvalid, user if user.errors.any?

          # Pending invitations can activate; deactivated accounts cannot be reactivated by recovery.
          user.update!(active: true, invitation_pending: false) if user.student? && user.invitation_pending?
          render json: { data: { message: 'Password saved. You can now sign in.' } }
        end
      end
    end
  end
end
