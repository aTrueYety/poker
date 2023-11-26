btn = document.getElementById("btn");
btn.onclick = function () {
    test();
}

var websocket = new WebSocket("ws://" + window.location.href.split("/")[2] + "/gameStream");

websocket.onmessage = function (event) {
    console.log(event.data);
};

function test() {
    var xhp = new XMLHttpRequest();
    xhp.responseType = 'text';
    xhp.open("post","/wstest",true);
    xhp.setRequestHeader("Content-Type", "application/json")
    xhp.send();
    xhp.timeout = 2000;
    xhp.onload = () => {
        console.log(xhp.response);
    }   

    xhp.ontimeout = (e) =>{
        console.log("timeout, try again");
    }
}