
import type { ReactNode } from 'react';
import { FlexAIFitLogo } from '@/components/icons/FlexAIFitLogo';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8">
        <Link href="/">
          <FlexAIFitLogo className="h-10 w-auto" />
        </Link>
      </div>
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
