"use client";

import { useRef } from "react";

export const Button = ({ variant, children, className, onClick, ...rest }: { variant?: String, children?: React.ReactNode, className?: String, onClick?: () => void }) => {
    return (
        <button
            className={
                variant == "primary"
                    ? `px-7 py-2 w-full h-full rounded-lg bg-neutral-700 hover:bg-blue-500 text-white ${className}`
                    : `px-7 py-2 w-full h-full rounded-lg bg-white border-2 hover:bg-blue-700 text-blue-500 border-blue-500 ${className}`
            }
            {...rest}
            onClick={onClick}
        >
            {children}
        </button>
    );
}

export const TextInput = ({ placeholder, value, onSubmit, onChange, className }: { placeholder?: string, value?: string, onSubmit?: (s: string) => void, onChange?: (s: string) => void, className?: string }) => {
    const element = useRef<HTMLInputElement>(null);

    //placeholder
    let pl = "Placeholder...";
    if (placeholder) {
        pl = placeholder;
    }

    let alwaysAcceptValues = [
        "Backspace",
        "Delete",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Tab",
    ];

    //function to handle key down
    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>, acceptedValues?: string[]) {
        if (acceptedValues) {
            if (!acceptedValues.includes(e.key)) {
                if (!alwaysAcceptValues.includes(e.key)) {
                    e.preventDefault();
                    //add animation?
                }
            }
        }
    }

    //function to handle submit
    function handleSubmit(text: string) {
        element?.current?.blur();
        onSubmit ? onSubmit(text) : {};
    }

    return (
        <div className={`w-52 h-full flex flex-row bg-neutral-700 border border-neutral-800 rounded-lg p-1 ${className}`}>
            <input
                ref={element}
                className={`w-full h-full bg-transparent outline-none px-3`}
                placeholder={pl}
                defaultValue={value}
                onChange={(e) => {
                    onChange ? onChange(e.target.value) : null;
                }}
                onKeyDown={(e) => {
                    e.key === "Enter"
                        ? handleSubmit(element.current ? element.current.value : "")
                        : handleKeyDown(e);
                }}
            />
        </div>
    );
};

