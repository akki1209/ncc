# frozen_string_literal: true

FactoryBot.define do
  factory :user do
    sequence(:email) { |n| "cadet#{n}@example.test" }
    password { 'TestPassword123!' }
    role { :student }
    active { true }
    trait :admin do
      role { :admin }
    end
  end
  factory :student_profile do
    user
    full_name { 'Example Cadet' }
    date_of_birth { Date.new(2006, 1, 1) }
    gender { 'Female' }
    mobile_number { '919000000001' }
    institution_name { 'Example College' }
    course_or_class { 'Undergraduate' }
  end
  factory :program do
    association :created_by, factory: %i[user admin]
    title { 'Example Training' }
    start_date { Date.current }
    end_date { Date.current + 5 }
    location { 'Example Camp' }
    capacity { 3 }
    status { :published }
  end
  factory :enrollment do
    user
    program
    enrolled_at { Time.current }
    eligibility_confirmed { true }
    progress_percent { 0 }
  end
end
