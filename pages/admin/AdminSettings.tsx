import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Quote, Phone, FileText, Cpu, Share2, Instagram, Facebook, Youtube } from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, setDoc, getDoc } from 'firebase/firestore';
import { Testimonial } from '../../types';

const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'testimonials' | 'general' | 'about' | 'integrations' | 'social'>('testimonials');
  
  // Testimonials State
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [tLoading, setTLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newText, setNewText] = useState('');

  // Settings State
  const [settingsData, setSettingsData] = useState<any>({});
  const [sLoading, setSLoading] = useState(false);

  useEffect(() => {
    // Reset data when tab changes to avoid stale data showing in other forms
    setSettingsData({});
    
    if (activeTab === 'testimonials') fetchTestimonials();
    if (activeTab === 'general') fetchSettings('contact');
    if (activeTab === 'about') fetchSettings('about');
    if (activeTab === 'integrations') fetchSettings('api_keys');
    if (activeTab === 'social') fetchSettings('social');
  }, [activeTab]);

  const fetchTestimonials = async () => {
    setTLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'testimonials'));
      setTestimonials(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial)));
    } catch (error) { console.error(error); } 
    finally { setTLoading(false); }
  };

  const fetchSettings = async (docId: string) => {
    setSLoading(true);
    try {
      const docSnap = await getDoc(doc(db, 'settings', docId));
      if (docSnap.exists()) {
        setSettingsData(docSnap.data());
      } else {
        setSettingsData({});
      }
    } catch (error) { 
      console.error(error);
      setSettingsData({}); 
    } 
    finally { setSLoading(false); }
  };

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettingsData((prev: any) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveSettings = async (e: React.FormEvent, docId: string) => {
    e.preventDefault();
    setSLoading(true);
    
    // Use settingsData directly for saving since we are now using controlled inputs
    try {
      await setDoc(doc(db, 'settings', docId), settingsData, { merge: true });
      alert('Configurações salvas com sucesso!');
    } catch (error) { 
      console.error(error);
      alert('Erro ao salvar: ' + error); 
    } 
    finally { setSLoading(false); }
  };

  const handleAddTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newText) return;
    try {
      await addDoc(collection(db, 'testimonials'), {
        name: newName,
        role: newRole || 'Visitante',
        text: newText,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(newName)}&background=random`
      });
      setNewName(''); setNewRole(''); setNewText('');
      fetchTestimonials();
    } catch (error) { alert("Erro ao salvar."); }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!window.confirm("Remover?")) return;
    await deleteDoc(doc(db, 'testimonials', id));
    setTestimonials(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-white">Configurações Gerais</h1>
        <p className="text-stone-400 mt-1">Gerencie dados do site, IA e redes sociais.</p>
      </div>

      <div className="flex flex-wrap gap-2 bg-stone-900 p-2 rounded-lg mb-8 border border-stone-800">
        <TabButton id="testimonials" label="Depoimentos" icon={<Quote size={16}/>} active={activeTab} set={setActiveTab} />
        <TabButton id="general" label="Contato" icon={<Phone size={16}/>} active={activeTab} set={setActiveTab} />
        <TabButton id="about" label="Sobre Nós" icon={<FileText size={16}/>} active={activeTab} set={setActiveTab} />
        <TabButton id="social" label="Redes Sociais" icon={<Share2 size={16}/>} active={activeTab} set={setActiveTab} />
        <TabButton id="integrations" label="IA & APIs" icon={<Cpu size={16}/>} active={activeTab} set={setActiveTab} />
      </div>

      {/* TESTIMONIALS TAB */}
      {activeTab === 'testimonials' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 h-fit">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Plus size={20} className="text-umbanda-gold" /> Novo Depoimento
            </h3>
            <form onSubmit={handleAddTestimonial} className="space-y-4">
              <Input label="Nome" val={newName} set={setNewName} ph="Ex: Maria Silva" />
              <Input label="Função" val={newRole} set={setNewRole} ph="Ex: Consulente" />
              <div>
                <label className="block text-xs font-bold uppercase text-stone-500 mb-2">Depoimento</label>
                <textarea value={newText} onChange={e => setNewText(e.target.value)} className="w-full bg-stone-950 border border-stone-800 rounded p-3 text-white focus:border-umbanda-gold focus:outline-none" rows={4} required />
              </div>
              <button type="submit" className="w-full bg-umbanda-gold hover:bg-yellow-600 text-stone-950 font-bold py-3 rounded-lg flex justify-center gap-2"><Save size={18} /> Salvar</button>
            </form>
          </div>
          <div className="lg:col-span-2 space-y-4">
             {tLoading ? <div className="text-stone-500">Carregando...</div> : testimonials.map(t => (
               <div key={t.id} className="bg-stone-900 border border-stone-800 p-5 rounded-xl relative">
                  <button onClick={() => handleDeleteTestimonial(t.id)} className="absolute top-3 right-3 text-stone-600 hover:text-red-500"><Trash2 size={16} /></button>
                  <div className="flex items-center gap-3 mb-3">
                    <img src={t.avatarUrl} alt={t.name} className="w-10 h-10 rounded-full" />
                    <div><h4 className="font-bold text-white text-sm">{t.name}</h4><p className="text-xs text-stone-500 uppercase">{t.role}</p></div>
                  </div>
                  <p className="text-stone-300 text-sm italic">"{t.text}"</p>
               </div>
             ))}
          </div>
        </div>
      )}

      {/* GENERAL CONTACT TAB */}
      {activeTab === 'general' && (
        <div className="max-w-2xl bg-stone-900 border border-stone-800 rounded-xl p-8">
           <h3 className="text-xl font-bold text-white mb-6">Informações de Contato</h3>
           {sLoading ? <div className="text-stone-500">Carregando...</div> : (
             <form onSubmit={(e) => handleSaveSettings(e, 'contact')} className="space-y-6">
                <ControlledInput label="WhatsApp / Telefone" name="phone" value={settingsData.phone} onChange={handleSettingsChange} />
                <ControlledInput label="Endereço Completo" name="address" value={settingsData.address} onChange={handleSettingsChange} />
                <ControlledInput label="Horário de Gira" name="hours" value={settingsData.hours} onChange={handleSettingsChange} />
                <button type="submit" disabled={sLoading} className="w-full bg-umbanda-red hover:bg-red-800 text-white font-bold py-3 rounded-lg"><Save size={18} className="inline mr-2"/> Salvar Contato</button>
             </form>
           )}
        </div>
      )}

      {/* SOCIAL MEDIA TAB */}
      {activeTab === 'social' && (
        <div className="max-w-2xl bg-stone-900 border border-stone-800 rounded-xl p-8">
           <h3 className="text-xl font-bold text-white mb-6">Redes Sociais</h3>
           <p className="text-stone-400 text-sm mb-6">Estes links aparecerão no rodapé do site.</p>
           {sLoading ? <div className="text-stone-500">Carregando...</div> : (
             <form onSubmit={(e) => handleSaveSettings(e, 'social')} className="space-y-6">
                <div className="relative">
                  <Instagram className="absolute left-3 top-9 text-stone-500" size={18}/>
                  <ControlledInput label="Instagram URL" name="instagram" value={settingsData.instagram} onChange={handleSettingsChange} ph="https://instagram.com/..." pl="pl-10" />
                </div>
                <div className="relative">
                  <Facebook className="absolute left-3 top-9 text-stone-500" size={18}/>
                  <ControlledInput label="Facebook URL" name="facebook" value={settingsData.facebook} onChange={handleSettingsChange} ph="https://facebook.com/..." pl="pl-10" />
                </div>
                <div className="relative">
                  <Youtube className="absolute left-3 top-9 text-stone-500" size={18}/>
                  <ControlledInput label="Youtube URL" name="youtube" value={settingsData.youtube} onChange={handleSettingsChange} ph="https://youtube.com/..." pl="pl-10" />
                </div>
                <button type="submit" disabled={sLoading} className="w-full bg-umbanda-red hover:bg-red-800 text-white font-bold py-3 rounded-lg"><Save size={18} className="inline mr-2"/> Salvar Redes</button>
             </form>
           )}
        </div>
      )}

      {/* INTEGRATIONS (API KEY) TAB */}
      {activeTab === 'integrations' && (
        <div className="max-w-2xl bg-stone-900 border border-stone-800 rounded-xl p-8">
           <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
             <Cpu className="text-umbanda-gold" /> Inteligência Artificial
           </h3>
           <p className="text-stone-400 text-sm mb-6">Configure a chave da API do Google Gemini para habilitar a criação automática de artigos com SEO avançado.</p>
           
           {sLoading ? <div className="text-stone-500">Carregando...</div> : (
             <form onSubmit={(e) => handleSaveSettings(e, 'api_keys')} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase text-stone-500 mb-2">Gemini API Key</label>
                  <input 
                    name="geminiKey" 
                    type="password" 
                    value={settingsData.geminiKey || ''} 
                    onChange={handleSettingsChange}
                    className="w-full bg-stone-950 border border-stone-800 rounded p-3 text-white focus:border-umbanda-gold focus:outline-none" 
                    placeholder="AIza..." 
                  />
                  <p className="text-[10px] text-stone-600 mt-1">Essa chave é armazenada de forma segura e usada apenas para gerar conteúdo no painel.</p>
                </div>
                <button type="submit" disabled={sLoading} className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3 rounded-lg"><Save size={18} className="inline mr-2"/> Salvar Integrações</button>
             </form>
           )}
        </div>
      )}

      {/* ABOUT PAGE TAB */}
      {activeTab === 'about' && (
        <div className="max-w-4xl bg-stone-900 border border-stone-800 rounded-xl p-8">
           <h3 className="text-xl font-bold text-white mb-6">Conteúdo Institucional</h3>
           {sLoading ? <div className="text-stone-500">Carregando...</div> : (
             <form onSubmit={(e) => handleSaveSettings(e, 'about')} className="space-y-6">
                <ControlledInput label="Título Principal" name="title" value={settingsData.title} onChange={handleSettingsChange} />
                <div>
                   <label className="block text-xs font-bold uppercase text-stone-500 mb-2">História Completa</label>
                   <textarea name="history" rows={8} value={settingsData.history || ''} onChange={handleSettingsChange} className="w-full bg-stone-950 border border-stone-800 rounded p-3 text-white focus:border-umbanda-gold focus:outline-none" />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ControlledTextArea label="Texto - Caridade" name="charityText" rows={4} value={settingsData.charityText} onChange={handleSettingsChange} />
                    <ControlledTextArea label="Texto - Fundamento" name="foundationText" rows={4} value={settingsData.foundationText} onChange={handleSettingsChange} />
                    <ControlledTextArea label="Texto - Estudo" name="studyText" rows={4} value={settingsData.studyText} onChange={handleSettingsChange} />
                 </div>
                <button type="submit" disabled={sLoading} className="w-full bg-umbanda-red hover:bg-red-800 text-white font-bold py-3 rounded-lg"><Save size={18} className="inline mr-2"/> Salvar Textos</button>
             </form>
           )}
        </div>
      )}
    </div>
  );
};

const TabButton = ({id, label, icon, active, set}: any) => (
  <button onClick={() => set(id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${active === id ? 'bg-stone-800 text-white shadow ring-1 ring-stone-700' : 'text-stone-500 hover:text-stone-300'}`}>
    {icon} <span>{label}</span>
  </button>
);

// Helper for simple local state inputs (like testimonials)
const Input = ({ label, val, set, ph }: any) => (
  <div>
    <label className="block text-xs font-bold uppercase text-stone-500 mb-2">{label}</label>
    <input value={val} onChange={e => set(e.target.value)} className="w-full bg-stone-950 border border-stone-800 rounded p-3 text-white focus:border-umbanda-gold focus:outline-none" placeholder={ph} required />
  </div>
);

// Helpers for settingsData controlled inputs
const ControlledInput = ({ label, name, value, onChange, ph, pl }: any) => (
  <div>
    <label className="block text-xs font-bold uppercase text-stone-500 mb-2">{label}</label>
    <input 
      name={name}
      value={value || ''} 
      onChange={onChange}
      className={`w-full bg-stone-950 border border-stone-800 rounded p-3 text-white focus:border-umbanda-gold focus:outline-none ${pl || ''}`}
      placeholder={ph} 
    />
  </div>
);

const ControlledTextArea = ({ label, name, value, onChange, rows }: any) => (
  <div>
    <label className="block text-xs font-bold uppercase text-stone-500 mb-2">{label}</label>
    <textarea 
      name={name} 
      value={value || ''} 
      onChange={onChange}
      rows={rows} 
      className="w-full bg-stone-950 border border-stone-800 rounded p-3 text-white text-xs focus:border-umbanda-gold focus:outline-none" 
    />
  </div>
);

export default AdminSettings;