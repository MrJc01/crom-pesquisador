// Tipos de dados para integração com backend Go

export interface SearchResult {
  id: string;
  site: string;
  url: string;
  breadcrumb: string;
  title: string;
  snippet: string;
  favicon?: string;
  color: string;
  sitelinks?: string[];
}

export interface ImageResult {
  id: string;
  src: string;
  alt: string;
  site: string;
  width?: number;
  height?: number;
}

export interface VideoResult {
  id: string;
  title: string;
  channel: string;
  views: string;
  duration: string;
  thumb: string;
  url?: string;
}

export interface NewsResult {
  id: string;
  title: string;
  source: string;
  time: string;
  snippet: string;
  url?: string;
}

export interface CodeResult {
  id: string;
  repo: string;
  file: string;
  lang: string;
  snippet: string;
  url?: string;
}

export interface KnowledgePanel {
  title: string;
  subtitle: string;
  description: string;
  image?: string;
  facts: { label: string; value: string; link?: string }[];
}

export interface SearchResponse {
  query: string;
  total: number;
  time: number;
  results: SearchResult[];
  images: ImageResult[];
  videos: VideoResult[];
  news: NewsResult[];
  code: CodeResult[];
  knowledgePanel?: KnowledgePanel;
  related: string[];
  hasMore: boolean;
  page: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface HistoryEntry {
  id: string;
  query: string;
  tab: TabType;
  timestamp: number;
}

export type TabType = 'all' | 'images' | 'videos' | 'news' | 'code';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface Settings {
  theme: ThemeMode;
  historyEnabled: boolean;
  autocompleteEnabled: boolean;
  openInNewTab: boolean;
  resultsPerPage: number;
  language: string;
  region: string;
}

// ===== Link Detail (Node) =====

export interface LinkMeta {
  title: string;
  description: string;
  ogImage?: string;
  ogType?: string;
  canonical?: string;
  favicon?: string;
  author?: string;
  publishedDate?: string;
  modifiedDate?: string;
  language?: string;
  keywords: string[];
}

export interface LinkTechnical {
  domain: string;
  ipMasked: string;      // Ex: "104.21.***.***" (LGPD)
  ssl: boolean;
  sslIssuer?: string;
  httpStatus: number;
  responseTimeMs: number;
  server?: string;
  contentType: string;
  contentLength?: number;
}

export interface LinkAnalytics {
  searchAppearances: number;
  lastCrawled: string;     // ISO date
  firstSeen: string;       // ISO date
  cromRank: number;        // 0-100
  categoryTags: string[];
}

export interface LinkComment {
  id: string;
  ipHash: string;          // Hash único do IP
  ipMasked: string;        // Ex: "192.168.***.***"
  content: string;
  timestamp: number;
  upvotes: number;
  downvotes: number;
  userVote?: 'up' | 'down' | null;
}

export interface LinkRelated {
  id: string;
  title: string;
  url: string;
  type: 'page' | 'image' | 'video' | 'news' | 'code';
}

export interface LinkDetail {
  id: string;
  url: string;
  type: 'page' | 'image' | 'video' | 'news' | 'code';
  meta: LinkMeta;
  technical: LinkTechnical;
  analytics: LinkAnalytics;
  comments: LinkComment[];
  related: LinkRelated[];
}
