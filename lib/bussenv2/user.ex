defmodule Bussenv2.User do
  use Ecto.Schema
  import Ecto.{Changeset, Query}
  alias Bussenv2.{User, Repo}
  require Logger

  schema "users" do
    field :liedOn, {:array, :boolean}
    field :currCards, {:array, :string}
    field :origCards, {:array, :string}
    field :roomCode, :string
    field :username, :string

    timestamps()
  end

  @doc false
  def changeset(user, attrs) do
    user
    |> cast(attrs, [:username, :roomCode, :origCards, :currCards, :liedOn])
    |> validate_required([:username, :roomCode, :origCards, :currCards, :liedOn])
  end

  def checkCard(username, index) do
    {index, ""} = Integer.parse(index)
    user = User |> Ecto.Query.where(username: ^username) |> Repo.one
    _result = [Enum.at(user.liedOn, index), Enum.at(user.origCards, index)]
  end

  def getDriver(roomCode) do
    query = User |> Ecto.Query.where(roomCode: ^roomCode) |> Repo.all |> Enum.map(fn x -> [x.username, Enum.count(x.currCards, fn y -> y != "x" end)] end)
    maxValue = Enum.max_by(query, fn [_, y] -> y end) |> List.last
    _chauffeur = Enum.reject(query, fn [_, y] -> y != maxValue end) |> Enum.random
  end
end