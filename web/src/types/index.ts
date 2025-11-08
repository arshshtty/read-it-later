export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface Category {
  id: string;
  name: string;
  color?: string;
  _count?: {
    links: number;
  };
}

export interface Link {
  id: string;
  url: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  content?: string;
  isRead: boolean;
  categoryId?: string;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export type ReaderTheme = 'light' | 'dark' | 'sepia';
