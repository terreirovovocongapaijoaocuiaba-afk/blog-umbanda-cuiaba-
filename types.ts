
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

// --- NEW COMMERCIAL TYPES ---

export interface Transaction {
  id: string;
  order_id: string; // Kiwify ID
  product_name: string;
  customer_email: string;
  customer_name: string;
  amount: number;
  status: 'paid' | 'pending' | 'refused' | 'refunded' | 'chargedback';
  payment_method: 'credit_card' | 'pix' | 'boleto';
  created_at: any;
  utm_source?: string; // Rastreamento de origem
}

export interface Subscription {
  id: string;
  user_email: string;
  plan: 'monthly' | 'yearly' | 'lifetime';
  status: 'active' | 'canceled' | 'past_due';
  start_date: any;
  next_payment: any;
  kiwify_subscription_id: string;
}

export interface AnalyticsMetric {
  id: string;
  event_type: 'page_view' | 'click_cta' | 'attempt_premium' | 'conversion';
  page: string;
  user_status: 'free' | 'premium';
  timestamp: any;
}

export interface AppNotification {
  id: string;
  targetId?: string; // 'global' ou ID do usuário/device
  type: 'payment' | 'system' | 'insight' | 'offer';
  title: string;
  message: string;
  read: boolean;
  timestamp: number;
  actionLink?: string;
  actionLabel?: string;
  priority?: 'high' | 'normal' | 'low';
}
