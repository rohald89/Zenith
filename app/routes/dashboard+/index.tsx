import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { clsx } from 'clsx'
import { Canvas } from '#app/components/canvas.js'
import { Timer } from '#app/components/timer'
import { ScrollArea } from '#app/components/ui/scroll-area.js'
import { requireUserId } from '#app/utils/auth.server'
import { prisma } from '#app/utils/db.server'
import { getTimeOfDayGreeting } from '#app/utils/misc'

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request)
	const user = await prisma.user.findUniqueOrThrow({
		where: { id: userId },
		select: {
			name: true,
			username: true,
			preferences: {
				select: {
					musicProvider: true,
					spotifyPlaylistUrl: true,
					youtubePlaylistUrl: true,
					preferredThemeId: true,
				},
			},
		},
	})

	const userItems = await prisma.userItem.findMany({
		where: {
			userId,
			...(user.preferences?.preferredThemeId
				? {
						item: {
							themeCategory: {
								themeId: user.preferences.preferredThemeId,
							},
						},
					}
				: {}),
		},
		take: 12,
		orderBy: { updatedAt: 'desc' },
		select: {
			id: true,
			quantity: true,
			item: {
				select: {
					name: true,
					rarity: true,
					images: {
						select: { id: true },
						take: 1,
					},
					themeCategory: {
						select: {
							name: true,
							theme: {
								select: { name: true },
							},
						},
					},
				},
			},
		},
	})

	return json({ user, userItems })
}

export default function Dashboard() {
	const { user, userItems } = useLoaderData<typeof loader>()
	const displayName = user.name ?? user.username

	return (
		<>
			<div className="text-2xl font-bold">
				{getTimeOfDayGreeting()}, {displayName} 🤩
			</div>
			<div className="grid max-h-[450px] gap-4 md:grid-cols-3">
				<div className="max-h-[450px] flex-1 rounded-xl bg-muted/50 p-4 md:min-h-min">
					<ScrollArea className="h-full">
						{userItems.map((userItem) => (
							<div
								key={userItem.id}
								className="relative rounded-xl bg-muted/50 p-4"
							>
								<div className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs font-semibold text-white">
									{userItem.quantity}
								</div>
								<div className="flex gap-4">
									{userItem.item.images[0] ? (
										<img
											src={`/resources/item-images/${userItem.item.images[0].id}`}
											alt={userItem.item.name}
											className="h-[50px] w-[50px] rounded-lg object-cover"
										/>
									) : (
										<div className="h-[50px] w-[50px] rounded-lg bg-muted" />
									)}
									<div className="flex flex-col justify-center">
										<h3
											className={clsx('font-semibold', {
												'text-white': userItem.item.rarity === 'COMMON',
												'text-blue-500': userItem.item.rarity === 'RARE',
												'text-purple-500': userItem.item.rarity === 'EPIC',
												'text-orange-500': userItem.item.rarity === 'LEGENDARY',
											})}
										>
											{userItem.item.name}
										</h3>
										<p className="text-sm text-muted-foreground">
											{userItem.item.themeCategory.theme.name} •{' '}
											{userItem.item.themeCategory.name}
										</p>
									</div>
								</div>
							</div>
						))}
					</ScrollArea>
				</div>
				<div className="max-h-[450px] flex-1 rounded-xl bg-muted/50 p-4 md:min-h-min">
					<MusicPlayer
						musicProvider={user.preferences?.musicProvider ?? 'SPOTIFY'}
						spotifyPlaylistUrl={
							user.preferences?.spotifyPlaylistUrl ?? '0vvXsWCC9xrXsKd4FyS8kM'
						}
						youtubePlaylistUrl={
							user.preferences?.youtubePlaylistUrl ?? 'jfKfPfyJRdk'
						}
					/>
				</div>
				<div className="max-h-[450px] flex-1 rounded-xl bg-muted/50 p-4 md:min-h-min">
					<Timer />
				</div>
			</div>
			<div className="mt-4 min-h-[50vh] flex-1 rounded-xl bg-muted/50 p-4 md:min-h-min">
				<Canvas userItems={userItems} />
			</div>
		</>
	)
}

function MusicPlayer({
	musicProvider,
	spotifyPlaylistUrl,
	youtubePlaylistUrl,
}: {
	musicProvider: string
	spotifyPlaylistUrl: string
	youtubePlaylistUrl: string
}) {
	if (musicProvider === 'YOUTUBE') {
		return (
			<iframe
				src={`https://www.youtube.com/embed/${youtubePlaylistUrl}?autoplay=1`}
				width="100%"
				height="100%"
				frameBorder="0"
				allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
				loading="lazy"
				title="YouTube lofi stream embed"
			/>
		)
	}

	return (
		<iframe
			src={`https://open.spotify.com/embed/playlist/${spotifyPlaylistUrl}`}
			width="100%"
			height="100%"
			frameBorder="0"
			allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
			loading="lazy"
			title="Spotify lofi playlist embed"
		/>
	)
}
