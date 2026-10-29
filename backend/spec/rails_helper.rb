# frozen_string_literal: true

ENV['RAILS_ENV'] = 'test'
require_relative '../config/environment'
require 'rspec/rails'
require 'factory_bot_rails'
ActiveRecord::Migration.maintain_test_schema!
RSpec.configure do |config|
  config.use_transactional_fixtures = true
  config.include FactoryBot::Syntax::Methods
  config.include Devise::Test::IntegrationHelpers, type: :request
  config.before { ActiveJob::Base.queue_adapter = :test }
end
