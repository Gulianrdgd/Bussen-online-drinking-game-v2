defmodule Bussenv2.Repo.Migrations.CreateRooms do
  use Ecto.Migration

  def change do
    create table(:rooms) do
      add :isPlaying, :boolean
      add :roomCode, :string
      add :round, :integer
      add :host, :string

      timestamps()
    end

  end
end
