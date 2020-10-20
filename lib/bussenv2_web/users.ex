defmodule Users do
  @moduledoc false
  use Ecto.Schema
  import Ecto.Changeset
  require Logger

  schema "users" do
    field :username
    field :roomcode
  end

  def changeset(users, params \\ %{}) do
    users
    |> cast(params, [:username, :roomcode])
    |> validate_required([:username, :roomcode])
    |> unique_constraint(:username)
  end

end
