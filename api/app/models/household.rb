class Household < ApplicationRecord
  INVITE_CODE_LENGTH = 10

  has_many :members, dependent: :destroy
  has_many :tasks, dependent: :destroy
  has_many :completions, dependent: :destroy
  has_many :shopping_items, dependent: :destroy
  has_many :goals, dependent: :destroy

  before_validation :assign_invite_code, on: :create

  validates :name, presence: true, length: { maximum: 60 }
  validates :invite_code, presence: true, uniqueness: true

  # Sandbox colmeias, handed out to whoever asks for one. Nobody owns them, so
  # they pile up and `rake demo:cleanup` sweeps the cold ones.
  scope :demos, -> { where(demo: true) }

  # The invite code is the address of a colmeia: whoever holds it can look the
  # colmeia up and claim a place in it.
  def self.generate_invite_code
    loop do
      code = SecureRandom.alphanumeric(INVITE_CODE_LENGTH)
      return code unless exists?(invite_code: code)
    end
  end

  private

  def assign_invite_code
    self.invite_code = self.class.generate_invite_code if invite_code.blank?
  end
end
