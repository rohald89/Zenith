import {
	json,
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'
import { Button } from '#app/components/ui/button'
import { prisma } from '#app/utils/db.server'
import { requireUserId } from '#app/utils/auth.server'
import { useState } from 'react'

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request)
	const [user, themes] = await Promise.all([
		prisma.user.findUnique({
			where: { id: userId },
			include: {
				preferences: {
					select: {
						preferredThemeId: true,
						musicProvider: true,
						spotifyPlaylistUrl: true,
						youtubePlaylistUrl: true,
						focusSessionDuration: true,
					},
				},
			},
		}),
		prisma.theme.findMany({
			where: { isActive: true },
			select: { id: true, name: true },
			orderBy: { name: 'asc' },
		}),
	])

	return json({ user, themes })
}

function getPlaylistId(url: string | null | undefined, provider: string) {
	if (!url)
		return provider === 'YOUTUBE' ? 'jfKfPfyJRdk' : '0vvXsWCC9xrXsKd4FyS8kM'

	if (provider === 'YOUTUBE') {
		return url.includes('watch?v=') ? url.split('watch?v=')[1] : url
	}
	return url.includes('playlist/')
		? (url.split('playlist/')[1]?.split('?')[0] ?? url)
		: url
}

export async function action({ request }: ActionFunctionArgs) {
	const userId = await requireUserId(request)
	const formData = await request.formData()
	const musicProvider = formData.get('musicProvider') as string
	const playlistUrl = formData.get(
		musicProvider === 'YOUTUBE' ? 'youtubePlaylistUrl' : 'spotifyPlaylistUrl',
	) as string

	const preferenceData = {
		focusSessionDuration: Number(formData.get('focusSessionDuration')) * 60,
		musicProvider,
		preferredThemeId: (formData.get('themeId') as string) || null,
		spotifyPlaylistUrl:
			musicProvider === 'SPOTIFY'
				? getPlaylistId(playlistUrl, 'SPOTIFY')
				: '0vvXsWCC9xrXsKd4FyS8kM',
		youtubePlaylistUrl:
			musicProvider === 'YOUTUBE'
				? getPlaylistId(playlistUrl, 'YOUTUBE')
				: 'jfKfPfyJRdk',
	}

	await prisma.userPreferences.upsert({
		where: { userId },
		create: { userId, ...preferenceData },
		update: preferenceData,
	})

	return json({ success: true })
}

export default function Preferences() {
	const { user, themes } = useLoaderData<typeof loader>()
	const prefs = user?.preferences
	const [currentProvider, setCurrentProvider] = useState(
		prefs?.musicProvider ?? 'SPOTIFY',
	)

	return (
		<div className="container py-8">
			<h1 className="text-h1">Preferences</h1>
			<Form method="POST" className="mt-8 max-w-md space-y-6">
				<div>
					<label className="block text-sm font-medium">Theme</label>
					<select
						name="themeId"
						defaultValue={prefs?.preferredThemeId ?? ''}
						className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2"
					>
						<option value="">Random (Default)</option>
						{themes.map((theme) => (
							<option key={theme.id} value={theme.id}>
								{theme.name}
							</option>
						))}
					</select>
				</div>

				<div>
					<label className="block text-sm font-medium">
						Focus Session Duration (minutes)
					</label>
					<input
						type="number"
						name="focusSessionDuration"
						defaultValue={
							prefs?.focusSessionDuration ? prefs.focusSessionDuration / 60 : 25
						}
						className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2"
					/>
				</div>

				<div>
					<label className="block text-sm font-medium">Music Provider</label>
					<select
						name="musicProvider"
						defaultValue={currentProvider}
						onChange={(e) => setCurrentProvider(e.target.value)}
						className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2"
					>
						<option value="SPOTIFY">Spotify</option>
						<option value="YOUTUBE">YouTube</option>
					</select>
				</div>

				<div>
					<label className="block text-sm font-medium">Playlist URL</label>
					<input
						type="url"
						name={
							currentProvider === 'YOUTUBE'
								? 'youtubePlaylistUrl'
								: 'spotifyPlaylistUrl'
						}
						defaultValue=""
						className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2"
					/>
				</div>

				<Button type="submit">Save Preferences</Button>
			</Form>
		</div>
	)
}
