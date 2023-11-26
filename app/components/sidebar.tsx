"use client";

import { motion, animate, useAnimate } from "framer-motion";
import { useState, useEffect } from "react";

export default function Sidebar() {
    const [sidebarIsOpen, setSidebarIsOpen] = useState(false);
    const [borderAnimationScope, animateBorder] = useAnimate();

    useEffect(() => {
        animate(borderAnimationScope.current,
            sidebarIsOpen
                ? { width: "fit-content", padding: "0.5rem" }
                : { width: 0, padding: 0 },
            {
                duration: 0.2,
                ease: "easeOut",
            },

        )

        animate(borderAnimationScope.current,
            sidebarIsOpen
                ? { height: "fit-content" }
                : { height: 0 },
            {
                duration: 0.2,
                ease: "easeOut",
                delay: sidebarIsOpen ? 0.2 : 0
            },

        )
    }, [sidebarIsOpen]);
    return (
        <div className="h-0 w-0 absolute rounded-lg bg-neutral-700" ref={borderAnimationScope}>
            <SidebarIcon onClick={() => { setSidebarIsOpen(!sidebarIsOpen) }} isOpen={sidebarIsOpen} />
            <SidebarContent isOpen={sidebarIsOpen} />
        </div>
    )
}

function SidebarContent({ isOpen }: { isOpen: boolean; }) {
    const [contentAnimationScope, animateContent] = useAnimate();
    useEffect(() => {
        animate(contentAnimationScope.current,
            isOpen
                ? { opacity: 1 }
                : { opacity: 0 },
            {
                duration: 0.2,
                ease: "easeOut",
                delay: isOpen ? 0.4 : 0
            },
        )
    }, [isOpen]);

    return (
        <div className="px-3 py-1 flex flex-col w-52 h-80">
            <div ref={contentAnimationScope} className="flex flex-col min-w-full opacity-0">
                <SidebarItem />
                <SidebarItem />
            </div>
        </div>
    )

}

function SidebarItem() {
    return (
        <div className="flex items-center">
            <div className="ml-2 mr-2">asdasd</div>
        </div>
    )

}

interface SidebarIconProps {
    onClick: () => void;
    isOpen: boolean;

}

function SidebarIcon({ onClick, isOpen }: SidebarIconProps) {
    return (
        <motion.button onClick={onClick} className="w-10 h-10 z-50"
            initial={{ rotate: 0 }}
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" style={{ width: "inherit", height: "inherit" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
        </motion.button>

    )
}