/**
 * Reflecta — Root Layout
 * Sets global font, metadata, and wraps all pages.
 * Poppins loaded via Google Fonts per spec §19.
 */
import type { Metadata } from 'next';
import { Poppins, Geist } from 'next/font/google';
import './globals.css';
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Reflecta — Better questions. Clearer you.',
  description: 'An AI companion that helps you spot blind spots in your thinking — so you can make decisions with more clarity.',
  keywords: ['decision making', 'critical thinking', 'AI reasoning', 'reflection'],
  openGraph: {
    title: 'Reflecta — Better questions. Clearer you.',
    description: 'Spot blind spots in your thinking and make decisions with more clarity.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className={`${poppins.className} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
