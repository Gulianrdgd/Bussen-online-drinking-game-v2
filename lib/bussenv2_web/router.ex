defmodule Bussenv2Web.Router do
  use Bussenv2Web, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :internal do
    plug CORSPlug, origins: [
                     "bussenv2.vdhorst.dev",
                      "127.0.0.1:4000"
    ]
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", Bussenv2Web do
    pipe_through :browser

    get "/", PageController, :index
    post "/", PageController, :input_gotten
  end

  scope "/", Bussenv2Web do
    pipe_through [:internal]

    resources "/room", ChatController, only: [:show]
  end

   scope "/api", Bussenv2Web do
     pipe_through :api

     resources "/", CardsController do
       resources "/cards", CardsController, only: [:show]
     end

     resources "/", UserController do
       resources "/users", UserController, only: [:show, :edit]
     end
   end

  if Mix.env() in [:dev, :test] do
    import Phoenix.LiveDashboard.Router

    scope "/" do
      pipe_through :browser
      live_dashboard "/dashboard", metrics: Bussenv2Web.Telemetry
    end
  end
end
