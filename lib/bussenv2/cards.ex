defmodule Bussenv2.Cards do
  use Ecto.Schema
  import Ecto.Changeset
  alias Bussenv2.{Repo, Cards, User}
  require Ecto.Query

  schema "cards" do
    field :name, :string
    field :roomCode, :string

    timestamps()
  end

  @doc false
  def changeset(cards, attrs) do
    cards
    |> cast(attrs, [:name, :roomCode])
    |> validate_required([:name, :roomCode])
  end

  def suits(), do: ["h", "d", "c", "s"]
  def ranks(), do: Enum.to_list(2..14)

  def createDeck(roomCode) do
    for c <- suits() do
      for rank <- ranks() do
          Repo.insert(%Cards{name: c <> to_string(rank), roomCode: roomCode})
      end
    end
    _result = "done"
  end

  def removeDeck(roomCode) do
      Cards |> Ecto.Query.where(roomCode: ^roomCode) |> Repo.delete_all
      _result = "done"
  end

  def placeCard(roomCode, username) do
  end

  def getCard(roomCode) do
    case Cards |> Ecto.Query.where(roomCode: ^roomCode) |> Repo.exists? do
    true ->
      result = Cards |> Ecto.Query.where(roomCode: ^roomCode) |> Repo.all |> Enum.random
      Cards |> Ecto.Query.where(roomCode: ^roomCode, name: ^result.name)|> Repo.delete_all
      _result = result.name
    false ->
      _result = "empty"
    end
  end
end
