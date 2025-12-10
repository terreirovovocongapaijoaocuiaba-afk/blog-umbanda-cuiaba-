export interface Ritual {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  duration: string;
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
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
  content?: string; // Conteudo completo HTML
  author: string;
  date: string;
  tags: string[];
  imageUrl: string;
  likes?: number; // Campo opcional para contagem de curtidas
}

export interface Comment {
  id: string;
  name: string;
  text: string;
  createdAt: any; // Timestamp do Firestore
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
  url: string; // Link do video ou download
  thumbnailUrl: string;
  exclusive: boolean;
}