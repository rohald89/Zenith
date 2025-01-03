import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { invariantResponse } from '@epic-web/invariant'
import { prisma } from '#app/utils/db.server'
import { Canvas } from '#app/components/canvas'

export async function loader({ params }: LoaderFunctionArgs) {
	const world = await prisma.world.findUnique({
		where: { id: params.id },
		select: {
			name: true,
			description: true,
			canvas: true,
			user: {
				select: {
					username: true,
				},
			},
		},
	})

	invariantResponse(world, 'World not found', { status: 404 })

	const userItems = await prisma.userItem.findMany({
		where: { userId: world.user.id },
		select: {
			id: true,
			quantity: true,
			item: {
				select: {
					name: true,
					images: {
						select: { id: true },
						take: 1,
					},
				},
			},
		},
	})

	return json({ world, userItems })
}

export default function WorldRoute() {
	const { world, userItems } = useLoaderData<typeof loader>()

	return (
		<div className="flex flex-col gap-4">
			<div>
				<h1 className="text-2xl font-bold">{world.name}</h1>
				<p className="text-sm text-muted-foreground">
					Created by {world.user.username}
				</p>
				{world.description ? (
					<p className="mt-2 text-muted-foreground">{world.description}</p>
				) : null}
			</div>
			<div className="relative h-[600px] w-full">
				<Canvas userItems={userItems} />
			</div>
		</div>
	)
}
