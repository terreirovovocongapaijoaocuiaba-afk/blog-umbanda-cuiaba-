
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save, Loader2, Sparkles, AlertCircle, Eye, Crown, Wand2, Lightbulb, RefreshCw, Bold, Italic, List, Link as LinkIcon, Image, CheckCircle, Search, ShoppingBag, DollarSign, Tag, Package } from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { Article, Ritual, Entity, VipContent, Product } from '../../types';
import { GoogleGenAI } from "@google/genai";

const AdminContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'articles' | 'rituals' | 'entities' | 'vip' | 'products'>('articles');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  
  // Data State
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // SEO Realtime State
  const [seoScore, setSeoScore] = useState(0);
  const [seoIssues, setSeoIssues] = useState<string[]>([]);

  useEffect(() => { fetchData(); }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    let collName = activeTab as string;
    if (activeTab === 'vip') collName = 'vip_content';
    // products collection name is 'products'
    
    try {
      const snap = await getDocs(collection(db, collName));
      setItems(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    // Calc initial SEO score if editing article
    if(activeTab === 'articles') calculateSeo(item);
    setIsEditorOpen(true);
  };

  const handleNew = () => {
    setEditingItem({});
    setSeoScore(0); setSeoIssues([]);
    setIsEditorOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Excluir item permanentemente?")) return;
    try {
      let collName = activeTab as string;
      if (activeTab === 'vip') collName = 'vip_content';
      
      await deleteDoc(doc(db, collName, id));
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (e) { console.error(e); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    // Build object based on form data manually to handle checkbox and custom logic
    const data: any = { updatedAt: serverTimestamp() };
    formData.forEach((value, key) => {
        if (key === 'tags') data[key] = (value as string).split(',').map(t => t.trim());
        else data[key] = value;
    });

    // Checkbox handling for VIP/Active
    const isVip = (form.elements.namedItem('isVip') as HTMLInputElement)?.checked;
    const isActive = (form.elements.namedItem('isActive') as HTMLInputElement)?.checked;

    if (activeTab === 'articles' || activeTab === 'rituals') data.isVip = isVip;
    if (activeTab === 'vip') data.exclusive = true;
    if (activeTab === 'products') data.isActive = isActive;

    // Defaults
    if (!data.imageUrl) data.imageUrl = 'https://picsum.photos/id/1015/800/600';

    try {
      let collName = activeTab as string;
      if (activeTab === 'vip') collName = 'vip_content';

      if (editingItem?.id) {
        await updateDoc(doc(db, collName, editingItem.id), data);
        setItems(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...data } : i));
      } else {
        data.createdAt = serverTimestamp();
        const ref = await addDoc(collection(db, collName), data);
        setItems(prev => [...prev, { id: ref.id, ...data }]);
      }
      setIsEditorOpen(false);
    } catch (e) { alert("Erro ao salvar: " + e); } finally { setSaving(false); }
  };

  // --- SEEDER LOGIC ---
  const seedDefaultProducts = async () => {
      setLoading(true);
      const defaults = [
          { title: 'Clube VIP (Assinatura Mensal)', slug: 'vip_monthly', price: 29.90, description: 'Acesso total à área de membros, rituais exclusivos e grupo de WhatsApp.', checkoutUrl: '', isActive: true },
          { title: 'Oráculo Completo', slug: 'oracle_reading', price: 9.90, description: 'Leitura detalhada de 3 cartas com conselho do guia.', checkoutUrl: '', isActive: true },
          { title: 'Interpretação de Sonhos', slug: 'dream_analysis', price: 9.90, description: 'Significado espiritual, aviso e números da sorte.', checkoutUrl: '', isActive: true },
          { title: 'Receita de Banho Personalizado', slug: 'herbal_prescription', price: 6.90, description: 'Banho de ervas específico para o seu momento.', checkoutUrl: '', isActive: true },
          { title: 'Mapa de Orixá (Numerologia)', slug: 'orixa_map', price: 9.90, description: 'Cálculo dos Odus para descobrir Pai e Mãe de cabeça.', checkoutUrl: '', isActive: true },
          { title: 'Leitura de Vela (Ceromancia)', slug: 'candle_reading', price: 3.90, description: 'Interpretação da chama da sua vela.', checkoutUrl: '', isActive: true },
      ];

      try {
          const promises = defaults.map(p => addDoc(collection(db, 'products'), { ...p, createdAt: serverTimestamp() }));
          await Promise.all(promises);
          alert("Produtos padrão criados! Agora adicione os links de checkout.");
          fetchData();
      } catch (e) { console.error(e); alert("Erro ao criar produtos."); } 
      finally { setLoading(false); }
  };

  // --- SEO LOGIC ---
  const calculateSeo = (data: any) => {
      let score = 100;
      let issues: string[] = [];
      const content = data.content || data.description || '';
      const title = data.title || '';
      const keyword = data.focusKeyword || '';

      if (!title) { score -= 20; issues.push("Título ausente."); }
      else if (title.length < 10) { score -= 10; issues.push("Título muito curto."); }
      
      if (!content || content.length < 300) { score -= 20; issues.push("Conteúdo muito curto (<300 palavras)."); }
      
      if (keyword) {
          if (!title.toLowerCase().includes(keyword.toLowerCase())) { score -= 15; issues.push("Palavra-chave não está no título."); }
          if (!content.toLowerCase().includes(keyword.toLowerCase())) { score -= 20; issues.push("Palavra-chave não encontrada no texto."); }
      } else {
          score -= 10; issues.push("Defina uma palavra-chave foco.");
      }

      if (!data.metaDescription) { score -= 10; issues.push("Meta descrição ausente."); }

      setSeoScore(Math.max(0, score));
      setSeoIssues(issues);
  };

  // Real-time update wrapper
  const updateField = (field: string, val: any) => {
      const updated = { ...editingItem, [field]: val };
      setEditingItem(updated);
      if (activeTab === 'articles') calculateSeo(updated);
  };

  // --- AI GENERATION ---
  const generateAIContent = async () => {
      const keyword = editingItem?.focusKeyword;
      if (!keyword) return alert("Defina uma Palavra-Chave Foco primeiro!");
      
      const prompt = `Escreva um parágrafo introdutório otimizado para SEO sobre "${keyword}" para um blog de Umbanda. Use tom respeitoso e didático. HTML format.`;
      
      try {
          const settingsSnap = await getDoc(doc(db, 'settings', 'api_keys'));
          const apiKey = settingsSnap.exists() ? settingsSnap.data().geminiKey : null;
          if(!apiKey) return alert("Configure a API Key em Configurações.");
          
          const ai = new GoogleGenAI({ apiKey });
          const res = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
          
          const newContent = (editingItem?.content || '') + res.text;
          updateField('content', newContent);
      } catch (e) { alert("Erro IA: " + e); }
  };

  return (
    <div className="animate-fadeIn relative h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white">Gestão de Conteúdo</h1>
          <p className="text-stone-400">Blog, Rituais e Produtos da Loja.</p>
        </div>
        <button onClick={handleNew} className="bg-umbanda-gold hover:bg-yellow-600 text-stone-950 font-bold py-2 px-6 rounded-lg flex items-center gap-2">
            <Plus size={18} /> Novo Item
        </button>
      </div>

      <div className="flex flex-wrap gap-2 bg-stone-900 p-2 rounded-lg mb-6 border border-stone-800 w-fit">
        {['articles', 'rituals', 'products', 'entities', 'vip'].map(t => (
            <button key={t} onClick={() => setActiveTab(t as any)} className={`px-4 py-2 rounded capitalize text-sm font-bold transition-colors ${activeTab === t ? 'bg-stone-800 text-white shadow ring-1 ring-stone-700' : 'text-stone-500 hover:text-stone-300'}`}>
                {t === 'vip' ? 'Clube VIP' : t === 'products' ? 'Produtos & Ofertas' : t}
            </button>
        ))}
      </div>

      {/* LIST VIEW */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden flex-1">
        {loading ? <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-umbanda-gold"/></div> : (
          items.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-20 text-center">
                  <div className="w-20 h-20 bg-stone-800 rounded-full flex items-center justify-center mb-4">
                      <Package size={32} className="text-stone-500"/>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Nenhum item encontrado</h3>
                  <p className="text-stone-500 mb-6">Esta coleção está vazia.</p>
                  
                  {activeTab === 'products' && (
                      <button onClick={seedDefaultProducts} className="bg-green-700 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg">
                          <Sparkles size={18}/> Gerar Produtos Padrão
                      </button>
                  )}
              </div>
          ) : (
          <table className="w-full text-left">
            <thead className="bg-stone-950 text-stone-500 text-xs uppercase">
              <tr>
                <th className="p-4">Título / Nome</th>
                <th className="p-4">Status / Info</th>
                <th className="p-4">{activeTab === 'products' ? 'Preço' : 'Acesso'}</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-stone-800/50">
                  <td className="p-4">
                      <div className="font-bold text-white">{item.title || item.name}</div>
                      <div className="text-xs text-stone-500">
                          {activeTab === 'products' ? `Slug: ${item.slug}` : item.focusKeyword ? `SEO: ${item.focusKeyword}` : 'Sem keyword'}
                      </div>
                  </td>
                  <td className="p-4">
                      {activeTab === 'products' ? (
                          item.checkoutUrl ? <span className="text-green-500 text-xs flex items-center gap-1"><LinkIcon size={12}/> Link Configurado</span> : <span className="text-red-500 text-xs">Sem Link</span>
                      ) : (
                          <span className="bg-green-900/30 text-green-500 px-2 py-1 rounded text-xs border border-green-900">Publicado</span>
                      )}
                  </td>
                  <td className="p-4">
                      {activeTab === 'products' ? (
                          <span className="font-mono font-bold text-white">R$ {item.price}</span>
                      ) : (
                          item.isVip || item.exclusive ? 
                            <span className="flex items-center gap-1 text-purple-400 text-xs font-bold"><Crown size={12}/> VIP</span> : 
                            <span className="text-stone-500 text-xs">Gratuito</span>
                      )}
                  </td>
                  <td className="p-4 text-right flex justify-end gap-2">
                      <button onClick={() => handleEdit(item)} className="p-2 bg-stone-800 rounded hover:text-umbanda-gold"><Edit2 size={16}/></button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 bg-stone-800 rounded hover:text-red-500"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )
        )}
      </div>

      {/* CMS EDITOR DRAWER */}
      {isEditorOpen && (
        <>
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40" onClick={() => setIsEditorOpen(false)}></div>
            <div className="fixed inset-y-0 right-0 w-full md:w-[90%] lg:w-[1100px] bg-stone-950 border-l border-stone-800 shadow-2xl z-50 flex flex-col animate-slideLeft">
                
                {/* Header */}
                <div className="h-16 border-b border-stone-800 flex items-center justify-between px-6 bg-stone-900">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        {editingItem?.id ? <Edit2 size={18}/> : <Plus size={18}/>} 
                        {activeTab === 'products' ? 'Editar Produto' : editingItem?.id ? 'Editar Conteúdo' : 'Criar Novo Conteúdo'}
                    </h2>
                    <div className="flex gap-4">
                         {/* TOGGLES */}
                        {(activeTab === 'articles' || activeTab === 'rituals') && (
                            <label className="flex items-center gap-2 cursor-pointer bg-stone-800 px-3 py-1.5 rounded border border-stone-700 hover:border-purple-500 transition-colors">
                                <input type="checkbox" name="isVip" defaultChecked={editingItem?.isVip} className="accent-purple-500"/>
                                <span className="text-xs font-bold text-purple-300 flex items-center gap-1"><Crown size={12}/> VIP</span>
                            </label>
                        )}
                        {activeTab === 'products' && (
                            <label className="flex items-center gap-2 cursor-pointer bg-stone-800 px-3 py-1.5 rounded border border-stone-700 hover:border-green-500 transition-colors">
                                <input type="checkbox" name="isActive" defaultChecked={editingItem?.isActive !== false} className="accent-green-500"/>
                                <span className="text-xs font-bold text-green-300 flex items-center gap-1"><CheckCircle size={12}/> Ativo</span>
                            </label>
                        )}

                        <button onClick={() => document.getElementById('cms-form')?.dispatchEvent(new Event('submit', {cancelable: true, bubbles: true}))} className="bg-green-700 hover:bg-green-600 text-white px-4 py-1.5 rounded text-sm font-bold flex items-center gap-2">
                            {saving ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>} Salvar
                        </button>
                        <button onClick={() => setIsEditorOpen(false)} className="text-stone-500 hover:text-white"><X size={24}/></button>
                    </div>
                </div>

                {/* Main Body */}
                <div className="flex-1 flex overflow-hidden">
                    <form id="cms-form" onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                        
                        {/* Title Section */}
                        <div className="space-y-4">
                            <input 
                                name={activeTab === 'entities' ? 'name' : 'title'} 
                                value={editingItem?.[activeTab === 'entities' ? 'name' : 'title'] || ''}
                                onChange={e => updateField(activeTab === 'entities' ? 'name' : 'title', e.target.value)}
                                placeholder="Título / Nome do Produto" 
                                className="w-full bg-transparent text-4xl font-serif font-bold text-white placeholder-stone-700 border-none focus:ring-0 px-0"
                                required
                            />
                            {activeTab !== 'entities' && (
                                <input 
                                    name="imageUrl" 
                                    value={editingItem?.imageUrl || ''}
                                    onChange={e => updateField('imageUrl', e.target.value)}
                                    placeholder="URL da Imagem de Capa (Unsplash/Storage)" 
                                    className="w-full bg-stone-900/50 border border-stone-800 rounded p-2 text-stone-300 text-sm focus:border-umbanda-gold focus:outline-none"
                                />
                            )}
                        </div>

                        {/* PRODUCT SPECIFIC FIELDS */}
                        {activeTab === 'products' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-stone-900 p-6 rounded-xl border border-stone-800">
                                <div className="col-span-1 md:col-span-2">
                                    <h3 className="font-bold text-white flex items-center gap-2 mb-4 text-sm uppercase tracking-widest border-b border-stone-800 pb-2">
                                        <ShoppingBag size={16} className="text-green-500"/> Configuração de Vendas
                                    </h3>
                                </div>
                                <Input 
                                    label="Slug (ID Interno)" 
                                    name="slug" 
                                    val={editingItem?.slug} 
                                    change={updateField} 
                                    placeholder="ex: vip_mensal, oraculo_avancado"
                                    hint="Use IDs únicos: vip_mensal, oraculo_avancado, sonhos_premium"
                                />
                                <Input 
                                    label="Preço (R$)" 
                                    name="price" 
                                    val={editingItem?.price} 
                                    change={updateField} 
                                    placeholder="29.90"
                                />
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-xs font-bold uppercase text-stone-500 mb-2">Link de Checkout (Kiwify)</label>
                                    <div className="flex gap-2">
                                        <div className="bg-stone-950 border border-stone-800 p-3 rounded-l text-stone-500"><LinkIcon size={16}/></div>
                                        <input 
                                            name="checkoutUrl"
                                            value={editingItem?.checkoutUrl || ''}
                                            onChange={e => updateField('checkoutUrl', e.target.value)}
                                            className="w-full bg-stone-900 border border-stone-800 rounded-r p-3 text-white focus:border-green-500 focus:outline-none font-mono text-sm text-green-400"
                                            placeholder="https://pay.kiwify.com.br/..." 
                                        />
                                    </div>
                                    <p className="text-[10px] text-stone-500 mt-1">Cole aqui o link direto do checkout do produto criado na Kiwify.</p>
                                </div>
                            </div>
                        )}

                        {/* Rich Text Editor Simulation */}
                        <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden min-h-[400px] flex flex-col">
                            {/* Toolbar */}
                            <div className="border-b border-stone-800 p-2 flex gap-1 bg-stone-950 sticky top-0 z-10">
                                <ToolBtn icon={<Bold size={16}/>} />
                                <ToolBtn icon={<Italic size={16}/>} />
                                <div className="w-px bg-stone-800 mx-2"></div>
                                <ToolBtn icon={<List size={16}/>} />
                                <ToolBtn icon={<LinkIcon size={16}/>} />
                                <ToolBtn icon={<Image size={16}/>} />
                                <div className="flex-1"></div>
                                {activeTab === 'articles' && (
                                    <button type="button" onClick={generateAIContent} className="text-xs bg-indigo-900/50 text-indigo-300 px-3 py-1 rounded flex items-center gap-2 hover:bg-indigo-900 border border-indigo-800">
                                        <Wand2 size={14}/> Escrever com IA
                                    </button>
                                )}
                            </div>
                            
                            {/* Text Area */}
                            <textarea 
                                name={activeTab === 'entities' || activeTab === 'rituals' || activeTab === 'products' ? 'description' : 'content'}
                                value={editingItem?.[activeTab === 'entities' || activeTab === 'rituals' || activeTab === 'products' ? 'description' : 'content'] || ''}
                                onChange={e => updateField(activeTab === 'entities' || activeTab === 'rituals' || activeTab === 'products' ? 'description' : 'content', e.target.value)}
                                className="flex-1 w-full bg-stone-900 p-6 text-stone-300 text-lg leading-relaxed focus:outline-none resize-none font-sans"
                                placeholder={activeTab === 'products' ? "Descreva os benefícios do produto..." : "Comece a escrever seu conteúdo sagrado aqui..."}
                            />
                        </div>

                        {/* Meta Fields Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-stone-800">
                             {/* Specific fields based on tab */}
                             {activeTab === 'articles' && (
                                 <>
                                    <Input label="Autor" name="author" val={editingItem?.author} change={updateField} />
                                    <Input label="Data" name="date" val={editingItem?.date} change={updateField} />
                                    <Input label="Tags (separar por vírgula)" name="tags" val={editingItem?.tags} change={updateField} />
                                    <Input label="Meta Title (SEO)" name="metaTitle" val={editingItem?.metaTitle} change={updateField} />
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold uppercase text-stone-500 mb-2">Meta Description (SEO)</label>
                                        <textarea name="excerpt" value={editingItem?.excerpt || ''} onChange={e => updateField('excerpt', e.target.value)} className="w-full bg-stone-900 border border-stone-800 rounded p-3 text-white focus:border-umbanda-gold focus:outline-none" rows={2}/>
                                    </div>
                                 </>
                             )}
                             {activeTab === 'rituals' && (
                                 <>
                                    <Input label="Categoria" name="category" val={editingItem?.category} change={updateField} />
                                    <Input label="Dificuldade" name="difficulty" val={editingItem?.difficulty} change={updateField} />
                                    <Input label="Duração" name="duration" val={editingItem?.duration} change={updateField} />
                                 </>
                             )}
                        </div>

                    </form>

                    {/* SEO Sidebar (Articles Only) */}
                    {activeTab === 'articles' && (
                        <aside className="w-80 border-l border-stone-800 bg-stone-900 p-6 overflow-y-auto hidden lg:block">
                            <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Search size={16}/> SEO Otimizer</h3>
                            
                            <div className="mb-6">
                                <label className="text-xs font-bold text-stone-500 uppercase">Palavra-Chave Foco</label>
                                <input 
                                    name="focusKeyword"
                                    value={editingItem?.focusKeyword || ''}
                                    onChange={e => updateField('focusKeyword', e.target.value)}
                                    className="w-full mt-1 bg-stone-950 border border-stone-800 rounded p-2 text-white text-sm focus:border-umbanda-gold focus:outline-none"
                                    placeholder="Ex: Oração Ogum"
                                />
                            </div>

                            <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 mb-6 text-center">
                                <div className={`text-4xl font-bold mb-1 ${seoScore >= 80 ? 'text-green-500' : seoScore >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>{seoScore}</div>
                                <div className="text-xs text-stone-500 uppercase tracking-widest">SEO Score</div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-white uppercase border-b border-stone-800 pb-2">Checklist</h4>
                                {seoIssues.length === 0 && <div className="text-green-500 text-sm flex items-center gap-2"><CheckCircle size={14}/> Tudo otimizado!</div>}
                                {seoIssues.map((issue, i) => (
                                    <div key={i} className="flex gap-2 items-start text-xs text-red-400">
                                        <AlertCircle size={12} className="mt-0.5 flex-shrink-0"/>
                                        <span>{issue}</span>
                                    </div>
                                ))}
                            </div>
                        </aside>
                    )}
                </div>
            </div>
        </>
      )}
    </div>
  );
};

const ToolBtn = ({icon}: any) => (
    <button type="button" className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded transition-colors">{icon}</button>
);

const Input = ({ label, name, val, change, placeholder, hint }: any) => (
  <div>
    <label className="block text-xs font-bold uppercase text-stone-500 mb-2">{label}</label>
    <input 
        name={name}
        value={val || ''}
        onChange={e => change(name, e.target.value)}
        className="w-full bg-stone-900 border border-stone-800 rounded p-3 text-white focus:border-umbanda-gold focus:outline-none" 
        placeholder={placeholder}
    />
    {hint && <p className="text-[10px] text-stone-600 mt-1">{hint}</p>}
  </div>
);

export default AdminContent;
