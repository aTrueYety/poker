"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function Me() {

    const { data: session } = useSession();
    const router = useRouter()

    console.log(session)

    if (!session?.user) {
        router.push("/login")
    }

    router.push("/users/" + session?.user?.name)
}