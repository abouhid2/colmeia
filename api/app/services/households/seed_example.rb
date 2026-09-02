module Households
  # The example family: a colmeia already lived in, with a week of history
  # behind it, a reward still in sight and something waiting to be reviewed.
  # db/seeds.rb and the demo endpoint both fill a colmeia from here, so there is
  # a single example to keep believable.
  class SeedExample
    NAME = "Família de exemplo".freeze
    # Whoever opens the example walks in as Ana: her place is already claimed,
    # so there is nothing to sign up for before touching the app.
    ENTRY_MEMBER_NAME = "Ana".freeze

    # A colmeia of its own for one visitor, filled with the example. Answers
    # with the colmeia and the member to enter as.
    def self.create_household(now: Time.current)
      Household.transaction do
        household = Household.create!(name: NAME, demo: true)
        [ household, new(household, now: now).call ]
      end
    end

    def initialize(household, now: Time.current)
      @household = household
      @now = now
    end

    # Fills the colmeia and answers with the member to enter as.
    def call
      Household.transaction do
        # Duda is a lagartinha, so the example shows what the switch turns on.
        household.update!(lagartinhas_enabled: true)
        create_seasons
        create_titles
        create_members
        create_tasks
        create_completions
        create_last_week
        create_votes
        create_goals
        create_shopping_items
      end
      members.fetch(:ana)
    end

    # Back to the beginning: the sandbox drops whatever was done to it and is
    # filled again. Everybody comes back with a new id, so whoever is inside has
    # to be pointed at the new Ana.
    def reset
      Household.transaction do
        household.members.destroy_all
        [ household.tasks, household.completions, household.shopping_items, household.goals ].each(&:destroy_all)
        household.seasons.destroy_all
        @members = nil
        @tasks = nil
        @seasons = nil
        @titles = nil
        call
      end
    end

    private

    attr_reader :household, :now

    def members
      @members ||= {}
    end

    def tasks
      @tasks ||= {}
    end

    def seasons
      @seasons ||= {}
    end

    def titles
      @titles ||= {}
    end

    def season
      seasons.fetch(:current)
    end

    def today
      now.to_date
    end

    # Two estações, so the example opens with a championship already decided
    # and another one running: the crown comes from the closed one. The example
    # replaces whatever the colmeia opened with, so no empty estação is left over.
    def create_seasons
      household.seasons.destroy_all
      week_start = now.beginning_of_week
      seasons[:past] = household.seasons.create!(
        name: "Estação passada", starts_on: (week_start - 1.week).to_date,
        ends_on: (week_start - 1.day).to_date, closed_at: week_start
      )
      seasons[:current] = household.seasons.create!(name: "Estação atual", starts_on: week_start.to_date)
    end

    # The títulos belong to the colmeia and survive a reset, so this only fills
    # them in the first time.
    def create_titles
      @titles = SeasonTitles::Seed.new(household).call.index_by(&:name)
    end

    def create_members
      # Ana already claimed her place; the other three are still invitations
      # waiting to be opened, which is what the invite link demonstrates. Ana
      # and Bruno also pinned badges they earned, which is what the profile shows.
      # Each one fills the honeycomb with a texture of their own.
      members[:ana] = household.members.create!(name: ENTRY_MEMBER_NAME, avatar: "🦊", color: "pollen", pattern: "dots", claimed_at: now,
        favorite_achievements: %w[ firstTask bigTask ])
      members[:bruno] = household.members.create!(name: "Bruno", avatar: "🐻", color: "sky", pattern: "stripes", crown_title: "Abelhão",
        favorite_achievements: %w[ flawless ])
      members[:clara] = household.members.create!(name: "Clara", avatar: "🐼", color: "plum", pattern: "crosses", crown_title: "Rainha da Louça")
      # Duda is the child of the house: everything she does is worth 1,5x.
      members[:duda] = household.members.create!(name: "Duda", avatar: "🦉", color: "leaf", pattern: "rings", kind: "lagartinha")
    end

    def create_tasks
      ana, bruno, clara, duda = members.values_at(:ana, :bruno, :clara, :duda)

      household.tasks.create!(
        season: season, title: "Trocar a resistência do chuveiro",
        description: "A resistência queimou. Comprar uma de 220V e trocar com o disjuntor desligado.",
        points: 50, priority: "urgent", requires_review: true, created_by: ana
      )
      tasks[:bathroom] = household.tasks.create!(
        season: season, title: "Limpar o banheiro", points: 20, priority: "high", recurrence: "weekly",
        due_on: today + 7, requires_review: true, assignee: bruno
      )
      tasks[:dishes] = household.tasks.create!(
        season: season, title: "Lavar a louça do jantar", points: 5, priority: "medium",
        recurrence: "daily", due_on: today + 1, kid_friendly: true
      )
      household.tasks.create!(season: season, title: "Pendurar o quadro da sala", points: 15, priority: "low", assignee: bruno, created_by: clara)
      tasks[:trash] = household.tasks.create!(
        season: season, title: "Levar o lixo para fora", points: 5, priority: "medium",
        recurrence: "daily", due_on: today + 1, kid_friendly: true
      )
      household.tasks.create!(
        season: season, title: "Regar as plantas", points: 5, priority: "low", recurrence: "custom",
        interval_days: 3, due_on: today + 1, assignee: duda, kid_friendly: true
      )
      household.tasks.create!(season: season, title: "Aspirar a sala e os quartos", points: 15, priority: "medium", recurrence: "weekly", due_on: today + 2)
      household.tasks.create!(
        season: season, title: "Trocar a roupa de cama", points: 10, priority: "medium", recurrence: "weekly",
        due_on: today + 3, requires_review: true
      )
      household.tasks.create!(season: season, title: "Organizar a despensa", points: 30, priority: "low", recurrence: "monthly", due_on: today + 12)

      tasks[:car] = household.tasks.create!(
        season: season, title: "Lavar o carro", points: 40, priority: "medium",
        requires_review: true, status: "done", completed_at: now - 9.hours
      )
      tasks[:lunch] = household.tasks.create!(season: season, title: "Fazer o almoço de domingo", points: 30, priority: "medium", status: "done", completed_at: now - 7.hours)
      tasks[:ironing] = household.tasks.create!(
        season: season, title: "Passar as roupas", points: 20, priority: "low",
        requires_review: true, status: "done", completed_at: now - 5.hours
      )
    end

    def create_completions
      ana, bruno, clara, duda = members.values_at(:ana, :bruno, :clara, :duda)
      car, lunch, ironing, dishes, trash, bathroom = tasks.values_at(:car, :lunch, :ironing, :dishes, :trash, :bathroom)

      household.completions.create!(season: season, task: car, member: ana, reviewer: bruno, status: "approved", rating: 4, points_awarded: 32,
        task_title: car.title, task_points: 40, completed_at: now - 9.hours, reviewed_at: now - 8.hours)
      household.completions.create!(season: season, task: lunch, member: bruno, status: "approved", points_awarded: 30,
        task_title: lunch.title, task_points: 30, completed_at: now - 7.hours)
      household.completions.create!(season: season, task: ironing, member: clara, reviewer: ana, status: "approved", rating: 5, points_awarded: 20,
        task_title: ironing.title, task_points: 20, completed_at: now - 5.hours)
      household.completions.create!(season: season, task: dishes, member: duda, status: "approved", points_awarded: 8, multiplier: 1.5,
        task_title: dishes.title, task_points: 5, completed_at: now - 3.hours)
      household.completions.create!(season: season, task: trash, member: ana, status: "approved", points_awarded: 5,
        task_title: trash.title, task_points: 5, completed_at: now - 2.hours)
      household.completions.create!(season: season, task: bathroom, member: bruno, status: "pending", points_awarded: 0,
        task_title: bathroom.title, task_points: 20, completed_at: now - 1.hour)
    end

    # Last week the house beat the goal and Bruno pulled ahead, so he wears the
    # crown this week.
    def create_last_week
      last_week = now.beginning_of_week - 1.week
      weekday = ->(offset) { last_week + offset.days + 10.hours }

      last_week_rows.each do |row|
        done_at = weekday.call(row[:day])
        household.completions.create!(
          season: seasons.fetch(:past),
          member: row[:member], reviewer: row[:reviewer], status: "approved", rating: row[:rating],
          points_awarded: row[:awarded], multiplier: row[:member].points_multiplier,
          task_title: row[:title], task_points: row[:points],
          completed_at: done_at, reviewed_at: (done_at if row[:rating])
        )
      end
    end

    def last_week_rows
      ana, bruno, clara, duda = members.values_at(:ana, :bruno, :clara, :duda)

      [
        { member: bruno, title: "Montar o armário do quarto", points: 90, awarded: 90, rating: 5, reviewer: ana, day: 1 },
        { member: bruno, title: "Lavar o carro", points: 40, awarded: 40, day: 4 },
        { member: ana, title: "Fazer a feira do mês", points: 50, awarded: 50, day: 0 },
        { member: ana, title: "Limpar o quintal", points: 30, awarded: 30, day: 3 },
        { member: ana, title: "Trocar as lâmpadas", points: 20, awarded: 20, day: 5 },
        { member: clara, title: "Passar as roupas", points: 20, awarded: 16, rating: 4, reviewer: bruno, day: 2 },
        { member: clara, title: "Organizar a despensa", points: 30, awarded: 30, day: 5 },
        { member: duda, title: "Regar as plantas", points: 5, awarded: 8, day: 2 },
        { member: duda, title: "Lavar a louça do jantar", points: 5, awarded: 8, day: 5 },
        { member: duda, title: "Aspirar a sala e os quartos", points: 20, awarded: 30, day: 6 }
      ]
    end

    # The family voted on the estação that closed: Bruno took the Pernilongo,
    # and the Lesma ended in a draw nobody wants to break.
    def create_votes
      ana, bruno, clara, duda = members.values_at(:ana, :bruno, :clara, :duda)

      cast("Pernilongo", ana, bruno)
      cast("Pernilongo", clara, bruno)
      cast("Pernilongo", duda, ana)
      cast("Lesma", ana, duda)
      cast("Lesma", bruno, clara)
    end

    def cast(title_name, voter, votee)
      household.season_title_votes.create!(
        season: seasons.fetch(:past), season_title: titles.fetch(title_name), voter: voter, votee: votee
      )
    end

    def create_goals
      # The closed estação kept its own reward, so the crown has a target to beat.
      household.goals.create!(season: seasons.fetch(:past), title: "Pizza e filme no sábado", target_points: 300)
      household.goals.create!(season: season, title: "Pizza e filme no sábado", target_points: 300)
      household.goals.create!(season: season, title: "Sorvete na sexta", target_points: 30, member: members.fetch(:duda))
      household.goals.create!(season: season, title: "Escolher o filme do sábado", target_points: 60, member: members.fetch(:bruno))
    end

    def create_shopping_items
      ana, bruno, clara, duda = members.values_at(:ana, :bruno, :clara, :duda)

      household.shopping_items.create!(name: "Leite", quantity: "2 caixas", added_by: ana)
      household.shopping_items.create!(name: "Ovos", quantity: "1 dúzia", added_by: bruno)
      household.shopping_items.create!(name: "Detergente", added_by: clara)
      household.shopping_items.create!(name: "Resistência do chuveiro 220V", added_by: ana)
      household.shopping_items.create!(name: "Café", quantity: "500 g", added_by: clara)
      household.shopping_items.create!(
        name: "Papel higiênico", quantity: "12 rolos", added_by: duda,
        purchased: true, purchased_by: bruno, purchased_at: now - 6.hours
      )
    end
  end
end
