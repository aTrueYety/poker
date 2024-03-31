
import type { Metadata } from 'next'
import { Open_Sans } from 'next/font/google'
import './globals.css'

import React from 'react'
import Sidebar from '../components/sidebar'
import LayoutWrapper from '@/components/layoutWrapper'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/util/auth'
import { ToastProvider } from '@/util/toastProvider'

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
        <html lang="en">
            <body className={open.className + " w-screen h-screen p-2 select-none"}>
                <LayoutWrapper session={session}>
                    <Sidebar />
                    {children}
                </LayoutWrapper>
            </body>
        </html>
    )


}


