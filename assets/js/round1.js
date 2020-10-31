let questions = ["Black or red?", "Higher, lower or equal?", "In between or outside", "Do you already have this color?"];
let answers = [["Black", "Red", "Color neutral"], ["Higher", "Lower", "Equal"], ["In between", "Outside", "Equal"], ["Yes", "No", "Rainbow"]];

export function toggleTurn(currUser, round){
    if(window.username === currUser) {
        document.getElementById("questionsBody").style.display = "block";
        document.getElementById("answerBody").style.display = "block";
        document.getElementById("turn").innerText = "It's your turn!";
        changeQuestion(round);
    } else{
        document.getElementById("answerBody").style.display = "none";
        document.getElementById("turn").innerText = "It's " + currUser + " turn!";
    }
}

function changeQuestion(id){
    document.getElementById("q").innerText = questions[id];
    document.getElementById("a0").innerText = answers[id][0];
    document.getElementById("a1").innerText = answers[id][1];
    document.getElementById("a2").innerText = answers[id][2];
}