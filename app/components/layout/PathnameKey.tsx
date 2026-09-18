'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';

export function PathnameKey({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return children;
}
