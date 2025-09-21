import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'RingBet - Ultimate Roulette Experience',
  description: 'The most exciting blockchain-powered roulette platform. Create rings, place bets, and win big with provably fair games.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-inter">{children}</body>
    </html>
  );
}
