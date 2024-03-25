import Image from "next/image"

export default function User({ params }: { params: { userId: string } }) {
    return (
        <>
            <div className="flex items-center justify-center">
                <h1>{params.userId}</h1>
            </div>
            <Image src={"/images/users/default.png"} alt={"Profile picture"} width={50} height={50} />
        </>
    )
}