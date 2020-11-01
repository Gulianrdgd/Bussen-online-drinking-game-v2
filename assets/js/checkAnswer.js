export function checkAnswer(card, round, answer, cards) {
    let cardvalue;
    let card0;
    let card1;
    if(card !== "empty"){
        switch (round) {
            case 0:
                switch (card.charAt(0)) {
                    case "h":
                        return answer !== "a";
                    case  "d":
                        return answer !== "a";
                    case "s":
                        return answer !== "b";
                    case "c":
                        return answer !== "b";
                    default:
                        return false
                }
            case 1:
                cardvalue = getNumber(card);
                card0 = getNumber(cards[0]);
                if (cardvalue > card0) {
                    return answer === "a";
                } else if (cardvalue < card0) {
                    return answer === "b";
                } else {
                    return answer === "c";
                }
            case 2:
                cardvalue = getNumber(cards[2]);
                card0 = getNumber(cards[0]);
                card1 = getNumber(cards[1]);

                if (cardvalue === card0 || cardvalue === card1) {
                    return answer === "c";
                } else if ((cardvalue > card0 && cardvalue < card1) || (cardvalue > card1 && cardvalue < card0)) {
                    return answer === "a";
                } else {
                    return answer === "b";
                }
            case 3:
                switch (answer) {
                    case "a":
                        for (let j = 0; j < cards.length; j++) {
                            if (card.charAt(0) === cards[j].charAt(0)) {
                                return true;
                            }
                        }
                        return false;
                    case "b":
                        for (let k = 0; k < cards.length; k++) {
                            if (card.charAt(0) === cards[k].charAt(0)) {
                                return false;
                            }
                        }
                        return true;
                    case "c":
                        let tempArr = [];
                        for (let i = 0; i < cards.length; i++) {
                            if (i === 0 || tempArr.findIndex(el => el === cards[i].charAt(0)) === -1) {
                                tempArr.push(cards[i].charAt(0));
                            }
                        }
                        return tempArr.length === 4;
                }
        }
    }
}

export function getNumber(card) {
    if (card.length === 3) {
        return parseInt(card.substring(1));
    } else {
        return parseInt(card.charAt(1));
    }
}

export function checkBus(flippedCard, previousCard, guess, channel){
    console.log(flippedCard);
    console.log(previousCard);
    if(flippedCard !== "empty"){
        switch (guess){
            case "up":
                return(getNumber(flippedCard) > getNumber(previousCard))
            case "down":
                return(getNumber(flippedCard) < getNumber(previousCard))
            case "paal":
                return(getNumber(flippedCard) === getNumber(previousCard))
        }
    }else{
        channel.push('shout', {name: username,  body: "?done", correct: true, empty: true})
        return false;
    }
}