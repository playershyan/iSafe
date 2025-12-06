import { getTranslations } from 'next-intl/server';
import { getStatistics } from '@/lib/services/statisticsService';
import { HeroSearchBar } from '@/components/features/HeroSearchBar';
import { StatsSection } from './StatsSection';
import { HomePageButtons } from './HomePageButtons';
import { AnnouncementBanner } from '@/components/features/AnnouncementBanner';

export const revalidate = 60; // Revalidate every 60 seconds

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const stats = await getStatistics();
  const t = await getTranslations('home');

  // Get announcement from environment variable or config
  const announcementText = process.env.NEXT_PUBLIC_ANNOUNCEMENT_TEXT || '';
  const announcementHref = process.env.NEXT_PUBLIC_ANNOUNCEMENT_HREF || undefined;
  const announcementVariant = (process.env.NEXT_PUBLIC_ANNOUNCEMENT_VARIANT as 'info' | 'warning' | 'success' | 'error') || 'info';
  const announcementDismissible = process.env.NEXT_PUBLIC_ANNOUNCEMENT_DISMISSIBLE === 'true';

  return (
    <>
      {/* Announcement Banner - Full Width */}
      {announcementText && (
        <div className="w-full">
          <AnnouncementBanner
            text={announcementText}
            href={announcementHref}
            variant={announcementVariant}
            dismissible={announcementDismissible}
            locale={locale}
          />
        </div>
      )}
      <div className="mx-auto max-w-4xl px-4 py-6 md:py-12">
        {/* Hero Section */}
      <div className="mb-6 text-center md:mb-12">
        <h1 className="text-2xl font-bold text-gray-900 md:text-[32px]">
          {t('title')}
        </h1>
      </div>

      {/* Hero Search Bar */}
      <div className="mb-8 md:mb-12">
        <HeroSearchBar locale={locale} />
      </div>

      <HomePageButtons 
        locale={locale}
        reportButtonText={t('reportButton').toUpperCase()}
        registerButtonText={t('registerButton')}
      />

        {/* Statistics Section */}
        <StatsSection stats={stats} />
      </div>
    </>
  );
}
