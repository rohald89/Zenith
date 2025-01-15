import { LoaderFunctionArgs } from '@remix-run/node'
import { prisma } from '#app/utils/db.server'
import { invariantResponse } from '@epic-web/invariant'

export async function loader({ params }: LoaderFunctionArgs) {
	const background = await prisma.background.findUnique({
		where: { id: params.backgroundId },
		select: { blob: true, contentType: true },
	})

	invariantResponse(background, 'Background not found', { status: 404 })

	return new Response(background.blob, {
		headers: {
			'Content-Type': background.contentType,
			'Content-Length': Buffer.byteLength(background.blob).toString(),
			'Content-Disposition': 'inline',
			'Cache-Control': 'public, max-age=31536000, immutable',
		},
	})
}
