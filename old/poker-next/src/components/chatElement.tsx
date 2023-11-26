export default function chatElement({chat}:{chat: string}) {


    //same author should not include name over chatmessage. 
    //change when implemented in backend


    return (
        <div className="flex flex-col mx-3 p-2 my-2 bg-zinc-300 bg-opacity-20 rounded">
            <div className="flex flex-col w-full font-bold" >
                test
            </div>
            <div className="flex max-w-fulljustify-center break-all text-left" >
                {chat}
            </div>
        </div>
    )
}