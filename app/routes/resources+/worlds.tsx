import { ActionFunctionArgs } from '@remix-run/node'

import { requireUserId } from '#app/utils/auth.server.js'

import { prisma } from '#app/utils/db.server.js'
import { json } from '@remix-run/node'

export async function action({ request }: ActionFunctionArgs) {
	const userId = await requireUserId(request)
	const { name, description, canvas, image } = (await request.json()) as {
		name: string
		description: string
		canvas: string
		image: string
	}

	console.log('Received Image:', image)

	const imageData = image ? image.split(',')[1] : ''
	const world = await prisma.world.create({
		data: {
			name,
			description,
			canvas: JSON.stringify(canvas),
			image: imageData ? Buffer.from(imageData, 'base64') : null,
			userId,
		},
		select: { id: true },
	})

	return json(world)
}
