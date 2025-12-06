import { getTranslations } from 'next-intl/server';
import { getStatistics } from '@/lib/services/statisticsService';
import { HeroSearchBar } from '@/components/features/HeroSearchBar';
import { StatsSection } from './StatsSection';
import { HomePageButtons } from './HomePageButtons';
import { AnnouncementBanner } from '@/components/features/AnnouncementBanner';
import { HeroBanner } from '@/components/features/HeroBanner';
import { HeroBackground } from '@/components/features/HeroBackground';

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

  // Get hero banner images from environment variable (JSON format)
  let heroBannerImages: Array<{ imageUrlDesktop: string; imageUrlMobile: string; linkUrl?: string; alt?: string }> = [];
  try {
    const bannerConfig = process.env.NEXT_PUBLIC_HERO_BANNER_IMAGES;
    if (bannerConfig) {
      heroBannerImages = JSON.parse(bannerConfig);
    }
  } catch (error) {
    console.error('Error parsing hero banner images config:', error);
  }

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

      {/* Hero Background - Full Width Top Half */}
      <div className="relative w-full">
        <div className="absolute inset-0" style={{ height: 'calc(100vh - 200px)' }}>
          <HeroBackground />
        </div>
        
        <div className="relative mx-auto max-w-4xl px-4 py-6 md:py-12">
          {/* Hero Banner - With margins */}
          {heroBannerImages.length > 0 && (
            <div className="mb-6 md:mb-12">
              <HeroBanner images={heroBannerImages} height="medium" locale={locale} />
            </div>
          )}
          {/* Hero Section */}
          <div className="mb-6 text-center md:mb-12">
            <h1 className="relative z-10 text-2xl font-bold text-gray-900 md:text-[32px]">
              {t('title')}
            </h1>
          </div>

          {/* Hero Search Bar */}
          <div className="relative z-10 mb-8 md:mb-12">
            <HeroSearchBar locale={locale} />
          </div>

          <HomePageButtons 
            locale={locale}
            reportButtonText={t('reportButton').toUpperCase()}
            registerButtonText={t('registerButton')}
          />
        </div>
      </div>

      {/* Statistics Section - Outside background */}
      <div className="mx-auto max-w-4xl px-4 pb-12 md:pb-16">
        <StatsSection stats={stats} />
      </div>
    </>
  );
}
