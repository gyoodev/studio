import type {Metadata} from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { appWithTranslation } from 'next-i18next/dist/commonjs';
import './globals.css';
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Toaster } from "@/components/ui/toaster";
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
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <LanguageSwitcher />
        {children}
      </body>
    </html>
  );
}

export default appWithTranslation(RootLayout);
