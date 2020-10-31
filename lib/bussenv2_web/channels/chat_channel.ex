defmodule Bussenv2Web.ChatChannel do
  use Bussenv2Web, :channel
  require Logger
  require Ecto.Query
  alias Bussenv2.Chats
  alias Bussenv2Web.Presence
  alias Bussenv2.ChannelWatcher
  alias Bussenv2.Room
  alias Bussenv2.Repo
  alias Bussenv2.User


  def join("chat:" <> room, _params, socket) do
    uid = socket.assigns.user_id
    :ok = ChannelWatcher.monitor(:chat, self(), {__MODULE__, :leave, [room, uid]})
    send(self(), :after_join)
    Logger.info("Userid")
    Logger.info(uid)
    res = User |> Ecto.Query.where(username: ^uid) |> Repo.exists?
    if !res do
      userSet = %User{}
      changeset = User.changeset(userSet, %{username: uid, roomCode: room, origCards: ["back.jpg","back.jpg","back.jpg","back.jpg"], currCards: ["back.jpg","back.jpg","back.jpg","back.jpg"]})
      Repo.insert(changeset)
    end
    {:ok, socket}
  end

  def leave(room_id, user_id) do
    Logger.info("Leaving")
    res = Room |> Ecto.Query.where(roomCode: ^room_id) |> Repo.exists?
    if res do
      # If room exists
      query = Room |> Ecto.Query.where(roomCode: ^room_id) |> Repo.one
      case(query.host) do
        # Check who is host
        ^user_id ->
          User |> Ecto.Query.where(username: ^user_id) |> Repo.delete_all
          case User |> Ecto.Query.where(roomCode: ^room_id) |> Repo.exists? do
            # If there are still users in the room then do this
            true ->
              users = User |> Ecto.Query.where(roomCode: ^room_id) |> Repo.one
              Room.changeset(query, %{roomCode: query.roomCode, round: query.round, isPlaying: query.isPlaying, host: users.username})
            # If you were the last then delete room
            false ->
              Room |> Ecto.Query.where(roomCode: ^room_id) |> Repo.delete_all
          end
        _ -> User |> Ecto.Query.where(username: ^user_id) |> Repo.delete_all
      end
    end

  end

  def handle_in("shout", payload, socket) do
#    payload {"body" => "message", "name" => "username"}
#    topic is vissible in socket
      if payload["body"] == "?origCards" do
        query = User |> Ecto.Query.where(username: ^payload["name"]) |> Repo.one
        User.changeset(query, %{username: query.username, roomCode: query.roomCode, origCards: payload["origCards"], currCards: payload["origCards"]})
      end
    "chat:" <> room = socket.topic
    payload = Map.merge(payload, %{"room" => room})
    Chats.create_message(payload)
    broadcast socket, "shout", payload
    {:noreply, socket}
  end

  def handle_info(:after_join, socket) do
      {:ok, _} = Presence.track(socket, socket.assigns.user_id, %{
      online_at: inspect(System.system_time(:second)),
      username: socket.assigns.user_id
    })

    push(socket, "presence_state", Presence.list(socket))
    {:noreply, socket}
  end


end
