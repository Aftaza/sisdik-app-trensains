
'use client';

import { useIsMobile } from '@/hooks/use-mobile';
import UnsupportedDevicePage from './unsupported-device';

export default function ResponsiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <UnsupportedDevicePage />;
  }

  return <>{children}</>;
}
