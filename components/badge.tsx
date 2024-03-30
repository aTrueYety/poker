import { animate, useAnimate } from "framer-motion";
import { useEffect, useState } from "react";

export enum BadgeColor {
    Red = "bg-red-700",
    Green = "bg-green-700",
    Blue = "bg-blue-700",
    Yellow = "bg-yellow-700",
    Purple = "bg-purple-700",
}

interface BadgeProps {
    color: BadgeColor;
    name: string;
    hoverInfo?: string;
}

export default function Badge(props: BadgeProps) {
    const [hover, setHover] = useState(false);
    const [fadeIn, animateFadeIn] = useAnimate();
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
            <div onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} className={`text-white text-center text-xs flex justify-center items-center border-neutral-600 rounded-lg w-14 h-8 ${props.color}`
            }>
                {props.name}
            </div >
            {props.hoverInfo && <div className="absolute opacity-0 text-center -translate-x-16 w-48 text-sm mt-1 bg-neutral-600 p-2 rounded-md text-white shadow" ref={fadeIn}>
                {props.hoverInfo}
            </div>}
        </div>
    )
}