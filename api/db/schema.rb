# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_09_03_000012) do
  create_table "completions", force: :cascade do |t|
    t.datetime "completed_at", null: false
    t.datetime "created_at", null: false
    t.integer "household_id", null: false
    t.integer "member_id"
    t.decimal "multiplier", precision: 3, scale: 2, default: "1.0", null: false
    t.integer "points_awarded", default: 0, null: false
    t.integer "rating"
    t.datetime "reviewed_at"
    t.integer "reviewer_id"
    t.string "status", default: "approved", null: false
    t.integer "task_id"
    t.integer "task_points", null: false
    t.string "task_title", null: false
    t.datetime "updated_at", null: false
    t.index ["completed_at"], name: "index_completions_on_completed_at"
    t.index ["household_id"], name: "index_completions_on_household_id"
    t.index ["member_id"], name: "index_completions_on_member_id"
    t.index ["reviewer_id"], name: "index_completions_on_reviewer_id"
    t.index ["status"], name: "index_completions_on_status"
    t.index ["task_id"], name: "index_completions_on_task_id"
  end

  create_table "goals", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "household_id", null: false
    t.integer "member_id"
    t.string "period", default: "week", null: false
    t.integer "target_points", default: 300, null: false
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.index ["household_id"], name: "index_goals_on_household_id"
    t.index ["member_id"], name: "index_goals_on_member_id"
  end

  create_table "households", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.boolean "demo", default: false, null: false
    t.string "invite_code", null: false
    t.string "name", default: "Nossa casa", null: false
    t.datetime "updated_at", null: false
    t.index ["demo"], name: "index_households_on_demo"
    t.index ["invite_code"], name: "index_households_on_invite_code", unique: true
  end

  create_table "members", force: :cascade do |t|
    t.string "avatar", default: "🐝", null: false
    t.datetime "claimed_at"
    t.string "color", default: "honey", null: false
    t.datetime "created_at", null: false
    t.string "crown_title", default: "Abelha Rainha", null: false
    t.integer "household_id", null: false
    t.string "kind", default: "bee", null: false
    t.string "name", null: false
    t.decimal "points_multiplier", precision: 3, scale: 2, default: "1.0", null: false
    t.datetime "updated_at", null: false
    t.index ["household_id"], name: "index_members_on_household_id"
  end

  create_table "shopping_items", force: :cascade do |t|
    t.integer "added_by_id"
    t.datetime "created_at", null: false
    t.integer "household_id", null: false
    t.string "name", null: false
    t.boolean "purchased", default: false, null: false
    t.datetime "purchased_at"
    t.integer "purchased_by_id"
    t.string "quantity"
    t.datetime "updated_at", null: false
    t.index ["added_by_id"], name: "index_shopping_items_on_added_by_id"
    t.index ["household_id"], name: "index_shopping_items_on_household_id"
    t.index ["purchased"], name: "index_shopping_items_on_purchased"
    t.index ["purchased_by_id"], name: "index_shopping_items_on_purchased_by_id"
  end

  create_table "tasks", force: :cascade do |t|
    t.integer "assignee_id"
    t.datetime "completed_at"
    t.datetime "created_at", null: false
    t.integer "created_by_id"
    t.text "description"
    t.date "due_on"
    t.integer "household_id", null: false
    t.integer "interval_days"
    t.boolean "kid_friendly", default: false, null: false
    t.integer "points", default: 10, null: false
    t.string "priority", default: "medium", null: false
    t.string "recurrence", default: "none", null: false
    t.boolean "requires_review", default: false, null: false
    t.string "status", default: "open", null: false
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.index ["assignee_id"], name: "index_tasks_on_assignee_id"
    t.index ["created_by_id"], name: "index_tasks_on_created_by_id"
    t.index ["due_on"], name: "index_tasks_on_due_on"
    t.index ["household_id"], name: "index_tasks_on_household_id"
    t.index ["status"], name: "index_tasks_on_status"
  end

  add_foreign_key "completions", "households"
  add_foreign_key "completions", "members"
  add_foreign_key "completions", "members", column: "reviewer_id"
  add_foreign_key "completions", "tasks"
  add_foreign_key "goals", "households"
  add_foreign_key "goals", "members"
  add_foreign_key "members", "households"
  add_foreign_key "shopping_items", "households"
  add_foreign_key "shopping_items", "members", column: "added_by_id"
  add_foreign_key "shopping_items", "members", column: "purchased_by_id"
  add_foreign_key "tasks", "households"
  add_foreign_key "tasks", "members", column: "assignee_id"
  add_foreign_key "tasks", "members", column: "created_by_id"
end
