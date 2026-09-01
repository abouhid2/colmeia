module Api
  module V1
    class BaseController < ApplicationController
      rescue_from ActiveRecord::RecordNotFound, with: :render_not_found
      rescue_from ActiveRecord::RecordInvalid, with: :render_invalid
      rescue_from ActionController::ParameterMissing, with: :render_bad_request

      private

      def render_not_found
        render json: { error: "not_found" }, status: :not_found
      end

      def render_invalid(exception)
        render json: { error: "invalid", details: exception.record.errors.full_messages }, status: :unprocessable_content
      end

      def render_bad_request(exception)
        render json: { error: "bad_request", details: [ exception.message ] }, status: :bad_request
      end

      def render_conflict(message)
        render json: { error: "conflict", details: [ message ] }, status: :conflict
      end
    end
  end
end
