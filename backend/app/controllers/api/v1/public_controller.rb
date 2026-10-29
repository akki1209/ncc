# frozen_string_literal: true

module Api
  module V1
    class PublicController < ApplicationController
      def programs
        render json: { data: Program.where(status: %i[published ongoing]).order(start_date: :asc).limit(12).map do |p|
          p.slice(:id, :title, :short_description, :start_date, :end_date, :location, :eligibility_criteria)
        end }
      end
    end
  end
end
