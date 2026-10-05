/**
 * Reflecta — Premium Landing Page
 *
 * Visual system: warm ivory base, Poppins, deep purple accents.
 * Hero uses the real "reflecta home page" artwork as the emotional centrepiece.
 * All animations are CSS-only (transform / opacity) — respects prefers-reduced-motion.
 */
'use client';

import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { Companion } from '@/components/Companion';
import { Glass } from '@/components/Glass';
import { Pointer } from '@/components/ui/custom-cursor';

const Silk = dynamic(() => import('@/components/Silk'), { ssr: false });

// ─── Tiny inline icons ──────────────────────────────────────────────────────────
function ArrowRight({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Scroll-reveal hook ─────────────────────────────────────────────────────────
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(18px)',
        transition: `opacity 0.55s ease ${delay}ms, transform 0.55s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ─── Step card ──────────────────────────────────────────────────────────────────
const STEPS = [
  {
    num: '01',
    title: 'Understand',
    desc: 'Put the decision into words.',
    bg: '#D1FAE5',
    border: '#A7F3D0',
    icon: '/assets/understand.png',
  },
  {
    num: '02',
    title: 'Explore',
    desc: 'Separate what you know from what you believe.',
    bg: '#EDE9FE',
    border: '#DDD6FE',
    icon: '/assets/explore.png',
  },
  {
    num: '03',
    title: 'Challenge',
    desc: 'Question the assumptions hiding underneath.',
    bg: '#FEF3C7',
    border: '#FDE68A',
    icon: '/assets/challenge.png',
  },
  {
    num: '04',
    title: 'Reflect',
    desc: 'Leave with a clearer view — not an answer.',
    bg: '#FCE7F3',
    border: '#FBCFE8',
    icon: '/assets/reflect.png',
  },
];

function StepCard({ step, index }: { step: typeof STEPS[0]; index: number }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Reveal delay={index * 80}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          backgroundColor: step.bg,
          border: `1px solid ${hovered ? step.border : 'transparent'}`,
          borderRadius: '24px',
          padding: '36px 28px',
          cursor: 'default',
          transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
          transition: 'all 0.22s cubic-bezier(0.16,1,0.3,1)',
          boxShadow: hovered ? '0 12px 32px rgba(59,7,100,0.10)' : '0 3px 8px rgba(0,0,0,0.03)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <span style={{
          display: 'block',
          fontSize: '13px',
          fontWeight: 800,
          letterSpacing: '0.14em',
          color: '#78716C',
          marginBottom: '16px',
          textTransform: 'uppercase',
        }}>{step.num}</span>
        <div style={{
          height: '100px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
          transform: hovered ? 'translateY(-4px) scale(1.08)' : 'translateY(0) scale(1)',
          transition: 'transform 0.22s ease',
        }}>
          <Image
            src={step.icon}
            alt={step.title}
            width={120}
            height={100}
            style={{ objectFit: 'contain', width: 'auto', maxHeight: '100px' }}
          />
        </div>
        <h3 style={{ fontWeight: 800, fontSize: '22px', color: '#1C1917', marginBottom: '8px' }}>{step.title}</h3>
        <p style={{ fontSize: '15px', color: '#44403C', lineHeight: 1.65, margin: 0 }}>{step.desc}</p>
        {hovered && (
          <span style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            color: '#7C3AED',
            opacity: 0.8,
            transition: 'opacity 0.2s',
          }}>
            <ArrowRight size={16} />
          </span>
        )}
      </div>
    </Reveal>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <Pointer name="Reflecta">
      <div className="page-container relative min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      {/* ── Background Silk Canvas (30% opacity) ─────────────────────────── */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{ opacity: 0.3 }}
        aria-hidden="true"
      >
        <Silk
          speed={1.6}
          scale={1}
          color="#C7B9E3"
          noiseIntensity={0.8}
          rotation={0}
        />
      </div>

      <div className="relative z-10">
      {/* ── Navigation ──────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4">
        <Glass
          radius={28}
          bevelDepth={24}
          scale={55}
          aberration={5}
          frost={0.02}
          tint={0.08}
          className="w-full max-w-5xl px-6 py-2"
        >
          <nav className="flex items-center justify-between w-full" aria-label="Main navigation">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group" aria-label="Reflecta home">
              <span style={{ transition: 'transform 0.25s ease' }} className="group-hover:scale-105 inline-block">
                <Companion expression="welcoming" size={64} />
              </span>
              <span style={{ fontWeight: 900, fontSize: '28px', letterSpacing: '-0.045em', color: '#3B0764', lineHeight: 1 }}>
                reflecta
              </span>
            </Link>

            {/* Nav links */}
            <div className="hidden sm:flex items-center gap-8" style={{ fontSize: '16px', fontWeight: 600, color: '#1C1917' }}>
              <Link href="#how-it-works" style={{ transition: 'color 0.15s' }} className="hover:text-purple-900">How it works</Link>
              <Link href="#examples" style={{ transition: 'color 0.15s' }} className="hover:text-purple-900">Try it</Link>
              <Link href="/about" style={{ transition: 'color 0.15s' }} className="hover:text-purple-900">About</Link>
            </div>

            {/* CTA */}
            <Link href="/decide" className="btn-primary" style={{ fontSize: '13px', padding: '8px 20px' }}>
              Get Started <ArrowRight size={13} />
            </Link>
          </nav>
        </Glass>
      </header>

      <main>
        {/* ── HERO ────────────────────────────────────────────────────────────── */}
        <section
          className="pt-32 pb-16 px-4"
          aria-labelledby="hero-heading"
        >
          <div
            className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-10 lg:gap-10"
            style={{ minHeight: '68vh' }}
          >
            {/* LEFT — text */}
            <div className="w-full text-center lg:text-left" style={{ flex: '0 0 auto', maxWidth: '420px', margin: '0 auto' }}>

              {/* Eyebrow pill */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#EDE9FE',
                color: '#5B21B6',
                borderRadius: '999px',
                padding: '5px 14px',
                fontSize: '12px',
                fontWeight: 600,
                marginBottom: '24px',
                border: '1px solid #DDD6FE',
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#7C3AED', display: 'inline-block' }} />
                It&apos;s a conversation with yourself.
              </div>

              {/* Heading */}
              <h1
                id="hero-heading"
                style={{
                  fontWeight: 800,
                  fontSize: 'clamp(40px, 6vw, 60px)',
                  lineHeight: 1.1,
                  letterSpacing: '-0.035em',
                  color: '#1C1917',
                  marginBottom: '22px',
                }}
              >
                Better questions.{' '}
                <br />
                <span style={{ color: '#7C3AED' }}>Clearer you.</span>
              </h1>

              {/* Supporting text */}
              <p style={{
                fontSize: '17px',
                color: '#78716C',
                lineHeight: 1.65,
                marginBottom: '32px',
                maxWidth: '400px',
              }}>
                An AI companion that helps you spot blind spots in your thinking —
                so you can make decisions with more clarity.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link href="/decide" className="btn-primary" style={{ fontSize: '15px', padding: '13px 28px' }}>
                  Start a decision <ArrowRight size={15} />
                </Link>
                <Link href="#how-it-works" className="btn-secondary" style={{ fontSize: '15px', padding: '13px 22px' }}>
                  See how it works
                </Link>
              </div>

              {/* Blind-spot signal */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '22px',
                justifyContent: 'center',
              }}
                className="lg:justify-start"
              >
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#7C3AED',
                  display: 'inline-block',
                  animation: 'gentlePulse 2.2s ease-in-out infinite',
                }} />
                <span style={{ width: '28px', height: '1px', backgroundColor: '#DDD6FE', display: 'inline-block' }} />
                <span style={{ fontSize: '12px', color: '#A78BFA', fontWeight: 500 }}>Spot the blind spot</span>
              </div>

              {/* Microcopy */}
              <p style={{ marginTop: '16px', fontSize: '13px', color: '#A8A29E', fontStyle: 'italic' }}>
                No right or wrong thoughts. Just your thoughts.
              </p>
            </div>

            {/* RIGHT — hero artwork */}
            <div
              className="w-full"
              style={{
                flex: '1 1 0',
                minWidth: 0,
                maxWidth: '780px',
                margin: '0 auto',
              }}
            >
              <div style={{ position: 'relative' }}>
                <Image
                  src="/hero.png"
                  alt="A person sitting beside the Reflecta companion, looking at a night city skyline under stars — No perfect choices. Just clearer thinking."
                  width={1456}
                  height={816}
                  priority
                  style={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: '28px',
                    border: '1px solid rgba(221,214,254,0.55)',
                    boxShadow: '0 16px 48px rgba(59,7,100,0.14), 0 2px 8px rgba(59,7,100,0.06)',
                    display: 'block',
                  }}
                />

                {/* Floating annotation card — sits inside bottom-right of image */}
                <div style={{
                  position: 'absolute',
                  bottom: '16px',
                  right: '20px',
                  backgroundColor: 'rgba(253,250,246,0.96)',
                  border: '1px solid #EDE9FE',
                  borderRadius: '12px',
                  padding: '9px 14px',
                  boxShadow: '0 4px 14px rgba(59,7,100,0.10)',
                  fontSize: '11px',
                  color: '#5B21B6',
                  fontWeight: 500,
                  animation: 'annotationFloat 3.5s ease-in-out infinite',
                  maxWidth: '200px',
                  lineHeight: 1.4,
                  backdropFilter: 'blur(6px)',
                  WebkitBackdropFilter: 'blur(6px)',
                }}>
                  ✦ One question can change the view.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── BEFORE / AFTER ──────────────────────────────────────────────────── */}
        <section className="py-24 px-4" aria-labelledby="before-after-heading">
          <div className="max-w-6xl mx-auto">
            <Reveal>
              <div className="text-center mb-16">
                <h2
                  id="before-after-heading"
                  style={{
                    fontWeight: 800,
                    fontSize: 'clamp(32px, 4.5vw, 44px)',
                    letterSpacing: '-0.035em',
                    color: '#1C1917',
                    marginBottom: '14px',
                  }}
                >
                  Same decision. A clearer view.
                </h2>
                <p style={{ color: '#44403C', fontSize: '18px', maxWidth: '580px', margin: '0 auto', lineHeight: 1.6, fontWeight: 500 }}>
                  Reflecta doesn&apos;t choose for you. It helps you see what your thinking might be missing.
                </p>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div
                className="flex flex-col md:flex-row items-stretch gap-0"
                style={{ borderRadius: '24px', overflow: 'hidden', border: '1px solid #E7E5E4', boxShadow: '0 8px 30px rgba(59,7,100,0.06)' }}
              >
                {/* Before */}
                <div style={{ flex: 1, backgroundColor: '#FDFAF6', padding: '40px 36px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '0.14em', color: '#78716C', textTransform: 'uppercase', display: 'block', marginBottom: '18px' }}>Before</span>
                  <p style={{ fontSize: '18px', color: '#292524', lineHeight: 1.65, fontStyle: 'italic', fontWeight: 500 }}>
                    &quot;I think this is the right choice because it feels right and everyone agrees with me.&quot;
                  </p>
                </div>

                {/* Arrow divider */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '24px 18px',
                  backgroundColor: '#EDE9FE',
                  flexShrink: 0,
                  flexDirection: 'column',
                  gap: '8px',
                }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#6D28D9', letterSpacing: '0.08em', writingMode: 'vertical-rl', textOrientation: 'mixed', textTransform: 'uppercase' }}>Reflecting</span>
                  <span style={{ color: '#6D28D9', fontSize: '22px' }}>↓</span>
                </div>

                {/* After */}
                <div style={{ flex: 1, backgroundColor: '#F5F0FF', padding: '40px 36px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '0.14em', color: '#6D28D9', textTransform: 'uppercase', display: 'block', marginBottom: '18px' }}>After reflecting</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                      { color: '#D1FAE5', border: '#A7F3D0', text: 'What am I actually assuming here?' },
                      { color: '#FEF3C7', border: '#FDE68A', text: 'What don\'t I know yet?' },
                      { color: '#FCE7F3', border: '#FBCFE8', text: 'What would change my mind?' },
                    ].map((item, i) => (
                      <div key={i} style={{
                        backgroundColor: item.color,
                        border: `1px solid ${item.border}`,
                        borderRadius: '14px',
                        padding: '12px 18px',
                        fontSize: '15px',
                        color: '#1C1917',
                        fontWeight: 600,
                      }}>
                        {item.text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── FOUR STEPS ──────────────────────────────────────────────────────── */}
        <section
          id="how-it-works"
          className="py-24 px-4"
          aria-labelledby="how-heading"
        >
          <div className="max-w-6xl mx-auto">
            <Reveal>
              <div className="text-center mb-16">
                <h2
                  id="how-heading"
                  style={{
                    fontWeight: 800,
                    fontSize: 'clamp(32px, 4.5vw, 44px)',
                    letterSpacing: '-0.035em',
                    color: '#1C1917',
                    marginBottom: '14px',
                  }}
                >
                  Four steps to clearer thinking
                </h2>
                <p style={{ color: '#44403C', fontSize: '18px', fontWeight: 500 }}>
                  Reflecta doesn&apos;t give you an answer. It helps you find better questions.
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {STEPS.map((step, i) => (
                <StepCard key={step.num} step={step} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ── BLIND SPOT ──────────────────────────────────────────────────────── */}
        <section className="py-24 px-4" aria-labelledby="blind-spot-heading">
          <div className="max-w-6xl mx-auto">
            <Reveal>
              <div className="text-center mb-16">
                <h2
                  id="blind-spot-heading"
                  style={{
                    fontWeight: 800,
                    fontSize: 'clamp(30px, 4.5vw, 42px)',
                    letterSpacing: '-0.035em',
                    color: '#1C1917',
                    marginBottom: '14px',
                  }}
                >
                  Your brain naturally fills in the gaps.
                </h2>
                <p style={{ color: '#44403C', fontSize: '18px', fontWeight: 600, maxWidth: '480px', margin: '0 auto' }}>
                  Pause. Look again.
                </p>
              </div>
            </Reveal>

            <div className="flex flex-col md:flex-row items-stretch gap-6 max-w-5xl mx-auto">
              {[
                {
                  label: 'VISIBLE',
                  title: 'What you notice first',
                  desc: 'The obvious, the loudest voice, the first thought that arrives.',
                  bg: '#D1FAE5',
                  border: '#A7F3D0',
                  textColor: '#065F46',
                  delay: 0,
                },
                {
                  label: 'HIDDEN',
                  title: 'What your thinking assumes',
                  desc: 'The beliefs you didn\'t know you had. The logic you didn\'t question.',
                  bg: '#EDE9FE',
                  border: '#DDD6FE',
                  textColor: '#5B21B6',
                  delay: 100,
                },
                {
                  label: 'UNCLEAR',
                  title: 'What you haven\'t figured out yet',
                  desc: 'The honest uncertainty. The part worth sitting with.',
                  bg: '#FEF3C7',
                  border: '#FDE68A',
                  textColor: '#92400E',
                  delay: 200,
                },
              ].map((card, i) => (
                <div key={i} className="flex flex-col md:flex-row items-center flex-1 w-full">
                  <Reveal delay={card.delay} className="flex-1 w-full h-full">
                    <div style={{
                      backgroundColor: card.bg,
                      border: `1px solid ${card.border}`,
                      borderRadius: '24px',
                      padding: '36px 28px',
                      textAlign: 'center',
                      height: '100%',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                    }}>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: 800,
                        letterSpacing: '0.14em',
                        color: card.textColor,
                        textTransform: 'uppercase',
                        display: 'block',
                        marginBottom: '12px',
                      }}>{card.label}</span>
                      <h3 style={{ fontWeight: 800, fontSize: '20px', color: '#1C1917', marginBottom: '10px' }}>{card.title}</h3>
                      <p style={{ fontSize: '15px', color: '#44403C', lineHeight: 1.65, margin: 0 }}>{card.desc}</p>
                    </div>
                  </Reveal>
                </div>
              ))}
            </div>

            {/* Companion near blind spot */}
            <Reveal delay={300}>
              <div className="flex justify-center mt-12">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <Companion expression="observing" size={80} />
                  <span style={{ fontSize: '16px', color: '#3B0764', fontWeight: 600, fontStyle: 'italic', maxWidth: '300px', lineHeight: 1.5 }}>
                    &quot;Sometimes the missing piece is a question.&quot;
                  </span>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── TRY ONE QUESTION ────────────────────────────────────────────────── */}
        <section
          id="examples"
          className="py-24 px-4"
          aria-labelledby="try-heading"
        >
          <div className="max-w-4xl mx-auto text-center">
            <Reveal>
              <h2
                id="try-heading"
                style={{
                  fontWeight: 800,
                  fontSize: 'clamp(32px, 4.5vw, 42px)',
                  letterSpacing: '-0.035em',
                  color: '#1C1917',
                  marginBottom: '14px',
                }}
              >
                Try one question.
              </h2>
              <p style={{ color: '#44403C', fontSize: '18px', fontWeight: 500, marginBottom: '40px' }}>
                Not an answer. A better question.
              </p>
            </Reveal>

            <Reveal delay={100}>
              <div style={{
                backgroundColor: '#FDFAF6',
                border: '1px solid #E7E5E4',
                borderRadius: '24px',
                padding: '40px 36px',
                textAlign: 'left',
                boxShadow: '0 8px 30px rgba(59,7,100,0.06)',
              }}>
                {/* Decision */}
                <div style={{
                  backgroundColor: 'white',
                  border: '1px solid #E7E5E4',
                  borderRadius: '16px',
                  padding: '20px 24px',
                  marginBottom: '18px',
                }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#78716C', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Your decision</span>
                  <p style={{ fontSize: '18px', color: '#1C1917', fontWeight: 600, margin: 0 }}>
                    Should I take this internship?
                  </p>
                </div>

                {/* Companion response */}
                <div style={{
                  backgroundColor: '#EDE9FE',
                  border: '1px solid #DDD6FE',
                  borderRadius: '16px',
                  padding: '20px 24px',
                  marginBottom: '16px',
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'center',
                }}>
                  <Companion expression="curious" size={56} />
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#6D28D9', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Reflecta asks</span>
                    <p style={{ fontSize: '18px', color: '#3B0764', fontWeight: 700, margin: 0 }}>
                      What would make you say no?
                    </p>
                  </div>
                </div>

                <p style={{ fontSize: '14px', color: '#78716C', fontStyle: 'italic', marginBottom: '24px', textAlign: 'center', fontWeight: 500 }}>
                  That&apos;s where the interesting part begins.
                </p>

                {/* Example chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px' }}>
                  {[
                    { label: 'Should I accept this internship?', href: '/decide?example=internship' },
                    { label: 'Should I choose this college?', href: '/decide?example=college' },
                    { label: 'Should I study abroad?', href: '/decide?example=abroad' },
                    { label: 'Should I switch my major?', href: '/decide?example=major' },
                    { label: 'Should I take this job?', href: '/decide?example=job' },
                  ].map(chip => (
                    <Link
                      key={chip.href}
                      href={chip.href}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 18px',
                        borderRadius: '999px',
                        fontSize: '14px',
                        fontWeight: 600,
                        backgroundColor: 'white',
                        border: '1px solid #E7E5E4',
                        color: '#292524',
                        transition: 'all 0.15s ease',
                      }}
                      className="hover:border-violet-400 hover:text-violet-900 hover:bg-violet-50"
                    >
                      {chip.label} <ArrowRight size={13} />
                    </Link>
                  ))}
                </div>

                <Link
                  href="/decide"
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', fontSize: '16px', padding: '16px 24px' }}
                >
                  Explore this decision <ArrowRight size={16} />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── FINAL CTA ───────────────────────────────────────────────────────── */}
        <section
          className="py-24 px-4 text-center relative overflow-hidden"
          style={{ backgroundColor: '#3B0764' }}
          aria-label="Final call to action"
        >
          {/* Subtle bg texture using dots */}
          <div aria-hidden="true" style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }} />

          <div className="max-w-xl mx-auto relative">
            <Reveal>
              <Companion expression="welcoming" size="clamp(80px, 12vw, 110px)" className="mx-auto mb-6" />
            </Reveal>
            <Reveal delay={80}>
              <h2
                style={{
                  fontWeight: 800,
                  fontSize: 'clamp(30px, 5vw, 48px)',
                  lineHeight: 1.15,
                  letterSpacing: '-0.03em',
                  color: 'white',
                  marginBottom: '16px',
                }}
              >
                No perfect choices.
                <br />
                Just clearer thinking.
              </h2>
            </Reveal>
            <Reveal delay={150}>
              <p style={{ color: '#C4B5FD', fontSize: '15px', lineHeight: 1.65, marginBottom: '32px', maxWidth: '380px', margin: '0 auto 32px' }}>
                Reflecta won&apos;t tell you what to choose.
                <br />
                It helps you notice what you might have missed.
              </p>
            </Reveal>
            <Reveal delay={220}>
              <Link
                href="/decide"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'white',
                  color: '#3B0764',
                  fontWeight: 700,
                  fontSize: '15px',
                  padding: '14px 32px',
                  borderRadius: '999px',
                  transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                }}
                className="hover:bg-violet-50 hover:-translate-y-0.5 hover:shadow-lg"
              >
                Start a decision <ArrowRight size={15} />
              </Link>
              <p style={{ marginTop: '18px', fontSize: '12px', color: '#7C3AED', fontStyle: 'italic', opacity: 0.8 }}>
                Clarity doesn&apos;t always mean certainty.
              </p>
            </Reveal>
          </div>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="py-8 px-4 border-t" style={{ borderColor: 'var(--border-muted)', backgroundColor: 'var(--bg-base)' }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Companion expression="calm" size={38} />
            <span style={{ fontWeight: 900, fontSize: '17px', color: '#3B0764', letterSpacing: '-0.03em' }}>reflecta</span>
          </div>
          <p style={{ fontSize: '12px', color: '#A8A29E' }}>
            Helping you think, not deciding for you.
          </p>
          <nav className="flex gap-5" style={{ fontSize: '12px', color: '#78716C' }} aria-label="Footer navigation">
            <Link href="/about" className="hover:text-violet-700 transition-colors">About</Link>
            <Link href="#examples" className="hover:text-violet-700 transition-colors">Examples</Link>
          </nav>
        </div>
      </footer>
      </div>
    </div>
    </Pointer>
  );
}
