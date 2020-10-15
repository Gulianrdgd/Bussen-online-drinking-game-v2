defmodule Bussenv2Web.PageController do
  use Bussenv2Web, :controller

  def index(conn, _params) do
    render(conn, "index.html")
  end
end
