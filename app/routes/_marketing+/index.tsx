import {
	json,
	type LoaderFunctionArgs,
	type ActionFunctionArgs,
	type MetaFunction,
} from '@remix-run/node'
import { Timer } from '#app/components/timer'
import { requireUserId } from '#app/utils/auth.server'
import { prisma } from '#app/utils/db.server'

export const meta: MetaFunction = () => [{ title: 'Epic Notes' }]

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

	if (intent === 'start') {
		return json(
			await prisma.focusSession.create({
				data: {
					userId,
					duration: 1500, // 25 minutes
				},
			}),
		)
	}

	if (intent === 'stop') {
		return json(
			await prisma.focusSession.updateMany({
				where: { userId, completed: false },
				data: { completed: true },
			}),
		)
	}
}

export default function Index() {
	return (
		<main className="font-poppins grid h-full place-items-center">
			<Timer />
		</main>
	)
}
