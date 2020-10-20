import {Presence} from "phoenix"
import socket from "./socket";

let Chat = {
  init(socket) {
    let path = window.location.pathname.split('/')
    let room = path[path.length - 1]
    let channel = socket.channel('chat:' + room, {})

    let presence = new Presence(channel)

    function renderOnlineUsers(presence) {
      let response = ""
      presence.list((id, {metas: [first, ...rest]}) => {
        let count = rest.length + 1;
        response = `There are currently ${count} players in this room`;
      })
      document.getElementById("presence-counter").innerHTML = response
    }
    presence.onSync(() => renderOnlineUsers(presence))
    channel.join()
  },
}

export default Chat
