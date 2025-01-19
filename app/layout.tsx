import './globals.css'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const data = {
    title: 'Fast Quiz - Load and play quizzes quickly',
    description: 'Fast Quiz allows you to load and play quizzes quickly.',
    author: 'CuB1z'
  }
  
  return (
    <html lang="en">
      <head>
        <title>{data.title}</title>
        <meta name="description" content={data.description} />
        <meta name="author" content={data.author} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="keywords" content="quiz, fast, quick, load, play" />
        <link rel="icon" href="/favicon.svg" />
      </head>
      <body>{children}</body>
    </html>
  )
}
