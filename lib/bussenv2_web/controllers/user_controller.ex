defmodule Bussenv2Web.UserController do
  use Bussenv2Web, :controller
  alias Bussenv2.{User}

  def edit(conn,  %{"user_id" => index, "id" => username}) do
    json(conn, User.checkCard(index, username))
  end

  def show(conn,  %{"user_id" => room, "id" => "getBusDriver"}) do
    json(conn, User.getDriver(room))
  end
end
