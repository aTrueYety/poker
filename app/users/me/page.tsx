"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react";

export default function Me() {

    const { data: session } = useSession();
    const router = useRouter()

    // Useeffect to prevent bad setstate error
    useEffect(() => {
        if (!session?.user) {
            router.push("/login")
        }

        router.push("/users/" + session?.user?.name)
    })

    return (
        <></>
    )

}