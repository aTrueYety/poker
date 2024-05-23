import NextAuth, { DefaultUser } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
    export interface Session {
        user: {
            id: string,
            name: string,
            accessToken: string,
        } & DefaultUser["user"]
    }

    export interface User {
        id: string
        name: string
        accessToken: string
    }
}

declare module "next-auth/jwt" {
    export interface JWT {
        id: string,
        name: string
        accessToken: string
    }
}