'use client';

import { Button } from '@trylinky/ui';
import { Metadata } from 'next';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface LinkRow {
  id: string;
  title: string;
  url: string;
}

const STORAGE_KEY = 'linky:editor:v1';

interface EditorState {
  username: string;
  bio: string;
  links: LinkRow[];
}

const defaultState: EditorState = {
  username: '',
  bio: '',
  links: [
    { id: crypto.randomUUID(), title: '', url: '' },
  ],
};

export default function EditorPage() {
  const [state, setState] = useState<EditorState>(defaultState);
  const [saved, setSaved] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage once on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState(JSON.parse(raw));
    } catch {
      // Ignore storage errors (private mode, quota, etc.)
    }
    setHydrated(true);
  }, []);

  // Persist any change to localStorage.
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setSaved(true);
      const t = setTimeout(() => setSaved(false), 1200);
      return () => clearTimeout(t);
    } catch {
      // Ignore
    }
  }, [state, hydrated]);

  const updateLink = (id: string, patch: Partial<LinkRow>) => {
    setState((prev) => ({
      ...prev,
      links: prev.links.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    }));
  };

  const addLink = () => {
    setState((prev) => ({
      ...prev,
      links: [
        ...prev.links,
        { id: crypto.randomUUID(), title: '', url: '' },
      ],
    }));
  };

  const removeLink = (id: string) => {
    setState((prev) => ({
      ...prev,
      links: prev.links.filter((l) => l.id !== id),
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f9f9f8] to-[#f5f3ea] py-12">
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900">
              Your Linky page
            </h1>
            <p className="mt-2 text-gray-600">
              No signup required. Saved automatically to your browser.{' '}
              {saved && (
                <span className="text-green-600 font-medium">✓ Saved</span>
              )}
            </p>
          </div>
          <Link href="/">
            <Button variant="ghost" className="rounded-full">
              ← Back to home
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Editor */}
          <div className="bg-white rounded-2xl shadow ring-1 ring-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Edit</h2>

            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Username
            </label>
            <div className="flex items-center rounded-full bg-gray-50 ring-1 ring-gray-200 px-4 py-2 mb-6">
              <span className="text-gray-500 mr-1">lin.ky/</span>
              <input
                type="text"
                value={state.username}
                onChange={(e) =>
                  setState({ ...state, username: e.target.value })
                }
                placeholder="yourname"
                className="flex-1 bg-transparent border-0 px-0 focus:outline-none focus:ring-0 text-gray-900"
              />
            </div>

            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              value={state.bio}
              onChange={(e) => setState({ ...state, bio: e.target.value })}
              placeholder="A short tagline about you"
              rows={3}
              className="w-full rounded-xl bg-gray-50 ring-1 ring-gray-200 px-4 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900"
            />

            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-700">Links</h3>
              <Button
                onClick={addLink}
                variant="outline"
                size="sm"
                className="rounded-full"
              >
                + Add link
              </Button>
            </div>

            <div className="space-y-3">
              {state.links.map((link) => (
                <div
                  key={link.id}
                  className="rounded-xl bg-gray-50 ring-1 ring-gray-200 p-3"
                >
                  <input
                    type="text"
                    value={link.title}
                    onChange={(e) =>
                      updateLink(link.id, { title: e.target.value })
                    }
                    placeholder="Link title"
                    className="w-full bg-transparent border-0 mb-2 focus:outline-none focus:ring-0 text-gray-900 font-medium"
                  />
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) =>
                      updateLink(link.id, { url: e.target.value })
                    }
                    placeholder="https://example.com"
                    className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 text-gray-600 text-sm"
                  />
                  {state.links.length > 1 && (
                    <button
                      onClick={() => removeLink(link.id)}
                      className="text-xs text-red-500 mt-2 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-2xl shadow ring-1 ring-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Preview</h2>
            <div className="rounded-2xl bg-gradient-to-b from-[#f3efe2] to-[#e3dfd2] p-6 text-center min-h-[400px]">
              <div className="mx-auto w-20 h-20 rounded-full bg-white shadow flex items-center justify-center text-3xl font-black text-gray-700 mb-4">
                {state.username
                  ? state.username.slice(0, 1).toUpperCase()
                  : '?'}
              </div>
              <div className="font-bold text-gray-900 text-lg">
                @{state.username || 'yourname'}
              </div>
              <div className="text-gray-600 text-sm mb-6 whitespace-pre-line">
                {state.bio || 'Your tagline will appear here.'}
              </div>
              <div className="space-y-2">
                {state.links
                  .filter((l) => l.title || l.url)
                  .map((link) => (
                    <a
                      key={link.id}
                      href={link.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-full bg-white px-6 py-3 font-semibold text-gray-900 shadow hover:shadow-md transition-shadow"
                    >
                      {link.title || link.url}
                    </a>
                  ))}
                {state.links.every((l) => !l.title && !l.url) && (
                  <div className="text-gray-400 text-sm py-8">
                    Add a link to see it here
                  </div>
                )}
              </div>
            </div>
            <p className="text-center text-xs text-gray-500 mt-4">
              Changes save to your browser automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
