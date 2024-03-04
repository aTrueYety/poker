import NextAuth, { DefaultUser } from "next-auth"

declare module "next-auth" {
    export interface Session {
        user: {
            id: string
        } & DefaultUser["user"]
    }
}