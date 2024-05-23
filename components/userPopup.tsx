import { PlayerInfo } from "@/types/types";
import { forwardRef, Ref } from "react";



export default forwardRef(function UserPopup({ user }: { user: PlayerInfo }, ref: Ref<HTMLDivElement>) {
    return (
        <div ref={ref} className="absolute opacity-0 text-center w-full min-w-fit text-sm mt-1 bg-neutral-600 p-2 rounded-md text-white shadow">
            <div className="flex flex-col align-middle">
                <div className="flex flex-row align-middle">
                    <div className="flex flex-row justify-center items-center text-center text-xl pb-1 pr-2 pl-2">
                        {user.username}
                    </div>
                    <div className="flex flex-row justify-center items-center text-center text-xs font-extralight">
                        #{user.id}
                    </div>
                </div>
                <div className="text-sm font-light">{"more info 👹"}</div>
            </div>
        </div>
    )

})