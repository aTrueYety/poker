export default function chatElement({chat}:{chat: string}) {


    //same author should not include name over chatmessage. 
    //change when implemented in backend


    return (
        <div className="flex flex-col bg-zinc-300 px-4 my-2">
            <div className="flex flex-col w-full font-bold" >
                test
            </div>
            <div className="flex max-w-fulljustify-center break-all text-center" >
                {chat}
            </div>
        </div>
    )
}