import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'StepOne Content Intelligence Engine',
  description:
    'Transform raw event media into publish-ready marketing assets for LinkedIn, Instagram, and more — powered by AI.',
  keywords: ['AI', 'marketing', 'content', 'automation', 'StepOne', 'events'],
  openGraph: {
    title: 'StepOne Content Intelligence Engine',
    description: 'AI-powered event media to marketing assets pipeline',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-gray-950 text-gray-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
