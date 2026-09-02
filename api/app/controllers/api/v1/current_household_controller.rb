module Api
  module V1
    # The colmeia the request is scoped to, for reading and renaming it.
    class CurrentHouseholdController < BaseController
      def show
        render json: HouseholdSerializer.call(current_household)
      end

      def update
        current_household.update!(household_params)
        render json: HouseholdSerializer.call(current_household)
      end

      # Only a sandbox has an example to go back to. Answers with the member to
      # carry on as, because the old ones are gone.
      def reseed
        return render_conflict(I18n.t("api.errors.not_a_demo")) unless current_household.demo?

        render json: MemberSerializer.call(Households::SeedExample.new(current_household).reset)
      end

      private

      def household_params
        params.require(:household).permit(:name)
      end
    end
  end
end
