import {
	GalleryVerticalEnd,
	Palette,
	Receipt,
	Settings2,
	User,
	Users,
} from 'lucide-react'

import { NavAccount } from '#app/components/nav-account'
import { NavUser } from '#app/components/nav-user'
import { TeamSwitcher } from '#app/components/team-switcher'
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
} from '#app/components/ui/sidebar'
import { NavAdmin } from './nav-admin'
import { UserDropdown } from '#app/root.js'

// This is sample data.
const data = {
	teams: [
		{
			name: 'Zenith',
			logo: GalleryVerticalEnd,
			plan: 'Free',
		},
	],
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
				<NavAccount account={data.account} />
				<NavAdmin items={data.navAdmin} />
			</SidebarContent>
			<SidebarFooter>
				<UserDropdown />
			</SidebarFooter>
		</Sidebar>
	)
}
