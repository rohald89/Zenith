import {
	AudioWaveform,
	BellDot,
	BookOpen,
	Bot,
	Clock,
	Command,
	GalleryVerticalEnd,
	Palette,
	Receipt,
	Settings2,
	SquareTerminal,
	User,
	Users,
} from 'lucide-react'

import { NavAccount } from '#app/components/nav-account'
import { NavMain } from '#app/components/nav-main'
import { NavUser } from '#app/components/nav-user'
import { TeamSwitcher } from '#app/components/team-switcher'
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from '#app/components/ui/sidebar'
import { NavAdmin } from './nav-admin'

// This is sample data.
const data = {
	teams: [
		{
			name: 'Zenith',
			logo: GalleryVerticalEnd,
			plan: 'Free',
		},
		// {
		// 	name: 'Acme Corp.',
		// 	logo: AudioWaveform,
		// 	plan: 'Startup',
		// },
		// {
		// 	name: 'Evil Corp.',
		// 	logo: Command,
		// 	plan: 'Free',
		// },
	],
	// navMain: [
	// 	{
	// 		title: 'Playground',
	// 		url: '#',
	// 		icon: SquareTerminal,
	// 		isActive: true,
	// 		items: [
	// 			{
	// 				title: 'History',
	// 				url: '#',
	// 			},
	// 			{
	// 				title: 'Starred',
	// 				url: '#',
	// 			},
	// 			{
	// 				title: 'Settings',
	// 				url: '#',
	// 			},
	// 		],
	// 	},
	// 	{
	// 		title: 'Models',
	// 		url: '#',
	// 		icon: Bot,
	// 		items: [
	// 			{
	// 				title: 'Genesis',
	// 				url: '#',
	// 			},
	// 			{
	// 				title: 'Explorer',
	// 				url: '#',
	// 			},
	// 			{
	// 				title: 'Quantum',
	// 				url: '#',
	// 			},
	// 		],
	// 	},
	// 	{
	// 		title: 'Documentation',
	// 		url: '#',
	// 		icon: BookOpen,
	// 		items: [
	// 			{
	// 				title: 'Introduction',
	// 				url: '#',
	// 			},
	// 			{
	// 				title: 'Get Started',
	// 				url: '#',
	// 			},
	// 			{
	// 				title: 'Tutorials',
	// 				url: '#',
	// 			},
	// 			{
	// 				title: 'Changelog',
	// 				url: '#',
	// 			},
	// 		],
	// 	},
	// 	{
	// 		title: 'Settings',
	// 		url: '#',
	// 		icon: Settings2,
	// 		items: [
	// 			{
	// 				title: 'General',
	// 				url: '#',
	// 			},
	// 			{
	// 				title: 'Team',
	// 				url: '#',
	// 			},
	// 			{
	// 				title: 'Billing',
	// 				url: '#',
	// 			},
	// 			{
	// 				title: 'Limits',
	// 				url: '#',
	// 			},
	// 		],
	// 	},
	// ],
	account: [
		{
			name: 'Account',
			url: '/dashboard',
			icon: User,
		},
		{
			name: 'Preferences',
			url: '/dashboard/preferences',
			icon: Settings2,
		},
		{
			name: 'Billing',
			url: '/dashboard/billing',
			icon: Receipt,
		},
		{
			name: 'Notifications',
			url: '/dashboard/notifications',
			icon: BellDot,
		},
		{
			name: 'Activities',
			url: '/dashboard/activities',
			icon: Clock,
		},
	],
	navAdmin: [
		{
			name: 'Users',
			url: '/dashboard/users',
			icon: Users,
		},
		{
			name: 'Themes',
			url: '/dashboard/themes',
			icon: Palette,
		},
	],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<TeamSwitcher teams={data.teams} />
			</SidebarHeader>
			<SidebarContent>
				{/* <NavMain items={data.navMain} /> */}
				<NavAccount account={data.account} />
				<NavAdmin items={data.navAdmin} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	)
}
