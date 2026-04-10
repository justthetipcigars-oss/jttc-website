import type { Metadata } from 'next';
import './globals.css';
import AgeGate from '@/components/AgeGate';

export const metadata: Metadata = {
  title: 'Just The Tip Cigars | Premium Cigar Lounge — South Park Township, PA',
  description: "South Park Township's premier cigar lounge. Hand-selected premium cigars, a welcoming lounge, and a community of enthusiasts.",
  keywords: ['cigar lounge', 'premium cigars', 'South Park Township', 'Pittsburgh cigars'],
  openGraph: {
    title: 'Just The Tip Cigars',
    description: 'Premium Cigar Lounge — South Park Township, PA',
    url: 'https://www.justthetipcigars.com',
    siteName: 'Just The Tip Cigars',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AgeGate>
          {children}
        </AgeGate>
      </body>
    </html>
  );
}
