let window_width = window.innerWidth;
let window_heigth = window.innerHeight;

let testCards = []

//test
testCards.push(new Card("Spades", 1));
testCards.push(new Card("Spades", 2));
testCards.push(new Card("Hearts", 3));
testCards.push(new Card("Clubs", 4));
testCards.push(new Card("Diamonds", 5));

let board = document.getElementById("board"); //get board


board.innerHTML = "<img src='render/assets/board.jpeg'>";

for(let i = 1; i < 6; i++){ //get and render center cards
    let card = document.getElementById("c"+i);
    card.innerHTML = "<img src='render/assets/cards/"+testCards[i-1].suit+"/"+testCards[i-1].value+".jpg'>";
}