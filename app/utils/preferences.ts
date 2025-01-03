import { loader } from '#app/root.js'
import { useRouteLoaderData } from '@remix-run/react'

export function useUserPreferences() {
	const data = useRouteLoaderData<typeof loader>('root')
	return data?.user?.preferences
}
