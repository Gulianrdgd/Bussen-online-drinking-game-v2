defmodule Bussenv2Web.ChatChannel do
  use Bussenv2Web, :channel
  require Logger
  alias Bussenv2.Chats
  alias Bussenv2Web.Presence

  def join("chat:" <> _room, _payload, socket) do
    send(self(), :after_join)
    {:ok, socket}
  end

  def handle_in("shout", payload, socket) do
#    payload {"body" => "message", "name" => "username"}
#    topic is vissible in socket
    "chat:" <> room = socket.topic
    payload = Map.merge(payload, %{"room" => room})
    Chats.create_message(payload)
    broadcast socket, "shout", payload
    {:noreply, socket}
  end

  def handle_info(:after_join, socket) do
    {:ok, _} = Presence.track(socket, socket.assigns.user_id, %{
      online_at: inspect(System.system_time(:second))
    })

    push(socket, "presence_state", Presence.list(socket))
    {:noreply, socket}
  end

end
