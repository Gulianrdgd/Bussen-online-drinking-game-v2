defmodule Bussenv2Web.ChatController do
  use Bussenv2Web, :controller
  require Logger
  alias Bussenv2.Chats

  def show(conn, %{"id" => room}) do
    token = get_session(conn, :token)
    username = get_session(conn, :username)
    messages = Chats.list_messages_by_room(room)
    conn
    |> render("room.html", room: room, username: username, token: token, roomCode: room, messages: messages, joining: false, connecting: true)
  end

end
