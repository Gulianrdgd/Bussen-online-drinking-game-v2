defmodule Bussenv2Web.UserSocket do
  use Phoenix.Socket
  require Logger
  channel "chat:*", Bussenv2Web.ChatChannel
  import Ecto.Query, warn: false

  def connect(params, socket, _connect_info) do
    Logger.info(params)
    cond do
      params["username"] == "" ->
        {:error, %{reason: "No username provided."}, socket}

      true ->
        username = params["username"]
        {:ok, assign(socket, :user_id, username)}
    end
  end


  def id(_socket), do: nil

end
