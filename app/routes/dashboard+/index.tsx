import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { Timer } from '#app/components/timer'
import { requireUserId } from '#app/utils/auth.server'
import { prisma } from '#app/utils/db.server'
import { getTimeOfDayGreeting } from '#app/utils/misc'

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request)
	const [user, userItems] = await Promise.all([
		prisma.user.findUniqueOrThrow({
			where: { id: userId },
			select: { name: true, username: true },
		}),
		prisma.userItem.findMany({
			where: { userId },
			include: {
				item: {
					include: {
						images: true,
						themeCategory: {
							include: { theme: true },
						},
					},
				},
			},
			orderBy: { updatedAt: 'desc' },
		}),
	])
	return json({ user, userItems })
}

export default function Dashboard() {
	const { user, userItems } = useLoaderData<typeof loader>()
	const displayName = user.name ?? user.username

	return (
		<>
			<div className="text-2xl font-bold">
				{getTimeOfDayGreeting()}, {displayName} 🤩
			</div>
			<div className="grid gap-4 md:grid-cols-3">
				<div className="min-h-[50vh] flex-1 rounded-xl bg-muted/50 p-4 md:min-h-min">
					a
				</div>
				<div className="min-h-[50vh] flex-1 rounded-xl bg-muted/50 p-4 md:min-h-min">
					b
				</div>
				<div className="min-h-[50vh] flex-1 rounded-xl bg-muted/50 p-4 md:min-h-min">
					<Timer />
				</div>
			</div>
			<div className="mt-4 min-h-[50vh] flex-1 rounded-xl bg-muted/50 p-4 md:min-h-min">
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{userItems.map((userItem) => (
						<div
							key={userItem.id}
							className="relative rounded-xl bg-muted/50 p-4"
						>
							<div className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs font-semibold text-white">
								{userItem.quantity}
							</div>
							<div className="flex gap-4">
								{userItem.item.images[0] ? (
									<img
										src={`/resources/item-images/${userItem.item.images[0].id}`}
										alt={userItem.item.name}
										className="h-[50px] w-[50px] rounded-lg object-cover"
									/>
								) : (
									<div className="h-[50px] w-[50px] rounded-lg bg-muted" />
								)}
								<div className="flex flex-col justify-center">
									<h3 className="font-semibold">{userItem.item.name}</h3>
									<p className="text-sm text-muted-foreground">
										{userItem.item.themeCategory.theme.name} •{' '}
										{userItem.item.themeCategory.name}
									</p>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</>
	)
}
