import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { Navbar } from '@/components/Navbar';
import { CommandPalette } from '@/components/CommandPalette';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'DevFlow - Developer Workspace',
  description: 'A fast, lightweight issue tracking and engineering workspace for software teams.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrains.variable} font-sans bg-[#000000] text-zinc-100 antialiased min-h-screen flex flex-col selection:bg-white/20 selection:text-white`}>
        <AuthProvider>
          <Navbar />
          <CommandPalette />
          <Toaster theme="dark" position="bottom-right" richColors closeButton />
          <main className="flex-1">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
