import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save, Loader2, Sparkles, AlertCircle, Video, BookOpen, Crown, Wand2, Lightbulb, RefreshCw, ArrowRight } from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { Article, Ritual, Entity, VipContent } from '../../types';
import { GoogleGenAI } from "@google/genai";

const AdminContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'articles' | 'rituals' | 'entities' | 'vip'>('articles');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  
  // Data State
  const [articles, setArticles] = useState<Article[]>([]);
  const [rituals, setRituals] = useState<Ritual[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [vipContent, setVipContent] = useState<VipContent[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // AI State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiKeywords, setAiKeywords] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  // Ideas State
  const [isIdeaModalOpen, setIsIdeaModalOpen] = useState(false);
  const [generatedIdeas, setGeneratedIdeas] = useState<string[]>([]);
  const [ideasLoading, setIdeasLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [artSnap, ritSnap, entSnap, vipSnap] = await Promise.all([
        getDocs(collection(db, 'articles')),
        getDocs(collection(db, 'rituals')),
        getDocs(collection(db, 'entities')),
        getDocs(collection(db, 'vip_content'))
      ]);

      setArticles(artSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article)));
      setRituals(ritSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ritual)));
      setEntities(entSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Entity)));
      setVipContent(vipSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as VipContent)));
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsEditorOpen(true);
  };

  const handleNew = () => {
    setEditingItem(null);
    setIsEditorOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir?")) return;
    
    try {
      let coll = activeTab === 'vip' ? 'vip_content' : activeTab;
      await deleteDoc(doc(db, coll, id));
      
      if (activeTab === 'articles') setArticles(prev => prev.filter(item => item.id !== id));
      else if (activeTab === 'rituals') setRituals(prev => prev.filter(item => item.id !== id));
      else if (activeTab === 'entities') setEntities(prev => prev.filter(item => item.id !== id));
      else setVipContent(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error("Erro ao deletar:", error);
    }
  };

  const generateIdeas = async () => {
      setIdeasLoading(true);
      setGeneratedIdeas([]);
      try {
        const settingsSnap = await getDoc(doc(db, 'settings', 'api_keys'));
        const apiKey = settingsSnap.exists() ? settingsSnap.data().geminiKey : null;

        if (!apiKey) {
            alert('Configure a chave da API Gemini nas configurações.');
            setIdeasLoading(false);
            return;
        }

        const ai = new GoogleGenAI({ apiKey });
        let prompt = "";

        if (activeTab === 'articles') {
            prompt = "Liste 5 títulos criativos, curiosos e com alto potencial de busca (SEO) para artigos de um blog de Umbanda. Fale sobre dúvidas comuns, fundamentos ou história. Retorne APENAS um JSON array de strings: [\"Titulo 1\", \"Titulo 2\"...]";
        } else if (activeTab === 'rituals') {
            prompt = "Liste 5 rituais ou firmezas de Umbanda (ex: prosperidade, amor, proteção) que seriam úteis para um consulente fazer em casa. Retorne APENAS um JSON array de strings.";
        } else if (activeTab === 'entities') {
            prompt = "Liste 5 entidades, orixás ou linhas de trabalho da Umbanda que merecem uma explicação detalhada. Retorne APENAS um JSON array de strings.";
        } else if (activeTab === 'vip') {
            prompt = "Liste 5 ideias de conteúdos exclusivos (Ebooks, Aulas ou Rituais Secretos) para vender em um Clube VIP de Umbanda. Retorne APENAS um JSON array de strings.";
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });

        const ideas = JSON.parse(response.text);
        setGeneratedIdeas(ideas);

      } catch (e: any) {
          console.error(e);
          alert("Erro ao gerar ideias: " + e.message);
      } finally {
          setIdeasLoading(false);
      }
  };

  const handleSelectIdea = (idea: string) => {
      setAiPrompt(idea);
      setAiKeywords("");
      setIsIdeaModalOpen(false);
      setIsAiModalOpen(true);
  };

  const generateWithAI = async () => {
    setAiLoading(true);
    setAiError('');
    try {
        const settingsSnap = await getDoc(doc(db, 'settings', 'api_keys'));
        const apiKey = settingsSnap.exists() ? settingsSnap.data().geminiKey : null;

        if (!apiKey) {
            setAiError('Chave da API Gemini não configurada em Configurações > IA.');
            setAiLoading(false);
            return;
        }

        const ai = new GoogleGenAI({ apiKey });
        
        let promptContext = "";
        let jsonSchema = "";

        // Lógica de Prompt Dinâmico baseada na Aba Ativa
        if (activeTab === 'articles') {
            promptContext = `Escreva um artigo completo para blog de Umbanda. TEMA: ${aiPrompt}. PALAVRAS-CHAVE: ${aiKeywords}.
            REGRAS: Título chamativo, conteúdo HTML com <h2>, <p>, <ul>, min 600 palavras.`;
            jsonSchema = `{
                "title": "Título do Artigo",
                "excerpt": "Resumo curto (meta description)",
                "content": "<p>Conteúdo HTML...</p>",
                "tags": ["tag1", "tag2"],
                "imagePrompt": "Descrição visual em inglês para gerar imagem"
            }`;
        } else if (activeTab === 'rituals') {
            promptContext = `Crie um ritual detalhado de Umbanda. OBJETIVO: ${aiPrompt}. ELEMENTOS: ${aiKeywords}.
            REGRAS: Liste materiais, passo a passo, dificuldade e duração estimada.`;
            jsonSchema = `{
                "title": "Nome do Ritual",
                "category": "Prosperidade|Amor|Proteção|Limpeza|Saúde",
                "difficulty": "Iniciante|Intermediário|Avançado",
                "duration": "Ex: 30 min",
                "description": "Texto completo do ritual com materiais e modo de fazer...",
                "imagePrompt": "Descrição visual do altar ou elementos em inglês"
            }`;
        } else if (activeTab === 'entities') {
            promptContext = `Descreva uma Entidade ou Linha de Umbanda. NOME/LINHA: ${aiPrompt}. DETALHES: ${aiKeywords}.
            REGRAS: Forneça saudação, cores, símbolos e como a entidade trabalha.`;
            jsonSchema = `{
                "name": "Nome da Entidade",
                "line": "Esquerda|Direita|Almas|Matas|Crianças",
                "greeting": "Saudação (Ex: Laroyê)",
                "color": "Cores da entidade",
                "symbol": "Tridente|Taça|Flecha|Cachimbo|Espada|Ancora",
                "description": "História e características da entidade...",
                "imagePrompt": "Descrição visual da entidade em inglês"
            }`;
        } else if (activeTab === 'vip') {
            promptContext = `Crie um título e descrição para um Conteúdo VIP (Ebook ou Vídeo) de Umbanda. TEMA: ${aiPrompt}.
            REGRAS: Descrição persuasiva para venda ou acesso exclusivo.`;
            jsonSchema = `{
                "title": "Título do Material VIP",
                "type": "video|ebook|ritual_exclusivo",
                "description": "Copywriting persuasivo sobre o conteúdo...",
                "url": "https://link-ficticio.com",
                "imagePrompt": "Descrição visual da capa do material em inglês"
            }`;
        }

        const prompt = `
            Você é um Pai de Santo sábio e especialista em SEO.
            ${promptContext}
            
            SAÍDA OBRIGATÓRIA (JSON PURO SEM MARKDOWN):
            ${jsonSchema}
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });

        const generatedData = JSON.parse(response.text);

        // Gera a URL da imagem
        const imageDescription = generatedData.imagePrompt || 'umbanda spiritual atmosphere cinematic lighting';
        const aiImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imageDescription)}?width=800&height=600&nologo=true&seed=${Math.floor(Math.random() * 1000)}`;

        // Mapeia os dados gerados para o formato do State (editingItem)
        let newItemData = {};

        if (activeTab === 'articles') {
            newItemData = {
                title: generatedData.title,
                excerpt: generatedData.excerpt,
                content: generatedData.content,
                tags: generatedData.tags,
                imageUrl: aiImageUrl,
                author: 'Umbanda Cuiabá (IA)',
                date: new Date().toLocaleDateString('pt-BR')
            };
        } else if (activeTab === 'rituals') {
            newItemData = {
                title: generatedData.title,
                imageUrl: aiImageUrl,
                category: generatedData.category,
                difficulty: generatedData.difficulty,
                duration: generatedData.duration,
                description: generatedData.description
            };
        } else if (activeTab === 'entities') {
            newItemData = {
                name: generatedData.name,
                line: generatedData.line,
                description: generatedData.description,
                color: generatedData.color,
                greeting: generatedData.greeting,
                symbol: generatedData.symbol
            };
        } else if (activeTab === 'vip') {
            newItemData = {
                title: generatedData.title,
                type: generatedData.type,
                description: generatedData.description,
                url: generatedData.url,
                thumbnailUrl: aiImageUrl,
                exclusive: true
            };
        }

        setEditingItem(newItemData);
        setIsAiModalOpen(false);
        setIsEditorOpen(true);

    } catch (err: any) {
        console.error(err);
        setAiError('Erro na geração: ' + err.message);
    } finally {
        setAiLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    let data: any = {
        updatedAt: serverTimestamp()
    };
    let collectionName = activeTab === 'vip' ? 'vip_content' : activeTab;

    try {
      if (activeTab === 'articles') {
        data = {
          ...data,
          title: formData.get('title'),
          imageUrl: formData.get('imageUrl') || 'https://picsum.photos/id/1015/800/600',
          author: formData.get('author'),
          date: formData.get('date'),
          excerpt: formData.get('excerpt'),
          content: formData.get('content'),
          tags: (formData.get('tags') as string).split(',').map(t => t.trim()),
        };
      } else if (activeTab === 'rituals') {
        data = {
          ...data,
          title: formData.get('title'),
          imageUrl: formData.get('imageUrl') || 'https://picsum.photos/id/1029/800/600',
          category: formData.get('category'),
          difficulty: formData.get('difficulty'),
          duration: formData.get('duration'),
          description: formData.get('description'),
        };
      } else if (activeTab === 'entities') {
        data = {
          ...data,
          name: formData.get('name'),
          line: formData.get('line'),
          description: formData.get('description'),
          color: formData.get('color'),
          greeting: formData.get('greeting'),
          symbol: formData.get('symbol'),
        };
      } else if (activeTab === 'vip') {
        data = {
            ...data,
            title: formData.get('title'),
            description: formData.get('description'),
            type: formData.get('type'),
            url: formData.get('url'),
            thumbnailUrl: formData.get('thumbnailUrl') || 'https://picsum.photos/id/1/200/200',
            exclusive: true
        };
      }

      if (editingItem && editingItem.id) {
        await updateDoc(doc(db, collectionName, editingItem.id), data);
      } else {
        data.createdAt = serverTimestamp(); // Adiciona timestamp na criação
        await addDoc(collection(db, collectionName), data);
      }
      
      setIsEditorOpen(false);
      fetchData(); 
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar dados.");
    } finally {
      setSaving(false);
    }
  };
  
  // Helper para o Label do Modal de IA
  const getAiModalLabel = () => {
      if (activeTab === 'articles') return "Sobre o que é o artigo?";
      if (activeTab === 'rituals') return "Qual o objetivo do ritual?";
      if (activeTab === 'entities') return "Qual entidade ou linha?";
      if (activeTab === 'vip') return "Tema do material VIP?";
      return "Tema";
  };
  
  const getAiKeywordLabel = () => {
      if (activeTab === 'rituals') return "Materiais principais (ex: velas, ervas)";
      if (activeTab === 'entities') return "Detalhes (ex: cor, saudação)";
      return "Palavras-chave";
  };

  return (
    <div className="animate-fadeIn relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white">Gerenciador de Conteúdo</h1>
          <p className="text-stone-400 mt-1">Edite, crie ou remova publicações.</p>
        </div>
        <div className="flex flex-wrap gap-2">
            <button 
                onClick={() => { setIsIdeaModalOpen(true); generateIdeas(); }}
                className="bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors border border-stone-700"
            >
                <Lightbulb size={18} className="text-yellow-400"/>
                <span className="hidden md:inline">Quero Ideias</span>
            </button>
            <button 
                onClick={() => setIsAiModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors border border-indigo-500 shadow-lg shadow-indigo-900/50"
            >
                <Wand2 size={18} />
                <span className="hidden md:inline">Criar com IA</span>
            </button>
            <button 
                onClick={handleNew}
                className="bg-umbanda-gold hover:bg-yellow-600 text-stone-950 font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
            >
                <Plus size={18} />
                <span>Cadastrar Novo</span>
            </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 bg-stone-900 p-2 rounded-lg mb-6 border border-stone-800">
        <TabButton id="articles" label="Artigos do Blog" active={activeTab} set={setActiveTab} />
        <TabButton id="rituals" label="Rituais" active={activeTab} set={setActiveTab} />
        <TabButton id="entities" label="Entidades" active={activeTab} set={setActiveTab} />
        <TabButton id="vip" label="Clube VIP" active={activeTab} set={setActiveTab} />
      </div>

      {/* Table Area */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-umbanda-gold animate-spin" />
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-950 text-stone-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold border-b border-stone-800">Título / Nome</th>
                <th className="p-4 font-bold border-b border-stone-800 hidden md:table-cell">Tipo / Categoria</th>
                <th className="p-4 font-bold border-b border-stone-800 hidden md:table-cell">Info</th>
                <th className="p-4 font-bold border-b border-stone-800 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800">
              {activeTab === 'articles' && articles.map(item => (
                <Row key={item.id} title={item.title} sub={item.tags?.[0]} info={item.author} onEdit={() => handleEdit(item)} onDel={() => handleDelete(item.id)} />
              ))}
              {activeTab === 'rituals' && rituals.map(item => (
                <Row key={item.id} title={item.title} sub={item.category} info={item.difficulty} onEdit={() => handleEdit(item)} onDel={() => handleDelete(item.id)} />
              ))}
              {activeTab === 'entities' && entities.map(item => (
                <Row key={item.id} title={item.name} sub={item.line} info={item.greeting} onEdit={() => handleEdit(item)} onDel={() => handleDelete(item.id)} />
              ))}
              {activeTab === 'vip' && vipContent.map(item => (
                <Row key={item.id} title={item.title} sub={item.type} info="Exclusivo" onEdit={() => handleEdit(item)} onDel={() => handleDelete(item.id)} />
              ))}
              
              {/* Empty States */}
              {((activeTab === 'articles' && articles.length === 0) || (activeTab === 'rituals' && rituals.length === 0) || (activeTab === 'entities' && entities.length === 0) || (activeTab === 'vip' && vipContent.length === 0)) && (
                 <tr><td colSpan={4} className="p-8 text-center text-stone-500">Nenhum registro encontrado nesta seção.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Ideas Generator Modal */}
      {isIdeaModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-stone-900 border border-stone-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative animate-fadeIn">
                  <button onClick={() => setIsIdeaModalOpen(false)} className="absolute top-4 right-4 text-stone-500 hover:text-white"><X size={24}/></button>
                  
                  <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-full bg-yellow-900/50 flex items-center justify-center border border-yellow-600 text-yellow-400">
                          <Lightbulb size={20} />
                      </div>
                      <div>
                          <h2 className="text-xl font-bold text-white">Ideias para {activeTab === 'vip' ? 'Clube VIP' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
                          <p className="text-xs text-stone-400">Sugestões geradas por IA para você criar agora.</p>
                      </div>
                  </div>

                  {ideasLoading ? (
                      <div className="py-12 flex flex-col items-center justify-center text-stone-500">
                          <Loader2 className="w-8 h-8 text-yellow-400 animate-spin mb-4" />
                          <p>Buscando inspiração na Aruanda...</p>
                      </div>
                  ) : (
                      <div className="space-y-3">
                          {generatedIdeas.map((idea, idx) => (
                              <button 
                                key={idx}
                                onClick={() => handleSelectIdea(idea)}
                                className="w-full text-left p-4 rounded-lg bg-stone-950 border border-stone-800 hover:border-yellow-500 hover:bg-stone-900 transition-all flex justify-between items-center group"
                              >
                                  <span className="text-stone-300 group-hover:text-white text-sm font-medium">{idea}</span>
                                  <ArrowRight size={16} className="text-stone-600 group-hover:text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </button>
                          ))}
                          <button 
                            onClick={generateIdeas}
                            className="w-full py-3 mt-4 text-xs font-bold uppercase text-stone-500 hover:text-white flex items-center justify-center gap-2"
                          >
                            <RefreshCw size={14} /> Gerar novas ideias
                          </button>
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* AI Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-stone-900 border border-stone-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative">
                <button onClick={() => setIsAiModalOpen(false)} className="absolute top-4 right-4 text-stone-500 hover:text-white"><X size={24}/></button>
                
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-indigo-900/50 flex items-center justify-center border border-indigo-500 text-indigo-400">
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Criar com IA</h2>
                        <p className="text-xs text-stone-400 capitalize">Gerando para: {activeTab}</p>
                    </div>
                </div>

                {aiError && (
                    <div className="bg-red-900/30 border border-red-800 text-red-300 p-3 rounded mb-4 text-sm flex gap-2 items-center">
                        <AlertCircle size={16} /> {aiError}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase text-stone-500 mb-2">{getAiModalLabel()}</label>
                        <input 
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            placeholder="Descreva o que deseja criar..."
                            className="w-full bg-stone-950 border border-stone-800 rounded p-3 text-white focus:border-indigo-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-stone-500 mb-2">{getAiKeywordLabel()}</label>
                        <input 
                            value={aiKeywords}
                            onChange={(e) => setAiKeywords(e.target.value)}
                            placeholder="Informações adicionais..."
                            className="w-full bg-stone-950 border border-stone-800 rounded p-3 text-white focus:border-indigo-500 focus:outline-none"
                        />
                    </div>
                    <button 
                        onClick={generateWithAI}
                        disabled={aiLoading || !aiPrompt}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {aiLoading ? <Loader2 className="animate-spin" /> : <Wand2 size={20} />}
                        {aiLoading ? 'Trabalhando...' : 'Gerar Conteúdo Mágico'}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Main Editor Drawer */}
      {isEditorOpen && (
        <>
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" onClick={() => setIsEditorOpen(false)}></div>
          <form onSubmit={handleSave} className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-stone-900 border-l border-stone-800 shadow-2xl z-50 overflow-y-auto">
            <div className="p-6 border-b border-stone-800 flex justify-between items-center bg-stone-950 sticky top-0 z-10">
              <h2 className="text-xl font-serif font-bold text-white capitalize">
                {editingItem?.id ? 'Editar' : 'Criar'} {activeTab === 'vip' ? 'Conteúdo VIP' : activeTab === 'articles' ? 'Artigo' : activeTab === 'rituals' ? 'Ritual' : 'Entidade'}
              </h2>
              <button type="button" onClick={() => setIsEditorOpen(false)} className="text-stone-500 hover:text-white"><X size={24} /></button>
            </div>

            <div className="p-6 space-y-6">
              {/* Articles Editor */}
              {activeTab === 'articles' && (
                <>
                  <Input label="Título (H1)" name="title" required defaultValue={editingItem?.title} />
                  <Input label="URL da Imagem de Capa" name="imageUrl" defaultValue={editingItem?.imageUrl} placeholder="https://..." />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Autor" name="author" required defaultValue={editingItem?.author} />
                    <Input label="Data" name="date" required defaultValue={editingItem?.date || new Date().toLocaleDateString('pt-BR')} />
                  </div>
                  <Input label="Tags SEO (separadas por vírgula)" name="tags" defaultValue={editingItem?.tags?.join(', ')} />
                  <TextArea label="Resumo (Meta Description)" name="excerpt" rows={3} required defaultValue={editingItem?.excerpt} />
                  
                  <div>
                    <label className="block text-xs font-bold uppercase text-stone-500 mb-2">Conteúdo do Artigo (HTML Aceito)</label>
                    <textarea 
                        name="content" 
                        rows={15} 
                        defaultValue={editingItem?.content} 
                        className="w-full bg-stone-950 border border-stone-800 rounded p-3 text-white font-mono text-sm focus:border-umbanda-gold focus:outline-none"
                        placeholder="<p>Escreva seu texto aqui...</p>"
                    />
                  </div>
                </>
              )}

              {/* Rituals Editor */}
              {activeTab === 'rituals' && (
                <>
                   <Input label="Nome do Ritual" name="title" required defaultValue={editingItem?.title} />
                   <Input label="URL da Imagem" name="imageUrl" defaultValue={editingItem?.imageUrl} placeholder="https://..." />
                   <div className="grid grid-cols-2 gap-4">
                      <Select label="Categoria" name="category" defaultValue={editingItem?.category} options={['Prosperidade', 'Amor', 'Proteção', 'Limpeza', 'Saúde']} />
                      <Select label="Dificuldade" name="difficulty" defaultValue={editingItem?.difficulty} options={['Iniciante', 'Intermediário', 'Avançado']} />
                   </div>
                   <Input label="Duração Estimada" name="duration" defaultValue={editingItem?.duration} placeholder="Ex: 30 min" />
                   <TextArea label="Passo a Passo / Descrição" name="description" rows={8} required defaultValue={editingItem?.description} />
                </>
              )}

              {/* Entities Editor */}
              {activeTab === 'entities' && (
                <>
                  <Input label="Nome da Entidade" name="name" required defaultValue={editingItem?.name} />
                  <div className="grid grid-cols-2 gap-4">
                    <Select label="Linha" name="line" defaultValue={editingItem?.line} options={['Esquerda', 'Direita', 'Almas', 'Matas', 'Crianças']} />
                    <Select label="Símbolo" name="symbol" defaultValue={editingItem?.symbol} options={['Tridente', 'Taça', 'Flecha', 'Cachimbo', 'Espada', 'Ancora']} />
                  </div>
                  <Input label="Saudação" name="greeting" required defaultValue={editingItem?.greeting} />
                  <Input label="Cores" name="color" defaultValue={editingItem?.color} />
                  <TextArea label="Descrição" name="description" rows={6} required defaultValue={editingItem?.description} />
                </>
              )}

              {/* VIP Editor */}
              {activeTab === 'vip' && (
                  <>
                    <Input label="Título do Conteúdo" name="title" required defaultValue={editingItem?.title} />
                    <div className="grid grid-cols-2 gap-4">
                        <Select label="Tipo de Material" name="type" defaultValue={editingItem?.type} options={['video', 'ebook', 'ritual_exclusivo']} />
                        <Input label="Thumbnail URL" name="thumbnailUrl" defaultValue={editingItem?.thumbnailUrl} />
                    </div>
                    <Input label="Link de Acesso / Download / Youtube" name="url" required defaultValue={editingItem?.url} placeholder="https://..." />
                    <TextArea label="Descrição do Conteúdo" name="description" rows={5} required defaultValue={editingItem?.description} />
                  </>
              )}
            </div>

            <div className="p-6 border-t border-stone-800 bg-stone-950 sticky bottom-0">
              <button type="submit" disabled={saving} className="w-full py-4 bg-umbanda-red hover:bg-red-800 text-white font-bold rounded flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

const TabButton = ({id, label, active, set}: any) => (
  <button onClick={() => set(id)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${active === id ? 'bg-stone-800 text-white shadow ring-1 ring-stone-700' : 'text-stone-500 hover:text-stone-300'}`}>
    {label}
  </button>
);

const Row = ({title, sub, info, onEdit, onDel}: any) => (
    <tr className="hover:bg-stone-800/50 transition-colors">
        <td className="p-4"><div className="font-bold text-stone-200">{title}</div></td>
        <td className="p-4 hidden md:table-cell"><span className="bg-stone-800 px-2 py-1 rounded text-xs border border-stone-700">{sub}</span></td>
        <td className="p-4 hidden md:table-cell text-sm text-stone-400">{info}</td>
        <td className="p-4 text-right space-x-2">
        <button onClick={onEdit} className="text-stone-500 hover:text-umbanda-gold p-1"><Edit2 size={16} /></button>
        <button onClick={onDel} className="text-stone-500 hover:text-red-500 p-1"><Trash2 size={16} /></button>
        </td>
    </tr>
);

const Input = ({ label, name, required, defaultValue, placeholder }: any) => (
  <div>
    <label className="block text-xs font-bold uppercase text-stone-500 mb-2">{label}</label>
    <input name={name} required={required} defaultValue={defaultValue} placeholder={placeholder} className="w-full bg-stone-950 border border-stone-800 rounded p-3 text-white focus:border-umbanda-gold focus:outline-none" />
  </div>
);

const TextArea = ({ label, name, required, defaultValue, rows, placeholder }: any) => (
  <div>
    <label className="block text-xs font-bold uppercase text-stone-500 mb-2">{label}</label>
    <textarea name={name} required={required} defaultValue={defaultValue} rows={rows} placeholder={placeholder} className="w-full bg-stone-950 border border-stone-800 rounded p-3 text-white focus:border-umbanda-gold focus:outline-none" />
  </div>
);

const Select = ({ label, name, defaultValue, options }: any) => (
  <div>
    <label className="block text-xs font-bold uppercase text-stone-500 mb-2">{label}</label>
    <select name={name} defaultValue={defaultValue} className="w-full bg-stone-950 border border-stone-800 rounded p-3 text-white focus:border-umbanda-gold focus:outline-none">
      {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

export default AdminContent;