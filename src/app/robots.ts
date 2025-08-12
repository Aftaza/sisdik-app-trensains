import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*', // Berlaku untuk semua robot
      disallow: '/',  // Larang akses ke semua halaman di situs
    },
  };
}