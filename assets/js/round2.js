let curPos = [4,5];

export function turnCardPyramid(card, channel){
    nextCardInPyramid();
    if(curPos[0] < 0 && curPos[1] < 0){
        channel.push('shout', {name: "done",  body: "?round2Finished"});
    }else {
        document.getElementById("c" + curPos[0] + "-" + curPos[1]).src = "/images/cards/" + card + ".jpg";
    }
}

function nextCardInPyramid(){
    if (curPos[1] === 0) {
        curPos[0]--;
        curPos[1] = curPos[0];
    } else {
        curPos[1]--;
    }
}

export function removeLiedCard(index, user){
    console.log(index);
    console.log(user);
    let lis = document.getElementById("cl" + curPos[0] + "-" + curPos[1]).getElementsByTagName("li");
    console.log(lis);
    console.log(lis.length);
    for (let i = 0; i < lis.length; i++) {
        console.log(lis[i].id);
        console.log(lis[i])
        if (lis[i].outerHTML.includes("id=\""+index+user + "\"")){
            lis[i].parentNode.removeChild(lis[i]);
            return;
        }
    }
}

export function getCurrPos(){
    return curPos;
}