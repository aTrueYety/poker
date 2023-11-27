"use client";

export const Button = ({ variant, children, className, onClick, ...rest }: { variant?: String, children?: React.ReactNode, className?: String, onClick?: () => void }) => {
    return (
        <button
            className={
                variant == "primary"
                    ? `px-7 py-2 w-full rounded-lg bg-neutral-700 hover:bg-blue-500 text-white ${className}`
                    : `px-7 py-2 w-full rounded-lg bg-white border-2 hover:bg-blue-700 text-blue-500 border-blue-500 ${className}`
            }
            {...rest}
            onClick={onClick}
        >
            {children}
        </button>
    );

}

