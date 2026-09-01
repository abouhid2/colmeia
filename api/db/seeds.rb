# Demo household for local development. Safe to run more than once.
return if Member.exists?

Household.current.update!(name: "Família Colmeia")

ana = Member.create!(name: "Ana", avatar: "🦊", color: "pollen")
bruno = Member.create!(name: "Bruno", avatar: "🐻", color: "sky")
clara = Member.create!(name: "Clara", avatar: "🐼", color: "plum")
duda = Member.create!(name: "Duda", avatar: "🦉", color: "leaf")

today = Date.current
now = Time.current

Task.create!(
  title: "Trocar a resistência do chuveiro",
  description: "A resistência queimou. Comprar uma de 220V e trocar com o disjuntor desligado.",
  points: 50, priority: "urgent", requires_review: true, created_by: ana
)
bathroom = Task.create!(
  title: "Limpar o banheiro", points: 20, priority: "high", recurrence: "weekly",
  due_on: today + 7, requires_review: true, assignee: bruno
)
dishes = Task.create!(title: "Lavar a louça do jantar", points: 5, priority: "medium", recurrence: "daily", due_on: today + 1)
Task.create!(title: "Pendurar o quadro da sala", points: 15, priority: "low", assignee: bruno, created_by: clara)
trash = Task.create!(title: "Levar o lixo para fora", points: 5, priority: "medium", recurrence: "daily", due_on: today + 1)
Task.create!(
  title: "Regar as plantas", points: 5, priority: "low", recurrence: "custom",
  interval_days: 3, due_on: today + 1, assignee: duda
)
Task.create!(title: "Aspirar a sala e os quartos", points: 15, priority: "medium", recurrence: "weekly", due_on: today + 2)
Task.create!(
  title: "Trocar a roupa de cama", points: 10, priority: "medium", recurrence: "weekly",
  due_on: today + 3, requires_review: true
)
Task.create!(title: "Organizar a despensa", points: 30, priority: "low", recurrence: "monthly", due_on: today + 12)

car = Task.create!(title: "Lavar o carro", points: 40, priority: "medium", requires_review: true, status: "done", completed_at: now - 9.hours)
lunch = Task.create!(title: "Fazer o almoço de domingo", points: 30, priority: "medium", status: "done", completed_at: now - 7.hours)
ironing = Task.create!(title: "Passar as roupas", points: 20, priority: "low", requires_review: true, status: "done", completed_at: now - 5.hours)

Completion.create!(task: car, member: ana, reviewer: bruno, status: "approved", rating: 4, points_awarded: 32,
  task_title: car.title, task_points: 40, completed_at: now - 9.hours, reviewed_at: now - 8.hours)
Completion.create!(task: lunch, member: bruno, status: "approved", points_awarded: 30,
  task_title: lunch.title, task_points: 30, completed_at: now - 7.hours)
Completion.create!(task: ironing, member: clara, reviewer: ana, status: "approved", rating: 5, points_awarded: 20,
  task_title: ironing.title, task_points: 20, completed_at: now - 5.hours, reviewed_at: now - 4.hours)
Completion.create!(task: dishes, member: duda, status: "approved", points_awarded: 5,
  task_title: dishes.title, task_points: 5, completed_at: now - 3.hours)
Completion.create!(task: trash, member: ana, status: "approved", points_awarded: 5,
  task_title: trash.title, task_points: 5, completed_at: now - 2.hours)
Completion.create!(task: bathroom, member: bruno, status: "pending", points_awarded: 0,
  task_title: bathroom.title, task_points: 20, completed_at: now - 1.hour)

Goal.create!(title: "Pizza e filme no sábado", target_points: 300, period: "week")
Goal.create!(title: "Sorvete na sexta", target_points: 30, period: "week", member: duda)
Goal.create!(title: "Escolher o filme do sábado", target_points: 60, period: "week", member: bruno)

ShoppingItem.create!(name: "Leite", quantity: "2 caixas", added_by: ana)
ShoppingItem.create!(name: "Ovos", quantity: "1 dúzia", added_by: bruno)
ShoppingItem.create!(name: "Detergente", added_by: clara)
ShoppingItem.create!(name: "Resistência do chuveiro 220V", added_by: ana)
ShoppingItem.create!(name: "Café", quantity: "500 g", added_by: clara)
ShoppingItem.create!(name: "Papel higiênico", quantity: "12 rolos", added_by: duda, purchased: true, purchased_by: bruno, purchased_at: now - 6.hours)
