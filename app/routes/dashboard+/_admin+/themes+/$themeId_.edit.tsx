import { json, redirect, type ActionFunctionArgs } from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'
import { Button } from '#app/components/ui/button'
import { prisma } from '#app/utils/db.server'
import { invariantResponse } from '@epic-web/invariant'
import { Field } from '#app/components/forms'
import { SEOHandle } from '@nasa-gcn/remix-seo'
import { type BreadcrumbHandle } from '#app/routes/settings+/profile.js'

export const handle: BreadcrumbHandle & SEOHandle = {
	breadcrumb: 'Edit',
	getSitemapEntries: () => null,
}

export async function loader({ params }: ActionFunctionArgs) {
	const theme = await prisma.theme.findUnique({
		where: { id: params.themeId },
	})

	invariantResponse(theme, 'Theme not found', { status: 404 })

	return json({ theme })
}

export async function action({ request, params }: ActionFunctionArgs) {
	const formData = await request.formData()
	const name = formData.get('name')
	const description = formData.get('description')
	const isActive = formData.get('isActive') === 'on'

	await prisma.theme.update({
		where: { id: params.themeId },
		data: {
			name: name as string,
			description: description as string,
			isActive,
		},
	})

	return redirect('..')
}

export default function EditTheme() {
	const { theme } = useLoaderData<typeof loader>()

	return (
		<div className="container py-8">
			<h1 className="text-h1">Edit Theme</h1>
			<Form method="POST" className="mt-8 grid max-w-md gap-4">
				<Field
					labelProps={{ children: 'Name' }}
					inputProps={{
						name: 'name',
						defaultValue: theme.name,
					}}
				/>

				<Field
					labelProps={{ children: 'Description' }}
					inputProps={{
						name: 'description',
						defaultValue: theme.description,
					}}
				/>

				<div className="flex items-center gap-2">
					<input
						type="checkbox"
						name="isActive"
						id="isActive"
						defaultChecked={theme.isActive}
					/>
					<label htmlFor="isActive">Active</label>
				</div>

				<div className="flex gap-4">
					<Button type="submit">Save Changes</Button>
					<Button variant="outline" type="reset">
						Reset
					</Button>
				</div>
			</Form>
		</div>
	)
}
