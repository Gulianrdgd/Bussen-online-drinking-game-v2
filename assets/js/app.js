import "../css/app.scss"

import {Presence} from "phoenix"

import socket from "./socket"
import {checkAnswer, getNumber, checkBus} from "./checkAnswer"
import {round1Notification} from "./notification";
import {turnCardPyramid, getCurrPos, removeLiedCard} from "./round2";
import {toggleTurn} from "./round1";
import {inBetweenRound3, startRound3, selectCard} from "./round3";
import "phoenix_html"

let channel = socket.channel('chat:' + roomCode, {})

//////////// Host params ////////////

let isHost = window.isHost;
let waitTime = 12000;

//////////// Host params end ////////////

let round = 0;
let round3Card = 1;
let presence = new Presence(channel)
let username = window.username;

let cards = ["back.jpg","back.jpg","back.jpg","back.jpg"];
let users = [];
let interval;

function renderOnlineUsers(presence) {
    let count = presence.list().length;
    if(isHost) {
        users = []
        for (let i = 0; i < count; i++) {
            users.push(presence.list()[i]["metas"][0]["username"]);
        }
        channel.push('shout', {name: username,  body: "?userChange", users: users});
    }
    if(count === 1 && !isHost){
        channel.push('shout', {name: username,  body: "?cleanLobby"});
    }
    document.getElementById("presence-counter").innerText = `there are currently ${count} players in this room`;
}

presence.onSync(() => renderOnlineUsers(presence))
channel.join();

channel.on('shout', payload => {
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
        case "?userChange":
            if(!isHost){
                users = payload.users;
            }
            break;
        case "?response":
            round1Notification(payload.correct, (payload.name === username), payload.name);
            break;
        case "?round2":
            startRound2();
            break;
        case "?round3Reset":
            document.getElementById("b0").src = "/images/cards/"+ payload.card +".jpg";
            break;
        case "?round2Finished":
            if(isHost){
                clearInterval(interval);
                fetchApiUsers("getBusDriver").then(data =>
                    channel.push('shout', {name: data[0], body: "?driver"})
                )
            }
            break;
        case "?driver":
            inBetweenRound3(payload.name);
            if(isHost){
                fetchApiCards("createDeck").then(data => {});
                clearInterval(interval);
                interval = setInterval(function (){
                    fetchApiCards("getCard").then(data => {
                        channel.push('shout', {name: payload.name, body: "?round3", card: data});
                        clearInterval(interval)
                        })
                }, 5000);
            }
            break;
        case "?pyramid":
            turnCardPyramid(payload.card, channel);
            break;
        case "?round3guess":
            round3Card = selectCard(round3Card, payload.correct, payload.card);
            if(round3Card === 1){
                fetchApiCards("getCard").then(data => {
                    if(data === "empty"){
                        channel.push('shout', {name: username, body: "?done", empty: true});
                    } else {
                        channel.push('shout', {name: username, body: "?round3Reset", card: data});
                    }
                })
            }
            if(round3Card<0 && payload.name === username){
                channel.push('shout', {name: username, body: "?done", empty: false});
            }
            break;
        case "?done":
            finalcode(payload).then(r => {
                confetti.stop();
                window.location.replace(window.location.protocol + "//" + window.location.host)
            });
            break;
        case "?placeCard":
            placeCardInPyramid(payload.name, payload.index);
            if(isHost){
                clearInterval(interval);
                interval = setInterval(sendRound2, waitTime);
            }
            if(payload.name !== username) {
                toastr.warning(payload.name + " placed a Card!");
            }
            break;
        case "?round3":
            startRound3(payload.card);
            if(payload.name === username){
                startRound3Driver(payload.name);
            }
            break;
        case "?leaving":
            if(payload.name === username){
                isHost = true;
                window.isHost = true;
            }
            toastr.warning(payload.left + " has left the room")
            break;
        case "?looked":
            if(payload.looked === username){
                if(payload.lied){
                    toastr.error(payload.name + " Lied, they need to drink!\n The card was: " + payload.card);
                    removeLiedCard(payload.index, payload.name);
                }else{
                    toastr.error(payload.name + 's card was correct\n You need to drink!');
                }
            }else if(payload.name === username){
                if(payload.lied){
                    toastr.error("You Lied, drink up!");
                    takeCardback(payload.name, payload.card, payload.index);
                }else{
                    toastr.warning(payload.looked + ' thought you were lying\n They need to drink');
                }
            }else{
                if(payload.lied){
                    removeLiedCard(payload.index, payload.name);
                    toastr.error(payload.name + " Lied, they need to drink!\n The card was: " + payload.card);
                }else{
                    toastr.warning(payload.name + 's card was correct\n' + payload.looked + ' needs to drink!');
                }
            }
            break;
    }
})
//////////// Round 1 ////////////

document.getElementById("room-start").onclick = function () {
    channel.push('shout', {name: username,  body: "?start"})
    fetchApiCards("createDeck").then(data => startTheGame());
    toggleTurn(username, round);
}

document.getElementById("enter-question").onclick = function () {
    let answer
    let radios = document.getElementsByName('rsvp');
    for (let i = 0; i < radios.length; i++) {
        if (radios[i].checked) {
            answer = radios[i].value;
            break;
        }
    }
    fetchApiCards("getCard").then(data => recievedCard(data, answer));
}

function startTheGame(){
    document.getElementById("room-start").style.display = "none";
    document.getElementById("footer").style.display = "none";
    document.getElementById("questions").style.display = "block";
    round = 0;
}

function recievedCard(card, answer){
    cards[round] = card;
    document.getElementById("c"+(round)).src = "/images/cards/"+ card +".jpg";
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


function nextUser(){
    let index = users.indexOf(username);
    if(index !== users.length-1){
        index++;
    }else{
        index = 0;
    }
    channel.push('shout', {name: users[index],  body: "?next"})
}

  //////////// Round 1 End //////////
 //                               //
//////////// Round 2 //////////////

function startRound2(){
    channel.push('shout', {name: username, body: "?origCards", cards: cards})
    document.getElementById("questions").style.display = "none";
    document.getElementById("round2").style.display = "block";
    for (let k = 0; k < 4; k++) {
        document.getElementById("c" + k).onclick = function () {
            if (document.getElementById("c" + k).src !== ("/images/cards/back.jpg")) {
                cardOnClick(k);
            }
        }
    }
    if(isHost){
        clearInterval(interval);
        interval = setInterval(sendRound2, waitTime);
    }
}

function cardOnClick(k) {
    if(cards[k]!=="back.jpg" && getCurrPos()[1] !== 5) {
        let bottomCard = /[^/]*$/.exec(document.getElementById("c" + getCurrPos()[0] + "-" + getCurrPos()[1]).src)[0]
        bottomCard = bottomCard.slice(0,bottomCard.length-4);
        channel.push('shout', {name: username, body: "?placeCard", card: cards[k], lied: getNumber(cards[k]) !== getNumber(bottomCard), index: k})
        document.getElementById("c" + k).src = "/images/cards/back.jpg";
    }
}

function placeCardInPyramid(user, index) {
    let list = document.getElementById("cl" + getCurrPos()[0] + "-" + getCurrPos()[1]);
    let node = document.createElement("li");
    node.innerHTML += "<button class='button has-background-black has-text-white' id='" + index + user +"'>" + user + "</button>";
    list.insertBefore(node, list.firstChild);
    document.getElementById(index+user).addEventListener('click', event => {
        if(user !== username) {
            checkPlacedCard(user, index);
        }
    });
}

function takeCardback(user, card, index){
    removeLiedCard(index, user);
    document.getElementById("c" + index).src = ("/images/cards/" + card + ".jpg");
}

function checkPlacedCard(user, index){
    fetchApiUsersEdit(user, index).then(response => {
        channel.push('shout', {name: user,  body: "?looked", looked: window.username, lied: response[0], card: response[1], index: index});
    })
}

function sendRound2(){
    fetchApiCards("getCard").then(data => {
        channel.push('shout', {name: username,  body: "?pyramid", card: data})
    });
}

  //////////// Round 2 End //////////
 //                               //
//////////// Round 3 //////////////


function startRound3Driver(username) {

    for (let i = 1; i < 6; i++) {
        document.getElementById("busu" + i).onclick = function () {
            fetchApiCards("getCard").then(data => {
                let previousCard = document.getElementById("b" + (i-1)).src.split("/").pop().replace(".jpg","");
                channel.push('shout', {name: username,  body: "?round3guess", correct: checkBus(data,  previousCard, "up", channel), card: data})
            });
        }
        document.getElementById("busd" + i).onclick = function () {
            fetchApiCards("getCard").then(data => {
                let previousCard = document.getElementById("b" + (i-1)).src.split("/").pop().replace(".jpg","");
                channel.push('shout', {name: username,  body: "?round3guess", correct: checkBus(data,  previousCard, "down", channel), card: data})
            });
        }
        document.getElementById("busb" + i).onclick = function () {
            fetchApiCards("getCard").then(data => {
                let previousCard = document.getElementById("b" + (i-1)).src.split("/").pop().replace(".jpg","");
                channel.push('shout', {name: username,  body: "?round3guess", correct: checkBus(data,  previousCard, "paal", channel), card: data})
            });
        }
    }

    document.getElementById("busb1").style.visibility = "visible";
    document.getElementById("busu1").style.visibility = "visible";
    document.getElementById("busd1").style.visibility = "visible";
}

async function finalcode(payload){
    const timeout = async ms => new Promise(res => setTimeout(res, ms));
    confetti.start();
    channel.push('shout', {name: username,  body: "?roomDone"})
    if(payload.empty){
        document.getElementById("busMessage").innerText = "The pack of cards is empty, good luck getting home!";
    } else{
        document.getElementById("busMessage").innerText = "You did it!";
    }
    await timeout(10000);
}

//////////// Round 3 End ////////////

async function fetchApiCards(action){
    let response = await fetch(window.location.protocol + "//" + window.location.host + "/api/" + roomCode + "/cards/" + action);
    return await response.json();
}

async function fetchApiUsersEdit(index, user){
    let response = await fetch(window.location.protocol + "//" + window.location.host + "/api/" + index + "/users/" + user + "/edit");
    return await response.json();
}

async function fetchApiUsers(action){
    let response = await fetch(window.location.protocol + "//" + window.location.host + "/api/" + roomCode  + "/users/" + action);
    return await response.json();
}


