import React, { useState } from 'react';
import { Flame, Loader2, ArrowRight } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { canUseFreeResource, registerFreeUsage } from '../../lib/usageUtils';
import PremiumLock from '../../components/PremiumLock';
import TrustBadges from '../../components/TrustBadges';
import { FooterCTA } from '../../components/ConversionSections';

const FLAME_TYPES = [
    { id: 'alta', label: 'Chama Alta e Forte', desc: 'A chama sobe reta e luminosa.' },
    { id: 'baixa', label: 'Chama Baixa / Fraca', desc: 'Quase apagando, sem força.' },
    { id: 'tremedeira', label: 'Chama Tremendo', desc: 'Oscila muito sem vento.' },
    { id: 'chorona', label: 'Vela Chorando', desc: 'Cera derrete muito rápido e escorre.' },
    { id: 'azul', label: 'Chama Azulada', desc: 'Base ou topo com cor azul.' },
    { id: 'fagulha', label: 'Soltando Fagulhas', desc: 'Estalando ou soltando pontinhos.' }
];

const CandleReader: React.FC = () => {
  const [selectedFlame, setSelectedFlame] = useState('');
  const [intention, setIntention] = useState('');
  const [step, setStep] = useState(1);
  const [result, setResult] = useState('');
  const [isLocked, setIsLocked] = useState(false);

  const interpret = async () => {
      setStep(3);
      const freeAvailable = canUseFreeResource();
      setIsLocked(!freeAvailable);

      try {
        const settingsSnap = await getDoc(doc(db, 'settings', 'api_keys'));
        const apiKey = settingsSnap.exists() ? settingsSnap.data().geminiKey : null;
        if(!apiKey) throw new Error("API Key Missing");

        const ai = new GoogleGenAI({ apiKey });
        const flameLabel = FLAME_TYPES.find(f => f.id === selectedFlame)?.label;
        const prompt = `
            Atue como especialista em Ceromancia. Intenção: "${intention}". Chama: "${flameLabel}".
            Interprete.
            1. Pedido aceito?
            2. Obstáculos?
            3. O que fazer?
            HTML simples.
        `;
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        setResult(response.text);
        if (freeAvailable) registerFreeUsage();
        setStep(4);
      } catch (e) { alert("Erro."); setStep(1); }
  };

  return (
    <div className="min-h-screen bg-[#2a0a0a] text-white pt-24 font-sans">
        <div className="container mx-auto px-6 pb-20">
             <div className="max-w-3xl mx-auto text-center mb-12 pt-10">
                <div className="w-20 h-20 bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30 shadow-[0_0_40px_rgba(220,38,38,0.4)]">
                    <Flame size={40} className="text-red-500 animate-pulse" />
                </div>
                <h1 className="text-4xl font-serif font-bold text-red-100 mb-2">Ceromancia Digital</h1>
                <p className="text-red-200/60 mb-8">O fogo fala. Entenda o recado da sua vela agora.</p>
                <TrustBadges />
            </div>

            <div className="max-w-2xl mx-auto">
                {step === 1 && (
                    <div className="space-y-8 animate-fadeIn">
                        <div className="bg-red-950/30 p-6 rounded-xl border border-red-900">
                            <label className="block text-xs font-bold uppercase text-red-400 mb-2">Qual foi seu pedido/intenção?</label>
                            <input value={intention} onChange={e => setIntention(e.target.value)} placeholder="Ex: Pedido de emprego, amor, saúde..." className="w-full bg-black/40 border border-red-900 rounded p-4 text-white focus:border-red-500 focus:outline-none transition-colors"/>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {FLAME_TYPES.map(f => (
                                <button 
                                    key={f.id}
                                    onClick={() => setSelectedFlame(f.id)}
                                    className={`p-4 rounded-xl border text-left transition-all hover:scale-105 ${selectedFlame === f.id ? 'bg-red-600 border-red-400 shadow-lg scale-105' : 'bg-red-900/20 border-red-900/50 hover:bg-red-900/40'}`}
                                >
                                    <div className="font-bold text-sm mb-1">{f.label}</div>
                                    <div className="text-xs opacity-70">{f.desc}</div>
                                </button>
                            ))}
                        </div>

                        <button onClick={() => (selectedFlame && intention) ? interpret() : alert("Preencha tudo.")} className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-600 font-bold rounded-xl shadow-lg flex justify-center gap-2 items-center transform hover:scale-[1.02] transition-transform">
                             Interpretar Chama <ArrowRight size={18}/>
                        </button>
                        <p className="text-center text-xs text-red-400/50 mt-2">
                            {canUseFreeResource() ? '🔥 Uma leitura gratuita disponível agora.' : '🔒 Limite diário atingido.'}
                        </p>
                    </div>
                )}

                {step === 3 && (
                    <div className="text-center py-20 bg-red-950/30 rounded-2xl border border-red-900/30">
                        <Loader2 size={48} className="animate-spin text-red-500 mx-auto"/>
                        <p className="mt-4 text-red-200">Lendo o fogo...</p>
                    </div>
                )}

                {step === 4 && (
                    <PremiumLock isLocked={isLocked} onUnlock={() => setTimeout(() => setIsLocked(false), 1500)} title="Diagnóstico da Vela" price="3,90">
                        <div className="bg-[#fdfcf8] text-stone-900 p-8 md:p-12 rounded-2xl shadow-2xl animate-slideUp border-t-4 border-red-600">
                            <div className="flex items-center gap-3 mb-6 border-b border-stone-200 pb-4">
                                <Flame className="text-red-600" />
                                <h2 className="text-2xl font-serif font-bold">A Voz do Fogo</h2>
                            </div>
                            <div className="prose prose-stone max-w-none text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: result }} />
                            <button onClick={() => {setStep(1); setIntention(''); setSelectedFlame('');}} className="mt-8 w-full py-3 border border-red-200 text-red-700 font-bold rounded-lg hover:bg-red-50 transition-colors uppercase text-sm">Nova leitura</button>
                        </div>
                    </PremiumLock>
                )}
            </div>

            <div className="mt-20">
                <FooterCTA />
            </div>
        </div>
    </div>
  );
};

export default CandleReader;