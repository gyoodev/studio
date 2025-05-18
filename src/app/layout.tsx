import type {Metadata} from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { appWithTranslation } from 'next-i18next'; // Updated import path
import './globals.css';
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/context/AuthContext'; // Added AuthProvider
import { AppLayout } from '@/components/layout/AppLayout'; // Added AppLayout

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'FlexFit AI',
  description: 'Your Personal AI Fitness Coach',
};

 function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          {/* LanguageSwitcher might be better inside AppLayout or specific pages if it needs client context not available here */}
          {/* <LanguageSwitcher /> */}
          <AppLayout>
            {children}
          </AppLayout>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}

export default appWithTranslation(RootLayout);