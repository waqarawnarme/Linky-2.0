import { signIn } from './auth';

// Google OAuth removed per project scope. Twitter/TikTok left for future use.
type Provider = 'twitter' | 'tiktok';

export const signInOauth = async (provider: Provider, redirectTo?: string) => {
  const data = await signIn.social({
    provider: provider as any,
    callbackURL: redirectTo,
  });

  return data;
};
