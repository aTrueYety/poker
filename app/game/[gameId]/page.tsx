
export default function Game({params} : {params: {gameId: string}}) {
    return (
        <div>
        <h1>Game {params.gameId}</h1>
        </div>
    )
}
