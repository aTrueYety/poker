import { TextInput, Button } from "@/components/input"
export default function Game() {
    return (
        <div className="flex flex-col items-center justify-center mt-10">
            <div className="flex flex-row items-center justify-center h-20 w-1/2">
                <TextInput placeholder="Enter game id..." className=" w-9/12" />
                <Button variant={"primary"} className="ml-2 w-3/12">Join</Button>
            </div>

            <div className="mt-8 mb-8">
                <h1 className="text-2xl">OR</h1>
            </div>

            <div className="flex flex-row items-center justify-center h-20 w-1/2">
                <Button variant={"primary"} className="w-full">Create New Game</Button>
            </div>

            <div className="mt-8 mb-8 flex flex-row">
                <div className="p-10">
                    ongoing games
                </div>
            </div>
        </div>
    )
}
