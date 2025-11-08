import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { linksApi } from '../services/api';
import type { ReaderTheme } from '../types';

export default function ReaderPage() {
  const { id } = useParams<{ id: string }>();
  const [theme, setTheme] = useState<ReaderTheme>('light');

  const { data: link, isLoading } = useQuery({
    queryKey: ['link', id],
    queryFn: async () => {
      const { data } = await linksApi.getLink(id!);
      return data;
    },
    enabled: !!id,
  });

  const getThemeClass = () => {
    switch (theme) {
      case 'dark':
        return 'reader-dark';
      case 'sepia':
        return 'reader-sepia';
      default:
        return 'reader-light';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!link) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Link not found</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${getThemeClass()}`}>
      {/* Reader Controls */}
      <div className="sticky top-0 bg-white border-b border-gray-200 shadow-sm z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link
            to="/"
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            ← Back to List
          </Link>
          <div className="flex gap-2">
            <button
              onClick={() => setTheme('light')}
              className={`px-4 py-2 rounded text-sm ${
                theme === 'light'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Light
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`px-4 py-2 rounded text-sm ${
                theme === 'dark'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Dark
            </button>
            <button
              onClick={() => setTheme('sepia')}
              className={`px-4 py-2 rounded text-sm ${
                theme === 'sepia'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Sepia
            </button>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <article className="reader-content">
        <h1 className="text-4xl font-bold mb-4">{link.title}</h1>

        {link.imageUrl && (
          <img
            src={link.imageUrl}
            alt={link.title || ''}
            className="w-full rounded-lg mb-6"
          />
        )}

        <div className="mb-6 text-sm opacity-70">
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            {link.url}
          </a>
        </div>

        {link.content ? (
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: link.content }}
          />
        ) : (
          <div className="text-center py-12 opacity-70">
            <p className="mb-4">Article content could not be extracted.</p>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline"
            >
              View original article →
            </a>
          </div>
        )}
      </article>
    </div>
  );
}
