import { json, redirect, type ActionFunctionArgs } from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'
import { Button } from '#app/components/ui/button'
import { prisma } from '#app/utils/db.server'
import { invariantResponse } from '@epic-web/invariant'
import { Field } from '#app/components/forms'
import { SEOHandle } from '@nasa-gcn/remix-seo'
import { type BreadcrumbHandle } from '#app/routes/settings+/profile.js'
import { createId as cuid } from '@paralleldrive/cuid2'
import {
	unstable_createMemoryUploadHandler as createMemoryUploadHandler,
	unstable_parseMultipartFormData as parseMultipartFormData,
} from '@remix-run/node'

const MAX_UPLOAD_SIZE = 1024 * 1024 * 3 // 3MB

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
			backgrounds: {
				select: {
					id: true,
					name: true,
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

	if (intent === 'delete-background') {
		const backgroundId = formData.get('backgroundId')
		await prisma.background.delete({
			where: { id: backgroundId as string },
		})
		return json({ success: true })
	}

	if (intent === 'add-background') {
		const uploadHandler = createMemoryUploadHandler({
			maxPartSize: MAX_UPLOAD_SIZE,
		})
		const backgroundFormData = await parseMultipartFormData(
			request,
			uploadHandler,
		)
		const backgroundName = backgroundFormData.get('backgroundName')
		const backgroundFile = backgroundFormData.get('backgroundFile')

		if (backgroundFile instanceof File) {
			await prisma.background.create({
				data: {
					id: cuid(),
					name: backgroundName as string,
					contentType: backgroundFile.type,
					blob: Buffer.from(await backgroundFile.arrayBuffer()),
					themeId: params.themeId as string,
				},
			})
		}
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

			<div className="mt-8">
				<h2 className="text-h2">Backgrounds</h2>
				<div className="mt-4 grid gap-4">
					{theme.backgrounds.map((background) => (
						<div
							key={background.id}
							className="flex items-center justify-between rounded-lg border border-muted-foreground p-4"
						>
							<div className="flex items-center gap-4">
								<img
									src={`/resources/background-images/${background.id}`}
									alt=""
									className="h-32 w-48 rounded-lg object-cover"
								/>
								<p className="font-bold">{background.name}</p>
							</div>
							<Form method="POST">
								<input
									type="hidden"
									name="backgroundId"
									value={background.id}
								/>
								<Button
									type="submit"
									name="intent"
									value="delete-background"
									variant="destructive"
									size="sm"
								>
									Delete
								</Button>
							</Form>
						</div>
					))}
				</div>

				<Form
					method="POST"
					className="mt-4 grid gap-4"
					encType="multipart/form-data"
				>
					<Field
						labelProps={{ children: 'Background Name' }}
						inputProps={{
							name: 'backgroundName',
							placeholder: 'Enter background name',
						}}
					/>
					<div className="flex flex-col gap-2">
						<label htmlFor="backgroundFile">Background Image</label>
						<input
							id="backgroundFile"
							name="backgroundFile"
							type="file"
							accept="image/*"
							className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						/>
					</div>
					<Button type="submit" name="intent" value="add-background">
						Add Background
					</Button>
				</Form>
			</div>
		</div>
	)
}
