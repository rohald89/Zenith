import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { Button } from '#app/components/ui/button'
import { prisma } from '#app/utils/db.server'
import { invariantResponse } from '@epic-web/invariant'
import { type BreadcrumbHandle } from '#app/routes/settings+/profile.js'
import { SEOHandle } from '@nasa-gcn/remix-seo'

export const handle: BreadcrumbHandle & SEOHandle = {
	breadcrumb: 'Theme Details',
}

export async function loader({ params }: LoaderFunctionArgs) {
	const theme = await prisma.theme.findUnique({
		where: { id: params.themeId },
		include: {
			themeCategories: {
				include: {
					_count: {
						select: { items: true },
					},
				},
			},
		},
	})

	invariantResponse(theme, 'Theme not found', { status: 404 })

	return json({ theme })
}

export default function ThemeDetails() {
	const { theme } = useLoaderData<typeof loader>()

	return (
		<div className="container py-8">
			<div className="flex justify-between">
				<h1 className="text-h1">{theme.name}</h1>
				<Button asChild variant="outline">
					<Link to="edit">Edit Theme</Link>
				</Button>
			</div>

			<div className="mt-8 grid gap-6">
				<div>
					<h2 className="text-xl font-semibold">Description</h2>
					<p className="mt-2 text-muted-foreground">{theme.description}</p>
				</div>

				<div>
					<h2 className="text-xl font-semibold">Categories</h2>
					<ul className="mt-4 grid gap-4 md:grid-cols-2">
						{theme.themeCategories.map((category) => (
							<li
								key={category.id}
								className="rounded-lg border border-muted-foreground/20 p-4"
							>
								<h3 className="font-medium">{category.name}</h3>
								<p className="text-sm text-muted-foreground">
									{category.description}
								</p>
								<p className="mt-2 text-sm">
									{category._count.items} items in this category
								</p>
							</li>
						))}
					</ul>
				</div>
			</div>
		</div>
	)
}
