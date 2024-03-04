import { authOptions } from '@/util/auth'
import { getServerSession } from "next-auth/next"

export async function getServerSideProps(context: { req: any, res: any }) {
    const session = await getServerSession(context.req, context.res, authOptions)

    if (!session) {
        return
    }

    return {
        props: {
            session,
        },
    }
}