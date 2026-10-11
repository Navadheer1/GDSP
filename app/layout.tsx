import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { AuthProvider } from '@/lib/firebase/authContext';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'Humanize AI — Make Every Word Sound More Human',
  description:
    'Transform robotic writing into natural, context-aware communication with verification checks designed to help preserve your original meaning.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-[#FAF9FF] text-[#15152B] font-sans antialiased selection:bg-[#EBE8FF] selection:text-[#5542E5]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
