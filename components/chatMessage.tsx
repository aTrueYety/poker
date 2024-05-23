import { Message } from "@/types/types";
import { useAnimate } from "framer-motion";
import { useEffect, useState } from "react";
import UserPopup from "./userPopup";

export function ChatMessage(message: Message) {

    const [fadeIn, animateFadeIn] = useAnimate();
    const [hover, setHover] = useState(false)
    let timeout: NodeJS.Timeout | undefined = undefined;

    useEffect(() => {
        const startAnimateFadeIn = async () => {
            fadeIn.current.style.display = "block"
            await animateFadeIn(fadeIn.current, { opacity: 1 }, { duration: 0.2 })
        }

        const startAnimateFadeOut = async () => {
            await animateFadeIn(fadeIn.current, { opacity: 0 }, { duration: 0.2 })
            if (!fadeIn.current) { return }
            fadeIn.current.style.display = "none"
        }

        if (!fadeIn.current) {
            return
        }

        if (hover) {
            startAnimateFadeIn()
            return
        }

        startAnimateFadeOut()

    }, [hover]);


    const onMouseEnter = () => {
        timeout = setTimeout(() => {
            setHover(true)
        }, 500);
    }

    const onMouseLeave = () => {
        clearTimeout(timeout)
        setHover(false)

    }


    return (
        <div className="relative">
            <div className="flex flex-row items-center">
                <div onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} className=" text-neutral-300 font-semibold" >{message.author.username}</div>
                <div className="text-white p-2 overflow-auto break-words">{message.content}</div>
            </div>
            {hover &&
                <UserPopup user={message.author} ref={fadeIn} />
            }
        </div>
    )
}