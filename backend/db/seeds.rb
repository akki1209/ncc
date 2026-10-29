# frozen_string_literal: true

return if Rails.env.test?

abort 'Development seed is disabled in production' if Rails.env.production?
password = ENV.fetch('SEED_ADMIN_PASSWORD') { abort 'Set SEED_ADMIN_PASSWORD (12+ characters) to seed local accounts' }
admin = User.find_or_initialize_by(email: ENV.fetch('SEED_ADMIN_EMAIL', 'admin@ncc.local'))
admin.update!(password: password, role: :admin, active: true)
names = ['Aarav Sharma', 'Ananya Rao', 'Arjun Mehta', 'Diya Patel', 'Ishaan Nair', 'Kavya Singh', 'Rohan Das', 'Saanvi Iyer', 'Vihaan Gupta', 'Zoya Khan']
students = names.each_with_index.map do |name, i|
  u = User.find_or_initialize_by(email: "cadet#{i + 1}@ncc.local")
  u.update!(password: password, role: :student, active: true)
  unless u.student_profile
    u.create_student_profile!(full_name: name, date_of_birth: Date.new(2006, (i % 12) + 1, 12), gender: i.even? ? 'Male' : 'Female', mobile_number: "90000000#{format('%02d', i)}",
                              institution_name: ['National College', 'Central Institute', 'City University'][i % 3], course_or_class: 'Undergraduate', blood_group: 'O+')
  end
  u
end
['Annual Training Camp', 'Leadership Development Camp', 'Physical Fitness Training', 'Discipline & Drill Workshop', 'Adventure Training Camp'].each_with_index do |title, i|
  p = Program.find_or_create_by!(slug: "sample-camp-#{i}") do |r|
    r.title = title
    r.short_description = 'Build confidence, character, and camaraderie through hands-on training.'
    r.description = 'A structured institutional training program combining practical sessions, team exercises, and personal development. These are sample programs, not official NCC-approved offerings.'
    r.eligibility_criteria = 'Active cadets aged 16 and above; institutional eligibility approval required.'
    r.start_date = Date.current + (i * 10) - 20
    r.end_date = r.start_date + 9
    r.location = ['Camp Shivalik, Dehradun', 'Training Centre, Pune', 'National College Grounds', 'Camp Aravali, Jaipur', 'Base Camp, Rishikesh'][i]
    r.capacity = 60
    r.created_by = admin
    r.status = [2, 1, 3, 2, 0][i]
  end
  next if p.draft? || p.cancelled?

  students.first(8 - i).each_with_index do |u, j|
    next if Enrollment.exists?(user: u, program: p)

    status = if p.completed?
               :completed
             else
               (j.zero? ? :assigned : :in_progress)
             end
    e = Enrollment.create!(user: u, program: p, status: status, enrolled_at: Time.current, eligibility_confirmed: true, progress_percent: p.completed? ? 100 : [0, 35, 60, 75, 90, 45, 25, 80][j],
                           completed_at: p.completed? ? Time.current : nil)
    Certificates::Issue.call(enrollment: e, actor: admin) if p.completed?
  end
end
puts 'Fictional development data ready. Admin and cadets use SEED_ADMIN_PASSWORD.'
