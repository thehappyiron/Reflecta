'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { Companion } from '@/components/Companion';
import { HistoryView } from '@/components/history/HistoryView';
import { useRouter } from 'next/navigation';

export default function HistoryPage() {
  const router = useRouter();

  return (
    <div className="page-container min-h-screen">
      <header className="flex items-center justify-between px-4 sm:px-8 py-4 border-b border-stone-200/80 bg-white/80 backdrop-blur-sm">
        <Link href="/" className="flex items-center gap-3" aria-label="Reflecta home">
          <Companion expression="friendly" size={64} />
          <span className="font-black text-3xl tracking-tight text-purple-950 leading-none">reflecta</span>
        </Link>
        <Link href="/decide" className="btn-primary text-xs py-2 px-5">
          Start a decision →
        </Link>
      </header>

      <main className="max-w-6xl mx-auto w-full px-4 py-8 flex-1">
        <Suspense fallback={
          <div className="flex items-center justify-center py-20">
            <Companion expression="thinking" size="clamp(80px, 12vw, 110px)" className="animate-pulse-gentle" />
          </div>
        }>
          <HistoryView
            onSelectDecision={(item) => router.push(`/decide?id=${item.id}`)}
            onOpenMap={(item) => router.push(`/decide?view=map&id=${item.id}`)}
            onBackToCurrent={() => router.push('/decide')}
          />
        </Suspense>
      </main>
    </div>
  );
}
