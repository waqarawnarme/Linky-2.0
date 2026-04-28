import { getLearnPosts } from '@/app/learn/utils';
import { getBlogPosts } from '@/lib/cms/get-blog-posts';
import { MetadataRoute } from 'next';

const baseUrl = `https://lin.ky`;

const baseSitemap = [
  {
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 1,
  },
  {
    url: `${baseUrl}/i/pricing`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  },
  {
    url: `${baseUrl}/i/terms`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.4,
  },
  {
    url: `${baseUrl}/i/privacy`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.4,
  },
  {
    url: `${baseUrl}/i/tiktok`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.4,
  },
  {
    url: `${baseUrl}/i/explore`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.4,
  },
];
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogSitemap = await generateBlogSitemap(baseUrl);
  const learnSitemap = await generateLearnSitemap(baseUrl);

  return [
    ...baseSitemap,
    ...blogSitemap,
    ...learnSitemap,
  ] as MetadataRoute.Sitemap;
}

const generateBlogSitemap = async (baseUrl: string) => {
  // Hygraph CMS is optional during deployment — if HYGRAPH_ENDPOINT/HYGRAPH_TOKEN
  // aren't configured, swallow the error and return only the static blog index page.
  let blogPosts: Awaited<ReturnType<typeof getBlogPosts>> = [];
  try {
    blogPosts = await getBlogPosts();
  } catch (err) {
    console.warn('[sitemap] Skipping blog posts — CMS not configured:', err);
  }

  const blogSitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/i/blog/${post.slug}`,
    lastModified: new Date(post.displayedPublishedAt),
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  return [
    {
      url: `${baseUrl}/i/blog`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...blogSitemap,
  ];
};

const generateLearnSitemap = async (baseUrl: string) => {
  const posts = await getLearnPosts();

  const postsSitemap = posts.map((post) => ({
    url: `${baseUrl}/i/learn/${post.slug}`,
    lastModified: new Date(post.publishDate),
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  return [
    {
      url: `${baseUrl}/i/learn`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...postsSitemap,
  ];
};
