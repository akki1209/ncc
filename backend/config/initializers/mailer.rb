# frozen_string_literal: true

Rails.application.config.action_mailer.default_url_options = { host: ENV.fetch('APP_HOST', 'localhost:5173') }
if ENV['SMTP_HOST'].present?
  Rails.application.config.action_mailer.delivery_method = :smtp
  Rails.application.config.action_mailer.smtp_settings = { address: ENV['SMTP_HOST'], port: ENV.fetch('SMTP_PORT', 587).to_i,
                                                           user_name: ENV.fetch('SMTP_USERNAME', nil), password: ENV.fetch('SMTP_PASSWORD', nil), authentication: :plain,
                                                           enable_starttls_auto: true }
end

if Rails.env.development? && ENV['SMTP_HOST'].blank?
  Rails.application.config.action_mailer.delivery_method = :file
  Rails.application.config.action_mailer.file_settings = { location: Rails.root.join('tmp/mail') }
end
