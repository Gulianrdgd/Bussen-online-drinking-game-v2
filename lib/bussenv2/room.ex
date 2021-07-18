defmodule Bussenv2.Room do
  use Ecto.Schema
  import Ecto.Changeset
  require Logger

  schema "rooms" do
    field :isPlaying, :boolean
    field :roomCode, :string
    field :round, :integer
    field :host, :string

    timestamps()
  end

  @doc false
  def changeset(room, attrs) do
    room
    |> cast(attrs, [:roomCode, :round, :isPlaying, :host])
    |> validate_required([:roomCode, :round, :isPlaying, :host])
  end


end
