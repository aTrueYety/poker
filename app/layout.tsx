import type { Metadata } from 'next'
import { Open_Sans } from 'next/font/google'
import './globals.css'

import React from 'react'
import Sidebar from '../components/sidebar'
import LayoutWrapper from '@/components/layoutWrapper'

const open = Open_Sans({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'poker',
    description: 'poker',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <LayoutWrapper>
            <html lang="en">
                <body className={open.className + " min-w-screen min-h-screen p-2 select-none"}>
                    <Sidebar />
                    {children}
                </body>
            </html>
        </LayoutWrapper>
    )
}
