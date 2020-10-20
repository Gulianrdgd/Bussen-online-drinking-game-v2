// We need to import the CSS so that webpack will load it.
// The MiniCssExtractPlugin is used to separate it out into
// its own CSS file.
import "../css/app.scss"

// webpack automatically bundles all modules in your
// entry points. Those entry points can be configured
// in "webpack.config.js".
//
// Import deps with the dep name or local files with a relative path, for example:
//
//     import {Socket} from "phoenix"
//
import {Presence} from "phoenix"

import socket from "./socket"

let path = window.location.pathname.split('/')
let room = path[path.length - 1]
let channel = socket.channel('chat:' + room, {})

let presence = new Presence(channel)

function renderOnlineUsers(presence) {
    let count = presence.list().length;
    document.getElementById("presence-counter").innerHTML = `there are currently ${count} players in this room`;
}
presence.onSync(() => renderOnlineUsers(presence))
channel.join();

channel.on('shout', payload => {
    switch (payload.body){
        case "?start":
            startTheGame();
    }
})

document.getElementById("room-start").onclick = function () {
    channel.push('shout', {name: window.username, body: "?start"})
    startTheGame();
}

function startTheGame(){
    document.getElementById("room-start").style.display = "none";
    document.getElementById("footer").style.display = "none";
    document.getElementById("questions").style.display = "block"
}


import "phoenix_html"
