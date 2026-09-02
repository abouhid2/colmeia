# A name the colmeia hands out at the end of an estação. One is automatic (the
# crown, won by whoever scored most), the rest are voted on by the family.
# Titles belong to the colmeia, not to an estação: they come back every season.
class SeasonTitle < ApplicationRecord
  NAME_LIMIT = 30
  DESCRIPTION_LIMIT = 120
  EMOJI_LIMIT = 8
  AUTO = "auto".freeze
  VOTE = "vote".freeze
  KINDS = [ AUTO, VOTE ].freeze

  # What every colmeia opens with. The first one is the crown the app already
  # awards; the others are the jokes the family votes on once the estação ends.
  DEFAULTS = [
    { name: "Vencedor da estação", emoji: "👑", kind: AUTO,
      description: "Quem mais pontuou com a meta da colmeia batida. Cada pessoa escolhe como quer ser chamada ao vencer." },
    { name: "Pernilongo", emoji: "🦟", kind: VOTE, description: "Só perturbou e não fez nada." },
    { name: "Abelhudo", emoji: "🔍", kind: VOTE, description: "Ficou fiscalizando demais o serviço dos outros." },
    { name: "Mosca-morta", emoji: "🪰", kind: VOTE, description: "Nem precisa explicar." },
    { name: "Lesma", emoji: "🐌", kind: VOTE, description: "O mais lerdo da estação." },
    { name: "Cigarra", emoji: "🦗", kind: VOTE, description: "Só fica gritando e não faz nada." }
  ].freeze

  include HouseholdScoped

  has_many :votes, class_name: "SeasonTitleVote", dependent: :destroy, inverse_of: :season_title

  normalizes :name, with: ->(value) { value.to_s.strip }
  normalizes :description, with: ->(value) { value.to_s.strip }, apply_to_nil: true
  normalizes :emoji, with: ->(value) { value.to_s.strip }

  validates :name, presence: true, length: { maximum: NAME_LIMIT }
  validates :description, length: { maximum: DESCRIPTION_LIMIT }
  validates :emoji, presence: true, length: { maximum: EMOJI_LIMIT }
  validates :kind, inclusion: { in: KINDS }

  scope :in_order, -> { order(:position, :id) }
  scope :active, -> { where(active: true) }
  scope :voted, -> { where(kind: VOTE) }

  # The crown: the app decides it from the ranking, so nobody votes on it and
  # it cannot be taken off the list.
  def auto?
    kind == AUTO
  end
end
