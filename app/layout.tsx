// Root layout - required by Next.js when using [locale] segment
// This simply passes children through to the locale-specific layout
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
