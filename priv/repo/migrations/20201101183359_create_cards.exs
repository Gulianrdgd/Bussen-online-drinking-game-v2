defmodule Bussenv2.Repo.Migrations.CreateCards do
  use Ecto.Migration

  def change do
    create table(:cards) do
      add :name, :string
      add :roomCode, :string

      timestamps()
    end

  end
end
