defmodule Bussenv2Web.CardsController do
  use Bussenv2Web, :controller
  alias Bussenv2.{Cards}

  def show(conn,  %{"cards_id" => room, "id" => "createDeck"}) do
    case Cards.removeDeck(room) do
      "done" -> json(conn, Cards.createDeck(room))
      _ -> json(conn, "error")
    end
  end

  def show(conn,  %{"cards_id" => room, "id" => "getCard"}) do
    json(conn, Cards.getCard(room))
  end

  def show(conn,  %{"cards_id" => room, "id" => "removeDeck"}) do
    json(conn, Cards.removeDeck(room))
  end

  def edit(conn,  %{"cards_id" => room, "id" => username}) do
    json(conn, Cards.placeCard(room, username))
  end
end
