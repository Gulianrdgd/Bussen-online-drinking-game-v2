defmodule Bussenv2Web.PageController do
  use Bussenv2Web, :controller
  import Users
  require Logger

  def index(conn, _params) do
    changeset = changeset(%Users{})
    render(conn, "index.html", changeset: changeset, roomCode: "undefined", token: get_csrf_token(), joining: false)
  end

  def input_gotten(conn, _params) do
    con= parse(conn)
    username = con.params["username"]
    roomcode = con.params["roomCode"]
    changeset = changeset(%Users{})
    token = Phoenix.Token.sign(Bussenv2Web.Endpoint, "user auth", username)
    conn
      |> put_session(:token, token)
      |> put_session(:username, username)
      |> render("index.html", changeset: changeset, username: username, token: token, roomCode: roomcode, joining: true)
  end

  def parse(conn, opts \\ []) do
    opts = Keyword.put_new(opts, :parsers, [Plug.Parsers.URLENCODED, Plug.Parsers.MULTIPART])
    Plug.Parsers.call(conn, Plug.Parsers.init(opts))
  end

end
