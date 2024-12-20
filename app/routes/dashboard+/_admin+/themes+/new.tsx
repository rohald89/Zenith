import { json, redirect, type ActionFunctionArgs } from '@remix-run/node'
import { Form } from '@remix-run/react'
import { Button } from '#app/components/ui/button'
import { Field } from '#app/components/forms'
import { prisma } from '#app/utils/db.server'
import { parseWithZod } from '@conform-to/zod'
import { z } from 'zod'
import { BreadcrumbHandle } from '#app/routes/settings+/profile.js'

export const handle: BreadcrumbHandle = {
	breadcrumb: 'New Theme',
}

const CreateThemeSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	description: z.string().min(1, 'Description is required'),
	isActive: z.boolean().default(false),
})

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()
	const submission = await parseWithZod(formData, {
		schema: CreateThemeSchema,
	})

	if (submission.status !== 'success') {
		return json(
			{ result: submission.reply() },
			{ status: submission.status === 'error' ? 400 : 200 },
		)
	}

	await prisma.theme.create({
		data: submission.value,
	})

	return redirect('..')
}

export default function NewTheme() {
	return (
		<div className="container py-8">
			<h1 className="text-h1">Create New Theme</h1>
			<Form method="POST" className="mt-8 grid max-w-md gap-4">
				<Field
					labelProps={{ children: 'Name' }}
					inputProps={{
						name: 'name',
						placeholder: 'Space, Garden, Ocean...',
					}}
				/>

				<Field
					labelProps={{ children: 'Description' }}
					inputProps={{
						name: 'description',
						placeholder: 'Create your own galaxy with celestial objects...',
					}}
				/>

				<div className="flex items-center gap-2">
					<input type="checkbox" name="isActive" id="isActive" />
					<label htmlFor="isActive">Active</label>
				</div>

				<div className="flex gap-4">
					<Button type="submit">Create Theme</Button>
					<Button variant="outline" type="reset">
						Reset
					</Button>
				</div>
			</Form>
		</div>
	)
}
