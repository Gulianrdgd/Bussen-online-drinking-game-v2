defmodule Bussenv2.Repo.Migrations.CreateUsers do
  use Ecto.Migration

  def change do
    create table(:users) do
      add :liedOn, {:array, :boolean}
      add :currCards, {:array, :string}
      add :origCards, {:array, :string}
      add :roomCode, :string
      add :username, :string

      timestamps()
    end
  end
end
