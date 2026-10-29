# frozen_string_literal: true

module Api
  module V1
    class StudentController < BaseController
      before_action { authorize current_user, :access? }
      def dashboard
        enrollments = policy_scope(Enrollment).includes(:program).order(created_at: :desc)
        success({ enrollments: enrollments.limit(100).map { |e| serialize(e) }, certificates: policy_scope(Certificate).active.count, name: current_user.name })
      end

      def profile
        profile = policy_scope(StudentProfile).find_by!(user_id: current_user.id)
        profile.update!(params.require(:profile).permit(:full_name, :mobile_number, :blood_group, :height_cm, :weight_kg, :photo)) if request.patch?
        success(serialize(current_user.reload))
      end

      def programs
        scope = policy_scope(Enrollment).includes(:program, :user)
        params[:id] ? success(serialize(scope.find(params[:id]))) : collection(scope.order(created_at: :desc))
      end

      def certificates
        scope = policy_scope(Certificate).active
        params[:id] ? success(serialize(scope.find(params[:id]))) : collection(scope.order(issued_at: :desc))
      end
    end
  end
end
