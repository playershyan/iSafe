import './globals.css';

// Root layout - required by Next.js
// The html and body tags must be here
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body className="flex min-h-screen flex-col">
        {children}
      </body>
    </html>
  );
}
