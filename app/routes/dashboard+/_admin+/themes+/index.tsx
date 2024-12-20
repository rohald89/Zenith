import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { Button } from '#app/components/ui/button'
import { prisma } from '#app/utils/db.server'
import { BreadcrumbHandle } from '#app/routes/settings+/profile.js'

export const handle: BreadcrumbHandle = {
	breadcrumb: 'Themes',
}

export async function loader({ request }: LoaderFunctionArgs) {
	const themes = await prisma.theme.findMany({
		select: {
			id: true,
			name: true,
			description: true,
			isActive: true,
			_count: {
				select: {
					themeCategories: true,
				},
			},
		},
		orderBy: { name: 'asc' },
	})

	return json({ themes })
}

export default function ThemesIndex() {
	const { themes } = useLoaderData<typeof loader>()

	return (
		<div className="container py-8">
			<div className="flex justify-between">
				<h1 className="text-h1">Themes</h1>
				<Button asChild>
					<Link to="new">Create new theme</Link>
				</Button>
			</div>

			<div className="mt-8">
				<table className="w-full">
					<thead>
						<tr className="border-b">
							<th className="pb-4 text-left">Name</th>
							<th className="pb-4 text-left">Description</th>
							<th className="pb-4 text-center">Categories</th>
							<th className="pb-4 text-center">Status</th>
							<th className="pb-4 text-right">Actions</th>
						</tr>
					</thead>
					<tbody>
						{themes.map((theme) => (
							<tr key={theme.id} className="border-b">
								<td className="py-4">{theme.name}</td>
								<td className="py-4">{theme.description}</td>
								<td className="py-4 text-center">
									{theme._count.themeCategories}
								</td>
								<td className="py-4 text-center">
									<span
										className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${
											theme.isActive
												? 'bg-green-100 text-green-800'
												: 'bg-red-100 text-red-800'
										}`}
									>
										{theme.isActive ? 'Active' : 'Inactive'}
									</span>
								</td>
								<td className="py-4 text-right">
									<div className="flex justify-end gap-2">
										<Button asChild variant="ghost" size="sm">
											<Link to={theme.id}>View</Link>
										</Button>
										<Button asChild variant="ghost" size="sm">
											<Link to={`${theme.id}/edit`}>Edit</Link>
										</Button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	)
}
