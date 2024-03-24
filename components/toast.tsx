import { useAnimate } from "framer-motion";

export default function Toast({ title, text, onClose, variant, fade }: { title?: string, text?: string, onClose?: () => void, variant?: string, fade?: number }) {
    const [fadeOutScope, animateFadeOutScope] = useAnimate();

    fade
        ? setTimeout(() => {
            animateFadeOut();
            setTimeout(() => {
                onClose?.();
            }, 400);
        }, fade)
        : null;

    const animateFadeOut = () => {
        if (!fadeOutScope.current) {
            onClose?.();
            return;
        }
        //await animate(fadeOutScope.current, {opacity: 1}, {duration: 0})
        animateFadeOutScope(
            fadeOutScope.current,
            { opacity: 1 },
            { ease: "easeIn", duration: 0 }
        );
        animateFadeOutScope(
            fadeOutScope.current,
            { opacity: 0, transform: "translateY(70px)" },
            { ease: "easeOut", duration: 0.4 }
        );
    };

    const variants: { [key: string]: string } = { success: "bg-green-400 border-green-400", error: "bg-red-500 border-red-500" };

    const bg = variant ? variants[variant] : "bg-white";
    const secondaryColor = variants[variant ? variant : ""] ? "text-gray-900" : "text-gray-500";

    return (
        <div
            ref={fadeOutScope}
            className={`fixed bottom-4 right-4 ${bg} shadow-lg border z-20 p-4 rounded-lg max-w-sm w-full transition-all ease-in-out duration-200 transform animate-slideUpEnter animate-fadeInLeave`}
        >
            <div className='flex justify-between items-center'>
                <div>
                    <div className='font-semibold text-gray-900 '>{title}</div>
                    <div className='text-gray-900 '>{text}</div>
                </div>
                <button
                    aria-label='Close toast'
                    className={secondaryColor}
                    onClick={onClose}
                >
                    <svg
                        className=' h-5 w-5'
                        fill='none'
                        height='24'
                        stroke='currentColor'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth='2'
                        viewBox='0 0 24 24'
                        width='24'
                        xmlns='http://www.w3.org/2000/svg'
                    >
                        <path d='M18 6 6 18' />
                        <path d='m6 6 12 12' />
                    </svg>
                </button>
            </div>
        </div>
    );
}
