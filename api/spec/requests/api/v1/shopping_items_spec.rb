require "rails_helper"

RSpec.describe "Shopping items API", type: :request do
  let(:household) { create_household }
  let(:headers) { headers_for(household) }
  let!(:member) { household.members.create!(name: "Ana") }

  it "adds an item" do
    post "/api/v1/shopping_items", params: { shopping_item: { name: "Leite", quantity: "2 caixas", added_by_id: member.id } }, headers: headers

    expect(response).to have_http_status(:created)
    expect(json_body).to include("name" => "Leite", "purchased" => false)
  end

  it "stamps purchased_at when an item is bought and clears it when unbought" do
    item = household.shopping_items.create!(name: "Ovos")

    patch "/api/v1/shopping_items/#{item.id}", params: { shopping_item: { purchased: true, purchased_by_id: member.id } }, headers: headers
    expect(json_body["purchased_at"]).to be_present

    patch "/api/v1/shopping_items/#{item.id}", params: { shopping_item: { purchased: false } }, headers: headers
    expect(json_body["purchased_at"]).to be_nil
    expect(json_body["purchased_by_id"]).to be_nil
  end

  it "clears purchased items" do
    household.shopping_items.create!(name: "Comprado", purchased: true)
    household.shopping_items.create!(name: "Falta")

    delete "/api/v1/shopping_items/purchased", headers: headers

    expect(response).to have_http_status(:no_content)
    expect(household.shopping_items.pluck(:name)).to eq([ "Falta" ])
  end
end
