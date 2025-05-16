
"use client";

import { Dumbbell } from 'lucide-react';

export function Preloader() {
  return (
    <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="animate-dumbbell-lift">
        <Dumbbell className="h-16 w-16 text-primary" strokeWidth={2.5} />
      </div>
      <p className="mt-6 text-lg font-medium text-foreground animate-pulse">
        Loading FlexFit AI...
      </p>
    </div>
  );
}
