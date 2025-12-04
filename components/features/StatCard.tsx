interface StatCardProps {
  value: number;
  label: string;
  icon?: string;
}

export function StatCard({ value, label, icon }: StatCardProps) {
  return (
    <div className="rounded-lg bg-gray-100 p-4">
      <div className="flex items-center gap-2">
        {icon && <span className="text-2xl" aria-hidden="true">{icon}</span>}
        <div>
          <p className="text-2xl font-bold text-gray-900">
            {value.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">{label}</p>
        </div>
      </div>
    </div>
  );
}
