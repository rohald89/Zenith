import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { Form, Link, useLoaderData } from '@remix-run/react'
import { Button } from '#app/components/ui/button.tsx'
import { prisma } from '#app/utils/db.server.ts'
import { requireUserWithRole } from '#app/utils/permissions.server.ts'
import { invariantResponse } from '@epic-web/invariant'

export async function loader({ request, params }: LoaderFunctionArgs) {
	await requireUserWithRole(request, 'admin')

	const theme = await prisma.theme.findUnique({
		where: { id: params.themeId },
		select: {
			id: true,
			name: true,
			description: true,
			isActive: true,
			themeCategories: {
				select: {
					id: true,
					name: true,
					items: {
						select: {
							id: true,
							name: true,
							description: true,
							rarity: true,
							droprate: true,
							images: {
								select: {
									id: true,
								},
							},
						},
					},
				},
			},
		},
	})

	invariantResponse(theme, 'Not found', { status: 404 })

	return json({ theme })
}

export default function ThemeDetails() {
	const { theme } = useLoaderData<typeof loader>()

	return (
		<div className="flex flex-col gap-4">
			<div className="flex justify-between">
				<h2 className="text-h2">{theme.name}</h2>
				<div className="flex gap-4">
					<Button asChild>
						<Link to="edit">Edit Theme</Link>
					</Button>
					<Button asChild>
						<Link to="items/new">Add Item</Link>
					</Button>
				</div>
			</div>

			<div className="flex flex-col gap-4">
				<p>{theme.description}</p>
				<p>Status: {theme.isActive ? 'Active' : 'Inactive'}</p>
			</div>

			<div className="flex flex-col gap-4">
				<h3 className="text-h3">Categories</h3>

				{theme.themeCategories.map((category) => (
					<div key={category.id} className="flex flex-col gap-4">
						<h4 className="text-h4">
							{category.name} ({category.items.length} items)
						</h4>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
							{category.items.map((item) => (
								<div
									key={item.id}
									className="flex flex-col gap-4 rounded-lg border border-muted-foreground p-4"
								>
									<div className="flex flex-wrap gap-4">
										{item.images.map((image) => (
											<img
												key={image.id}
												src={`/resources/item-images/${image.id}`}
												alt=""
												className="h-32 w-32 rounded-lg object-cover"
											/>
										))}
									</div>
									<div className="flex flex-col gap-2">
										<h5 className="text-h5">{item.name}</h5>
										<p>{item.description}</p>
										<p>Rarity: {item.rarity}</p>
										<p>Drop Rate: {item.droprate}%</p>
										<div className="flex gap-2">
											<Button asChild>
												<Link to={`items/${item.id}/edit`}>Edit Item</Link>
											</Button>
											<Form method="POST" action={`items/${item.id}/delete`}>
												<Button type="submit" variant="destructive">
													Delete Item
												</Button>
											</Form>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
