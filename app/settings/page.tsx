"use client"

import { Button, TextInput } from "@/components/input"
import { signOut } from "next-auth/react"

export default function Settings() {
    return (
        <div className="flex items-center justify-center">
            <h1>Settings</h1>
            <Button variant="primary" onClick={() => signOut()}>Sign Out</Button>
        </div>
    )

}