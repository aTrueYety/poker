"use client"

import { useEffect, useState, useRef } from "react"
import useSocket from "@/util/socket"
import { TextInput, Button } from "./input"
import { ChatMessage } from "./chatMessage"
import { useSession } from "next-auth/react"
import { useAnimate } from "framer-motion"
import { Message, MessageTransfer } from "@/types/types"

export default function Chat({ gameId }: { gameId: string }) {
    const [loading, setLoading] = useState(true)
    const [input, setInput] = useState("")
    const socket = useSocket();
    const [messages, setMessages] = useState<Message[]>([])
    const chatBoxRef = useRef<HTMLInputElement>(null)
    const session = useSession()

    const sendMessage = (message: string) => {
        if (message.length < 1) return
        socket?.emit("sendMessage", { gameId: gameId, message: { author: { id: session.data?.user.id, username: session.data?.user.name }, content: input } } as MessageTransfer)

        if (chatBoxRef.current) chatBoxRef.current.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" })
        chatBoxRef.current ? chatBoxRef.current.value = "" : null
        setInput("")
    }

    socket?.on("chatMessage", (message: Message) => {
        setMessages([...messages, message])
    })

    useEffect(() => {
        socket?.emit("getChatMessages", { gameId }, (res: Message[]) => {
            setLoading(false)
            setMessages(res)
        })

        socket?.on("gamestream", (res: any) => {
            console.log(res)
        })

    }, [])

    //cleanup on page unload
    useEffect(() => {
        return () => {

            // Remove all socket listeners
            socket?.off("chatMessage")
            socket?.off("gamestreamAt" + gameId)
        }

    }, [])

    return (
        <div className="border border-neutral-500 rounded-xl p-2 w-4/12 max-h-full mr-4 ml-4 mb-6 mt-4 flex flex-col-reverse">
            <div className="flex flex-row h-14">
                <TextInput ref={chatBoxRef} placeholder="Enter message..." className="w-full min-h-full"
                    onEnterClear={true}
                    onEnterBlur={false}
                    onChange={s => setInput(s)}
                    onSubmit={(s) => { sendMessage(s) }}
                    value={input}

                />
                <Button variant="primary" className="w-1/4 h-full ml-2 lg:block hidden min-w-fit"
                    onClick={() => { sendMessage(input) }}

                >
                    Send
                </Button>
            </div>
            <Messages messages={messages} />
        </div>
    )
}


function Messages({ messages }: { messages?: Message[] }) {

    const [scope, animate] = useAnimate();
    const [chatFadeIn, animateChatFadeIn] = useAnimate();

    useEffect(() => {
        const chatAnimation = async () => {
            if (chatFadeIn.current === null) return;
            let ytranslate: number = chatFadeIn.current.clientHeight;
            await animate(scope.current, { transform: `translateY(${ytranslate}px)` }, { ease: "easeIn", duration: 0 });
            await animateChatFadeIn(chatFadeIn.current, { opacity: 0 }, { ease: "easeIn", duration: 0 })
            animateChatFadeIn(chatFadeIn.current, { opacity: 1 }, { ease: "easeOut", duration: 0.4 })
            await animate(scope.current, { transform: "translateY(0px)" }, { ease: "easeOut", duration: 0.3 });
        }
        chatAnimation();
    }, [messages]);

    if (!messages || messages.length === 0) {
        return (
            <div className="flex items-center justify-center mb-10 font-light text-neutral-200">
                <h1>No messages yet</h1>
            </div>
        )
    }

    return (
        <div className="flex flex-col-reverse overflow-y-scroll overflow-x-hidden p-2">
            <div ref={scope} className="flex flex-col-reverse">
                {messages.toReversed().map((message, i) => {
                    console.log("")
                    console.log(messages.toReversed().at(i - 1))
                    console.log(message)

                    console.log(messages.toReversed().at(i - 1)?.author.id != message.author.id)

                    if (i === 0) {
                        return (
                            <div key={message.author.username + message.content + i} ref={chatFadeIn}>
                                <ChatMessage message={message} displayAuthor={messages.toReversed().at(i + 1)?.author.id !== message.author.id} />
                            </div>
                        )
                    }
                    return (
                        <div key={message.author.username + message.content + i}>
                            <ChatMessage message={message} displayAuthor={messages.toReversed().at(i + 1)?.author.id !== message.author.id} />
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
