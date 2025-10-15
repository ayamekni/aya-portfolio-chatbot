'use client';

import { useEffect, useRef, useState } from 'react';

type Message = { role: 'user' | 'assistant'; content: string };

export default function ChatWidget() {
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState('');
	const [open, setOpen] = useState(true);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (containerRef.current)
			containerRef.current.scrollTop = containerRef.current.scrollHeight;
	}, [messages]);

	async function send() {
		if (!input.trim()) return;
		const user: Message = { role: 'user', content: input };
		setMessages(prev => [...prev, user]);
		setInput('');

		try {
			const res = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ messages: [...messages, user] })
			});
			const data = await res.json();
			const assistant: Message = {
				role: 'assistant',
				content: data?.reply ?? 'No answer'
			};
			setMessages(prev => [...prev, assistant]);
		} catch (e: any) {
			setMessages(prev => [
				...prev,
				{ role: 'assistant', content: `⚠️ Error: ${e?.message ?? 'unknown'}` }
			]);
		}
	}

	return (
		<div style={{ position: 'fixed', right: 24, bottom: 24, zIndex: 1000 }}>
			<div
				style={{
					width: 380,
					height: open ? 480 : 64,
					background: 'rgba(14, 18, 40, 0.85)',
					backdropFilter: 'blur(20px)',
					border: '1px solid rgba(255,255,255,0.08)',
					borderRadius: 20,
					overflow: 'hidden',
					boxShadow: '0 12px 60px rgba(118, 75, 162, 0.5)',
					transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
					color: 'white',
					fontFamily: 'Poppins, Inter, sans-serif'
				}}
			>
				{/* Header */}
				<div
					style={{
						padding: '14px 18px',
						background: 'linear-gradient(90deg, #667eea, #764ba2, #f093fb)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						fontWeight: 600,
						fontSize: 16
					}}
				>
					<span>Aya Assistant</span>
					<button
						onClick={() => setOpen(o => !o)}
						style={{
							background: 'rgba(255,255,255,0.15)',
							color: '#fff',
							border: 'none',
							cursor: 'pointer',
							width: 32,
							height: 32,
							borderRadius: 8,
							fontSize: 18,
							fontWeight: 'bold',
							backdropFilter: 'blur(6px)',
							transition: 'all 0.2s'
						}}
						onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
						onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
					>
						{open ? '−' : '+'}
					</button>
				</div>

				{/* Messages */}
				{open && (
					<>
						<div
							ref={containerRef}
							style={{
								padding: 14,
								height: 340,
								overflowY: 'auto',
								display: 'flex',
								flexDirection: 'column',
								gap: 10,
								background: 'transparent'
							}}
						>
							{messages.length === 0 && (
								<div
									style={{
										textAlign: 'center',
										color: 'rgba(255,255,255,0.85)',
										fontSize: 15,
										marginTop: 40
									}}
								>
									👋 Hey there! I’m Aya’s AI assistant.<br />
									Ask about her skills, projects, or experience.
								</div>
							)}

							{messages.map((m, idx) => (
								<div
									key={idx}
									style={{
										alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
										background:
											m.role === 'user'
												? 'linear-gradient(135deg, #667eea, #764ba2)'
												: 'rgba(255,255,255,0.08)',
										color: m.role === 'user' ? '#fff' : '#e8e8e8',
										padding: '12px 16px',
										borderRadius:
											m.role === 'user'
												? '16px 16px 4px 16px'
												: '16px 16px 16px 4px',
										fontSize: 14,
										lineHeight: 1.5,
										maxWidth: '80%',
										boxShadow:
											m.role === 'user'
												? '0 4px 15px rgba(118,75,162,0.4)'
												: '0 2px 10px rgba(0,0,0,0.2)'
									}}
								>
									{m.content}
								</div>
							))}
						</div>

						{/* Input */}
						<form
							onSubmit={e => {
								e.preventDefault();
								send();
							}}
							style={{
								display: 'flex',
								gap: 10,
								padding: 14,
								background: 'rgba(255,255,255,0.04)',
								borderTop: '1px solid rgba(255,255,255,0.1)'
							}}
						>
							<input
								value={input}
								onChange={e => setInput(e.target.value)}
								placeholder="Type your question..."
								style={{
									flex: 1,
									borderRadius: 12,
									border: '1px solid rgba(255,255,255,0.15)',
									background: 'rgba(20,25,45,0.8)',
									color: '#fff',
									padding: '10px 14px',
									fontSize: 14,
									outline: 'none'
								}}
							/>
							<button
								type="submit"
								style={{
									borderRadius: 12,
									border: 'none',
									background:
										'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
									color: '#fff',
									padding: '10px 18px',
									cursor: 'pointer',
									fontWeight: 600,
									fontSize: 14,
									boxShadow: '0 4px 15px rgba(118,75,162,0.5)',
									transition: 'transform 0.2s ease'
								}}
								onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
								onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
							>
								Send
							</button>
						</form>
					</>
				)}
			</div>
		</div>
	);
}
