# frozen_string_literal: true

Rails.application.config.filter_parameters += %i[password password_confirmation token reset_password_token aadhaar_number encrypted_password]
