import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://kickgoal.com',
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1,
    },
    {
      url: 'https://kickgoal.com/standings',
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: 'https://kickgoal.com/matches',
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    },
  ]
}
