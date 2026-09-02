module Api
  module V1
    class MembersController < BaseController
      def index
        render json: members.order(:created_at).map { |member| MemberSerializer.call(member) }
      end

      def create
        member = members.create!(member_params)
        render json: MemberSerializer.call(member), status: :created
      end

      def update
        member = members.find(params[:id])
        member.update!(member_params)
        render json: MemberSerializer.call(member)
      end

      def destroy
        members.find(params[:id]).destroy!
        head :no_content
      end

      private

      def members
        current_household.members
      end

      def member_params
        params.require(:member).permit(:name, :avatar, :color, :kind, :points_multiplier)
      end
    end
  end
end
