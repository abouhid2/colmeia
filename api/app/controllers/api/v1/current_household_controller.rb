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

      private

      def household_params
        params.require(:household).permit(:name)
      end
    end
  end
end
