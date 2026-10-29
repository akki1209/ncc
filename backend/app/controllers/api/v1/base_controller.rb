# frozen_string_literal: true

module Api
  module V1
    class BaseController < ApplicationController
      include CampSerializer

      before_action :require_user!
      after_action :verify_authorized
      def require_user!
        return if current_user&.active?

        sign_out if current_user
        render json: { error: { code: 'UNAUTHENTICATED', message: 'Please sign in to continue.' } }, status: :unauthorized
      end

      def success(data, meta = {})
        render json: { data: data, meta: meta }
      end

      def collection(scope)
        page = [params.fetch(:page, 1).to_i, 1].max
        size = params.fetch(:per_page, 20).to_i.clamp(1, 100)
        total = scope.count
        success(scope.limit(size).offset((page - 1) * size).map { |r| serialize(r) }, { page: page, per_page: size, total: total })
      end
    end
  end
end
