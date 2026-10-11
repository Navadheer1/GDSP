import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/firebase/authContext';

export const metadata: Metadata = {
  title: 'Humanize AI | Make Every Word Sound More Human',
  description:
    'Transform robotic, repetitive, awkward text into natural, readable, context-appropriate language while strictly preserving factual accuracy and original meaning.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-navy-900 selection:bg-brand-100 selection:text-brand-900">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
