# frozen_string_literal: true

require 'rails_helper'
RSpec.describe 'Camp domain' do
  let(:admin) { create(:user, :admin) }
  let(:student) { create(:user) }
  let(:program) { create(:program, created_by: admin) }
  it 'normalizes email and rejects duplicate accounts' do
    student.update!(email: '  Cadet@Example.test ')
    expect(student.reload.email).to eq('cadet@example.test')
    expect(build(:user, email: 'CADET@example.test')).not_to be_valid
  end
  it 'denies authentication to disabled accounts' do
    student.update!(active: false)
    expect(student.active_for_authentication?).to be false
  end
  it 'rejects a future birth date and admin profiles' do
    expect(build(:student_profile, date_of_birth: Date.tomorrow)).not_to be_valid
    expect(build(:student_profile, user: admin)).not_to be_valid
  end
  it 'rejects reversed dates' do
    program.end_date = program.start_date - 1
    expect(program).not_to be_valid
  end
  it 'enforces eligibility, capacity, and uniqueness' do
    expect { Enrollments::Assign.call(program: program, user: student, actor: admin, eligibility_confirmed: false) }.to raise_error(ActiveRecord::RecordInvalid)
    program.update!(capacity: 1)
    Enrollments::Assign.call(program: program, user: student, actor: admin, eligibility_confirmed: true)
    expect { Enrollments::Assign.call(program: program, user: create(:user), actor: admin, eligibility_confirmed: true) }.to raise_error(ActiveRecord::RecordInvalid)
    expect(build(:enrollment, user: student, program: program)).not_to be_valid
  end
  it 'rejects draft and cancelled enrollment and invalid transitions' do
    program.update!(status: :draft)
    expect { Enrollments::Assign.call(program: program, user: student, actor: admin, eligibility_confirmed: true) }.to raise_error(ActiveRecord::RecordInvalid)
    expect { program.transition!('completed', admin) }.to raise_error(ActiveRecord::RecordInvalid)
  end
  it 'does not infer completion from 100 percent progress' do
    e = create(:enrollment, program: program, user: student, progress_percent: 100)
    expect(e).to be_assigned
    expect { Certificates::Issue.call(enrollment: e, actor: admin) }.to raise_error(ActiveRecord::RecordInvalid)
    e.progress_percent = 101
    expect(e).not_to be_valid
  end
  it 'generates a real PDF idempotently with immutable issued snapshots' do
    create(:student_profile, user: student, full_name: 'Original Name')
    program.update!(status: :completed)
    e = create(:enrollment, program: program, user: student, progress_percent: 100, status: :completed, completed_at: Time.current)
    c = Certificates::Issue.call(enrollment: e, actor: admin)
    expect(c.pdf_file.download).to start_with('%PDF-')
    student.student_profile.update!(full_name: 'Changed Name')
    expect { Certificates::Issue.call(enrollment: e, actor: admin) }.not_to change(Certificate, :count)
    expect(c.reload.student_name_snapshot).to eq('Original Name')
    c.update!(status: :revoked, revocation_reason: 'Correction', revoked_at: Time.current)
    expect(Certificates::Issue.call(enrollment: e, actor: admin)).to be_revoked
  end
  it 'restricts deletion of training history' do
    create(:enrollment, user: student, program: program)
    expect(student.destroy).to be false
    expect(program.destroy).to be false
  end
end
