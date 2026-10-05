/**
 * Reflecta — About Page (spec §52)
 * Minimal explanation of what Reflecta does and why it asks questions instead of deciding.
 */
import Link from 'next/link';
import { Companion } from '@/components/Companion';

function StepCard({ number, title, description, color }: {
  number: string; title: string; description: string; color: string;
}) {
  return (
    <div className="flex items-start gap-4 p-5 rounded-2xl border" style={{ borderColor: 'var(--border-default)', backgroundColor: 'white' }}>
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
        style={{ backgroundColor: color, color: 'var(--color-primary)' }}
        aria-hidden="true"
      >
        {number}
      </div>
      <div>
        <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{title}</h3>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{description}</p>
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="page-container">
      {/* Nav */}
      <header className="flex items-center justify-between px-4 sm:px-8 py-4 border-b" style={{ borderColor: 'var(--border-default)' }}>
        <Link href="/" className="flex items-center gap-2" aria-label="Reflecta home">
          <Companion expression="welcoming" size={32} />
          <span className="font-bold" style={{ color: 'var(--color-primary)' }}>reflecta</span>
        </Link>
        <Link href="/decide" className="btn-primary text-sm py-2 px-5">
          Start a decision →
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-16">
        {/* Heading */}
        <div className="text-center mb-12">
          <Companion expression="welcoming" size="clamp(96px, 15vw, 130px)" className="mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Reflecta doesn't decide for you.
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            It helps you notice what your thinking might be missing — so you can decide with more clarity.
          </p>
        </div>

        {/* Why questions */}
        <div className="rounded-2xl p-6 mb-10" style={{ backgroundColor: 'var(--color-believed)' }}>
          <h2 className="font-semibold mb-3" style={{ color: 'var(--color-believed-text)' }}>
            Why does Reflecta ask questions instead of giving recommendations?
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-believed-text)', opacity: 0.9 }}>
            The best decision isn't the one the AI thinks is optimal — it's the one that aligns with
            what actually matters to you. Reflecta's job is to help you discover your own blind spots,
            unstated assumptions, and the questions you forgot to ask. The decision always remains yours.
          </p>
        </div>

        {/* Process */}
        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
          How it works
        </h2>
        <div className="space-y-3 mb-12">
          <StepCard number="1" title="Understand" description="You share what you're deciding and why you're leaning a certain way." color="var(--color-known)" />
          <StepCard number="2" title="Explore" description="Reflecta maps your reasoning — separating what you know from what you believe, and what's still unclear." color="var(--color-believed)" />
          <StepCard number="3" title="Challenge" description="You encounter the single most important question drawn from your own words — one that's worth sitting with." color="var(--color-unclear)" />
          <StepCard number="4" title="Reflect" description="You walk away with what you discovered: clearer priorities, key uncertainties, and a new angle worth exploring." color="var(--color-challenge)" />
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/decide" className="btn-primary text-base py-3.5 px-10">
            Start a decision →
          </Link>
          <p className="mt-4 text-sm" style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
            No right or wrong thoughts. Just your thoughts.
          </p>
        </div>
      </main>
    </div>
  );
}
