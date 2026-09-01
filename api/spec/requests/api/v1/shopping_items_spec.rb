require "rails_helper"

RSpec.describe "Shopping items API", type: :request do
  let!(:member) { Member.create!(name: "Ana") }

  it "adds an item" do
    post "/api/v1/shopping_items", params: { shopping_item: { name: "Leite", quantity: "2 caixas", added_by_id: member.id } }

    expect(response).to have_http_status(:created)
    expect(json_body).to include("name" => "Leite", "purchased" => false)
  end

  it "stamps purchased_at when an item is bought and clears it when unbought" do
    item = ShoppingItem.create!(name: "Ovos")

    patch "/api/v1/shopping_items/#{item.id}", params: { shopping_item: { purchased: true, purchased_by_id: member.id } }
    expect(json_body["purchased_at"]).to be_present

    patch "/api/v1/shopping_items/#{item.id}", params: { shopping_item: { purchased: false } }
    expect(json_body["purchased_at"]).to be_nil
    expect(json_body["purchased_by_id"]).to be_nil
  end

  it "clears purchased items" do
    ShoppingItem.create!(name: "Comprado", purchased: true)
    ShoppingItem.create!(name: "Falta")

    delete "/api/v1/shopping_items/purchased"

    expect(response).to have_http_status(:no_content)
    expect(ShoppingItem.pluck(:name)).to eq([ "Falta" ])
  end
end
