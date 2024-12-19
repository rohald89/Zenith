import { type MetaFunction } from '@remix-run/node'
import { Link } from '@remix-run/react'

export const meta: MetaFunction = () => [{ title: 'Zenith - Gamified Productivity' }]

export default function Index() {
	return (
		<main className="flex flex-col items-center px-6">
			{/* Hero Section */}
			<section className="my-16 max-w-4xl text-center">
				<h1 className="mb-6 text-5xl font-bold sm:text-6xl">
					Build Your Universe of Productivity
				</h1>
				<p className="mb-8 text-xl text-muted-foreground">
					Transform your focus time into worlds of wonder. With Zenith, every
					completed task, habit, and study session helps you craft unique digital
					realms that grow with your achievements.
				</p>
				<div className="flex flex-wrap justify-center gap-4">
					<Link
						to="/signup"
						className="rounded-lg bg-blue-500 px-8 py-3 font-semibold text-white hover:bg-blue-600"
					>
						Get Started - It's Free
					</Link>
					<Link
						to="#demo"
						className="rounded-lg border border-blue-500 px-8 py-3 font-semibold text-blue-500 hover:bg-blue-50"
					>
						Watch Demo
					</Link>
				</div>
				<ul className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-muted-foreground">
					<li>• Multiple themes to express your journey</li>
					<li>• Real productivity tools, real results</li>
					<li>• Build something beautiful, one task at a time</li>
				</ul>
			</section>

			{/* Features Section */}
			<section className="grid max-w-6xl gap-16 py-16">
				<div className="grid gap-12 md:grid-cols-2">
					<div>
						<h2 className="mb-4 text-2xl font-bold">Turn Time into Creation</h2>
						<p className="mb-4 text-muted-foreground">
							Every focused session rewards you with unique elements to build your
							world. Choose from cosmic wonders, enchanted gardens, underwater
							reefs, and more. Your productivity has never been more visible—or
							beautiful.
						</p>
						<ul className="text-sm text-muted-foreground">
							<li>• Pomodoro timer with purpose</li>
							<li>• Earn rare items through consistency</li>
							<li>• Watch your world grow with every session</li>
						</ul>
					</div>
					{/* Add image here */}
				</div>
			</section>

			{/* CTA Section */}
			<section className="my-16 text-center">
				<h2 className="mb-6 text-3xl font-bold">Begin Your Journey</h2>
				<p className="mb-8 text-muted-foreground">
					Start building your productivity universe today. Your first world awaits.
				</p>
				<Link
					to="/signup"
					className="inline-block rounded-lg bg-blue-500 px-8 py-3 font-semibold text-white hover:bg-blue-600"
				>
					Create Free Account
				</Link>
				<ul className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-muted-foreground">
					<li>• No credit card required</li>
					<li>• 5 daily tasks included</li>
					<li>• Basic world theme unlocked</li>
				</ul>
			</section>
		</main>
	)
}
