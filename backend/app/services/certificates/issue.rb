# frozen_string_literal: true

module Certificates
  class Issue
    def self.call(enrollment:, actor:)
      enrollment.with_lock do
        unless enrollment.completed? && enrollment.program.completed?
          enrollment.errors.add(:base, 'Student and program must both be completed')
          raise ActiveRecord::RecordInvalid, enrollment
        end
        certificate = enrollment.certificate
        return certificate if certificate&.revoked?

        unless certificate
          p = enrollment.program
          certificate = enrollment.create_certificate!(issued_by: actor, certificate_number: "NCC-#{Date.current.year}-#{SecureRandom.hex(6).upcase}",
                                                       issued_at: Time.current, student_name_snapshot: enrollment.user.name, program_title_snapshot: p.title,
                                                       program_start_date_snapshot: p.start_date, program_end_date_snapshot: p.end_date, location_snapshot: p.location)
          AuditLog.record!(actor, 'certificate.issued', certificate)
        end
        certificate.with_lock do
          unless certificate.pdf_file.attached?
            pdf = Prawn::Document.new(page_size: 'A4', page_layout: :landscape, margin: 50)
            pdf.stroke_color 'B79B58'
            pdf.stroke_rectangle [0, pdf.bounds.top], pdf.bounds.width, pdf.bounds.height
            pdf.move_down 25
            pdf.fill_color '234F3D'
            pdf.text ENV.fetch('ORGANIZATION_NAME', 'NCC Officers’ Training Academy, Gwalior'), align: :center, size: 20
            pdf.move_down 28
            pdf.text 'CERTIFICATE OF COMPLETION', align: :center, size: 28
            pdf.move_down 22
            pdf.fill_color '475569'
            pdf.text 'This is to certify that', align: :center
            pdf.move_down 14
            pdf.text certificate.student_name_snapshot, align: :center, size: 26
            pdf.move_down 14
            pdf.text "has successfully completed #{certificate.program_title_snapshot}", align: :center, size: 16
            pdf.move_down 20
            pdf.text "#{certificate.program_start_date_snapshot} to #{certificate.program_end_date_snapshot} | #{certificate.location_snapshot}", align: :center
            pdf.move_down 36
            pdf.text "Certificate: #{certificate.certificate_number} | Issued: #{certificate.issued_at.to_date}", align: :center, size: 10
            pdf.move_down 24
            pdf.text ENV.fetch('CERTIFICATE_SIGNATORY', 'Authorized Training Officer'), align: :right
            pdf.move_down 20
            pdf.text 'Institutional training completion. This is not an official NCC A/B/C certificate.', size: 9, align: :center
            certificate.pdf_file.attach(io: StringIO.new(pdf.render), filename: "#{certificate.certificate_number}.pdf", content_type: 'application/pdf')
          end
          certificate.update!(generation_status: 'ready', generation_error: nil)
        end
        certificate
      end
    end
  end
end
