let window_width = window.innerWidth;
let window_heigth = window.innerHeight;

//pixi init
const app = new PIXI.Application({ background: '#cccccc ', resizeTo: document.getElementById("game"), antialias: true});
app.ticker.maxFPS = 30;

document.getElementById("game").appendChild(app.view);

//backgroundContainer
const backgroundContainer = new PIXI.Container({antialias: true});
app.stage.addChild(backgroundContainer);

//playercontainer
const playerContainer = new PIXI.Container ({antialias: true})
app.stage.addChild(backgroundContainer);

//graphics init
const graphics = new PIXI.Graphics();

class GameRenderer{
    constructor(width, height){
        this.width = width;
        this.height = height;

        //sprites
        let boardTexture = PIXI.Texture.from("/render/assets/board.jpeg"); 
        this.board = new PIXI.Sprite(boardTexture);
        this.board.width = this.width;
        this.board.height = this.height;
    }

    render(){
        backgroundContainer.removeChildren(); //removed old background

        backgroundContainer.addChild(this.board);
    }

    resize(){
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.board.width = this.width;
        this.board.height = this.height;
    }
}

class Card{
    constructor(suit, value){
        this.card = new PIXI.Sprite(PIXI.Texture.from("/render/assets/cards/"+suit+"/"+value+".png"));
        this.suit = suit;
        this.value = value;
    }
}

let gameRenderer = new GameRenderer(window_width, window_heigth);
gameRenderer.render();

//resize
var resizeTimeout;
window.addEventListener("resize",function(){
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resizeHandler,100); //kaller resizehandler når 500ms har gått uten resize
});

function resizeHandler(){ //funksjon for å calle resize etter delay
    gameRenderer.resize();
};


