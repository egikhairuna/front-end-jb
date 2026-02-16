import { MetadataRoute } from 'next';
import { serverClient } from '@/lib/graphql/server-client';
import { GET_ALL_POSTS_FOR_SITEMAP, GET_ALL_PRODUCTS_FOR_SITEMAP } from '@/lib/graphql/queries';

const SITE_URL = 'https://jamesboogie.com';

interface SitemapNode {
  slug: string;
  modified: string;
}

interface PostsResponse {
  posts: {
    nodes: SitemapNode[];
  };
}

interface ProductsResponse {
  products: {
    nodes: SitemapNode[];
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages with high priority
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/journal`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/our-story`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/our-people`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/ventile`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/links`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/how-to-order`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/contact-us`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/our-services`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/returns-refunds`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  try {
    // Fetch all published posts
    const postsData = await serverClient.request<PostsResponse>(GET_ALL_POSTS_FOR_SITEMAP);
    const posts: MetadataRoute.Sitemap = postsData.posts.nodes.map((post) => ({
      url: `${SITE_URL}/journal/${post.slug}`,
      lastModified: new Date(post.modified),
      changeFrequency: 'weekly',
      priority: 0.6,
    }));

    // Fetch all published products
    const productsData = await serverClient.request<ProductsResponse>(GET_ALL_PRODUCTS_FOR_SITEMAP);
    const products: MetadataRoute.Sitemap = productsData.products.nodes.map((product) => ({
      url: `${SITE_URL}/shop/${product.slug}`,
      lastModified: new Date(product.modified),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    // Combine all URLs
    return [...staticPages, ...posts, ...products];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // Return static pages as fallback if GraphQL fetch fails
    return staticPages;
  }
}

