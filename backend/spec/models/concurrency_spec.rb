# frozen_string_literal: true

require 'rails_helper'
RSpec.describe 'Concurrent camp workflows' do
  self.use_transactional_tests = false
  before do
    @admin = create(:user, :admin)
    @students = Array.new(2) { create(:user) }
    @program = create(:program, created_by: @admin, capacity: 1)
  end
  after do
    certificates = Certificate.joins(:enrollment).where(enrollments: { program_id: @program.id })
    certificates.each { |certificate| certificate.pdf_file.purge }
    certificates.delete_all
    AuditLog.where(actor_id: @admin.id).delete_all
    Enrollment.where(program_id: @program.id).delete_all
    Program.where(id: @program.id).delete_all
    StudentProfile.where(user_id: @students.map(&:id)).delete_all
    User.where(id: [@admin.id, *@students.map(&:id)]).delete_all
  end
  def race(&block)
    ready = Queue.new
    release = Queue.new
    threads = 2.times.map do |index|
      Thread.new do
        ActiveRecord::Base.connection_pool.with_connection do
          ready << true
          release.pop
          block.call(index)
        end
      end
    end
    2.times { ready.pop }
    2.times { release << true }
    threads.map(&:value)
  end
  it 'admits only one student when two requests compete for the last seat' do
    results = race do |index|
      Enrollments::Assign.call(program: Program.find(@program.id), user: @students[index], actor: @admin, eligibility_confirmed: true)
      :accepted
    rescue ActiveRecord::RecordInvalid
      :full
    end
    expect(results.sort).to eq(%i[accepted full])
    expect(@program.enrollments.count).to eq(1)
  end
  it 'creates one certificate when two workers issue the same enrollment' do
    create(:student_profile, user: @students.first)
    @program.update!(status: :completed)
    enrollment = create(:enrollment, program: @program, user: @students.first, status: :completed, progress_percent: 100, completed_at: Time.current)
    results = race do
      Certificates::Issue.call(enrollment: Enrollment.find(enrollment.id), actor: @admin).id
    end
    expect(results.uniq.length).to eq(1)
    expect(enrollment.reload.certificate.pdf_file.download).to start_with('%PDF-')
  end
end
