import { useFetcher } from '@remix-run/react'
import { useEffect, useState } from 'react'
import { type loader } from '#app/routes/resources+/focus-session'
import { useDoubleCheck } from '#app/utils/misc.tsx'
import { useUserPreferences } from '#app/utils/preferences.js'
import { StatusButton } from './ui/status-button.tsx'

function formatTime(seconds: number) {
	const minutes = Math.floor(seconds / 60)
	const remainingSeconds = seconds % 60
	return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export function Timer() {
	const preferences = useUserPreferences()
	const fetcher = useFetcher<typeof loader>()
	const [timeLeft, setTimeLeft] = useState(10)
	const [duration, setDuration] = useState(
		preferences?.focusSessionDuration ?? 1500, // 25 minutes default
	)
	const [isBreak, setIsBreak] = useState(false)
	const [isCompleting, setIsCompleting] = useState(false)
	const dc = useDoubleCheck()
	const [breakTimer, setBreakTimer] = useState<NodeJS.Timeout | null>(null)

	function startBreak(minutes: number) {
		setIsBreak(true)
		setDuration(minutes * 60)
		setTimeLeft(minutes * 60)

		const timer = setInterval(() => {
			setTimeLeft((prev) => {
				if (prev <= 1) {
					clearInterval(timer)
					setIsBreak(false)
					setDuration(preferences?.focusSessionDuration ?? 1500)
					return preferences?.focusSessionDuration ?? 1500
				}
				return prev - 1
			})
		}, 1000)

		setBreakTimer(timer)
	}

	function stopBreak() {
		if (breakTimer) {
			clearInterval(breakTimer)
			setBreakTimer(null)
		}
		setIsBreak(false)
		setDuration(preferences?.focusSessionDuration ?? 1500)
		setTimeLeft(preferences?.focusSessionDuration ?? 1500)
	}

	// Reset state when break completes
	useEffect(() => {
		if (isBreak && timeLeft === 0) {
			setIsBreak(false)
			setDuration(preferences?.focusSessionDuration ?? 1500)
			setTimeLeft(preferences?.focusSessionDuration ?? 1500)
		}
	}, [timeLeft, isBreak, preferences?.focusSessionDuration])

	/**
	 * Loads the initial session state when the component mounts
	 * or when there's no active session data
	 */
	useEffect(() => {
		if (fetcher.state === 'idle' && !fetcher.data) {
			fetcher.load('/resources/focus-session')
		}
	}, [fetcher])

	/**
	 * Manages the timer countdown and synchronization with the server.
	 * Handles both active sessions from the server and optimistic updates
	 * when starting a new session.
	 */
	useEffect(() => {
		const isStarting =
			fetcher.state === 'submitting' &&
			fetcher.formData?.get('intent') === 'start'
		const session = isStarting
			? {
					duration: Number(fetcher.formData?.get('duration')),
					startTime: new Date(),
				}
			: fetcher.data?.activeSession

		if (!session) {
			setIsCompleting(false)
			setTimeLeft(duration)
			return
		}

		const startTime = new Date(session.startTime)
		const elapsedSeconds = Math.floor((Date.now() - startTime.getTime()) / 1000)
		const remainingSeconds = Math.max(0, session.duration - elapsedSeconds)
		setTimeLeft(remainingSeconds)

		const timer = setInterval(() => {
			setTimeLeft((prev) => Math.max(0, prev - 1))
		}, 1000)

		return () => clearInterval(timer)
	}, [fetcher.data?.activeSession, duration, fetcher.state, fetcher.formData])

	/**
	 * Handles session completion when the timer reaches zero.
	 * Prevents multiple completion attempts and reloads the session
	 * state after marking it complete.
	 */
	useEffect(() => {
		if (timeLeft === 0 && fetcher.data?.activeSession && !isCompleting) {
			setIsCompleting(true)
			fetcher.submit(
				{ intent: 'complete' },
				{ method: 'POST', action: '/resources/focus-session' },
			)
			setTimeout(() => fetcher.load('/resources/focus-session'), 100)
		}
	}, [timeLeft, fetcher, fetcher.data?.activeSession, isCompleting])

	// function adjustDuration(adjustment: number) {
	// 	setDuration((prev) => Math.max(10, Math.min(3600, prev + adjustment)))
	// 	if (!fetcher.data?.activeSession) {
	// 		setTimeLeft((prev) => Math.max(10, Math.min(3600, prev + adjustment)))
	// 	}
	// }

	return (
		<div className="flex flex-col items-center justify-center p-4">
			<div className="relative mb-8 inline-flex h-64 w-64 items-center justify-center rounded-full">
				{/* Progress Circle */}
				<svg className="absolute h-full w-full -rotate-90">
					<circle
						className="stroke-blue-500"
						fill="none"
						strokeWidth="4"
						r="124"
						cx="128"
						cy="128"
					/>
					{(fetcher.data?.activeSession || isBreak) && (
						<circle
							className="stroke-muted transition-all duration-1000"
							fill="none"
							strokeWidth="4"
							r="124"
							cx="128"
							cy="128"
							strokeDasharray="779.2"
							strokeDashoffset={
								779.2 *
								(timeLeft /
									(isBreak
										? duration
										: (fetcher.data?.activeSession?.duration ?? duration)))
							}
						/>
					)}
				</svg>
				<div className="text-6xl font-bold">{formatTime(timeLeft)}</div>
			</div>

			{/* Only show focus session form when not in break mode */}
			{!isBreak ? (
				<fetcher.Form method="POST" action="/resources/focus-session">
					<input type="hidden" name="duration" value={duration} />
					{fetcher.data?.activeSession ? (
						<div className="flex flex-col gap-4">
							<StatusButton
								status={fetcher.state === 'submitting' ? 'pending' : 'idle'}
								{...dc.getButtonProps({
									name: 'intent',
									value: 'stop',
									className:
										'rounded bg-blue-500 px-8 py-3 text-white hover:bg-blue-600',
								})}
							>
								{dc.doubleCheck ? 'Are you sure?' : 'Stop Focus Session'}
							</StatusButton>
							<StatusButton
								status={fetcher.state === 'submitting' ? 'pending' : 'idle'}
								name="intent"
								value="complete"
								className="rounded bg-blue-500 px-8 py-3 text-white hover:bg-blue-600"
							>
								Complete Focus Session
							</StatusButton>
						</div>
					) : (
						<StatusButton
							status={fetcher.state === 'submitting' ? 'pending' : 'idle'}
							name="intent"
							value="start"
							className="rounded bg-blue-500 px-8 py-3 text-white hover:bg-blue-600"
						>
							Start Focus Session
						</StatusButton>
					)}
				</fetcher.Form>
			) : (
				<StatusButton
					status="idle"
					onClick={stopBreak}
					className="rounded bg-blue-500 px-8 py-3 text-white hover:bg-blue-600"
				>
					Stop Break
				</StatusButton>
			)}

			<div className="mt-4 flex gap-4">
				{!fetcher.data?.activeSession && !isBreak && (
					<>
						<button
							onClick={() => startBreak(5)}
							className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
						>
							Short Break
						</button>
						<button
							onClick={() => startBreak(20)}
							className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
						>
							Long Break
						</button>
					</>
				)}
			</div>
		</div>
	)
}
