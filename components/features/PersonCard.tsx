import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui';
import { PersonSearchResult } from '@/types';
import { format } from 'date-fns';

interface PersonCardProps {
  person: PersonSearchResult;
}

const healthStatusColors = {
  HEALTHY: 'text-success',
  MINOR_INJURIES: 'text-warning',
  REQUIRES_CARE: 'text-warning',
  CRITICAL: 'text-danger',
};

export function PersonCard({ person }: PersonCardProps) {
  const t = useTranslations('search');
  const tHealth = useTranslations('health');

  return (
    <Card className="hover:border-primary">
      <div className="flex gap-4">
        {/* Photo */}
        {person.photoUrl ? (
          <div className="h-24 w-24 flex-shrink-0">
            <img
              src={person.photoUrl}
              alt={`Photo of ${person.fullName}`}
              className="h-full w-full rounded object-cover"
            />
          </div>
        ) : (
          <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded bg-gray-200">
            <span className="text-4xl text-gray-400">👤</span>
          </div>
        )}

        {/* Details */}
        <div className="flex-1">
          <h3 className="mb-1 text-lg font-bold text-gray-900">{person.fullName}</h3>
          <p className="mb-2 text-sm text-gray-600">
            Age: {person.age} | {person.gender}
          </p>

          {person.nic && (
            <p className="mb-2 text-sm text-gray-600">NIC: {person.nic}</p>
          )}

          <div className="mb-2 flex items-center gap-2">
            <span className="text-sm">📍</span>
            <div className="text-sm">
              <p className="font-medium text-gray-900">{person.shelter.name}</p>
              <p className="text-gray-600">{person.shelter.district}</p>
            </div>
          </div>

          <div className="mb-2 flex items-center gap-2">
            <span className="text-sm">🏥</span>
            <p className={`text-sm font-medium ${healthStatusColors[person.healthStatus]}`}>
              {tHealth(person.healthStatus)}
            </p>
          </div>

          {person.shelter.contactNumber && (
            <div className="mt-3">
              <a
                href={`tel:${person.shelter.contactNumber}`}
                className="inline-flex items-center gap-1 rounded bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                📞 {t('contactShelter')}
              </a>
            </div>
          )}

          <p className="mt-2 text-xs text-gray-500">
            {t('registered')}: {format(new Date(person.createdAt), 'PPp')}
          </p>
        </div>
      </div>
    </Card>
  );
}
