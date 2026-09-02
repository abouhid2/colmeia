namespace :demo do
  desc "Delete sandbox colmeias older than a week, with everything inside them"
  task cleanup: :environment do
    # A week is long enough for somebody to come back to the example they were
    # playing with, and short enough that they do not pile up forever.
    stale = Household.demos.where(created_at: ...1.week.ago)
    removed = stale.count
    stale.destroy_all
    puts "Removidas #{removed} colmeias de exemplo."
  end
end
