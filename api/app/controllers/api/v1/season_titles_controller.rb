module Api
  module V1
    class SeasonTitlesController < BaseController
      def index
        render json: titles.in_order.map { |title| SeasonTitleSerializer.call(title) }
      end

      def create
        title = titles.create!(title_params.merge(kind: SeasonTitle::VOTE, position: next_position))
        render json: SeasonTitleSerializer.call(title), status: :created
      end

      def update
        title = titles.find(params[:id])
        title.update!(title_params.merge(order_params))
        render json: SeasonTitleSerializer.call(title)
      end

      # The crown stays: the app awards it from the ranking, so the colmeia can
      # rename it but not drop it. A voted title somebody already used goes
      # quiet instead of away, and the votes it holds stay readable.
      def destroy
        title = titles.find(params[:id])
        return render_conflict(t_error(:auto_title_kept)) if title.auto?

        title.votes.exists? ? title.update!(active: false) : title.destroy!
        head :no_content
      end

      private

      def titles
        current_household.season_titles
      end

      def next_position
        (titles.maximum(:position) || -1) + 1
      end

      def title_params
        params.require(:season_title).permit(:name, :description, :emoji)
      end

      # Where the title sits in the list, and whether it is still handed out.
      # `kind` is not here: the crown never becomes a voted title.
      def order_params
        params.require(:season_title).permit(:position, :active)
      end
    end
  end
end
