module Api
  module V1
    # The public door: creating a colmeia and joining one only need the invite
    # code that comes in the link.
    class HouseholdsController < BaseController
      skip_before_action :require_household!

      def create
        household = Households::Create.new(**create_params).call
        render json: HouseholdSerializer.with_members(household), status: :created
      end

      def show
        render json: HouseholdSerializer.with_members(invited_household)
      end

      def claim
        member = invited_household.members.find(params.require(:member_id))
        return render_conflict("Essa pessoa já entrou na colmeia") if member.claimed?

        member.claim!
        render json: MemberSerializer.call(member)
      end

      def join
        member = invited_household.members.create!(member_params.merge(claimed_at: Time.current))
        render json: MemberSerializer.call(member), status: :created
      end

      private

      def invited_household
        @invited_household ||= Household.find_by!(invite_code: params[:invite_code].to_s.downcase)
      end

      # Names arrive from a phone keyboard, trailing space and all.
      def create_params
        permitted = params.require(:household).permit(:name, member_names: [])
        {
          name: permitted[:name].to_s.strip,
          member_names: Array(permitted[:member_names]).map { |value| value.to_s.strip }
        }
      end

      def member_params
        permitted = params.require(:member).permit(:name, :avatar, :color)
        permitted.merge(name: permitted[:name].to_s.strip)
      end
    end
  end
end
