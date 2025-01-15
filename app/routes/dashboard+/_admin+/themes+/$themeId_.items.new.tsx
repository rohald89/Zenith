import { json, redirect, type ActionFunctionArgs } from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'
import { z } from 'zod'
import { parseWithZod } from '@conform-to/zod'
import { createId as cuid } from '@paralleldrive/cuid2'
import {
	unstable_createMemoryUploadHandler as createMemoryUploadHandler,
	unstable_parseMultipartFormData as parseMultipartFormData,
} from '@remix-run/node'
import { Button } from '#app/components/ui/button'
import { prisma } from '#app/utils/db.server'
import { invariantResponse } from '@epic-web/invariant'
import { Field } from '#app/components/forms'
import { requireUserWithRole } from '#app/utils/permissions.server'

const MAX_UPLOAD_SIZE = 1024 * 1024 * 3 // 3MB

const ItemSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	description: z.string().min(1, 'Description is required'),
	rarity: z.enum(['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY']),
	droprate: z.coerce
		.number()
		.min(0, 'Drop rate must be at least 0')
		.max(100, 'Drop rate cannot exceed 100'),
	categoryId: z.string().min(1, 'Category is required'),
	image: z
		.instanceof(File)
		.refine(
			(file) => file.size <= MAX_UPLOAD_SIZE,
			'File size must be less than 3MB',
		)
		.refine(
			(file) => ['image/jpeg', 'image/png', 'image/gif'].includes(file.type),
			'Only JPEG, PNG, and GIF images are allowed',
		),
})

export async function loader({ params }: ActionFunctionArgs) {
	const theme = await prisma.theme.findUnique({
		where: { id: params.themeId },
		include: {
			themeCategories: {
				select: {
					id: true,
					name: true,
				},
			},
		},
	})

	invariantResponse(theme, 'Theme not found', { status: 404 })

	return json({
		theme,
		rarityOptions: ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY'],
	})
}

export async function action({ request, params }: ActionFunctionArgs) {
	await requireUserWithRole(request, 'admin')

	const uploadHandler = createMemoryUploadHandler({
		maxPartSize: MAX_UPLOAD_SIZE,
	})
	const formData = await parseMultipartFormData(request, uploadHandler)

	const submission = await parseWithZod(formData, {
		schema: ItemSchema,
	})

	if (submission.status !== 'success') {
		return json(
			{ result: submission.reply() },
			{ status: submission.status === 'error' ? 400 : 200 },
		)
	}

	const { image, ...itemData } = submission.value

	const item = await prisma.item.create({
		data: {
			name: itemData.name,
			description: itemData.description,
			rarity: itemData.rarity,
			droprate: itemData.droprate,
			themeCategoryId: itemData.categoryId,
			images: {
				create: {
					id: cuid(),
					contentType: image.type,
					blob: Buffer.from(await image.arrayBuffer()),
				},
			},
		},
	})

	return redirect(`/dashboard/themes/${params.themeId}`)
}

export default function NewItem() {
	const { theme, rarityOptions } = useLoaderData<typeof loader>()

	return (
		<div className="container py-8">
			<h1 className="text-h1">Add New Item</h1>
			<Form
				method="POST"
				className="mt-8 grid max-w-md gap-4"
				encType="multipart/form-data"
			>
				<Field
					labelProps={{ children: 'Name' }}
					inputProps={{
						name: 'name',
						placeholder: 'Enter item name',
					}}
				/>

				<Field
					labelProps={{ children: 'Description' }}
					inputProps={{
						name: 'description',
						placeholder: 'Enter item description',
					}}
				/>

				<div className="flex flex-col gap-2">
					<label htmlFor="rarity">Rarity</label>
					<select
						id="rarity"
						name="rarity"
						className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					>
						<option value="">Select rarity</option>
						{rarityOptions.map((rarity) => (
							<option key={rarity} value={rarity}>
								{rarity.charAt(0) + rarity.slice(1).toLowerCase()}
							</option>
						))}
					</select>
				</div>

				<Field
					labelProps={{ children: 'Drop Rate (%)' }}
					inputProps={{
						name: 'droprate',
						type: 'number',
						step: '0.01',
						min: '0',
						max: '100',
						placeholder: 'Enter drop rate percentage',
					}}
				/>
				<div className="rounded-lg border border-muted-foreground p-3 text-sm">
					<h4 className="mb-1 font-medium">Suggested Drop Rates</h4>
					<div className="grid grid-cols-2 gap-x-8 gap-y-1 text-muted-foreground">
						<div>Common: 40-60%</div>
						<div>Uncommon: 20-40%</div>
						<div>Rare: 10-20%</div>
						<div>Epic: 5-10%</div>
						<div>Legendary: 1-5%</div>
					</div>
				</div>

				<div className="flex flex-col gap-2">
					<label htmlFor="categoryId">Category</label>
					<select
						id="categoryId"
						name="categoryId"
						className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					>
						<option value="">Select category</option>
						{theme.themeCategories.map((category) => (
							<option key={category.id} value={category.id}>
								{category.name}
							</option>
						))}
					</select>
				</div>

				<div className="flex flex-col gap-2">
					<label htmlFor="image">Image</label>
					<input
						id="image"
						name="image"
						type="file"
						accept="image/*"
						className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					/>
				</div>

				<div className="flex gap-4">
					<Button type="submit">Create Item</Button>
					<Button variant="outline" type="reset">
						Reset
					</Button>
				</div>
			</Form>
		</div>
	)
}
