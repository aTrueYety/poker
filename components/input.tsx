"use client";

import { useRef, forwardRef } from "react";

export const Button = ({ variant, children, className, onClick, ...rest }: { variant?: String, children?: React.ReactNode, className?: String, onClick?: () => void }) => {
    return (
        <button
            className={
                variant == "primary"
                    ? ` px-7 py-2 max-w-full h-full rounded-lg bg-neutral-700 hover:bg-blue-500 text-white ${className}`
                    : ` px-7 py-2 max-w-full h-full rounded-lg bg-white border-2 hover:bg-blue-700 text-blue-500 border-blue-500 ${className}`
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
    acceptedValues?: string[];
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
        <div className={`min-w-52 min-h-full flex flex-row bg-neutral-700 border border-neutral-800 rounded-lg p-1 ${props.className}`}>
            <input
                ref={element}
                type={props.type ? props.type : "text"}
                className={`w-full h-full bg-transparent outline-none px-3 ${props.textCentered || props.textCentered == undefined ? " text-center" : ""}}`}
                placeholder={pl}
                defaultValue={props.value}
                onChange={(e) => {
                    props.onChange ? props.onChange(e.target.value) : null;
                }}
                onKeyDown={(e) => {
                    e.key === "Enter"
                        ? handleSubmit(element.current ? element.current.value : "")
                        : handleKeyDown(e, props.acceptedValues);
                }}
            />
        </div>
    );
});

import { motion, stagger, useAnimate } from "framer-motion";
import { useEffect, useState } from "react";

type reactChild = React.JSX.Element;
type multipleReactChildren = React.JSX.Element[];

/**
 * A dropdown component that displays a list of options and allows the user to select one.
 * @param {Object} props - The props object that contains the properties passed to the component.
 * @param {Array} children - The array of child components that represent the options in the dropdown.
 * @returns {JSX.Element} - The JSX element that represents the dropdown component.
 */
export const Dropdown = ({ children, open }: { children: reactChild | multipleReactChildren, open: number }) => {
    const staggerMenuItems = stagger(0.05, { startDelay: 0.1 }); //generates a stagger function for the menu items
    const [isOpen, setIsOpen] = useState(false); //if the dropdown is open
    const [selectedItem, setSelectedItem] = useState<number>(
        open ? open : open == 0 ? 0 : -1
    ); //truly the worst code ive ever written
    const [scope, animate] = useAnimate(); //animation scope

    Array.isArray(children) ? children : children = [children];


    if (selectedItem >= children.length) { setSelectedItem(-1) }

    useEffect(() => {
        setSelectedItem(open);
    }, [open])

    useEffect(() => {
        //checks if a click is outside the dropdown box
        function checkClick(e: MouseEvent) {
            if (!scope.current.contains(e.target)) {
                setIsOpen(false);
                window.removeEventListener("click", checkClick);
            }
        }

        //adds an event listener to the window to check if a click is outside the dropdown box
        if (isOpen) {
            window.addEventListener("click", checkClick);
        }

        //animaes the dropdown box
        animate(
            "#dropdown",
            {
                clipPath: isOpen
                    ? "inset(0% 0% 0% 0% round 10px)"
                    : "inset(10% 50% 90% 50% round 10px)",
            },
            {
                type: "spring",
                bounce: 0,
                duration: 0.2,
            }
        );

        //animates each dropdown item
        animate(
            ".dropdownItem",
            isOpen
                ? { opacity: 1, scale: 1, filter: "blur(0px)", x: 0 }
                : { opacity: 0, scale: 0, filter: "blur(2px)", x: 50 },
            { duration: 0.15, ease: "easeOut", delay: isOpen ? staggerMenuItems : 0 }
        );

        //animates the arrow icon
        animate(".arrow", isOpen ? { rotate: 180 } : { rotate: 0 }, {
            duration: 0.2,
            ease: "easeOut",
        });

        //removes the event listener when the component is unmounted
        return () => {
            window.removeEventListener("click", checkClick);
        };
    }, [isOpen]);

    return (
        <div ref={scope} className='w-52 h-12'>
            <motion.button
                className='w-full h-full flex flex-row justify-between rounded-lg bg-neutral-600'
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className='px-3 h-full flex justify-center items-center'>
                    {selectedItem === -1 ? "Select" : children[selectedItem] ? children[selectedItem].props.children : "Select"}
                </div>

                <div
                    className='arrow self-center p-2'
                    style={{ transformOrigin: "50% 55%" }}
                >
                    <svg
                        width='25'
                        height='20'
                        viewBox='-10 -12 20 20'
                        transform='scale(0.6)'
                    >
                        <path d='M -10 -3 C -12 -5 -10 -7 -8 -5 L 0 2 L 0 2 L 8 -5 C 10 -7 12 -5 10 -3 L 1 5 C 0 6 0 6 -1 5' />
                    </svg>
                </div>
            </motion.button>

            <div
                id='dropdown'
                className='bg-neutral-600 first-letter:flex flex-col justify-center mt-2 rounded-xl '
                style={{
                    pointerEvents: isOpen ? "auto" : "none",
                    clipPath: "inset(10% 50% 90% 50% round 10px)",
                }}
            >
                {children.map ? children.map((child, index) => (
                    <motion.button
                        key={index}
                        className='dropdownItem flex py-3 px-3 w-full'
                        onClick={() => {
                            child.props.onSelect?.();
                            setIsOpen(false);
                            setSelectedItem(index);
                        }}
                        whileHover={{ scale: 1.02, x: 5, fontWeight: 450 }}
                    >
                        {child}
                    </motion.button>
                )) : <motion.button
                    className='dropdownItem flex py-3 px-3 w-full'
                    onClick={() => {
                        if (children instanceof Array) {
                            children.at(0)?.props.onSelect?.();
                            setIsOpen(false);
                            setSelectedItem(-1);
                        }
                    }}
                    whileHover={{ scale: 1.02, x: 5, fontWeight: 450 }}
                >
                    {children}
                </motion.button>}
            </div>
        </div>
    );
};

/**
 * A component that represents an item in the dropdown.
 * @param {Object} props - The props object that contains the properties passed to the component.
 * @param {function} [onSelect] - The function to be called when the user selects the item.
 * @param {Array} children - The array of child components that represent the options in the dropdown.
 * @returns {JSX.Element} - The JSX element that represents the dropdown item component.
 */
export const DropdownItem = ({ children, onSelect }: { onSelect?: () => void, children: multipleReactChildren | reactChild | string }) => {
    return <div className='dropdownItem flex'>{children}</div>;
};



