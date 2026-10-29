# frozen_string_literal: true

module Api
  module V1
    class DownloadsController < BaseController
      def show
        c = policy_scope(Certificate).find(params[:id])
        authorize c, :access?
        return render json: { error: { code: 'UNAVAILABLE', message: 'Certificate is revoked or its PDF is not ready.' } }, status: :not_found unless c.active? && c.pdf_file.attached?

        send_data c.pdf_file.download, filename: "#{c.certificate_number}.pdf", type: 'application/pdf', disposition: 'attachment'
      end
    end
  end
end
