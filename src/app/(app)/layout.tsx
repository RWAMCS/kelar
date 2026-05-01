import { createClient } from '@/lib/supabase/server';
import Providers from './providers';
import BottomNav from '@/components/kelar/BottomNav';
import OfflineBanner from '@/components/kelar/OfflineBanner';
import RealtimeProvider from './RealtimeProvider';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <Providers user={user}>
      <RealtimeProvider>
        <div className="mx-auto w-full max-w-[430px] min-h-screen bg-surface flex flex-col relative overflow-x-hidden shadow-2xl">
          <OfflineBanner />
          <main className="flex-1 overflow-y-auto pb-[80px]">
            {children}
          </main>
          <BottomNav />
        </div>
      </RealtimeProvider>
    </Providers>
  );
}
