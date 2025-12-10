import React, { useState, useEffect } from 'react';
import { 
  Globe, Search, MapPin, Share2, Shield, Cpu, Save, Loader2, 
  BarChart, AlertTriangle, CheckCircle, Code, Layers, Eye,
  LayoutList, Wand2, X, RefreshCw, Smartphone, Monitor, ChevronRight, Target, Zap,
  Lightbulb, TrendingUp, PlusCircle, Compass, Users, Link as LinkIcon, Anchor,
  Calendar, FileText, Activity, AlertOctagon, ArrowUpRight, ArrowDownRight, MoreHorizontal,
  Rocket, Crosshair, Sword, ExternalLink
} from 'lucide-react';
import { db } from '../../lib/firebase';
import { doc, getDoc, setDoc, collection, getDocs, updateDoc, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { GoogleGenAI } from "@google/genai";

// --- TYPES ---
interface PageAudit {
    id: string;
    type: 'article' | 'ritual';
    title: string;
    slug: string;
    metaTitle: string;
    metaDescription: string;
    focusKeyword: string;
    content: string;
    score: number;
    issues: string[];
    wordCount: number;
    internalLinks: number;
    hasImage: boolean;
}

interface Opportunity {
    topic: string;
    keyword: string;
    difficulty: string;
    volume_estimate: string;
    reason: string;
    suggested_title: string;
}

interface TechIssue {
    id: string;
    pageId: string;
    pageTitle: string;
    severity: 'critical' | 'warning';
    issue: string;
}

interface KeywordData {
    keyword: string;
    count: number;
    difficulty?: string;
    intent?: string;
}

interface Competitor {
    id: string;
    name: string;
    url: string;
    analysis?: string; // AI Generated SWOT
}

interface Backlink {
    id: string;
    domain: string;
    status: 'prospect' | 'contacted' | 'active' | 'rejected';
    notes: string;
}

type ViewMode = 'dashboard' | 'opportunities' | 'keywords' | 'competitors' | 'backlinks' | 'content' | 'editor' | 'technical';

const AdminSEO: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewMode>('dashboard');
  const [loading, setLoading] = useState(true);
  
  // Real Data State
  const [pages, setPages] = useState<PageAudit[]>([]);
  const [techIssues, setTechIssues] = useState<TechIssue[]>([]);
  const [keywords, setKeywords] = useState<KeywordData[]>([]);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [backlinks, setBacklinks] = useState<Backlink[]>([]);

  const [globalStats, setGlobalStats] = useState({
      avgScore: 0,
      totalWords: 0,
      totalPages: 0,
      criticalIssues: 0
  });

  // Opportunity State
  const [seedKeyword, setSeedKeyword] = useState('');
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  
  // AI Loading
  const [aiLoading, setAiLoading] = useState(false);

  // Editor State
  const [selectedPage, setSelectedPage] = useState<PageAudit | null>(null);
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('mobile');

  // New Inputs
  const [newCompetitorUrl, setNewCompetitorUrl] = useState('');
  const [newBacklinkDomain, setNewBacklinkDomain] = useState('');

  useEffect(() => {
    runFullAudit();
    fetchExtras();
  }, []);

  const fetchExtras = async () => {
      // Fetch Competitors & Backlinks from Firestore (assuming collections exist or create on fly)
      // For now, using local state for new items if collections are empty to show functionality
      // In a real full app, these would be separate collections.
      try {
        const compSnap = await getDocs(collection(db, 'seo_competitors'));
        const backSnap = await getDocs(collection(db, 'seo_backlinks'));
        
        setCompetitors(compSnap.docs.map(d => ({id: d.id, ...d.data()} as Competitor)));
        setBacklinks(backSnap.docs.map(d => ({id: d.id, ...d.data()} as Backlink)));
      } catch (e) { console.log("Collections SEO extras not created yet."); }
  };

  // --- CORE LOGIC: REAL AUDIT ---
  const runFullAudit = async () => {
    setLoading(true);
    try {
        // 1. Fetch Real Data
        const [artSnap, ritSnap] = await Promise.all([
            getDocs(collection(db, 'articles')),
            getDocs(collection(db, 'rituals'))
        ]);

        const auditList: PageAudit[] = [];
        const keywordMap = new Map<string, number>();
        let totalScore = 0;
        let totalWords = 0;

        const processDoc = (doc: any, type: 'article' | 'ritual') => {
            const data = doc.data();
            const content = type === 'article' ? (data.content || '') : (data.description || '');
            
            // Analyze Logic
            const analysis = analyzePageOnTheFly(data, content);
            
            totalScore += analysis.score;
            totalWords += analysis.wordCount;

            // Collect Keywords
            if (data.focusKeyword) {
                const k = data.focusKeyword.toLowerCase().trim();
                keywordMap.set(k, (keywordMap.get(k) || 0) + 1);
            }

            return {
                id: doc.id,
                type,
                title: data.title,
                slug: type === 'article' ? `/artigos/${doc.id}` : `/rituais/${doc.id}`,
                metaTitle: data.metaTitle || data.title,
                metaDescription: data.metaDescription || data.excerpt || '',
                focusKeyword: data.focusKeyword || '',
                content,
                score: analysis.score,
                issues: analysis.issues,
                wordCount: analysis.wordCount,
                internalLinks: analysis.internalLinks,
                hasImage: !!data.imageUrl
            };
        };

        artSnap.forEach(d => auditList.push(processDoc(d, 'article')));
        ritSnap.forEach(d => auditList.push(processDoc(d, 'ritual')));

        setPages(auditList.sort((a, b) => a.score - b.score));

        // Process Keywords
        const kList: KeywordData[] = [];
        keywordMap.forEach((v, k) => kList.push({ keyword: k, count: v }));
        setKeywords(kList.sort((a,b) => b.count - a.count));

        // 2. Generate Real Tech Issues
        const realIssues: TechIssue[] = [];
        auditList.forEach(p => {
            if (p.score < 50) realIssues.push({ id: Math.random().toString(), pageId: p.id, pageTitle: p.title, severity: 'critical', issue: 'Pontuação SEO crítica (abaixo de 50).' });
            if (!p.metaDescription) realIssues.push({ id: Math.random().toString(), pageId: p.id, pageTitle: p.title, severity: 'critical', issue: 'Meta Descrição ausente.' });
            if (p.metaTitle.length < 30) realIssues.push({ id: Math.random().toString(), pageId: p.id, pageTitle: p.title, severity: 'warning', issue: 'Título SEO muito curto.' });
            if (!p.hasImage) realIssues.push({ id: Math.random().toString(), pageId: p.id, pageTitle: p.title, severity: 'warning', issue: 'Página sem imagem destacada.' });
            if (p.wordCount < 300) realIssues.push({ id: Math.random().toString(), pageId: p.id, pageTitle: p.title, severity: 'warning', issue: 'Conteúdo Thin Content (< 300 palavras).' });
        });
        setTechIssues(realIssues);

        // 3. Set Stats
        setGlobalStats({
            totalPages: auditList.length,
            avgScore: auditList.length > 0 ? Math.round(totalScore / auditList.length) : 0,
            totalWords,
            criticalIssues: realIssues.filter(i => i.severity === 'critical').length
        });

    } catch (error) {
        console.error("Erro na auditoria:", error);
    } finally {
        setLoading(false);
    }
  };

  const analyzePageOnTheFly = (data: any, content: string) => {
      let score = 100; // Start perfect, subtract for errors
      let issues: string[] = [];
      
      const cleanContent = content.replace(/<[^>]*>?/gm, '');
      const wordCount = cleanContent.split(/\s+/).length;
      const internalLinks = (content.match(/href="\/|href="http.*umbandacuiaba/g) || []).length;
      const focusKeyword = data.focusKeyword || '';
      
      // Penalties
      if (!focusKeyword) { score -= 20; issues.push("Sem palavra-chave foco definida."); }
      if (wordCount < 300) { score -= 15; issues.push("Conteúdo muito curto."); }
      if (!data.metaDescription) { score -= 15; issues.push("Sem Meta Descrição."); }
      if ((data.metaTitle || data.title).length > 60) { score -= 10; issues.push("Título muito longo (>60)."); }
      if (internalLinks === 0) { score -= 10; issues.push("Sem links internos."); }
      
      if (focusKeyword) {
          if (!cleanContent.toLowerCase().includes(focusKeyword.toLowerCase())) { score -= 20; issues.push("Keyword não aparece no texto."); }
          if (!(data.metaTitle || data.title).toLowerCase().includes(focusKeyword.toLowerCase())) { score -= 10; issues.push("Keyword não está no título."); }
      }

      return { score: Math.max(0, score), issues, wordCount, internalLinks };
  };

  // --- AI ACTIONS ---
  const getAI = async () => {
    const settingsSnap = await getDoc(doc(db, 'settings', 'api_keys'));
    const apiKey = settingsSnap.exists() ? settingsSnap.data().geminiKey : null;
    if (!apiKey) throw new Error("API Key não configurada");
    return new GoogleGenAI({ apiKey });
  };

  const findOpportunities = async () => {
      if (!seedKeyword) return;
      setAiLoading(true);
      try {
          const ai = await getAI();
          const prompt = `
            Você é um especialista em SEO para Umbanda. O usuário quer rankear rápido para o tema: "${seedKeyword}".
            Identifique 4 oportunidades de "Cauda Longa" (Long Tail Keywords) que tenham baixa competição e alta intenção de busca.
            
            Retorne APENAS um JSON array neste formato:
            [
                {
                    "topic": "Tópico Geral",
                    "keyword": "A palavra chave exata",
                    "difficulty": "Baixa/Média",
                    "volume_estimate": "Estimativa (ex: 500/mês)",
                    "reason": "Por que é fácil rankear (ex: Poucos concorrentes diretos)",
                    "suggested_title": "Um título SEO matador e clicável"
                }
            ]
          `;
          
          const response = await ai.models.generateContent({ 
            model: 'gemini-2.5-flash', 
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        setOpportunities(JSON.parse(response.text));
      } catch (error) { alert("Erro IA: " + error); } finally { setAiLoading(false); }
  };

  const analyzeKeywordsAI = async () => {
      if (keywords.length === 0) return;
      setAiLoading(true);
      try {
          const ai = await getAI();
          const kws = keywords.map(k => k.keyword).slice(0, 10).join(', ');
          const prompt = `Analise estas keywords de Umbanda: [${kws}]. Para cada uma, dê a Dificuldade (Baixa/Média/Alta) e Intenção (Informacional/Transacional). JSON Array: [{"keyword": "x", "difficulty": "y", "intent": "z"}]`;
          
          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt,
              config: { responseMimeType: "application/json" }
          });
          
          const analysis = JSON.parse(response.text);
          const updatedKws = keywords.map(k => {
              const found = analysis.find((a:any) => a.keyword === k.keyword);
              return found ? { ...k, difficulty: found.difficulty, intent: found.intent } : k;
          });
          setKeywords(updatedKws);
      } catch (e) { alert("Erro IA: " + e); } finally { setAiLoading(false); }
  };

  const addCompetitor = async () => {
      if (!newCompetitorUrl) return;
      setAiLoading(true);
      try {
          const ai = await getAI();
          const prompt = `Analise o site/domínio: ${newCompetitorUrl} no contexto de espiritualidade/umbanda. 
          Gere uma breve análise SWOT (Forças e Fraquezas) de 1 parágrafo como se fosse um especialista de SEO.`;
          
          const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
          
          const newComp = {
              name: newCompetitorUrl.replace('https://','').split('/')[0],
              url: newCompetitorUrl,
              analysis: response.text
          };

          const docRef = await addDoc(collection(db, 'seo_competitors'), newComp);
          setCompetitors([...competitors, { id: docRef.id, ...newComp }]);
          setNewCompetitorUrl('');

      } catch (e) { alert("Erro IA: " + e); } finally { setAiLoading(false); }
  };

  const addBacklink = async () => {
      if (!newBacklinkDomain) return;
      const newBL = { domain: newBacklinkDomain, status: 'prospect', notes: 'Link prospectado manualmente.' };
      const docRef = await addDoc(collection(db, 'seo_backlinks'), newBL);
      // @ts-ignore
      setBacklinks([...backlinks, { id: docRef.id, ...newBL }]);
      setNewBacklinkDomain('');
  };

  const createDraft = async (opp: Opportunity) => {
      if(!window.confirm(`Criar rascunho automático para "${opp.suggested_title}"?`)) return;
      try {
          await addDoc(collection(db, 'articles'), {
              title: opp.suggested_title,
              focusKeyword: opp.keyword,
              excerpt: `Artigo focado em ${opp.keyword}. Rascunho gerado pela IA.`,
              content: `<h2>Introdução sobre ${opp.keyword}</h2><p>Este é um rascunho otimizado para a palavra-chave: <strong>${opp.keyword}</strong>.</p><p>A intenção de busca é: ${opp.reason}</p>`,
              author: 'Umbanda Cuiabá (Estratégia)',
              date: new Date().toLocaleDateString('pt-BR'),
              tags: [seedKeyword, 'SEO Strategy'],
              imageUrl: 'https://picsum.photos/id/1015/800/600',
              createdAt: serverTimestamp(),
              metaTitle: opp.suggested_title,
              metaDescription: `Saiba tudo sobre ${opp.keyword} neste guia completo.`
          });
          alert("Rascunho criado com sucesso!");
          runFullAudit();
      } catch (e) { console.error(e); }
  };

  const handleAiOptimize = async (type: 'title' | 'desc') => {
      if (!selectedPage) return;
      setAiLoading(true);
      try {
          const ai = await getAI();
          const prompt = type === 'title' 
            ? `Melhore este título SEO para a keyword "${selectedPage.focusKeyword}". Título atual: "${selectedPage.metaTitle}". Máximo 60 caracteres. Seja chamativo.`
            : `Crie uma meta description para a keyword "${selectedPage.focusKeyword}". Baseada no texto: "${selectedPage.content.substring(0, 300)}...". Máximo 155 caracteres.`;
          
          const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
          const text = response.text.trim().replace(/^"|"$/g, '');
          
          if (type === 'title') setSelectedPage({...selectedPage, metaTitle: text});
          else setSelectedPage({...selectedPage, metaDescription: text});

      } catch (error) { alert("Erro IA: " + error); } finally { setAiLoading(false); }
  };

  const handleSavePage = async () => {
    if (!selectedPage) return;
    try {
        const coll = selectedPage.type === 'article' ? 'articles' : 'rituals';
        await updateDoc(doc(db, coll, selectedPage.id), {
            metaTitle: selectedPage.metaTitle,
            metaDescription: selectedPage.metaDescription,
            focusKeyword: selectedPage.focusKeyword,
            lastOptimized: serverTimestamp()
        });
        alert("Otimizações salvas!");
        setActiveView('content');
        runFullAudit();
    } catch (error) { alert("Erro ao salvar."); }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-umbanda-gold w-10 h-10"/></div>;

  return (
    <div className="flex h-screen bg-stone-950 text-stone-200 font-sans overflow-hidden animate-fadeIn">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-stone-900 border-r border-stone-800 flex flex-col">
          <div className="p-6 border-b border-stone-800">
              <h1 className="text-xl font-serif font-bold text-white tracking-wider flex items-center gap-2">
                  <Globe className="text-umbanda-gold" /> SEO MASTER
              </h1>
          </div>
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              <NavButton id="dashboard" icon={<Activity/>} label="Visão Geral" active={activeView} set={setActiveView} />
              
              <div className="pt-4 pb-2 px-2 text-[10px] font-bold uppercase text-stone-600">Estratégia</div>
              <NavButton id="opportunities" icon={<Rocket/>} label="Oportunidades (IA)" active={activeView} set={setActiveView} />
              <NavButton id="keywords" icon={<Target/>} label="Palavras-Chave" active={activeView} set={setActiveView} />
              <NavButton id="competitors" icon={<Sword/>} label="Concorrência" active={activeView} set={setActiveView} />
              
              <div className="pt-4 pb-2 px-2 text-[10px] font-bold uppercase text-stone-600">Manutenção</div>
              <NavButton id="content" icon={<FileText/>} label="Auditoria Conteúdo" active={activeView} set={setActiveView} />
              <NavButton id="technical" icon={<Cpu/>} label="Técnico" active={activeView} set={setActiveView} />
              <NavButton id="backlinks" icon={<LinkIcon/>} label="Backlinks" active={activeView} set={setActiveView} />
          </nav>
      </aside>

      {/* MAIN */}
      <main className="flex-1 overflow-y-auto bg-stone-950 p-8">
          
          {/* DASHBOARD */}
          {activeView === 'dashboard' && (
              <div className="space-y-8">
                  <header>
                      <h2 className="text-3xl font-bold text-white">Performance do Terreiro</h2>
                      <p className="text-stone-400">Visão geral do SEO do Umbanda Cuiabá.</p>
                  </header>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <KPICard title="SEO Score Médio" value={globalStats.avgScore} suffix="/100" color={globalStats.avgScore > 70 ? 'text-green-500' : 'text-yellow-500'} icon={<Activity/>}/>
                      <KPICard title="Total de Palavras" value={(globalStats.totalWords / 1000).toFixed(1)} suffix="k" color="text-blue-400" icon={<FileText/>}/>
                      <KPICard title="Keywords Rastreadas" value={keywords.length} suffix="" color="text-purple-400" icon={<Target/>}/>
                      <KPICard title="Backlinks Ativos" value={backlinks.filter(b => b.status === 'active').length} suffix="" color="text-umbanda-gold" icon={<LinkIcon/>}/>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Quick Issues */}
                      <div className="bg-stone-900 border border-stone-800 rounded-xl p-6">
                          <h3 className="text-lg font-bold text-white mb-4">Atenção Necessária</h3>
                          {techIssues.length === 0 ? <p className="text-stone-500">Tudo limpo!</p> : (
                              <div className="space-y-3">
                                  {techIssues.slice(0, 5).map(i => (
                                      <div key={i.id} className="flex justify-between items-center text-sm border-b border-stone-800 pb-2">
                                          <span className="text-stone-300 truncate w-2/3">{i.issue}</span>
                                          <button onClick={() => { setSelectedPage(pages.find(p => p.id === i.pageId) || null); setActiveView('editor'); }} className="text-xs text-umbanda-gold hover:underline">Corrigir</button>
                                      </div>
                                  ))}
                              </div>
                          )}
                      </div>

                      {/* Top Keywords */}
                      <div className="bg-stone-900 border border-stone-800 rounded-xl p-6">
                          <h3 className="text-lg font-bold text-white mb-4">Keywords Principais</h3>
                          <div className="space-y-3">
                              {keywords.slice(0, 5).map(k => (
                                  <div key={k.keyword} className="flex justify-between items-center">
                                      <span className="text-white font-medium capitalize">{k.keyword}</span>
                                      <span className="bg-stone-800 px-2 py-1 rounded text-xs text-stone-400">{k.count} páginas</span>
                                  </div>
                              ))}
                              {keywords.length === 0 && <p className="text-stone-500 text-sm">Nenhuma keyword definida nos artigos.</p>}
                          </div>
                      </div>
                  </div>
              </div>
          )}

          {/* OPPORTUNITIES */}
          {activeView === 'opportunities' && (
              <div className="space-y-6">
                  <header>
                      <h2 className="text-3xl font-bold text-white flex items-center gap-2"><Rocket className="text-umbanda-gold"/> Estratégia de Crescimento (IA)</h2>
                      <p className="text-stone-400">Descubra "Frutas Baixas" (oportunidades fáceis) para rankear rápido.</p>
                  </header>

                  <div className="bg-stone-900 p-6 rounded-xl border border-stone-800">
                      <div className="flex gap-4 mb-2">
                          <input 
                             value={seedKeyword}
                             onChange={e => setSeedKeyword(e.target.value)}
                             placeholder="Ex: Ogum, Banhos, Amor..."
                             className="flex-1 bg-stone-950 border border-stone-800 rounded-lg px-4 text-white focus:outline-none focus:border-umbanda-gold"
                          />
                          <button 
                             onClick={findOpportunities}
                             disabled={aiLoading || !seedKeyword}
                             className="bg-umbanda-gold hover:bg-yellow-600 text-stone-950 px-6 rounded-lg font-bold flex items-center gap-2"
                          >
                              {aiLoading ? <Loader2 className="animate-spin"/> : <Wand2 size={20}/>} Descobrir
                          </button>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {opportunities.map((opp, idx) => (
                          <div key={idx} className="bg-stone-900 border border-stone-800 hover:border-green-500/50 p-6 rounded-xl transition-all group">
                              <div className="flex justify-between items-start mb-4">
                                  <span className="bg-green-900/30 text-green-400 text-xs font-bold px-2 py-1 rounded uppercase border border-green-900">Oportunidade</span>
                                  <span className="text-stone-500 text-xs font-mono">{opp.volume_estimate}</span>
                              </div>
                              <h3 className="text-xl font-bold text-white mb-2">{opp.suggested_title}</h3>
                              <p className="text-stone-400 text-sm mb-4">"{opp.reason}"</p>
                              <div className="flex items-center gap-2 p-3 bg-stone-950 rounded mb-4">
                                  <Target size={16} className="text-umbanda-gold"/>
                                  <span className="text-sm font-bold text-stone-300">Keyword: <span className="text-white">{opp.keyword}</span></span>
                              </div>
                              <button onClick={() => createDraft(opp)} className="w-full py-3 bg-stone-800 hover:bg-green-700 hover:text-white text-stone-300 rounded font-bold transition-colors flex items-center justify-center gap-2">
                                  <PlusCircle size={18}/> Gerar Rascunho
                              </button>
                          </div>
                      ))}
                  </div>
              </div>
          )}

          {/* KEYWORDS TRACKER */}
          {activeView === 'keywords' && (
              <div className="space-y-6">
                  <header className="flex justify-between">
                      <div>
                        <h2 className="text-3xl font-bold text-white">Monitor de Palavras-Chave</h2>
                        <p className="text-stone-400">Keywords reais extraídas dos seus artigos e rituais.</p>
                      </div>
                      <button onClick={analyzeKeywordsAI} disabled={aiLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded flex items-center gap-2">
                          <Wand2 size={16} /> Analisar Dificuldade (IA)
                      </button>
                  </header>

                  <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden">
                      <table className="w-full text-left">
                          <thead className="bg-stone-950 text-stone-500 text-xs uppercase">
                              <tr>
                                  <th className="p-4">Keyword</th>
                                  <th className="p-4">Páginas Usando</th>
                                  <th className="p-4">Dificuldade (IA)</th>
                                  <th className="p-4">Intenção (IA)</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-800">
                              {keywords.length === 0 ? (
                                  <tr><td colSpan={4} className="p-8 text-center text-stone-500">Defina "Focus Keyword" em seus artigos para ver dados aqui.</td></tr>
                              ) : keywords.map((k, i) => (
                                  <tr key={i} className="hover:bg-stone-800/50">
                                      <td className="p-4 font-bold text-white capitalize">{k.keyword}</td>
                                      <td className="p-4">{k.count}</td>
                                      <td className="p-4">
                                          {k.difficulty ? (
                                              <span className={`px-2 py-1 rounded text-xs border ${k.difficulty.includes('Baixa') ? 'bg-green-900/30 border-green-800 text-green-400' : 'bg-red-900/30 border-red-800 text-red-400'}`}>
                                                  {k.difficulty}
                                              </span>
                                          ) : <span className="text-stone-600">-</span>}
                                      </td>
                                      <td className="p-4 text-sm text-stone-400">{k.intent || '-'}</td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          )}

          {/* COMPETITORS */}
          {activeView === 'competitors' && (
              <div className="space-y-6">
                  <header>
                      <h2 className="text-3xl font-bold text-white">Análise de Concorrência</h2>
                      <p className="text-stone-400">Inteligência competitiva baseada em IA.</p>
                  </header>

                  <div className="flex gap-4 mb-6">
                      <input 
                         value={newCompetitorUrl}
                         onChange={e => setNewCompetitorUrl(e.target.value)}
                         placeholder="URL do concorrente (ex: https://concorrente.com)"
                         className="flex-1 bg-stone-900 border border-stone-800 rounded p-3 text-white focus:outline-none focus:border-umbanda-gold"
                      />
                      <button onClick={addCompetitor} disabled={aiLoading || !newCompetitorUrl} className="bg-umbanda-gold hover:bg-yellow-600 text-black px-6 rounded font-bold">
                          {aiLoading ? <Loader2 className="animate-spin"/> : 'Analisar com IA'}
                      </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {competitors.map(comp => (
                          <div key={comp.id} className="bg-stone-900 border border-stone-800 p-6 rounded-xl">
                              <div className="flex justify-between items-start mb-4">
                                  <h3 className="text-xl font-bold text-white">{comp.name}</h3>
                                  <a href={comp.url} target="_blank" className="text-stone-500 hover:text-white"><ExternalLink size={16}/></a>
                              </div>
                              <div className="bg-stone-950 p-4 rounded text-sm text-stone-300 leading-relaxed border border-stone-800">
                                  <div className="font-bold text-umbanda-gold mb-2 uppercase text-xs">Análise IA:</div>
                                  {comp.analysis}
                              </div>
                              <button onClick={async() => {
                                  if(confirm('Remover?')) {
                                      await deleteDoc(doc(db, 'seo_competitors', comp.id));
                                      setCompetitors(competitors.filter(c => c.id !== comp.id));
                                  }
                              }} className="mt-4 text-xs text-red-500 hover:underline">Remover Concorrente</button>
                          </div>
                      ))}
                      {competitors.length === 0 && (
                          <div className="col-span-2 text-center text-stone-500 py-12 border border-stone-800 rounded-xl border-dashed">
                              Adicione uma URL para a IA analisar os pontos fortes e fracos do concorrente.
                          </div>
                      )}
                  </div>
              </div>
          )}

          {/* BACKLINKS */}
          {activeView === 'backlinks' && (
              <div className="space-y-6">
                  <header>
                      <h2 className="text-3xl font-bold text-white">Gerenciador de Backlinks</h2>
                      <p className="text-stone-400">Controle de parcerias e link building.</p>
                  </header>

                  <div className="bg-stone-900 p-6 rounded-xl border border-stone-800">
                      <div className="flex gap-4 mb-4">
                          <input 
                              value={newBacklinkDomain}
                              onChange={e => setNewBacklinkDomain(e.target.value)}
                              placeholder="Domínio para prospectar (ex: blogespiritual.com)"
                              className="flex-1 bg-stone-950 border border-stone-800 rounded p-3 text-white focus:outline-none focus:border-umbanda-gold"
                          />
                          <button onClick={addBacklink} className="bg-stone-800 hover:bg-stone-700 text-white px-6 rounded font-bold">Adicionar</button>
                      </div>

                      <table className="w-full text-left mt-4">
                          <thead className="text-stone-500 text-xs uppercase border-b border-stone-800">
                              <tr>
                                  <th className="pb-3">Domínio</th>
                                  <th className="pb-3">Status</th>
                                  <th className="pb-3">Notas</th>
                                  <th className="pb-3 text-right">Ação</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-800">
                              {backlinks.map(bl => (
                                  <tr key={bl.id}>
                                      <td className="py-4 font-bold text-white">{bl.domain}</td>
                                      <td className="py-4">
                                          <span className={`px-2 py-1 rounded text-xs uppercase font-bold 
                                              ${bl.status === 'active' ? 'bg-green-900 text-green-400' : 
                                                bl.status === 'contacted' ? 'bg-yellow-900 text-yellow-400' : 
                                                'bg-stone-800 text-stone-400'}`}>
                                              {bl.status}
                                          </span>
                                      </td>
                                      <td className="py-4 text-sm text-stone-400">{bl.notes}</td>
                                      <td className="py-4 text-right">
                                          <button onClick={async() => {
                                              const newStatus = bl.status === 'prospect' ? 'contacted' : bl.status === 'contacted' ? 'active' : 'prospect';
                                              // @ts-ignore
                                              await updateDoc(doc(db, 'seo_backlinks', bl.id), { status: newStatus });
                                              setBacklinks(backlinks.map(b => b.id === bl.id ? {...b, status: newStatus} : b));
                                          }} className="text-xs bg-stone-800 px-2 py-1 rounded hover:bg-white hover:text-black mr-2">
                                              Mudar Status
                                          </button>
                                          <button onClick={async() => {
                                              await deleteDoc(doc(db, 'seo_backlinks', bl.id));
                                              setBacklinks(backlinks.filter(b => b.id !== bl.id));
                                          }} className="text-stone-600 hover:text-red-500"><X size={16}/></button>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          )}

          {/* TECHNICAL AUDIT */}
          {activeView === 'technical' && (
              <div className="space-y-6">
                  <header>
                      <h2 className="text-3xl font-bold text-white">Problemas Técnicos Reais</h2>
                      <p className="text-stone-400">Problemas detectados no escaneamento atual.</p>
                  </header>

                  <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden">
                      {techIssues.length === 0 ? (
                          <div className="p-12 text-center text-green-500">
                              <CheckCircle size={48} className="mx-auto mb-4"/>
                              <p>Nenhum problema técnico encontrado! Parabéns.</p>
                          </div>
                      ) : (
                          techIssues.map((issue, idx) => (
                              <div key={idx} className="p-4 border-b border-stone-800 flex items-center justify-between hover:bg-stone-800/50">
                                  <div className="flex items-center gap-4">
                                      {issue.severity === 'critical' ? <AlertOctagon className="text-red-500" size={20}/> : <AlertTriangle className="text-yellow-500" size={20}/>}
                                      <div>
                                          <p className="text-white font-medium">{issue.issue}</p>
                                          <p className="text-xs text-stone-500">Em: {issue.pageTitle}</p>
                                      </div>
                                  </div>
                                  <button onClick={() => { setSelectedPage(pages.find(p => p.id === issue.pageId) || null); setActiveView('editor'); }} className="text-xs bg-stone-800 px-3 py-1.5 rounded hover:bg-stone-700 text-white">
                                      Corrigir
                                  </button>
                              </div>
                          ))
                      )}
                  </div>
              </div>
          )}

          {/* CONTENT LIST */}
          {activeView === 'content' && (
              <div className="space-y-6">
                 <header className="flex justify-between items-center">
                      <div>
                          <h2 className="text-3xl font-bold text-white">Auditoria de Conteúdo</h2>
                          <p className="text-stone-400">Lista completa de páginas e suas notas reais.</p>
                      </div>
                      <button onClick={runFullAudit} className="text-stone-400 hover:text-white"><RefreshCw/></button>
                  </header>

                  <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-stone-950/50 text-stone-500 text-xs uppercase font-bold">
                                <th className="p-5 border-b border-stone-800">Página</th>
                                <th className="p-5 border-b border-stone-800">Score</th>
                                <th className="p-5 border-b border-stone-800 text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-800">
                            {pages.map(page => (
                                <tr key={page.id} className="hover:bg-stone-800/40">
                                    <td className="p-5">
                                        <div className="font-bold text-stone-200">{page.title}</div>
                                        <div className="flex gap-2 mt-1">
                                            <span className="text-xs bg-stone-950 px-2 py-0.5 rounded text-stone-500 border border-stone-800">{page.wordCount} palavras</span>
                                            <span className="text-xs bg-stone-950 px-2 py-0.5 rounded text-stone-500 border border-stone-800">{page.internalLinks} links</span>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <span className={`font-bold text-sm px-2 py-1 rounded ${page.score >= 80 ? 'bg-green-900/30 text-green-400' : page.score >= 50 ? 'bg-yellow-900/30 text-yellow-400' : 'bg-red-900/30 text-red-400'}`}>
                                            {page.score}/100
                                        </span>
                                    </td>
                                    <td className="p-5 text-right">
                                        <button 
                                            onClick={() => { setSelectedPage(page); setActiveView('editor'); }}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all ml-auto"
                                        >
                                            Otimizar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
              </div>
          )}

          {/* EDITOR (OTIMIZADOR) */}
          {activeView === 'editor' && selectedPage && (
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-100px)]">
                  <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
                      <div className="flex items-center gap-2 mb-2">
                          <button onClick={() => setActiveView('content')} className="text-stone-400 hover:text-white p-2 bg-stone-900 rounded-lg"><X size={20}/></button>
                          <h2 className="text-xl font-bold text-white truncate">Editando: {selectedPage.title}</h2>
                      </div>
                      
                      {/* Live Score */}
                      <div className="bg-stone-900 p-6 rounded-xl border border-stone-800">
                          <div className="flex items-center gap-4 mb-4">
                              <div className={`text-4xl font-bold ${analyzePageOnTheFly({}, selectedPage.content).score >= 80 ? 'text-green-500' : 'text-yellow-500'}`}>
                                  {selectedPage.score}
                              </div>
                              <div className="text-xs text-stone-500 leading-tight">Nota Atual</div>
                          </div>
                          <ul className="space-y-2">
                              {selectedPage.issues.map((issue, i) => (
                                  <li key={i} className="text-red-400 text-xs flex gap-2 items-start">
                                      <X size={14} className="mt-0.5 flex-shrink-0"/> {issue}
                                  </li>
                              ))}
                          </ul>
                      </div>

                      {/* Configs */}
                      <div className="bg-stone-900 p-6 rounded-xl border border-stone-800 space-y-4">
                           <div>
                               <label className="text-xs font-bold text-stone-500 uppercase">Keyword Foco</label>
                               <input 
                                    value={selectedPage.focusKeyword}
                                    onChange={(e) => setSelectedPage({...selectedPage, focusKeyword: e.target.value})}
                                    className="w-full bg-stone-950 border border-stone-800 rounded p-2 text-white text-sm mt-1"
                                />
                           </div>
                           <button onClick={handleSavePage} className="w-full bg-umbanda-gold hover:bg-yellow-600 text-black font-bold py-3 rounded-lg"><Save size={16} className="inline mr-2"/> Salvar Alterações</button>
                      </div>
                  </div>

                  {/* Preview SERP */}
                  <div className="lg:col-span-8 flex flex-col gap-6">
                      <div className="bg-white text-black rounded-xl overflow-hidden shadow-2xl border border-stone-700">
                          <div className="bg-gray-100 border-b border-gray-300 p-3 flex justify-between items-center">
                              <span className="text-xs text-gray-500">Simulação Google SERP</span>
                              <div className="flex gap-2">
                                  <button onClick={() => setPreviewMode('mobile')} className={`p-1 rounded ${previewMode==='mobile'?'bg-blue-100':''}`}><Smartphone size={16}/></button>
                                  <button onClick={() => setPreviewMode('desktop')} className={`p-1 rounded ${previewMode==='desktop'?'bg-blue-100':''}`}><Monitor size={16}/></button>
                              </div>
                          </div>
                          <div className="p-6">
                               <div className={`max-w-[600px] mx-auto ${previewMode === 'mobile' ? 'w-[375px]' : 'w-full'}`}>
                                   <div className="flex items-center gap-2 mb-1">
                                       <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center text-xs font-serif font-bold text-gray-600">UC</div>
                                       <div className="flex flex-col"><span className="text-sm text-stone-900 font-normal">Umbanda Cuiabá</span><span className="text-xs text-stone-500">https://umbandacuiaba.com.br {selectedPage.slug}</span></div>
                                   </div>
                                   <h3 className="text-[#1a0dab] hover:underline text-xl cursor-pointer leading-snug mb-1 truncate">{selectedPage.metaTitle}</h3>
                                   <p className="text-[#4d5156] text-sm leading-normal">{selectedPage.metaDescription || "Sem descrição..."}</p>
                               </div>
                          </div>
                          <div className="bg-gray-50 border-t border-gray-200 p-6 space-y-4">
                              <div className="flex gap-2 items-end">
                                  <div className="flex-1">
                                      <label className="text-xs font-bold text-gray-500 uppercase">Título SEO ({selectedPage.metaTitle.length}/60)</label>
                                      <input value={selectedPage.metaTitle} onChange={(e) => setSelectedPage({...selectedPage, metaTitle: e.target.value})} className="w-full border border-gray-300 rounded p-2 text-sm text-black"/>
                                  </div>
                                  <button onClick={() => handleAiOptimize('title')} disabled={aiLoading} className="bg-purple-100 text-purple-600 p-2 rounded h-[38px]"><Wand2 size={18}/></button>
                              </div>
                              <div className="flex gap-2 items-end">
                                  <div className="flex-1">
                                      <label className="text-xs font-bold text-gray-500 uppercase">Meta Descrição ({selectedPage.metaDescription.length}/160)</label>
                                      <textarea value={selectedPage.metaDescription} onChange={(e) => setSelectedPage({...selectedPage, metaDescription: e.target.value})} className="w-full border border-gray-300 rounded p-2 text-sm text-black" rows={2}/>
                                  </div>
                                  <button onClick={() => handleAiOptimize('desc')} disabled={aiLoading} className="bg-purple-100 text-purple-600 p-2 rounded h-fit"><Wand2 size={18}/></button>
                              </div>
                          </div>
                      </div>
                  </div>
               </div>
          )}

      </main>
    </div>
  );
};

// --- COMPONENTS ---
const NavButton = ({ id, icon, label, active, set }: any) => (
    <button onClick={() => set(id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${active === id ? 'bg-indigo-900/30 text-indigo-300 border-r-2 border-indigo-500' : 'text-stone-400 hover:bg-stone-900 hover:text-white'}`}>
        {icon} <span>{label}</span>
    </button>
);

const KPICard = ({ title, value, suffix, color, icon }: any) => (
    <div className="bg-stone-900 p-6 rounded-xl border border-stone-800">
        <div className="flex justify-between items-start mb-4">
            <h3 className="text-stone-400 text-xs font-bold uppercase">{title}</h3>
            <div className={`${color} opacity-80`}>{icon}</div>
        </div>
        <div className={`text-3xl font-bold text-white`}>{value}<span className="text-sm text-stone-500 ml-1">{suffix}</span></div>
    </div>
);

export default AdminSEO;