
import {Socket, Presence} from "phoenix"
let socket = new Socket("/socket", {params: {username: window.username, roomCode: window.roomCode}});

socket.connect();
socket.onError(function x(){
    socket.disconnect();
    window.location = "/";
})
export default socket
