defmodule Bussenv2.Repo do
  use Ecto.Repo,
    otp_app: :bussenv2,
    adapter: Ecto.Adapters.Postgres
end
