import { type BreadcrumbHandle } from '../settings+/profile'

export const handle: BreadcrumbHandle = {
	breadcrumb: 'Billing',
}

export default function Billing() {
	return (
		<div>
			<div className="flex flex-col gap-2">
				<h1 className="text-2xl font-bold">Billing</h1>
				<div className="flex flex-col gap-2 text-muted-foreground">
					<p>One day this will be a real billing page.</p>
					<p>Today is not that day.</p>
					<p>Today it is just placeholder text.</p>
					<p>But it will be real one day.</p>
					<p>I promise.</p>
					<p>Just you wait and see.</p>
					<p className="text-xs italic">- Claude</p>
				</div>
			</div>

			<div className="mt-10 flex flex-col gap-4">
				<div className="flex flex-col gap-2">
					<h2 className="text-lg font-semibold">Subscription</h2>
					<p className="text-sm text-muted-foreground">
						Your current subscription plan.
					</p>
				</div>
				<div className="flex flex-col gap-2">
					<h2 className="text-lg font-semibold">Payment Methods</h2>
					<p className="text-sm text-muted-foreground">
						Manage your payment methods.
					</p>
				</div>
				<div className="flex flex-col gap-2">
					<h2 className="text-lg font-semibold">Invoices</h2>
					<p className="text-sm text-muted-foreground">View your invoices.</p>
				</div>
			</div>
		</div>
	)
}
