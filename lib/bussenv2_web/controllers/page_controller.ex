defmodule Bussenv2Web.PageController do
  use Bussenv2Web, :controller
  require Logger
  require Ecto.Query
  alias Bussenv2.User
  alias Bussenv2.Repo


  def index(conn, _params) do
    render(conn, "index.html", roomCode: "undefined", joining: false, taken: false)
  end

  def input_gotten(conn, _params) do
    con= parse(conn)
    username = con.params["username"]
    roomCode = con.params["roomCode"]
    res = User |> Ecto.Query.where(username: ^username) |> Repo.exists?
    case res do
      false ->
        Logger.error("Eerste keer")
        token = Phoenix.Token.sign(Bussenv2Web.Endpoint, "user auth", username)
        userSet = %User{}
        changeset = User.changeset(userSet, %{username: username, roomCode: roomCode, origCards: ["back.jpg","back.jpg","back.jpg","back.jpg"], currCards: ["back.jpg","back.jpg","back.jpg","back.jpg"], liedOn: [false, false, false, false]})
        Repo.insert(changeset)
        conn
        |> put_session(:token, token)
        |> put_session(:username, username)
        |> render("index.html", username: username, roomCode: roomCode, joining: true, taken: false)
      true ->
        token = "empty"
        conn
        |> put_session(:token, token)
        |> put_session(:username, username)
        |> render("index.html", username: username, roomCode: roomCode, joining: false, taken: true)
    end
  end

  def parse(conn, opts \\ []) do
    opts = Keyword.put_new(opts, :parsers, [Plug.Parsers.URLENCODED, Plug.Parsers.MULTIPART])
    Plug.Parsers.call(conn, Plug.Parsers.init(opts))
  end

end
