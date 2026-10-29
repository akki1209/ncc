# frozen_string_literal: true

Devise.setup do |config|
  config.mailer_sender = ENV.fetch('MAILER_FROM', 'training@example.org')
  require 'devise/orm/active_record'
  config.case_insensitive_keys = [:email]
  config.strip_whitespace_keys = [:email]
  config.password_length = 12..128
  config.reset_password_within = 6.hours
  config.sign_out_via = :post
  config.navigational_formats = []
end
