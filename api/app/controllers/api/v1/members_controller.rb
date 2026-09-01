module Api
  module V1
    class MembersController < BaseController
      def index
        render json: Member.order(:created_at).map { |member| MemberSerializer.call(member) }
      end

      def create
        member = Member.create!(member_params)
        render json: MemberSerializer.call(member), status: :created
      end

      def update
        member = Member.find(params[:id])
        member.update!(member_params)
        render json: MemberSerializer.call(member)
      end

      def destroy
        Member.find(params[:id]).destroy!
        head :no_content
      end

      private

      def member_params
        params.require(:member).permit(:name, :avatar, :color)
      end
    end
  end
end
