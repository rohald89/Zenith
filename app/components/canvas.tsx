import { useEffect, useRef, useState } from 'react'
import { Canvas as FabricCanvas, Image as FabricImage } from 'fabric'
import type { FabricImage as FabricImageType } from 'fabric'
import { useNavigate } from 'react-router-dom'

type UserItem = {
	id: string
	quantity: number
	item: {
		name: string
		images: Array<{ id: string }>
	}
}

export function Canvas({ userItems }: { userItems: Array<UserItem> }) {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const fabricRef = useRef<FabricCanvas | null>(null)
	const [itemUsage, setItemUsage] = useState<Record<string, number>>({})
	const [name, setName] = useState('')
	const [description, setDescription] = useState('')
	const navigate = useNavigate()

	useEffect(() => {
		if (!canvasRef.current) return

		fabricRef.current = new FabricCanvas(canvasRef.current, {
			width: canvasRef.current.parentElement?.clientWidth ?? 800,
			height: canvasRef.current.parentElement?.clientHeight ?? 600,
		})

		return () => {
			void fabricRef.current?.dispose()
		}
	}, [])

	async function addImageToCanvas(imageUrl: string, itemId: string) {
		if (!fabricRef.current) return

		const currentUsage = itemUsage[itemId] ?? 0
		const item = userItems.find((i) => i.id === itemId)
		if (!item || currentUsage >= item.quantity) return

		const img = document.createElement('img')
		img.crossOrigin = 'anonymous'
		img.src = imageUrl
		img.onload = () => {
			const fabricImage = new FabricImage(img)
			const scale = Math.min(150 / img.width, 150 / img.height)
			fabricImage.scale(scale)
			fabricRef.current?.add(fabricImage)
			fabricRef.current?.renderAll()
			setItemUsage((prev) => ({ ...prev, [itemId]: (prev[itemId] ?? 0) + 1 }))
		}
		img.onerror = (err) => {
			console.error('Error loading image:', err)
		}
	}

	async function saveWorld() {
		if (!fabricRef.current) return
		const canvasState = fabricRef.current.toJSON()
		const canvasImage = canvasRef.current?.toDataURL('image/png')

		console.log('Canvas Image:', canvasImage)

		const response = await fetch('/resources/worlds', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				name,
				description,
				canvas: canvasState,
				image: canvasImage,
			}),
		})

		if (response.ok) {
			const world = await response.json()
			navigate(`/worlds/${world.id}`)
		}
	}

	return (
		<div className="relative h-full w-full">
			<canvas ref={canvasRef} />

			<div className="absolute bottom-4 left-4">
				<input
					type="text"
					placeholder="World name"
					value={name}
					onChange={(e) => setName(e.target.value)}
					className="mr-2 rounded border p-2"
				/>
				<button
					onClick={saveWorld}
					disabled={!name}
					className="rounded bg-green-500 p-2 text-white hover:bg-green-600 disabled:opacity-50"
				>
					Save World
				</button>
			</div>

			<div className="absolute right-4 top-4 flex max-h-[80vh] flex-col gap-2 overflow-y-auto">
				{userItems.map((item) => {
					const used = itemUsage[item.id] ?? 0
					const remaining = item.quantity - used
					return (
						<button
							key={item.id}
							onClick={() =>
								item.item.images[0] && remaining > 0
									? addImageToCanvas(
											`/resources/item-images/${item.item.images[0].id}`,
											item.id,
										)
									: null
							}
							disabled={remaining === 0}
							className="rounded bg-blue-500 p-2 text-white hover:bg-blue-600 disabled:opacity-50"
						>
							Add {item.item.name} ({remaining})
						</button>
					)
				})}
			</div>
		</div>
	)
}
