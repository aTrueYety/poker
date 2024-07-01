import NextAuth, { DefaultUser } from "next-auth"
import { JWT } from "next-auth/jwt"

export interface SessionUser extends DefaultUser {
    id: string
    name: string
    accessToken: string
}

declare module "next-auth" {
    export interface Session {
        user: SessionUser
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