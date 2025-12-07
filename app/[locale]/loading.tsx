import { Loading } from '@/components/ui/Loading';

export default function LoadingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loading size="large" text="Loading..." />
    </div>
  );
}

