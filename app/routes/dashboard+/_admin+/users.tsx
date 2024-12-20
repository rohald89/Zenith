import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { prisma } from '#app/utils/db.server'

export async function loader({ request }: LoaderFunctionArgs) {
	const users = await prisma.user.findMany()
	return json({ users })
}

const Users = () => {
	return <div>users</div>
}

export default Users
