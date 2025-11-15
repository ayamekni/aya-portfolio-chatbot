export const metadata = {
	title: 'Aya Portfolio Chatbot',
	description: 'A minimal portfolio chatbot with local retrieval.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body
  style={{
    margin: 0,
    background: 'rgba(14, 18, 40, 0.3)', // semi-transparent navy
    backdropFilter: 'blur(10px)',
    color: 'white',
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial',
  }}
>
  {children}
</body>

		</html>
	);
}


