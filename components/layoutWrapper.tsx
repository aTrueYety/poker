"use client"

import { ToastProvider } from "@/util/toastProvider";
import { Session } from "next-auth"
import { SessionProvider } from "next-auth/react"
import React, { createContext } from "react";
import { io, Socket } from "socket.io-client";

interface socketContext {
    socket: Socket | null
}


export const socketContext = createContext<Socket | null>(null)

function LayoutWrapper({
    children,
    session,
}: { children: React.ReactNode, session: Session | null }) {

    return (
        <SessionProvider session={session}>
            <socketContext.Provider value={createSocket()}>
                <ToastProvider>
                    {children}
                </ToastProvider>
            </socketContext.Provider>
        </SessionProvider>
    )
}

function createSocket() {
    let hostname;
    if (typeof window !== "undefined") {
        hostname = window.location.hostname;
    }
    const socket: Socket = io(`http://${hostname}:4000`);

    return socket;
}

export default LayoutWrapper;
