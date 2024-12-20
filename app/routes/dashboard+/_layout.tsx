import { AppSidebar } from '#app/components/app-sidebar'
import { useMatches } from '@remix-run/react'
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '#app/components/ui/breadcrumb'
import { Separator } from '#app/components/ui/separator'
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from '#app/components/ui/sidebar'
import { Outlet } from '@remix-run/react'
import { z } from 'zod'
import { House } from 'lucide-react'
import { cn } from '#app/utils/misc.js'

const BreadcrumbHandleMatch = z.object({
	handle: z.object({ breadcrumb: z.any() }),
})

export default function DashboardLayout() {
	const matches = useMatches()
	const isDashboard = matches.at(-1)?.pathname === '/dashboard/'

	const breadcrumbs = matches
		.map((match) => {
			const result = BreadcrumbHandleMatch.safeParse(match)
			if (!result.success || !result.data.handle.breadcrumb) return null
			return {
				title: result.data.handle.breadcrumb,
				path: match.pathname,
			}
		})
		.filter(Boolean)

	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
					<div className="flex items-center gap-2 px-4">
						<SidebarTrigger className="-ml-1" />
						<Separator orientation="vertical" className="mr-2 h-4" />
						<Breadcrumb>
							<BreadcrumbList>
								<BreadcrumbItem>
									<BreadcrumbLink href="/dashboard">
										<House
											className={cn('size-4', isDashboard && 'text-foreground')}
										/>
									</BreadcrumbLink>
								</BreadcrumbItem>
								{breadcrumbs.map((breadcrumb, i) => (
									<div className="flex items-center gap-2" key={i}>
										<BreadcrumbSeparator />
										<BreadcrumbItem key={breadcrumb.path}>
											{i === breadcrumbs.length - 1 ? (
												<BreadcrumbPage>{breadcrumb.title}</BreadcrumbPage>
											) : (
												<BreadcrumbLink href={breadcrumb.path}>
													{breadcrumb.title}
												</BreadcrumbLink>
											)}
										</BreadcrumbItem>
									</div>
								))}
							</BreadcrumbList>
						</Breadcrumb>
					</div>
				</header>
				<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
					<Outlet />
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}
