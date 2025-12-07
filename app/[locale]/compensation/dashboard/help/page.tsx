'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, BookOpen, HelpCircle } from 'lucide-react';

interface Guide {
  slug: string;
  title: string;
  description: string;
}

const guides: Guide[] = [
  {
    slug: 'how-to-register-new-arrivals-to-shelter',
    title: 'How to Register New Arrivals to a Shelter',
    description: 'Learn how shelter staff can register new people arriving at displacement shelters'
  },
  {
    slug: 'how-to-change-hero-banner-image',
    title: 'How to Change Hero Banner Image and Link URL',
    description: 'Change the large banner image on the home page and set up clickable links'
  },
  {
    slug: 'how-to-change-announcement-banner-text',
    title: 'How to Change the Top Announcement Banner Text',
    description: 'Update the announcement banner at the top of the website with different styles'
  },
  {
    slug: 'how-to-change-default-admin-login-credentials',
    title: 'How to Change Default Admin Login Credentials',
    description: 'Change the default admin username and password for the compensation dashboard'
  },
  {
    slug: 'how-to-assign-shelter-login-credentials',
    title: 'How to Assign Displacement Shelter Login Credentials',
    description: 'Create new shelter centers with login credentials and update access codes'
  },
  {
    slug: 'how-to-change-ta-json-with-tamil-fonts',
    title: 'How to Change ta.json with Tamil Fonts',
    description: 'Update Tamil translations in the ta.json file and ensure proper font display'
  }
];

export default function HelpPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const router = useRouter();
  const t = useTranslations('compensation.dashboard');
  const [locale, setLocale] = useState('en');

  useEffect(() => {
    params.then((p) => setLocale(p.locale));
  }, [params]);

  return (
    <main className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="secondary"
            onClick={() => router.push(`/${locale}/compensation/dashboard`)}
            size="small"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <HelpCircle className="w-8 h-8 text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Help & How-To Guides</h1>
          </div>
          <p className="text-gray-600">
            Step-by-step guides to help you manage the iSafe system effectively
          </p>
        </div>

        {/* Guides List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-gray-900">How-To Guides</h2>
            </div>
            
            <div className="grid gap-4">
              {guides.map((guide, index) => (
                <Link
                  key={guide.slug}
                  href={`/${locale}/compensation/dashboard/help/${guide.slug}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1 hover:text-primary">
                        {guide.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {guide.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Need More Help?</h3>
          <p className="text-sm text-blue-800 mb-4">
            If you can't find what you're looking for in these guides, contact your system administrator for assistance.
          </p>
        </div>
      </div>
    </main>
  );
}

