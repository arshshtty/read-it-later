import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { linksApi, categoriesApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import type { Link as LinkType } from '../types';

export default function DashboardPage() {
  const [url, setUrl] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const queryClient = useQueryClient();
  const { user, logout } = useAuthStore();
  const { isDarkMode, toggleTheme } = useThemeStore();

  // Fetch links
  const { data: links = [], isLoading } = useQuery({
    queryKey: ['links', selectedCategory, showUnreadOnly, search],
    queryFn: async () => {
      const { data } = await linksApi.getLinks({
        categoryId: selectedCategory,
        isRead: showUnreadOnly ? false : undefined,
        search: search || undefined,
      });
      return data;
    },
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await categoriesApi.getCategories();
      return data;
    },
  });

  // Create link mutation
  const createLinkMutation = useMutation({
    mutationFn: (url: string) => linksApi.createLink(url),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      setUrl('');
    },
  });

  // Toggle read mutation
  const toggleReadMutation = useMutation({
    mutationFn: ({ id, isRead }: { id: string; isRead: boolean }) =>
      linksApi.updateLink(id, { isRead: !isRead }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
    },
  });

  // Delete link mutation
  const deleteLinkMutation = useMutation({
    mutationFn: (id: string) => linksApi.deleteLink(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
    },
  });

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      createLinkMutation.mutate(url);
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-dark-bg-lighter border-b border-gray-200 dark:border-dark-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-dark-accent-blue to-dark-accent-purple flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-dark-accent-blue to-dark-accent-purple bg-clip-text text-transparent">
                Read It Later
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-dark-bg-light hover:bg-gray-200 dark:hover:bg-dark-bg transition-colors"
                aria-label="Toggle theme"
              >
                {isDarkMode ? (
                  <svg className="w-5 h-5 text-dark-accent-yellow" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-dark-accent-purple" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
              <span className="text-sm text-gray-600 dark:text-dark-muted">
                {user?.email}
              </span>
              <button
                onClick={logout}
                className="text-sm font-medium text-dark-accent-red hover:underline"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Link Form */}
        <form onSubmit={handleAddLink} className="mb-8">
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-dark-text-light">Save a New Link</h2>
            <div className="flex gap-3">
              <input
                type="url"
                placeholder="Paste URL here..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="input flex-1"
              />
              <button
                type="submit"
                disabled={createLinkMutation.isPending}
                className="btn btn-primary px-8"
              >
                {createLinkMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Adding...
                  </span>
                ) : (
                  'Add Link'
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Filters */}
        <div className="card p-4 mb-6">
          <div className="flex gap-3 flex-wrap items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-dark-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search links..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>
            </div>
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || undefined)}
              className="input"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-dark-bg-light cursor-pointer hover:bg-gray-200 dark:hover:bg-dark-bg transition-colors">
              <input
                type="checkbox"
                checked={showUnreadOnly}
                onChange={(e) => setShowUnreadOnly(e.target.checked)}
                className="w-4 h-4 rounded text-dark-accent-blue focus:ring-dark-accent-blue dark:bg-dark-bg-light dark:border-dark-border"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-dark-text">Unread only</span>
            </label>
          </div>
        </div>

        {/* Links List */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="flex flex-col items-center gap-3">
              <svg className="animate-spin h-10 w-10 text-dark-accent-blue" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-dark-muted">Loading your links...</p>
            </div>
          </div>
        ) : links.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-dark-accent-blue/10 dark:bg-dark-accent-blue/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-dark-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-light mb-1">No links saved yet</h3>
                <p className="text-sm text-gray-600 dark:text-dark-muted">Start building your reading list by adding your first link above!</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {links.map((link: LinkType) => (
              <div
                key={link.id}
                className="card-hover p-5 group"
              >
                <div className="flex gap-5">
                  {link.imageUrl && (
                    <div className="flex-shrink-0">
                      <img
                        src={link.imageUrl}
                        alt=""
                        className="w-32 h-32 object-cover rounded-lg border-2 border-transparent group-hover:border-dark-accent-blue/20 transition-colors"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-dark-text-light leading-tight">
                        {link.title || 'Untitled'}
                      </h3>
                      {link.isRead && (
                        <span className="flex-shrink-0 px-2 py-1 text-xs font-medium rounded-full bg-dark-accent-green/10 text-dark-accent-green">
                          Read
                        </span>
                      )}
                    </div>
                    {link.description && (
                      <p className="text-sm text-gray-600 dark:text-dark-muted mb-3 line-clamp-2">
                        {link.description}
                      </p>
                    )}
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-dark-accent-blue hover:underline break-all line-clamp-1"
                    >
                      {link.url}
                    </a>
                  </div>
                  <div className="flex-shrink-0 flex flex-col gap-2">
                    <Link
                      to={`/reader/${link.id}`}
                      className="btn btn-primary text-sm whitespace-nowrap"
                    >
                      <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      Read
                    </Link>
                    <button
                      onClick={() =>
                        toggleReadMutation.mutate({
                          id: link.id,
                          isRead: link.isRead,
                        })
                      }
                      className={`btn text-sm whitespace-nowrap ${
                        link.isRead
                          ? 'btn-secondary'
                          : 'btn-success'
                      }`}
                    >
                      {link.isRead ? (
                        <>
                          <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Unread
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Mark Read
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => deleteLinkMutation.mutate(link.id)}
                      className="btn btn-danger text-sm"
                    >
                      <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
