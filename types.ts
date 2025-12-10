export interface Ritual {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  duration: string;
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
  isVip?: boolean; // Monetização
}

export interface Entity {
  id: string;
  name: string;
  line: string;
  description: string;
  color: string;
  greeting: string;
  symbol: string;
}

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content?: string;
  author: string;
  authorRole?: string;
  authorAvatar?: string;
  date: string;
  tags: string[];
  imageUrl: string;
  likes?: number;
  views?: number; // Analytics
  isVip?: boolean; // Monetização
  focusKeyword?: string; // SEO
  metaTitle?: string; // SEO
  metaDescription?: string; // SEO
  faqs?: { question: string; answer: string }[];
  audioUrl?: string; // Mídia Interativa
  audioDuration?: string;
}

export interface Comment {
  id: string;
  name: string;
  text: string;
  createdAt: any;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  avatarUrl: string;
}

export interface VipContent {
  id: string;
  title: string;
  type: 'video' | 'ebook' | 'ritual_exclusivo';
  description: string;
  url: string;
  thumbnailUrl: string;
  exclusive: boolean;
}

export interface Subscriber {
  id: string;
  email: string;
  plan: 'free' | 'monthly' | 'yearly';
  status: 'active' | 'past_due' | 'canceled';
  joinedAt: any;
}