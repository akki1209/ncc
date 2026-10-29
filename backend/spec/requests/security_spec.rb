# frozen_string_literal: true

require 'rails_helper'
RSpec.describe 'API security', type: :request do
  let(:admin) { create(:user, :admin) }
  let(:student) { create(:user) }
  it 'requires authentication and forbids student administration' do
    get '/api/v1/admin/students'
    expect(response).to have_http_status(:unauthorized)
    sign_in student
    get '/api/v1/admin/students'
    expect(response).to have_http_status(:forbidden)
    post '/api/v1/admin/programs', params: { program: { title: 'Unauthorized' } }
    expect(response).to have_http_status(:forbidden)
  end
  it 'scopes student enrollments and rejects another student record' do
    own = create(:enrollment, user: student)
    other = create(:enrollment)
    sign_in student
    get '/api/v1/student/programs'
    expect(response.parsed_body['data'].pluck('id')).to eq([own.id])
    get "/api/v1/student/programs/#{other.id}"
    expect(response).to have_http_status(:not_found)
  end
  it 'allows admin access without exposing credentials' do
    sign_in admin
    create(:student_profile, user: student)
    get '/api/v1/admin/students'
    expect(response).to have_http_status(:ok)
    expect(response.body).not_to include('encrypted_password', 'reset_password_token')
  end
  it 'rejects cookie mutations without CSRF and authenticates with a token' do
    old = ActionController::Base.allow_forgery_protection
    ActionController::Base.allow_forgery_protection = true
    post '/api/v1/auth/login', params: { email: admin.email, password: 'TestPassword123!' }, as: :json
    expect(response).to have_http_status(:unprocessable_entity)
    get '/api/v1/auth/csrf'
    token = response.parsed_body.dig('data', 'csrf_token')
    post '/api/v1/auth/login', params: { email: admin.email, password: 'TestPassword123!' }, headers: { 'X-CSRF-Token' => token }, as: :json
    expect(response).to have_http_status(:ok)
    expect(response.parsed_body.dig('data', 'role')).to eq('admin')
  ensure
    ActionController::Base.allow_forgery_protection = old
  end
  it 'requires 100 percent progress before completion approval' do
    e = create(:enrollment, progress_percent: 50)
    sign_in admin
    post "/api/v1/admin/enrollments/#{e.id}/complete"
    expect(response).to have_http_status(:unprocessable_entity)
    expect(e.reload).not_to be_completed
  end
  it 'rejects a replayed session cookie after logout' do
    post '/api/v1/auth/login', params: { email: admin.email, password: 'TestPassword123!' }, as: :json
    cookie = response.headers['Set-Cookie'].split(';').first
    post '/api/v1/auth/logout'
    cookies['_ncc_session'] = CGI.unescape(cookie.split('=', 2).last)
    get '/api/v1/auth/me', headers: { 'Cookie' => cookie }
    expect(response).to have_http_status(:unauthorized)
  end
  it 'activates pending invitations without reactivating disabled accounts' do
    pending = create(:user, active: false, invitation_pending: true)
    raw, hashed = Devise.token_generator.generate(User, :reset_password_token)
    pending.update!(reset_password_token: hashed, reset_password_sent_at: Time.current)
    put '/api/v1/auth/password', params: { token: raw, password: 'NewPassword123!', password_confirmation: 'NewPassword123!' }, as: :json
    expect(response).to have_http_status(:ok)
    expect(pending.reload).to be_active
    pending.update!(active: false)
    raw, hashed = Devise.token_generator.generate(User, :reset_password_token)
    pending.update!(reset_password_token: hashed, reset_password_sent_at: Time.current)
    put '/api/v1/auth/password', params: { token: raw, password: 'AnotherPassword123!', password_confirmation: 'AnotherPassword123!' }, as: :json
    expect(pending.reload).not_to be_active
  end
  it 'preserves a pending registration and reports failed email delivery' do
    sign_in admin
    allow_any_instance_of(User).to receive(:send_reset_password_instructions).and_raise(IOError, 'SMTP unavailable')
    post '/api/v1/admin/students', params: {
      email: 'invited@example.test',
      profile: { full_name: 'Invited Cadet', date_of_birth: '2006-01-01', gender: 'Female', mobile_number: '919000000002', institution_name: 'Example College', course_or_class: 'Undergraduate' }
    }, as: :json
    expect(response).to have_http_status(:ok)
    expect(response.parsed_body.dig('meta', 'invitation_sent')).to be false
    expect(User.find_by!(email: 'invited@example.test')).not_to be_active
  end

  it 'completes the admin-to-student certificate workflow' do
    create(:student_profile, user: student)
    p = create(:program, created_by: admin)
    sign_in admin
    post "/api/v1/admin/programs/#{p.id}/enrollments", params: { user_id: student.id, eligibility_confirmed: true }, as: :json
    expect(response).to have_http_status(:ok)
    e = Enrollment.find(response.parsed_body['data'][0]['id'])
    patch "/api/v1/admin/enrollments/#{e.id}/progress", params: { progress_percent: 100 }, as: :json
    post "/api/v1/admin/enrollments/#{e.id}/complete"
    post "/api/v1/admin/programs/#{p.id}/start"
    perform_enqueued_jobs { post "/api/v1/admin/programs/#{p.id}/complete" }
    expect(response).to have_http_status(:ok)
    c = e.reload.certificate
    expect(c.pdf_file).to be_attached
    sign_out admin
    sign_in student
    get "/api/v1/student/certificates/#{c.id}/download"
    expect(response).to have_http_status(:ok)
    expect(response.body).to start_with('%PDF-')
    sign_out student
    sign_in create(:user)
    get "/api/v1/student/certificates/#{c.id}/download"
    expect(response).to have_http_status(:not_found)
    sign_out :user
    sign_in admin
    post "/api/v1/admin/certificates/#{c.id}/revoke", params: { reason: 'Administrative correction' }, as: :json
    get "/api/v1/admin/certificates/#{c.id}/download"
    expect(response).to have_http_status(:not_found)
  end
end
