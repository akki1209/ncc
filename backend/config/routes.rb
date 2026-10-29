# frozen_string_literal: true

Rails.application.routes.draw do
  devise_for :users, skip: :all
  get '/up', to: 'rails/health#show'
  namespace :api do
    namespace :v1 do
      get 'public/programs', to: 'public#programs'
      get 'auth/csrf', to: 'auth#csrf'
      post 'auth/login', to: 'auth#login'
      post 'auth/logout', to: 'auth#logout'
      get 'auth/me', to: 'auth#me'
      match 'auth/password', to: 'auth#password', via: %i[post put]
      get 'admin/dashboard', to: 'admin#dashboard'
      get 'admin/reports', to: 'admin#dashboard'
      get 'admin/students', to: 'admin#students'
      post 'admin/students', to: 'admin#register_student'
      match 'admin/students/:id', to: 'admin#student', via: %i[get patch]
      patch 'admin/students/:id/:operation', to: 'admin#activation', constraints: { operation: /activate|deactivate/ }
      get 'admin/students/:student_id/enrollments', to: 'admin#enrollments'
      get 'admin/students/:student_id/certificates', to: 'admin#certificates'
      get 'admin/programs', to: 'admin#programs'
      post 'admin/programs', to: 'admin#create_program'
      match 'admin/programs/:id', to: 'admin#program', via: %i[get patch]
      post 'admin/programs/:id/:operation', to: 'admin#transition', constraints: { operation: /publish|start|complete|cancel/ }
      post 'admin/programs/:id/enrollments', to: 'admin#enroll'
      post 'admin/programs/:id/bulk_enrollments', to: 'admin#enroll'
      post 'admin/programs/:id/generate_certificates', to: 'admin#generate'
      get 'admin/enrollments', to: 'admin#enrollments'
      get 'admin/enrollments/:id', to: 'admin#enrollment'
      match 'admin/enrollments/:id/:operation', to: 'admin#enrollment', via: %i[post patch], constraints: { operation: /progress|complete|fail|withdraw/ }
      post 'admin/enrollments/:enrollment_id/certificate', to: 'admin#generate'
      get 'admin/certificates', to: 'admin#certificates'
      get 'admin/certificates/:id', to: 'admin#certificate'
      post 'admin/certificates/:id/:operation', to: 'admin#certificate', constraints: { operation: /revoke|reissue/ }
      get 'admin/certificates/:id/download', to: 'downloads#show'
      get 'student/dashboard', to: 'student#dashboard'
      match 'student/profile', to: 'student#profile', via: %i[get patch]
      get 'student/programs', to: 'student#programs'
      get 'student/programs/:id', to: 'student#programs'
      get 'student/certificates', to: 'student#certificates'
      get 'student/certificates/:id', to: 'student#certificates'
      get 'student/certificates/:id/download', to: 'downloads#show'
    end
  end
end
