export interface Messageprops {
    author: string,
    content: string
}

export function Message(message: Messageprops) {
    return (
        <div className="flex flex-row items-center">
            <h1 className=" text-neutral-300 font-semibold">{message.author}</h1>
            <div className="text-white p-2 overflow-auto break-words">{message.content}</div>
        </div>
    )
}