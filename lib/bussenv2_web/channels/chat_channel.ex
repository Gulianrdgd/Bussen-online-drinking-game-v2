defmodule Bussenv2Web.ChatChannel do
  use Bussenv2Web, :channel
  require Logger
  require Ecto.Query
  alias Bussenv2Web.Presence
  alias Bussenv2.{User, Repo, Room, ChannelWatcher, Chats}


  def join("chat:" <> room, _params, socket) do
    uid = socket.assigns.user_id
    :ok = ChannelWatcher.monitor(:chat, self(), {__MODULE__, :leave, [room, uid]})
    send(self(), :after_join)

    res = User |> Ecto.Query.where(username: ^uid) |> Repo.exists?
    if !res do
      changeset = User.changeset(%User{}, %{username: uid, roomCode: room, origCards: ["back.jpg","back.jpg","back.jpg","back.jpg"], currCards: ["back.jpg","back.jpg","back.jpg","back.jpg"], liedOn: [false, false, false, false]})
      Repo.insert(changeset)
    end

    res = Room |> Ecto.Query.where(roomCode: ^room) |> Repo.exists?
    if !res do
      changeset = Room.changeset(%Room{}, %{roomCode: room, round: 0 , isPlaying: false, host: uid})
      Repo.insert(changeset)
    end
    {:ok, socket}
  end

  def leave(room_id, user_id) do

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
              changeset = Room.changeset(query, %{roomCode: query.roomCode, round: query.round, isPlaying: query.isPlaying, host: users.username})
              Repo.update(changeset)
              # If you were the last then delete room
              leaving(room_id, user_id, users.username)

            false ->
              Room |> Ecto.Query.where(roomCode: ^room_id) |> Repo.delete_all
          end

        _ ->  User |> Ecto.Query.where(username: ^user_id) |> Repo.delete_all
              leaving(room_id, user_id, "?noNewHostToBeFoundHere")
      end
    end
  end

  def leaving(room_id, user_id, new_host) do
    payload = %{"body" => "?leaving", "name" => new_host, "left" => user_id}
    payload = Map.merge(payload, %{"room" => room_id})
    Chats.create_message(payload)
    Bussenv2Web.Endpoint.broadcast("chat:" <> room_id, "shout", payload)
  end

  def handle_in("shout", payload, socket) do
#    payload {"body" => "message", "name" => "username"}
#    topic is vissible in socket
      case payload["body"] do

        "?origCards" ->
          query = User |> Ecto.Query.where(username: ^payload["name"]) |> Repo.one
          changeset = User.changeset(query, %{username: query.username, roomCode: query.roomCode, origCards: payload["cards"], currCards: payload["cards"], liedOn: query.liedOn})
          Repo.update(changeset)
          {:noreply, socket}

        "?placeCard" ->
          "chat:" <> room = socket.topic
          query = User |> Ecto.Query.where(username: ^payload["name"], roomCode: ^room) |> Repo.one
          placedCard = payload["card"]
          liedOn = List.replace_at(query.liedOn, payload["index"], payload["lied"])
          cards = Enum.map(query.currCards, fn x -> case x  do
                                                              ^placedCard -> "x"
                                                              _           -> x
                                                            end end )
          changeset = User.changeset(query, %{username: query.username, roomCode: query.roomCode, origCards: query.origCards, currCards: cards, liedOn: liedOn})
          Repo.update(changeset)

          # Sending the data but not the card
          "chat:" <> room = socket.topic
          payload = %{"body" => payload["body"], "name" => payload["name"], "index" => payload["index"]}
          payload = Map.merge(payload, %{"room" => room})
          Chats.create_message(payload)
          broadcast socket, "shout", payload
          {:noreply, socket}

       "?cleanLobby" ->
            "chat:" <> room = socket.topic

            areLeftovers = User |> Ecto.Query.where([x], x.roomCode == ^room and x.username != ^payload["name"]) |> Repo.exists?
            if(areLeftovers) do
              User |> Ecto.Query.where([x], x.roomCode == ^room and x.username != ^payload["name"]) |> Repo.delete_all
            end

            roomHostGhosts = Room |> Ecto.Query.where([x], x.roomCode == ^room and x.host != ^payload["name"]) |> Repo.exists?
            if(roomHostGhosts) do
              query = Room |> Ecto.Query.where(roomCode: ^room) |> Repo.one
              Room.changeset(query, %{roomCode: query.roomCode, round: query.round, isPlaying: query.isPlaying, host: payload["name"]}) |> Repo.update
            end

            {:noreply, socket}
        "?roomDone" ->
          "chat:" <> room = socket.topic

          roomIsStilAlive = Room |> Ecto.Query.where(roomCode: ^room) |> Repo.exists?
          if(roomIsStilAlive) do
            _query = Room |> Ecto.Query.where(roomCode: ^room) |> Repo.delete_all
          end

          usersAreStillAlive = User |> Ecto.Query.where(roomCode: ^room) |> Repo.exists?
          if(usersAreStillAlive) do
            _query = User |> Ecto.Query.where(roomCode: ^room) |> Repo.delete_all
          end

          {:noreply, socket}
        _ ->
          "chat:" <> room = socket.topic
          payload = Map.merge(payload, %{"room" => room})
          Chats.create_message(payload)
          broadcast socket, "shout", payload
          {:noreply, socket}
      end
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
