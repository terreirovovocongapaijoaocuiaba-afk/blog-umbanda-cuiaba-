import { Ritual, Entity, Article, Testimonial } from './types';
import { Flame, Moon, Sun, Sparkles, User, Shield, Heart, Anchor } from 'lucide-react';

export const SITE_NAME = "Umbanda Cuiabá";

export const RITUALS: Ritual[] = [
  {
    id: '1',
    title: 'Abertura de Caminhos com Ogum',
    category: 'Prosperidade',
    description: 'Um ritual poderoso para romper barreiras e trazer novas oportunidades profissionais e pessoais.',
    imageUrl: 'https://picsum.photos/id/1015/800/600',
    duration: '30 min',
    difficulty: 'Iniciante'
  },
  {
    id: '2',
    title: 'Firmeza de Proteção com Exu',
    category: 'Proteção',
    description: 'Aprenda a firmar a tronqueira e pedir proteção contra energias densas e inveja.',
    imageUrl: 'https://picsum.photos/id/1029/800/600',
    duration: '45 min',
    difficulty: 'Intermediário'
  },
  {
    id: '3',
    title: 'Banho de Descarrego de 7 Ervas',
    category: 'Limpeza',
    description: 'O clássico banho para limpar a aura e restaurar o equilíbrio espiritual após semanas pesadas.',
    imageUrl: 'https://picsum.photos/id/1043/800/600',
    duration: '20 min',
    difficulty: 'Iniciante'
  },
  {
    id: '4',
    title: 'Adoçamento Amoroso de Oxum',
    category: 'Amor',
    description: 'Para trazer paz, harmonia e doçura para dentro do relacionamento e da família.',
    imageUrl: 'https://picsum.photos/id/1048/800/600',
    duration: '1 hora',
    difficulty: 'Avançado'
  }
];

export const ENTITIES: Entity[] = [
  {
    id: 'exu',
    name: 'Exu',
    line: 'Esquerda',
    description: 'O guardião dos caminhos, mensageiro e executor da lei.',
    color: 'Vermelho e Preto',
    greeting: 'Laroyê Exu!',
    symbol: 'Tridente'
  },
  {
    id: 'pombagira',
    name: 'Pombagira',
    line: 'Esquerda',
    description: 'Senhora da magia, do amor próprio e da força feminina.',
    color: 'Vermelho e Dourado',
    greeting: 'Laroyê Pombagira!',
    symbol: 'Taça'
  },
  {
    id: 'pretovelho',
    name: 'Pretos Velhos',
    line: 'Almas',
    description: 'A sabedoria ancestral, humildade e mandinga de cura.',
    color: 'Preto e Branco',
    greeting: 'Adorei as Almas!',
    symbol: 'Cachimbo'
  },
  {
    id: 'caboclo',
    name: 'Caboclos',
    line: 'Matas',
    description: 'A força da natureza, caçadores e guerreiros espirituais.',
    color: 'Verde e Branco',
    greeting: 'Okê Caboclo!',
    symbol: 'Flecha'
  }
];

export const ARTICLES: Article[] = [
  {
    id: '1',
    title: 'Como montar seu primeiro altar em casa',
    excerpt: 'Guia passo a passo para consagrar seu espaço sagrado com segurança e fundamento.',
    author: 'Mãe Pequena Clara',
    date: '12 Ago 2024',
    tags: ['Fundamentos', 'Altar'],
    imageUrl: 'https://picsum.photos/id/204/800/600'
  },
  {
    id: '2',
    title: 'A diferença entre Umbanda e Candomblé',
    excerpt: 'Entenda as raízes históricas e as práticas que distinguem e unem estas religiões afro-brasileiras.',
    author: 'Pai Antônio',
    date: '05 Set 2024',
    tags: ['História', 'Religião'],
    imageUrl: 'https://picsum.photos/id/216/800/600'
  },
  {
    id: '3',
    title: 'O poder da vela de 7 dias',
    excerpt: 'Quando usar, como acender e como interpretar as chamas durante suas orações.',
    author: 'Mãe Pequena Clara',
    date: '22 Set 2024',
    tags: ['Magia', 'Velas'],
    imageUrl: 'https://picsum.photos/id/336/800/600'
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Juliana S.',
    role: 'Consulente',
    text: 'A gira de Exu mudou minha vida. Sentir a energia e o acolhimento do terreiro me deu forças para vencer a depressão.',
    avatarUrl: 'https://picsum.photos/id/64/100/100'
  },
  {
    id: '2',
    name: 'Ricardo M.',
    role: 'Filho de Santo',
    text: 'Encontrei no Umbanda Cuiabá não só uma religião, mas uma família. O respeito aos fundamentos é impecável.',
    avatarUrl: 'https://picsum.photos/id/91/100/100'
  },
  {
    id: '3',
    name: 'Carla T.',
    role: 'Visitante',
    text: 'Os artigos do blog me ajudaram a entender a espiritualidade sem medo. Hoje acendo minha vela com fé.',
    avatarUrl: 'https://picsum.photos/id/65/100/100'
  }
];