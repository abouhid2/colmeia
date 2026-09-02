class Household < ApplicationRecord
  INVITE_CODE_LENGTH = 12

  has_many :members, dependent: :destroy
  has_many :tasks, dependent: :destroy
  has_many :completions, dependent: :destroy
  has_many :shopping_items, dependent: :destroy
  has_many :goals, dependent: :destroy
  has_many :achievement_awards, dependent: :destroy

  before_validation :normalize_invite_code

  validates :name, presence: true, length: { maximum: 60 }
  validates :invite_code, presence: true, uniqueness: true

  # Sandbox colmeias, handed out to whoever asks for one. Nobody owns them, so
  # they pile up and `rake demo:cleanup` sweeps the cold ones.
  scope :demos, -> { where(demo: true) }

  # The invite code is the address of a colmeia: whoever holds it can look the
  # colmeia up and claim a place in it. Lowercase because it gets typed by hand
  # off somebody else's screen, and a longer code makes up for the smaller
  # alphabet.
  def self.generate_invite_code
    loop do
      code = SecureRandom.alphanumeric(INVITE_CODE_LENGTH).downcase
      return code unless exists?(invite_code: code)
    end
  end

  private

  # Stored lowercase so a lookup can downcase what it is given and still match.
  def normalize_invite_code
    self.invite_code = invite_code.blank? ? self.class.generate_invite_code : invite_code.to_s.downcase
  end
end
