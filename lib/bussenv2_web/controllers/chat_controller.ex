defmodule Bussenv2Web.ChatController do
  use Bussenv2Web, :controller
  require Logger
  import Ecto.Query, warn: false
  alias Bussenv2.{Repo, Chats, Room}

  def show(conn, %{"id" => room}) do
    token = get_session(conn, :token)
    username = get_session(conn, :username)
    messages = Chats.list_messages_by_room(room)
    case username do
      nil -> render(conn, "index.html", roomCode: "undefined", joining: false, taken: false)
      _ -> res = Room |> Ecto.Query.where(roomCode: ^room) |> Repo.exists?
          case res do
            true ->
              res = Room |> Ecto.Query.where(roomCode: ^room, host: ^username) |> Repo.exists?
              case res do
                true ->
                  conn
                  |> render("room.html", room: room, username: username, token: token, roomCode: room, messages: messages, joining: false, connecting: true, isHost: true)
                false ->
                  conn
                  |> render("room.html", room: room, username: username, token: token, roomCode: room, messages: messages, joining: false, connecting: true, isHost: false)
                end
            false ->
              roomSet = %Room{}
              changeset = Room.changeset(roomSet, %{roomCode: room, round: 0, isPlaying: false, host: username})
              Repo.insert(changeset)
              conn
              |> render("room.html", room: room, username: username, token: token, roomCode: room, messages: messages, joining: false, connecting: true, isHost: true)
          end
  end
  end
end
