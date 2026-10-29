# frozen_string_literal: true

module Rack
  class Attack
    throttle('auth/ip', limit: 10, period: 60) do |request|
      request.ip if request.post? && request.path.match?(%r{/api/v1/auth/(login|password)})
    end
  end
end
