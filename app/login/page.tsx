import { Button, TextInput } from "@/components/input"
import Link from "next/link"

export default function Login() {
    return (
        <div className="flex flex-col mt-40 items-center justify-center">
            <TextInput placeholder="Username" className="w-1/3 h-14 mt-4" />
            <TextInput placeholder="Password" className="w-1/3 h-14 mt-4" onEnterClear={true} type="password" />
            <Button variant="primary" className="w-1/3 h-14 mt-4">Login</Button>

            <div className="mt-8 mb-8">
                <div>
                    {"Don't have an account?"} <Link href="/register" className="text-blue-500">Register</Link>
                </div>
            </div>
        </div>
    )
}



