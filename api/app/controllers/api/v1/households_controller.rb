module Api
  module V1
    class HouseholdsController < BaseController
      def show
        render json: HouseholdSerializer.call(Household.current)
      end

      def update
        household = Household.current
        household.update!(household_params)
        render json: HouseholdSerializer.call(household)
      end

      private

      def household_params
        params.require(:household).permit(:name)
      end
    end
  end
end
