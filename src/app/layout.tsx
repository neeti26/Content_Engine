import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Content Engine — AI-Powered Event Marketing',
  description: 'Transform raw event media into publish-ready marketing assets for LinkedIn, Instagram, and more — powered by AI.',
  keywords: ['AI', 'marketing', 'content', 'automation', 'events'],
  openGraph: {
    title: 'Content Engine — AI-Powered Event Marketing',
    description: 'AI-powered event media to marketing assets pipeline',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const html = (
    <html lang="en" className={inter.variable}>
      <body className="bg-gray-950 text-gray-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );

  // Clerk is optional — without a publishable key the provider would throw and
  // take the whole app down, so render the app un-wrapped instead.
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) return html;

  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#7c3aed',
          colorBackground: '#09090f',
          borderRadius: '0.75rem',
        },
        elements: {
          card: { background: 'rgba(15,5,30,0.95)', border: '1px solid rgba(167,139,250,0.2)', backdropFilter: 'blur(20px)' },
          headerTitle: { color: '#ffffff', fontWeight: '800' },
          headerSubtitle: { color: 'rgba(255,255,255,0.5)' },
          socialButtonsBlockButton: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' },
          dividerLine: { background: 'rgba(255,255,255,0.1)' },
          dividerText: { color: 'rgba(255,255,255,0.3)' },
          formFieldLabel: { color: 'rgba(255,255,255,0.6)' },
          footer: { '& + div': { display: 'none' } },
        },
      }}
    >
      {html}
    </ClerkProvider>
  );
}
