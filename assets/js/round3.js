let timeOut;
let initial;

export function inBetweenRound3(username){
    document.getElementById("round2").style.display = "none";
    document.getElementById("questions").style.display = "none";
    document.getElementById("playerCards").style.display = "none";
    document.getElementById("round3Message").style.display = "block";
    document.getElementById("busMessage").innerText = username + " is going into the bus!";
}

export function startRound3(card) {
    document.getElementById("round3").style.display = "block";
    document.getElementById("b0").src = "/images/cards/" + card + ".jpg";
    timeOut = setTimeout(function () {
        document.getElementById("emptyBus").style.display = "block";
    }, 5000);
    initial = true;
}

function busDriverIsBack(){
    if(initial){
        initial = false;
        clearTimeout(timeOut);
        document.getElementById("emptyBus").style.display = "none";
    }
}

export function selectCard(id, success, card, driver) {
    busDriverIsBack();
    document.getElementById("busu" + id).style.visibility = "hidden";
    document.getElementById("busb" + id).style.visibility = "hidden";
    document.getElementById("busd" + id).style.visibility = "hidden";
    if(card !== "empty") {
        document.getElementById("b" + id).src = "/images/cards/" + card + ".jpg";
    }
    if(success){
        if(id + 1 > 5){
            return -1;
        }
        if(driver) {
            document.getElementById("busu" + (id + 1)).style.visibility = "visible";
            document.getElementById("busb" + (id + 1)).style.visibility = "visible";
            document.getElementById("busd" + (id + 1)).style.visibility = "visible";
        }
        document.getElementById("busMessage").innerText = "Correct!";
        return id+1;
    } else{
        if(driver) {
            document.getElementById("busu" + 1).style.visibility = "visible";
            document.getElementById("busb" + 1).style.visibility = "visible";
            document.getElementById("busd" + 1).style.visibility = "visible";
        }
        document.getElementById("busMessage").innerText = "Wrong!";
        return 1;
    }
}