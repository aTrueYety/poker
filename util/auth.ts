import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next"
import type { NextAuthOptions } from "next-auth"
import { JWT } from "next-auth/jwt"

import { getServerSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "username", type: "text", placeholder: "username" },
                password: { label: "password", type: "password" }
            },
            async authorize(credentials, req) {
                // TODO: this is just for testing purposes
                // Connect with a database.
                // Maybe also include a link to image and email? These will be included in the signup process
                if (credentials?.username == "admin" && credentials?.password == "admin") {
                    return { id: "adminId", name: "admin", accessToken: "adminToken" }
                } else {
                    return { id: "user2Id", name: "user2", accessToken: "user2Token" }
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
            // TODO: the access token should be hashed and given an expiration date
            // but i am too lazy to do that right now
            if (user?.accessToken) token.accessToken = user.accessToken
            if (user?.id) token.id = user.id
            return token
        },

        session({ session, token }) {
            session.user.id = token.id
            session.user.name = token.name
            session.user.accessToken = token.accessToken
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