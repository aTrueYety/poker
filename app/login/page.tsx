"use client"
import { Button, TextInput } from "@/components/input"
import { signIn } from "next-auth/react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function Login() {
    const [password, setPassword] = useState("")
    const [username, setUsername] = useState("")

    const router = useRouter()

    function logIn(username: String, password: String) {

        signIn("credentials", {
            redirect: false,
            username: username,
            password: password,
        }).then(res => {
            if (res?.ok) {
                router.push("/users/me")
            }
        })
    }

    return (
        <div className="flex flex-col mt-40 items-center justify-center">
            <TextInput placeholder="Username" className="w-1/3 h-14 mt-4" onChange={(s) => setUsername(s)} />
            <TextInput placeholder="Password" className="w-1/3 h-20 mt-4" onChange={(s) => setPassword(s)} onSubmit={() => logIn(username, password)} onEnterClear={true} type="password" />
            <Button variant="primary" className="w-1/3 h-14 mt-4" onClick={() => {
                logIn(username, password);
            }}>Login</Button>

            <div className="mt-8 mb-8">
                <div>
                    {"Don't have an account?"} <Link href="/register" className="text-blue-500">Register</Link>
                </div>
            </div>
        </div>
    )
}



