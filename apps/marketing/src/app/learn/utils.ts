'use server';

import { LearnPostMetadata } from '@/types/mdx';
import { readdir } from 'fs/promises';
import path from 'path';

export type LearnPost = {
  slug: string;
} & LearnPostMetadata;

export async function getLearnPosts(): Promise<LearnPost[]> {
  // Resilient: if the (learnPosts) dir is missing or any MDX import fails,
  // return an empty list so callers don't crash the page or sitemap build.
  try {
    const slugs = (
      await readdir(path.join(process.cwd(), './src/app/learn/(learnPosts)'), {
        withFileTypes: true,
      })
    ).filter((dirent) => dirent.isDirectory());

    const posts = await Promise.all(
      slugs.map(async ({ name }) => {
        try {
          const { metadata } = await import(`./(learnPosts)/${name}/page.mdx`);
          return { slug: name, ...metadata };
        } catch (err) {
          console.warn(`[getLearnPosts] Skipping ${name}:`, err);
          return null;
        }
      })
    );

    return posts
      .filter((p): p is LearnPost => p !== null)
      .sort((a, b) => +new Date(b.publishDate) - +new Date(a.publishDate));
  } catch (err) {
    console.warn('[getLearnPosts] Returning empty list:', err);
    return [];
  }
}

export async function getLearnPostBySlug(
  slugs: string[]
): Promise<LearnPost[]> {
  const posts = await Promise.all(
    slugs.map(async (slug) => {
      const { metadata } = await import(`./(learnPosts)/${slug}/page.mdx`);
      return { slug, ...metadata };
    })
  );

  return posts;
}
