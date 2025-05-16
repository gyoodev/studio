
import type { ReactNode } from 'react';
import { FlexFitAILogo } from '@/components/icons/FlexFitAILogo'; // Updated import
import Link from 'next/link';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8">
        <Link href="/">
          <FlexFitAILogo className="h-10 w-auto" /> {/* Updated usage */}
        </Link>
      </div>
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
