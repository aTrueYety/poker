
export default function Game({ params }: { params: { gameId: string } }) {
    return (
        <div className="flex items-center justify-center">
            <h1>Game {params.gameId}</h1>
        </div>
    )
}
