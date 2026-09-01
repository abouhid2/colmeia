module Api
  module V1
    class ShoppingItemsController < BaseController
      def index
        render json: ShoppingItem.oldest_first.map { |item| ShoppingItemSerializer.call(item) }
      end

      def create
        item = ShoppingItem.create!(shopping_item_params)
        render json: ShoppingItemSerializer.call(item), status: :created
      end

      def update
        item = ShoppingItem.find(params[:id])
        item.update!(shopping_item_params.merge(purchase_timestamp(item)))
        render json: ShoppingItemSerializer.call(item)
      end

      def destroy
        ShoppingItem.find(params[:id]).destroy!
        head :no_content
      end

      def clear_purchased
        ShoppingItem.purchased.destroy_all
        head :no_content
      end

      private

      def shopping_item_params
        params.require(:shopping_item).permit(:name, :quantity, :added_by_id, :purchased, :purchased_by_id)
      end

      def purchase_timestamp(item)
        return {} unless shopping_item_params.key?(:purchased)

        purchasing = ActiveModel::Type::Boolean.new.cast(shopping_item_params[:purchased])
        purchasing ? { purchased_at: Time.current } : { purchased_at: nil, purchased_by_id: nil }
      end
    end
  end
end
