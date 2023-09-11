'use client'
import ChatElement from "src/components/chatElement";
import {motion, useAnimate} from "framer-motion";

let _chats : string[];
_chats = []

import { useEffect, useLayoutEffect, useState } from "react";

export default function Chat() {
    const [chats, setChats] = useState<string[]>(_chats);
    const [heightDim,setHeightDim] = useState<number>(0);
    const [scope, animate] = useAnimate();
    const [chatFadeIn, animateChatFadeIn] = useAnimate();

    function handleChat(){
        const chatInput = document.getElementById("chatInput") as HTMLInputElement;
        setChats([...chats, chatInput.value]);
        chatInput.value = "";
    }

    useEffect(() => {
        const chatAnimation = async () => {
            if(chatFadeIn.current === null) return;
            let ytranslate:number = chatFadeIn.current.clientHeight;
            await animate(scope.current, {transform:`translateY(${ytranslate}px)`},{ease:"easeIn",duration:0});
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
        <div className="flex flex-col-reverse min-w-full max-w-full max-h-full overflow-y-scroll">
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
