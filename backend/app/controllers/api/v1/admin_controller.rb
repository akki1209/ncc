# frozen_string_literal: true

module Api
  module V1
    class AdminController < BaseController
      before_action { authorize User, :manage? }
      def dashboard
        success({ students: User.student.count, active_students: User.student.where(active: true).count,
                  programs: Program.count, ongoing_programs: Program.ongoing.count, enrollments: Enrollment.count,
                  certificates: Certificate.active.count, completed: Enrollment.completed.count,
                  pending_certificates: Enrollment.completed.joins(:program).where(programs: { status: Program.statuses[:completed] }).left_joins(:certificate).where(certificates: { id: nil }).count,
                  failed_certificates: Certificate.where(generation_status: 'failed').count,
                  revoked_certificates: Certificate.revoked.count,
                  program_stats: Program.order(:start_date).limit(12).map { |p| { name: p.title, enrolled: p.enrollments.count, completed: p.enrollments.completed.count } },
                  recent_activity: AuditLog.includes(:actor).order(created_at: :desc).limit(8).map { |a| { id: a.id, action: a.action, actor: a.actor.name, created_at: a.created_at } } })
      end

      def students
        scope = policy_scope(User).student.includes(:student_profile).order(created_at: :desc)
        scope = scope.joins(:student_profile).where('student_profiles.full_name ILIKE :q OR users.email ILIKE :q', q: "%#{params[:q]}%") if params[:q].present?
        scope = scope.where(active: params[:active] == 'true') if params[:active].present?
        collection(scope)
      end

      def student
        user = policy_scope(User).student.find(params[:id])
        if request.patch?
          User.transaction do
            user.student_profile.update!(profile_params)
            AuditLog.record!(current_user, 'student.updated', user)
          end
        end
        success(serialize(user))
      end

      def register_student
        user = User.transaction do
          u = User.create!(email: params[:email], password: SecureRandom.base64(32), role: :student, active: false, invitation_pending: true)
          u.create_student_profile!(profile_params)
          AuditLog.record!(current_user, 'student.registered', u)
          u
        end
        invitation_sent = true
        begin
          user.send_reset_password_instructions
        rescue Net::SMTPError, IOError, Timeout::Error, SocketError, SystemCallError => e
          invitation_sent = false
          Rails.logger.error("Invitation delivery failed for user #{user.id}: #{e.class}")
        end
        success(serialize(user), { invitation_sent: invitation_sent })
      end

      def activation
        user = policy_scope(User).student.find(params[:id])
        user.update!(active: params[:operation] == 'activate', invitation_pending: false)
        AuditLog.record!(current_user, "student.#{params[:operation]}", user)
        success(serialize(user))
      end

      def programs
        scope = policy_scope(Program).includes(:enrollments).order(start_date: :desc)
        scope = scope.where(status: params[:status]) if params[:status].present?
        scope = scope.where('title ILIKE ?', "%#{params[:q]}%") if params[:q].present?
        collection(scope)
      end

      def create_program
        program = Program.transaction do
          p = Program.create!(program_params.merge(created_by: current_user))
          AuditLog.record!(current_user, 'program.created', p)
          p
        end
        success(serialize(program))
      end

      def program
        p = policy_scope(Program).find(params[:id])
        if request.patch?
          p.with_lock do
            p.update!(program_params)
            AuditLog.record!(current_user, 'program.updated', p)
          end
        end
        success(serialize(p))
      end

      def transition
        p = policy_scope(Program).find(params[:id])
        p.transition!({ 'publish' => 'published', 'start' => 'ongoing', 'complete' => 'completed', 'cancel' => 'cancelled' }.fetch(params[:operation]), current_user)
        success(serialize(p))
      end

      def enrollments
        scope = policy_scope(Enrollment).includes(:user, :program).order(created_at: :desc)
        scope = scope.where(user_id: params[:student_id]) if params[:student_id].present?
        scope = scope.where(program_id: params[:program_id]) if params[:program_id].present?
        scope = scope.where(status: params[:status]) if params[:status].present?
        collection(scope)
      end

      def enroll
        p = policy_scope(Program).find(params[:id])
        ids = params[:user_ids] || [params[:user_id]]
        raise ActionController::BadRequest, 'Select 1–100 students' unless ids.is_a?(Array) && ids.size.between?(1, 100)

        results = Enrollment.transaction do
          ids.map { |id| Enrollments::Assign.call(program: p, user: policy_scope(User).student.find(id), actor: current_user, eligibility_confirmed: params[:eligibility_confirmed] == true) }
        end
        success(results.map { |e| serialize(e) })
      end

      def enrollment
        e = policy_scope(Enrollment).find(params[:id])
        return success(serialize(e)) if request.get?

        e.with_lock do
          if e.completed? || e.failed? || e.withdrawn? || e.program.cancelled?
            e.errors.add(:base, 'This enrollment cannot be modified')
            raise ActiveRecord::RecordInvalid, e
          end
          case params[:operation]
          when 'progress'
            e.update!(progress_percent: params[:progress_percent], status: :in_progress, remarks: params[:remarks])
          when 'complete'
            e.update!(status: :completed, completed_at: Time.current)
            CertificateGenerationJob.perform_later(e.id, current_user.id) if e.program.completed?
          when 'fail' then e.update!(status: :failed)
          when 'withdraw' then e.update!(status: :withdrawn)
          end
          AuditLog.record!(current_user, "enrollment.#{params[:operation]}", e, progress_percent: e.progress_percent)
        end
        success(serialize(e))
      end

      def certificates
        scope = policy_scope(Certificate).includes(enrollment: :user).order(issued_at: :desc)
        scope = scope.joins(:enrollment).where(enrollments: { user_id: params[:student_id] }) if params[:student_id].present?
        scope = scope.where(status: params[:status]) if params[:status].present?
        collection(scope)
      end

      def certificate
        c = policy_scope(Certificate).find(params[:id])
        case params[:operation]
        when 'revoke'
          c.with_lock do
            if params[:reason].blank?
              c.errors.add(:revocation_reason, 'is required')
              raise ActiveRecord::RecordInvalid, c
            end
            c.update!(status: :revoked, revoked_at: Time.current, revocation_reason: params[:reason])
            AuditLog.record!(current_user, 'certificate.revoked', c)
          end
        when 'reissue'
          c.with_lock do
            previous = c.certificate_number
            p = c.enrollment.program
            c.update!(status: :active, revoked_at: nil, revocation_reason: nil, issued_by: current_user, issued_at: Time.current,
                      student_name_snapshot: c.enrollment.user.name, program_title_snapshot: p.title,
                      certificate_number: "NCC-#{Date.current.year}-#{SecureRandom.hex(6).upcase}", generation_status: 'pending')
            c.pdf_file.purge
            AuditLog.record!(current_user, 'certificate.reissued', c, previous_number: previous)
            CertificateGenerationJob.perform_later(c.enrollment_id, current_user.id)
          end
        end
        success(serialize(c))
      end

      def generate
        if params[:enrollment_id]
          e = policy_scope(Enrollment).find(params[:enrollment_id])
          unless e.completed? && e.program.completed?
            e.errors.add(:base, 'Student and program must be completed')
            raise ActiveRecord::RecordInvalid, e
          end
          CertificateGenerationJob.perform_later(e.id, current_user.id)
        else
          p = policy_scope(Program).find(params[:id])
          unless p.completed?
            p.errors.add(:base, 'Program must be completed')
            raise ActiveRecord::RecordInvalid, p
          end
          p.enrollments.completed.find_each { |en| CertificateGenerationJob.perform_later(en.id, current_user.id) }
        end
        success({ message: 'Certificate generation queued.' })
      end

      private

      def profile_params
        params.require(:profile).permit(:full_name, :date_of_birth, :gender, :blood_group, :mobile_number, :institution_name, :course_or_class, :height_cm, :weight_kg, :photo)
      end

      def program_params
        params.require(:program).permit(:title, :description, :short_description, :eligibility_criteria, :start_date, :end_date, :location, :capacity)
      end
    end
  end
end
