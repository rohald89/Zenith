import {
	type LoaderFunctionArgs,
	type ActionFunctionArgs,
	json,
} from '@remix-run/node'
import { requireUserId } from '#app/utils/auth.server'
import { prisma } from '#app/utils/db.server'

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request)
	const activeSession = await prisma.focusSession.findFirst({
		where: {
			userId,
			completed: false,
		},
		orderBy: { startTime: 'desc' },
	})

	return json({ activeSession })
}

export async function action({ request }: ActionFunctionArgs) {
	const userId = await requireUserId(request)
	const formData = await request.formData()
	const intent = formData.get('intent')

	if (intent === 'complete') {
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { preferredThemeId: true },
		})

		const themeId = user?.preferredThemeId ?? (await getRandomActiveThemeId())

		const category = await prisma.themeCategory.findFirst({
			where: { themeId },
			include: { items: true },
		})

		if (category?.items.length) {
			const randomItem =
				category.items[Math.floor(Math.random() * category.items.length)]

			await prisma.userItem.upsert({
				where: {
					userId_itemId: {
						userId,
						itemId: randomItem.id,
					},
				},
				create: {
					userId,
					itemId: randomItem.id,
					quantity: 1,
				},
				update: {
					quantity: {
						increment: 1,
					},
				},
			})
		}

		// Complete the session
		const session = await prisma.focusSession.findFirst({
			where: { userId, completed: false },
		})

		if (session) {
			await prisma.focusSession.update({
				where: { id: session.id },
				data: { completed: true },
			})
		}
	}

	switch (intent) {
		case 'start': {
			const duration = Number(formData.get('duration'))
			const session = await prisma.focusSession.create({
				data: {
					userId,
					duration,
				},
			})
			return json({ activeSession: session })
		}
		case 'stop': {
			const session = await prisma.focusSession.findFirst({
				where: { userId, completed: false },
				select: { id: true },
			})

			if (!session) {
				return json({ error: 'No active session' }, { status: 400 })
			}

			await prisma.focusSession.delete({
				where: { id: session.id },
			})

			return json({ activeSession: null })
		}
		case 'complete': {
			const session = await prisma.focusSession.findFirst({
				where: { userId, completed: false },
				select: { id: true, startTime: true, duration: true },
			})

			if (!session) {
				return json({ error: 'No active session' }, { status: 400 })
			}

			if (intent === 'complete') {
				const elapsedSeconds = Math.floor(
					(Date.now() - session.startTime.getTime()) / 1000,
				)
				if (elapsedSeconds < session.duration) {
					return json(
						{ error: 'Session duration not reached' },
						{ status: 400 },
					)
				}
			}

			return json(
				await prisma.focusSession.update({
					where: { id: session.id },
					data: { completed: true },
				}),
			)
		}
		default: {
			return json({ error: 'Invalid intent' }, { status: 400 })
		}
	}
}

async function getRandomActiveThemeId() {
	const themes = await prisma.theme.findMany({
		where: { isActive: true },
		select: { id: true },
	})
	const randomTheme = themes[Math.floor(Math.random() * themes.length)]
	return randomTheme?.id
}
