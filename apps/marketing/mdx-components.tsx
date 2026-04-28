import type { ComponentType } from 'react';

// Locally-defined to avoid the runtime dependency on `@types/mdx` during Vercel
// builds. Functionally equivalent to MDXComponents from 'mdx/types'.
type MDXComponents = Record<string, ComponentType<unknown>>;

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
  };
}
