"use client";

import { useRef, forwardRef } from "react";

export const Button = ({ variant, children, className, onClick, ...rest }: { variant?: String, children?: React.ReactNode, className?: String, onClick?: () => void }) => {
    return (
        <button
            className={
                variant == "primary"
                    ? `px-7 py-2 max-w-full h-full rounded-lg bg-neutral-700 hover:bg-blue-500 text-white ${className}`
                    : `px-7 py-2 max-w-full h-full rounded-lg bg-white border-2 hover:bg-blue-700 text-blue-500 border-blue-500 ${className}`
            }
            {...rest}
            onClick={onClick}
        >
            {children}
        </button>
    );
}

interface TextInputProps {
    placeholder?: string;
    value?: string;
    onSubmit?: (s: string) => void;
    onChange?: (s: string) => void;
    className?: string;
    textCentered?: boolean;
    onEnterClear?: boolean;
    onEnterBlur?: boolean;
    type?: string;
}

export const TextInput = forwardRef(function TextInput(props: TextInputProps, ref: any) {
    let element = useRef<HTMLInputElement>(null);
    if (ref) element = ref

    //placeholder
    let pl = "Placeholder...";
    if (props.placeholder) {
        pl = props.placeholder;
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
        if (props.onEnterBlur) element?.current?.blur();

        props.onEnterClear ? element?.current ? (element.current.value = "") : null : null;
        props.onSubmit ? props.onSubmit(text) : {};
    }

    return (
        <div className={`min-w-52 h-full flex flex-row bg-neutral-700 border border-neutral-800 rounded-lg p-1 ${props.className}`}>
            <input
                ref={element}
                type={props.type ? props.type : "text"}
                className={`w-full h-full bg-transparent outline-none px-3 ${props.textCentered ? " text-center" : ""}}`}
                placeholder={pl}
                defaultValue={props.value}
                onChange={(e) => {
                    props.onChange ? props.onChange(e.target.value) : null;
                }}
                onKeyDown={(e) => {
                    e.key === "Enter"
                        ? handleSubmit(element.current ? element.current.value : "")
                        : handleKeyDown(e);
                }}
            />
        </div>
    );
});

