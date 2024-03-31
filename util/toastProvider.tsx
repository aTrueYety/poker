import Toast from '@/components/toast';
import { createContext, useContext, useEffect, useRef, useState } from 'react';

interface toastProps {
    title?: string,
    text?: string,
    onClose?: () => void,
    variant?: string,
    fade?: number
}

interface toastContext {
    enqueue: (props: toastProps) => void
}

const ToastContext = createContext<toastContext>({} as toastContext)

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [queue, setQueue] = useState<toastProps[]>([]);
    const toastRef = useRef<toastProps | null>(null);

    const enqueue = (toast: toastProps) => {
        const toastIsDisplayed = (toast: toastProps) => {
            if (!toastRef.current) {
                return false;
            }

            if (toast.title !== toastRef.current.title) {
                return false;
            }

            if (toast.text !== toastRef.current.text) {
                return false;
            }

            if (toast.variant !== toastRef.current.variant) {
                return false;
            }

            return true;
        }

        // if the toast is in queue
        if (queue[0] === toast || toastIsDisplayed(toast)) {
            return;
        }

        if (!toastRef.current) {
            toastRef.current = toast;
            setQueue([]);
            return;
        }

        setQueue((oldQueue) => [...oldQueue, toast]);
    };

    const next = () => {
        if (queue.length > 0) {
            toastRef.current = queue[0];
            setQueue((oldQueue) => oldQueue.slice(1));
            return
        }

        toastRef.current = null;
        setQueue([]);
    }

    useEffect(() => {
        if (queue.length > 0 && !toastRef.current) {
            next();
        }
    }, [queue]);

    return (
        <ToastContext.Provider value={{ enqueue }}>
            {children}
            {toastRef.current &&
                <Toast
                    {...toastRef.current}
                    onClose={() => {
                        toastRef.current?.onClose?.();
                        next();
                    }}
                />
            }
        </ToastContext.Provider>
    );
};


export function useToast() {
    const toast = useContext(ToastContext);
    return toast;
}
