module Api
  module V1
    class BaseController < ApplicationController
      HOUSEHOLD_HEADER = "X-Household-Code".freeze

      rescue_from ActiveRecord::RecordNotFound, with: :render_not_found
      rescue_from ActiveRecord::RecordInvalid, with: :render_invalid
      rescue_from ActionController::ParameterMissing, with: :render_bad_request
      rescue_from ActiveRecord::InvalidForeignKey, with: :render_missing_reference

      before_action :require_household!

      private

      # A colmeia is addressed by its invite code, sent on every scoped request.
      # No code, no data: there is nothing global left to read.
      def current_household
        return @current_household if defined?(@current_household)

        code = request.headers[HOUSEHOLD_HEADER].to_s.downcase
        @current_household = code.present? ? Household.find_by(invite_code: code) : nil
      end

      def require_household!
        render json: { error: "unauthorized" }, status: :unauthorized if current_household.nil?
      end

      def render_not_found
        render json: { error: "not_found" }, status: :not_found
      end

      def render_invalid(exception)
        render json: { error: "invalid", details: exception.record.errors.full_messages }, status: :unprocessable_content
      end

      def render_missing_reference
        render json: { error: "invalid", details: [ I18n.t("api.errors.missing_reference") ] }, status: :unprocessable_content
      end

      def render_bad_request(exception)
        render json: { error: "bad_request", details: [ exception.message ] }, status: :bad_request
      end

      def render_conflict(message)
        render json: { error: "conflict", details: [ message ] }, status: :conflict
      end

      def t_error(key)
        I18n.t("api.errors.#{key}")
      end

      # A closed estação is a finished championship: nothing new is scored in it.
      def season_closed?(season)
        season.present? && season.closed?
      end
    end
  end
end
