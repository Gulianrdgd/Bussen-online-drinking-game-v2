defmodule Bussenv2.Repo.Migrations.CreateMessages do
  use Ecto.Migration

  def change do
    create table(:messages) do
      add :body, :string
      add :name, :string
      add :room, :string

      timestamps()
    end

  end
end
