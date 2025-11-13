export interface Article {
  id: string;
  title: string;
  summary: string;
  imageUrl: string;
  category: string;
  publishedAt: string;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  articleCount: number;
  latestPostDate?: string;
}

export interface ArticleCardProps {
  article: Article;
  onSummaryClick: (article: Article) => void;
}

export interface SummaryModalProps {
  article: Article | null;
  isOpen: boolean;
  onClose: () => void;
}

export interface LoadMoreButtonProps {
  onLoadMore: () => void;
  isLoading: boolean;
  hasMore: boolean;
}