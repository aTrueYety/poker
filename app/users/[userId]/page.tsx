
export default function User({ params }: { params: { userId: string } }) {
    console.log(params.userId)
    return (
        <div className="flex items-center justify-center">
            <h1>{params.userId}</h1>
        </div>
    )
}