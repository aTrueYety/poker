"use client";

import { motion, animate, useAnimate, stagger } from "framer-motion";
import { Button } from "./input";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Sidebar() {
    const [sidebarIsOpen, setSidebarIsOpen] = useState(false);
    const [borderAnimationScope, animateBorder] = useAnimate();
    useEffect(() => {

        //checks if a click is outside the dropdown box
        function checkClick(e: MouseEvent) {
            if (!borderAnimationScope.current.contains(e.target)) {
                setSidebarIsOpen(false);
                window.removeEventListener("click", checkClick);
            }
        }

        //adds an event listener to the window to check if a click is outside the dropdown box
        if (sidebarIsOpen) {
            window.addEventListener("click", checkClick);
        }

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

        //removes the event listener when the component is unmounted
        return () => {
            window.removeEventListener("click", checkClick);
        };

    }, [sidebarIsOpen, borderAnimationScope]);
    return (
        <nav className="h-0 w-0 absolute rounded-lg bg-neutral-700" ref={borderAnimationScope}>
            <SidebarIcon onClick={() => { setSidebarIsOpen(!sidebarIsOpen) }} isOpen={sidebarIsOpen} />
            <SidebarContent isOpen={sidebarIsOpen} setIsOpen={setSidebarIsOpen} />
        </nav>
    )
}

function SidebarContent({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (isOpen: boolean) => void; }) {
    const [contentAnimationScope, animateContent] = useAnimate();
    const staggerItems = stagger(0.1, { startDelay: 0.2 });
    useEffect(() => {
        animate(".sidebarItemStagger",
            isOpen
                ? { opacity: 1, x: 0 }
                : { opacity: 0, x: -20 },
            {
                duration: 0.2,
                ease: "easeOut",
                delay: isOpen ? staggerItems : 0
            },
        )
    }, [isOpen]);

    return (
        <div className="py-1 flex flex-col w-52 h-80 ">
            <div ref={contentAnimationScope} className="flex flex-col items-center min-h-full min-w-full ">
                <SidebarItem text="Home" className="mt-2" icon={
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                    </svg>
                }
                    redirectTo="/"
                    onClick={() => {
                        setIsOpen(false);
                    }} />

                <SidebarItem text="Play" className="mt-2" icon={
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                    </svg>
                }
                    redirectTo="/game"
                    onClick={() => {
                        setIsOpen(false);
                    }} />

                <SidebarItem text="Users" className="mt-2" icon={
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                    </svg>


                }
                    //TODO: change this to the profile page
                    redirectTo="/users"
                    onClick={() => {
                        setIsOpen(false);
                    }} />

                <SidebarItem text="Profile" className="mt-2" icon={
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>

                }
                    //TODO: change this to the profile page
                    redirectTo="/users/PROFILE_ID"
                    onClick={() => {
                        setIsOpen(false);
                    }} />
                <SidebarItem text="Settings" className="mt-auto" icon={
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75a4.5 4.5 0 01-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 11-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 016.336-4.486l-3.276 3.276a3.004 3.004 0 002.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.867 19.125h.008v.008h-.008v-.008z" />
                    </svg>

                }
                    redirectTo="/settings"
                    onClick={() => {
                        setIsOpen(false);
                    }}
                />
            </div>
        </div>
    )

}
function SidebarItem({ className, text, icon, redirectTo, onClick }: { className?: string, text?: string, icon?: React.ReactNode, redirectTo: string, onClick?: () => void; }) {
    return (
        <Link href={redirectTo} className={`flex w-full items-center justify-center opacity-0 sidebarItemStagger ${className}`} >
            <Button variant={"primary"} onClick={onClick}>
                <div className="flex flex-row">
                    {icon}
                    <div className="ml-2">
                        {text}
                    </div>
                </div>
            </Button>
        </Link >
    )

}

function SidebarIcon({ onClick, isOpen }: { onClick?: () => void; isOpen: boolean; }) {
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