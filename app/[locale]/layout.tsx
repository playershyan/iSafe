import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AnonymousUserInitializer } from '@/components/features/AnonymousUserInitializer';
import '../globals.css';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body className="flex min-h-screen flex-col">
        <AnonymousUserInitializer />
        <Header locale={locale} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
