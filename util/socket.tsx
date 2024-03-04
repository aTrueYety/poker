"use client"

import { useContext } from 'react';
import { socketContext } from '@/components/layoutWrapper';

function useSocket() {
    const socket = useContext(socketContext);
    return socket;
}

export default useSocket;