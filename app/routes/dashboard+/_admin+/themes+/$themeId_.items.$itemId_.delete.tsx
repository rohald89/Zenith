import { redirect, type ActionFunctionArgs } from '@remix-run/node'
import { prisma } from '#app/utils/db.server'
import { requireUserWithRole } from '#app/utils/permissions.server'

export async function action({ request, params }: ActionFunctionArgs) {
	await requireUserWithRole(request, 'admin')

	await prisma.item.delete({
		where: { id: params.itemId },
	})

	return redirect(`/dashboard/themes/${params.themeId}`)
}
