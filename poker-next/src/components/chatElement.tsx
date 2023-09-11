export default function chatElement({chat}:{chat: string}) {
    return (
        <div className="flex max-w-full bg-orange-500 justify-center break-all text-center" >
            {chat}
        </div>
    )
}