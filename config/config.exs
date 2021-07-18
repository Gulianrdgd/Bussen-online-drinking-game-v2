# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
use Mix.Config

config :bussenv2,
  ecto_repos: [Bussenv2.Repo]

# Configures the endpoint
config :bussenv2, Bussenv2Web.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "P/pBN2urex7/9fYHnbhlu3pcBPJfLQonNGLcJk9DjSa0+/RsGh9J08UMRJDc852b",
  render_errors: [view: Bussenv2Web.ErrorView, accepts: ~w(html json), layout: false],
  pubsub_server: Bussenv2.PubSub,
  live_view: [signing_salt: "PSND92xE"]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env()}.exs"
