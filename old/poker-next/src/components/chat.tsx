'use client'
import ChatElement from "src/components/chatElement";
import {motion, useAnimate} from "framer-motion";

import { useEffect, useLayoutEffect, useState } from "react";

//this ONLY works with localhost. 
let socket:WebSocket = new WebSocket("ws://localhost:4000/gameStream");

//this works by manually inserting the ip adress of the server
//let socket:WebSocket = new WebSocket("ws://10.22.214.237:4000/gameStream");


export default function Chat({_chats}:{_chats: string[]}) {

    socket.onmessage = (e) => {
        let message; //TODO - typesafety
        try{
            message = JSON.parse(e.data);
        }catch{
            console.error("error parsing JSON message");
            return;
        }

        setChats([...chats, message.chatMessage]);
    }

    const [chats, setChats] = useState<string[]>(_chats);
    const [scope, animate] = useAnimate();
    const [chatFadeIn, animateChatFadeIn] = useAnimate();

    function handleChat(){
        const chatInput = document.getElementById("chatInput") as HTMLInputElement;
        //setChats([...chats, chatInput.value]);
        socket.send('{"type":"chat","message":"'+chatInput.value+'"}');
        chatInput.value = "";
    }

    useEffect(() => {
        const chatAnimation = async () => {
            if(chatFadeIn.current === null) return;
            let ytranslate:number = chatFadeIn.current.clientHeight;
            await animate(scope.current, {transform:`translateY(${ytranslate+4}px)`},{ease:"easeIn",duration:0});
            await animateChatFadeIn(chatFadeIn.current, {opacity:0},{ease:"easeIn",duration:0})
            animateChatFadeIn(chatFadeIn.current, {opacity:1},{ease:"easeOut",duration:0.4})
            await animate(scope.current, {transform:"translateY(0px)"},{ease:"easeOut",duration:0.3});
        }
        chatAnimation();
    },[chats]);

    function renderChats(){

        if(chats.length === 0) return (<div></div>);

        return(
            <div>
                {chats.slice(0,-1).map((chat: string, i: number) => <div key = {i}> <ChatElement chat = {chat} /> </div>)}
                {< div ref = {chatFadeIn}> <ChatElement chat = {chats[chats.length-1]}/> </div> }
            </div>
        )
    }

    return (
        <div className="flex flex-col-reverse min-w-full max-w-full max-h-full overflow-y-scroll bg-gradient-to-t from-slate-600 to-gray-600">
            <div className="flex w-full px-5 z-10" >
                <input onKeyDown = {e => {if(e.key === "Enter") handleChat()}}
                       id = "chatInput" className="flex w-full" type="text" />
                <button onClick={handleChat} className="flex">Update Chat</button>
            </div>

            <div ref = {scope} className="z-0">
                {renderChats()}
            </div>
        </div>
    )
}
