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
import {checkAnswer} from "./checkAnswer"
import {round1Notification} from "./notification";
import {turnCardPyramid} from "./pyramid";
import {toggleTurn} from "./round1";

import "phoenix_html"

let channel = socket.channel('chat:' + roomCode, {})

// Host params
let isHost = window.isHost;
let waitTime = 15000;

let round = 0;
let presence = new Presence(channel)
let username = window.username;

let cards = ["back.jpg","back.jpg","back.jpg","back.jpg"];
let users;
let interval;

function renderOnlineUsers(presence) {
    let count = presence.list().length;
    users = [];

    for(let i=0; i<count; i++){
        users.push(presence.list()[i]["metas"][0]["username"]);
    }
    document.getElementById("presence-counter").innerText = `there are currently ${count} players in this room`;
}

presence.onSync(() => renderOnlineUsers(presence))
channel.join();

channel.on('shout', payload => {
    if(isHost) {
        console.log("ik ben host!");
    }
    console.log(payload);
    switch (payload.body){
        case "?start":
            if(payload.name !== username) {
                startTheGame();
                toggleTurn(payload.name, round);
            }
            break;
        case "?next":
            if(round >= 4 && payload.name === username) {
                channel.push('shout', {name: username,  body: "?round2"})
            }else{
                toggleTurn(payload.name, round);
            }
            break;
        case "?response":
            round1Notification(payload.correct, (payload.name === username), username);
            break;
        case "?round2":
            startRound2();
            break
        case "?pyramid":
            turnCardPyramid(payload.card);
            break;
    }
})

document.getElementById("room-start").onclick = function () {
    channel.push('shout', {name: username,  body: "?start"})
    fetchApi("createDeck").then(data => startTheGame());
    toggleTurn(username, round);
}

document.getElementById("enter-question").onclick = function () {
    let answer
    let radios = document.getElementsByName('rsvp');
    console.log(radios.length);
    for (let i = 0; i < radios.length; i++) {
        if (radios[i].checked) {
            answer = radios[i].value;
            break;
        }
    }
    fetchApi("getCard").then(data => recievedCard(data, answer));
}

async function fetchApi(action){
    let response = await fetch(window.location.protocol + "//" + window.location.host + "/api/" + roomCode + "/action/" + action);
    console.log(response);
    return await response.json();
}

function startTheGame(){
    document.getElementById("room-start").style.display = "none";
    document.getElementById("footer").style.display = "none";
    document.getElementById("questions").style.display = "block";
    round = 0;
}

function startRound2(){
    channel.push('shout', {name: username, body: "?origCards", cards: cards})
    document.getElementById("questions").style.display = "none";
    document.getElementById("round2").style.display = "block";
    for (let k = 0; k < 4; k++) {
        document.getElementById("c" + k).onclick = function () {
            if (document.getElementById("c" + k).src !== (window.location.protocol + "//" + window.location.host + "/static/media/cards/back.jpg")) {
                cardOnClick(k);
            }
        }
    }
    if(isHost){
        console.log("YESS");
        interval = setInterval(sendRound2, waitTime);
    }
}

function cardOnClick(k) {
    if(cards[k]!=="back.jpg") {
        channel.push('shout', {name: username, body: "?placeCard", card: cards[k]})
        document.getElementById("c" + k).src = "/static/media/cards/back.jpg";
    }
}



function recievedCard(card, answer){
    cards[round] = card;
    document.getElementById("c"+(round)).src = "/images/cards/"+ card +".jpg"
    if(checkAnswer(card, round, answer, cards)){
        document.getElementById("q").innerText = "Correct!";
        channel.push('shout', {name: username,  body: "?response", correct: true})
    } else{
        document.getElementById("q").innerText = "Wrong take a sip!";
        channel.push('shout', {name: username,  body: "?response", correct: false})
    }
    round++;
    nextUser();
}


function sendRound2(){
    fetchApi("getCard").then(data => {
        channel.push('shout', {name: username,  body: "?pyramid", card: data})
    });
}


function nextUser(){
    let index = users.indexOf(username);
    if(index !== users.length-1){
        index++;
    }else{
        index = 0;
    }
    channel.push('shout', {name: users[index],  body: "?next"})
}




