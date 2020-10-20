defmodule Bussenv2.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  def start(_type, _args) do
    children = [
      # Start the Ecto repository
      Bussenv2.Repo,
      # Start the Telemetry supervisor
      Bussenv2Web.Telemetry,
      # Start the PubSub system
      {Phoenix.PubSub, name: Bussenv2.PubSub},
      # Start the Endpoint (http/https)
      Bussenv2Web.Endpoint,
      # Start a worker by calling: Bussenv2.Worker.start_link(arg)
      # {Bussenv2.Worker, arg}
      Bussenv2Web.Presence
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Bussenv2.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  def config_change(changed, _new, removed) do
    Bussenv2Web.Endpoint.config_change(changed, removed)
    :ok
  end
end
