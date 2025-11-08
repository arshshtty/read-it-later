import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { linksApi, categoriesApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import type { Link as LinkType } from '../types';

export default function DashboardPage() {
  const [url, setUrl] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const queryClient = useQueryClient();
  const { user, logout } = useAuthStore();

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Read It Later</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user?.email}
            </span>
            <button
              onClick={logout}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Link Form */}
        <form onSubmit={handleAddLink} className="mb-8">
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="Enter URL to save..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={createLinkMutation.isPending}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {createLinkMutation.isPending ? 'Adding...' : 'Add Link'}
            </button>
          </div>
        </form>

        {/* Filters */}
        <div className="mb-6 flex gap-4 flex-wrap">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value || undefined)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showUnreadOnly}
              onChange={(e) => setShowUnreadOnly(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700">Unread only</span>
          </label>
        </div>

        {/* Links List */}
        {isLoading ? (
          <div className="text-center py-12">Loading...</div>
        ) : links.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No links saved yet. Add your first link above!
          </div>
        ) : (
          <div className="grid gap-4">
            {links.map((link: LinkType) => (
              <div
                key={link.id}
                className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4">
                  {link.imageUrl && (
                    <img
                      src={link.imageUrl}
                      alt=""
                      className="w-24 h-24 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">
                      {link.title || link.url}
                    </h3>
                    {link.description && (
                      <p className="text-sm text-gray-600 mb-2">
                        {link.description}
                      </p>
                    )}
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-600 hover:underline"
                    >
                      {link.url}
                    </a>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Link
                      to={`/reader/${link.id}`}
                      className="px-4 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 text-center"
                    >
                      Read
                    </Link>
                    <button
                      onClick={() =>
                        toggleReadMutation.mutate({
                          id: link.id,
                          isRead: link.isRead,
                        })
                      }
                      className={`px-4 py-2 rounded text-sm ${
                        link.isRead
                          ? 'bg-gray-200 text-gray-700'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {link.isRead ? 'Mark Unread' : 'Mark Read'}
                    </button>
                    <button
                      onClick={() => deleteLinkMutation.mutate(link.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
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
