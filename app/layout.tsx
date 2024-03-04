
import type { Metadata } from 'next'
import { Open_Sans } from 'next/font/google'
import './globals.css'

import React from 'react'
import Sidebar from '../components/sidebar'
import LayoutWrapper from '@/components/layoutWrapper'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/util/auth'

const open = Open_Sans({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'poker',
    description: 'poker',
}

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {

    const session = await getServerSession(authOptions);

    return (
        <LayoutWrapper session={session}>
            <html lang="en">
                <body className={open.className + " min-w-screen min-h-screen p-2 select-none"}>
                    <Sidebar />
                    {children}
                </body>
            </html>
        </LayoutWrapper>
    )


}


