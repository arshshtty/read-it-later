import { extract } from '@extractus/article-extractor';

export interface ArticleData {
  title?: string;
  description?: string;
  image?: string;
  content?: string;
}

export const extractArticle = async (url: string): Promise<ArticleData> => {
  try {
    const article = await extract(url);

    if (!article) {
      return {
        title: url,
        description: '',
        image: undefined,
        content: '',
      };
    }

    return {
      title: article.title || url,
      description: article.description || '',
      image: article.image || undefined,
      content: article.content || '',
    };
  } catch (error) {
    console.error('Article extraction error:', error);
    // Return minimal data if extraction fails
    return {
      title: url,
      description: '',
      image: undefined,
      content: '',
    };
  }
};
