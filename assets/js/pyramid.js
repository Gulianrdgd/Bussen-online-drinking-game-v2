let curPos = [4,5];

export function turnCardPyramid(card){
    nextCardInPyramid();
    document.getElementById("c"+ curPos[0] + "-" + curPos[1]).src = "/images/cards/"+ card +".jpg";
}

function nextCardInPyramid(){
    if (curPos[1] === 0) {
        curPos[0]--;
        curPos[1] = curPos[0];
    } else {
        curPos[1]--;
    }
}