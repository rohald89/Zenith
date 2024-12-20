import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { Timer } from '#app/components/timer'
import { requireUserId } from '#app/utils/auth.server'
import { prisma } from '#app/utils/db.server'
import { getTimeOfDayGreeting } from '#app/utils/misc'

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request)
	const user = await prisma.user.findUniqueOrThrow({
		where: { id: userId },
		select: { name: true, username: true },
	})
	return json({ user })
}

export default function Dashboard() {
	const { user } = useLoaderData<typeof loader>()
	const displayName = user.name ?? user.username

	return (
		<>
			<div className="text-2xl font-bold">
				{getTimeOfDayGreeting()}, {displayName} 🤩
			</div>
			<div className="grid auto-rows-min gap-4 md:grid-cols-3">
				<div className="aspect-video rounded-xl bg-muted/50" />
				<div className="aspect-video rounded-xl bg-muted/50" />
				<div className="aspect-video rounded-xl bg-muted/50" />
			</div>
			<div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min">
				<Timer />
			</div>
		</>
	)
}
