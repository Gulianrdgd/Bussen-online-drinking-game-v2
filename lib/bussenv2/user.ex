defmodule Bussenv2.User do
  use Ecto.Schema
  import Ecto.Changeset

  schema "users" do
    field :currCards, {:array, :string}
    field :origCards, {:array, :string}
    field :roomCode, :string
    field :username, :string

    timestamps()
  end

  @doc false
  def changeset(user, attrs) do
    user
    |> cast(attrs, [:username, :roomCode, :origCards, :currCards])
    |> validate_required([:username, :roomCode, :origCards, :currCards])
  end
end
