# Demo colmeia for local development, reachable at /entrar/demo. Safe to run
# more than once: the second run finds the same household and stops.
household = Household.find_or_create_by!(invite_code: "demo") { |record| record.name = "Família Colmeia" }
return if household.members.exists?

now = Time.current
today = Date.current

# Ana already claimed her place; the other three are still invitations waiting
# to be opened, which is what the invite link demonstrates.
ana = household.members.create!(name: "Ana", avatar: "🦊", color: "pollen", claimed_at: now)
bruno = household.members.create!(name: "Bruno", avatar: "🐻", color: "sky", crown_title: "Abelhão")
clara = household.members.create!(name: "Clara", avatar: "🐼", color: "plum", crown_title: "Rainha da Louça")
duda = household.members.create!(name: "Duda", avatar: "🦉", color: "leaf")

household.tasks.create!(
  title: "Trocar a resistência do chuveiro",
  description: "A resistência queimou. Comprar uma de 220V e trocar com o disjuntor desligado.",
  points: 50, priority: "urgent", requires_review: true, created_by: ana
)
bathroom = household.tasks.create!(
  title: "Limpar o banheiro", points: 20, priority: "high", recurrence: "weekly",
  due_on: today + 7, requires_review: true, assignee: bruno
)
dishes = household.tasks.create!(title: "Lavar a louça do jantar", points: 5, priority: "medium", recurrence: "daily", due_on: today + 1)
household.tasks.create!(title: "Pendurar o quadro da sala", points: 15, priority: "low", assignee: bruno, created_by: clara)
trash = household.tasks.create!(title: "Levar o lixo para fora", points: 5, priority: "medium", recurrence: "daily", due_on: today + 1)
household.tasks.create!(
  title: "Regar as plantas", points: 5, priority: "low", recurrence: "custom",
  interval_days: 3, due_on: today + 1, assignee: duda
)
household.tasks.create!(title: "Aspirar a sala e os quartos", points: 15, priority: "medium", recurrence: "weekly", due_on: today + 2)
household.tasks.create!(
  title: "Trocar a roupa de cama", points: 10, priority: "medium", recurrence: "weekly",
  due_on: today + 3, requires_review: true
)
household.tasks.create!(title: "Organizar a despensa", points: 30, priority: "low", recurrence: "monthly", due_on: today + 12)

car = household.tasks.create!(title: "Lavar o carro", points: 40, priority: "medium", requires_review: true, status: "done", completed_at: now - 9.hours)
lunch = household.tasks.create!(title: "Fazer o almoço de domingo", points: 30, priority: "medium", status: "done", completed_at: now - 7.hours)
ironing = household.tasks.create!(title: "Passar as roupas", points: 20, priority: "low", requires_review: true, status: "done", completed_at: now - 5.hours)

household.completions.create!(task: car, member: ana, reviewer: bruno, status: "approved", rating: 4, points_awarded: 32,
  task_title: car.title, task_points: 40, completed_at: now - 9.hours, reviewed_at: now - 8.hours)
household.completions.create!(task: lunch, member: bruno, status: "approved", points_awarded: 30,
  task_title: lunch.title, task_points: 30, completed_at: now - 7.hours)
household.completions.create!(task: ironing, member: clara, reviewer: ana, status: "approved", rating: 5, points_awarded: 20,
  task_title: ironing.title, task_points: 20, completed_at: now - 5.hours, reviewed_at: now - 4.hours)
household.completions.create!(task: dishes, member: duda, status: "approved", points_awarded: 5,
  task_title: dishes.title, task_points: 5, completed_at: now - 3.hours)
household.completions.create!(task: trash, member: ana, status: "approved", points_awarded: 5,
  task_title: trash.title, task_points: 5, completed_at: now - 2.hours)
household.completions.create!(task: bathroom, member: bruno, status: "pending", points_awarded: 0,
  task_title: bathroom.title, task_points: 20, completed_at: now - 1.hour)

# Last week the house beat the goal and Bruno pulled ahead, so he wears the crown this week.
last_week = now.beginning_of_week - 1.week
weekday = ->(offset) { last_week + offset.days + 10.hours }

[
  { member: bruno, title: "Montar o armário do quarto", points: 90, awarded: 90, rating: 5, reviewer: ana, day: 1 },
  { member: bruno, title: "Lavar o carro", points: 40, awarded: 40, day: 4 },
  { member: ana, title: "Fazer a feira do mês", points: 50, awarded: 50, day: 0 },
  { member: ana, title: "Limpar o quintal", points: 30, awarded: 30, day: 3 },
  { member: ana, title: "Trocar as lâmpadas", points: 20, awarded: 20, day: 5 },
  { member: clara, title: "Passar as roupas", points: 20, awarded: 16, rating: 4, reviewer: bruno, day: 2 },
  { member: clara, title: "Organizar a despensa", points: 30, awarded: 30, day: 5 },
  { member: duda, title: "Regar as plantas", points: 5, awarded: 5, day: 2 },
  { member: duda, title: "Lavar a louça do jantar", points: 5, awarded: 5, day: 5 },
  { member: duda, title: "Aspirar a sala e os quartos", points: 20, awarded: 20, day: 6 }
].each do |row|
  done_at = weekday.call(row[:day])
  household.completions.create!(
    member: row[:member], reviewer: row[:reviewer], status: "approved", rating: row[:rating],
    points_awarded: row[:awarded], task_title: row[:title], task_points: row[:points],
    completed_at: done_at, reviewed_at: (done_at if row[:rating])
  )
end

household.goals.create!(title: "Pizza e filme no sábado", target_points: 300, period: "week")
household.goals.create!(title: "Sorvete na sexta", target_points: 30, period: "week", member: duda)
household.goals.create!(title: "Escolher o filme do sábado", target_points: 60, period: "week", member: bruno)

household.shopping_items.create!(name: "Leite", quantity: "2 caixas", added_by: ana)
household.shopping_items.create!(name: "Ovos", quantity: "1 dúzia", added_by: bruno)
household.shopping_items.create!(name: "Detergente", added_by: clara)
household.shopping_items.create!(name: "Resistência do chuveiro 220V", added_by: ana)
household.shopping_items.create!(name: "Café", quantity: "500 g", added_by: clara)
household.shopping_items.create!(name: "Papel higiênico", quantity: "12 rolos", added_by: duda, purchased: true, purchased_by: bruno, purchased_at: now - 6.hours)
