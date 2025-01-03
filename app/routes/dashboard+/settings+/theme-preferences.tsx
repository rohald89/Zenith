import {
	json,
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'
import { Button } from '#app/components/ui/button'
import { prisma } from '#app/utils/db.server'
import { requireUserId } from '#app/utils/auth.server'
import { Field } from '#app/components/forms'

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request)
	const [user, themes] = await Promise.all([
		prisma.user.findUnique({
			where: { id: userId },
			select: { preferredThemeId: true },
		}),
		prisma.theme.findMany({
			where: { isActive: true },
			select: { id: true, name: true },
			orderBy: { name: 'asc' },
		}),
	])

	return json({ user, themes })
}

export async function action({ request }: ActionFunctionArgs) {
	const userId = await requireUserId(request)
	const formData = await request.formData()
	const themeId = formData.get('themeId')

	await prisma.user.update({
		where: { id: userId },
		data: { preferredThemeId: themeId as string },
	})

	return json({ success: true })
}

export default function ThemePreferences() {
	const { user, themes } = useLoaderData<typeof loader>()

	return (
		<div className="container py-8">
			<h1 className="text-h1">Theme Preferences</h1>
			<Form method="POST" className="mt-8 max-w-md">
				<div className="mt-8 max-w-md">
					<label className="block text-sm font-medium" htmlFor="themeId">
						Preferred Theme
					</label>
					<select
						name="themeId"
						id="themeId"
						defaultValue={user?.preferredThemeId ?? ''}
						className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2"
					>
						<option value="">Random (Default)</option>
						{themes.map((theme) => (
							<option key={theme.id} value={theme.id}>
								{theme.name}
							</option>
						))}
					</select>
				</div>
				<Button type="submit" className="mt-4">
					Save Preference
				</Button>
			</Form>
		</div>
	)
}
