import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next"
import type { NextAuthOptions } from "next-auth"

import { getServerSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                username: { label: "username", type: "text", placeholder: "username" },
                password: { label: "password", type: "password" }
            },
            async authorize(credentials, req) {
                if (credentials?.username == "admin" && credentials?.password == "admin") {
                    return { id: "test", name: "admin" }
                } else {
                    return { id: "test2", name: "user2" }
                }

                return null;
            },

        })
    ],

    session: {
        strategy: "jwt"
    },

    callbacks: {
        jwt({ token, account, user }) {
            return token
        },

        session({ session, token }) {
            session.user.id = token.sub
            session.user.name = token.name
            return session;
        }
    },

    pages: {
        signIn: "/login"
    }

} satisfies NextAuthOptions

export function auth(...args: [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]] | [NextApiRequest, NextApiResponse] | []) {
    return getServerSession(...args, authOptions)
}