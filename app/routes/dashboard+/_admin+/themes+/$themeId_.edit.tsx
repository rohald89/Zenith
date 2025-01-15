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
		include: {
			themeCategories: {
				select: {
					id: true,
					name: true,
					_count: {
						select: {
							items: true,
						},
					},
				},
			},
		},
	})

	invariantResponse(theme, 'Theme not found', { status: 404 })

	return json({ theme })
}

export async function action({ request, params }: ActionFunctionArgs) {
	const formData = await request.formData()
	const intent = formData.get('intent')

	if (intent === 'delete-category') {
		const categoryId = formData.get('categoryId')
		await prisma.themeCategory.delete({
			where: { id: categoryId as string },
		})
		return json({ success: true })
	}

	if (intent === 'add-category') {
		const name = formData.get('categoryName')
		const description = formData.get('categoryDescription')
		await prisma.themeCategory.create({
			data: {
				name: name as string,
				description: (description as string) || `Category for ${name}`,
				themeId: params.themeId as string,
			},
		})
		return json({ success: true })
	}

	// Update theme
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

			<div className="mt-8">
				<h2 className="text-h2">Categories</h2>
				<div className="mt-4 grid gap-4">
					{theme.themeCategories.map((category) => (
						<div
							key={category.id}
							className="flex items-center justify-between rounded-lg border border-muted-foreground p-4"
						>
							<div>
								<p className="font-bold">{category.name}</p>
								<p className="text-sm text-muted-foreground">
									{category._count.items} items
								</p>
							</div>
							<Form method="POST">
								<input type="hidden" name="categoryId" value={category.id} />
								<Button
									type="submit"
									name="intent"
									value="delete-category"
									variant="destructive"
									size="sm"
								>
									Delete
								</Button>
							</Form>
						</div>
					))}
				</div>

				<Form method="POST" className="mt-4 grid gap-4">
					<Field
						labelProps={{ children: 'Category Name' }}
						inputProps={{
							name: 'categoryName',
							placeholder: 'Enter category name',
						}}
					/>
					<Field
						labelProps={{ children: 'Category Description' }}
						inputProps={{
							name: 'categoryDescription',
							placeholder: 'Enter category description (optional)',
						}}
					/>
					<Button type="submit" name="intent" value="add-category">
						Add Category
					</Button>
				</Form>
			</div>
		</div>
	)
}
