require "rails_helper"

RSpec.describe NavPreferences do
  it "keeps the screens it knows, in the order they were given" do
    normalized = described_class.normalize({ "order" => %w[ seasons home tasks ], "hidden" => %w[ shopping ] })

    expect(normalized).to eq({ "order" => %w[ seasons home tasks ], "hidden" => %w[ shopping ] })
  end

  it "drops a screen it does not know, so an older or newer app cannot store one" do
    normalized = described_class.normalize({ "order" => %w[ home garagem tasks ], "hidden" => %w[ garagem ] })

    expect(normalized).to eq({ "order" => %w[ home tasks ], "hidden" => [] })
  end

  it "keeps a screen once, however many times it was named" do
    normalized = described_class.normalize({ "order" => %w[ home home tasks home ] })

    expect(normalized["order"]).to eq(%w[ home tasks ])
  end

  it "refuses to hide Início: it is the way back to everything else" do
    normalized = described_class.normalize({ "hidden" => %w[ home shopping ] })

    expect(normalized["hidden"]).to eq(%w[ shopping ])
  end

  it "answers with an empty preference for anything that is not one" do
    empty = { "order" => [], "hidden" => [] }

    expect(described_class.normalize(nil)).to eq(empty)
    expect(described_class.normalize("home")).to eq(empty)
    expect(described_class.normalize({ "order" => "home" })).to eq(empty)
  end

  it "knows every screen the app can put in the navigation" do
    expect(described_class::KEYS).to eq(%w[ home tasks goals shopping family achievements seasons ])
  end

  it "reads the params the app sends as well as a stored hash" do
    params = ActionController::Parameters.new(order: %w[ tasks home ], hidden: %w[ family ]).permit!

    expect(described_class.normalize(params)).to eq({ "order" => %w[ tasks home ], "hidden" => %w[ family ] })
  end
end
