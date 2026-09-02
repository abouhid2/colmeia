module Api
  module V1
    class SeasonsController < BaseController
      def index
        render json: seasons.newest_first.map { |season| SeasonSerializer.call(season) }
      end

      def create
        season = Seasons::Create.new(
          household: current_household,
          attributes: season_params,
          copy_tasks_from_season_id: params[:season][:copy_tasks_from_season_id]
        ).call
        render json: SeasonSerializer.call(season), status: :created
      end

      def update
        season = seasons.find(params[:id])
        season.update!(season_params)
        render json: SeasonSerializer.call(season)
      end

      # Closing freezes the ranking: nothing else can be scored in it.
      def close
        season = seasons.find(params[:id])
        return render_conflict(t_error(:season_already_closed)) if season.closed?

        season.update!(closed_at: Time.current)
        render json: SeasonSerializer.call(season)
      end

      def reopen
        season = seasons.find(params[:id])
        return render_conflict(t_error(:season_already_open)) unless season.closed?

        season.update!(closed_at: nil)
        render json: SeasonSerializer.call(season)
      end

      # What was scored is history: an estação with completions stays.
      def destroy
        season = seasons.find(params[:id])
        return render_conflict(t_error(:season_has_completions)) if season.completions.exists?

        season.destroy!
        head :no_content
      end

      private

      def seasons
        current_household.seasons
      end

      def season_params
        params.require(:season).permit(:name, :starts_on, :ends_on)
      end
    end
  end
end
