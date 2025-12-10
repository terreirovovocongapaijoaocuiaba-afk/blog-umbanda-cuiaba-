import React, { useState } from 'react';
import { Flame, Loader2, CreditCard, Lock, ArrowRight } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

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
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    setTimeout(async () => {
        setLoading(false);
        await interpret();
    }, 2000);
  };

  const interpret = async () => {
      setStep(3);
      try {
        const settingsSnap = await getDoc(doc(db, 'settings', 'api_keys'));
        const apiKey = settingsSnap.exists() ? settingsSnap.data().geminiKey : null;
        if(!apiKey) throw new Error("API Key Missing");

        const ai = new GoogleGenAI({ apiKey });
        const flameLabel = FLAME_TYPES.find(f => f.id === selectedFlame)?.label;
        const prompt = `
            Atue como um especialista em Ceromancia (Leitura de Velas).
            O consulente acendeu uma vela com a intenção: "${intention}".
            O comportamento da chama foi: "${flameLabel}".
            Interprete o significado espiritual.
            1. O pedido foi aceito?
            2. Há obstáculos ou energias contrárias?
            3. O que fazer a seguir (acender outra, fazer oração, banho?).
            Use HTML simples.
        `;
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        setResult(response.text);
        setStep(4);
      } catch (e) { alert("Erro."); setStep(1); }
  };

  return (
    <div className="min-h-screen bg-[#2a0a0a] text-white pt-32 pb-20 px-6 font-sans">
        <div className="max-w-2xl mx-auto">
             <div className="text-center mb-10">
                <div className="w-20 h-20 bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30 shadow-[0_0_40px_rgba(220,38,38,0.4)]">
                    <Flame size={40} className="text-red-500 animate-pulse" />
                </div>
                <h1 className="text-4xl font-serif font-bold text-red-100 mb-2">Ceromancia Digital</h1>
                <p className="text-red-200/60">O fogo fala. Entenda o recado da sua vela agora.</p>
            </div>

            {step === 1 && (
                <div className="space-y-8 animate-fadeIn">
                    <div className="bg-red-950/30 p-6 rounded-xl border border-red-900">
                        <label className="block text-xs font-bold uppercase text-red-400 mb-2">Qual foi seu pedido/intenção?</label>
                        <input value={intention} onChange={e => setIntention(e.target.value)} placeholder="Ex: Pedido de emprego, amor, saúde..." className="w-full bg-black/40 border border-red-900 rounded p-3 text-white focus:border-red-500 focus:outline-none"/>
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

                    <button onClick={() => (selectedFlame && intention) ? setStep(2) : alert("Preencha tudo.")} className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-600 font-bold rounded-xl shadow-lg flex justify-center gap-2 items-center">
                         Interpretar Chama <ArrowRight size={18}/>
                    </button>
                </div>
            )}

            {step === 2 && (
                <div className="bg-white dark:bg-stone-900 p-8 rounded-2xl border border-red-700 shadow-2xl text-center animate-fadeIn max-w-md mx-auto">
                    <Lock size={40} className="mx-auto text-red-500 mb-4" />
                    <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-2">Diagnóstico Pronto</h2>
                    <p className="text-stone-500 mb-6">A espiritualidade analisou a queima da sua vela. Há uma mensagem importante sobre seu pedido.</p>
                    <div className="bg-red-900/20 p-4 rounded-lg mb-6 text-left">
                        <div className="flex justify-between font-bold text-red-400 mb-1"><span>Leitura Ceromântica</span> <span>R$ 3,90</span></div>
                    </div>
                    <button onClick={handlePay} disabled={loading} className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl flex items-center justify-center gap-2">
                        {loading ? <Loader2 className="animate-spin"/> : <CreditCard size={20}/>} Liberar Diagnóstico
                    </button>
                </div>
            )}

            {step === 3 && <div className="text-center py-20"><Loader2 size={48} className="animate-spin text-red-500 mx-auto"/><p className="mt-4">Lendo o fogo...</p></div>}

            {step === 4 && (
                <div className="bg-[#fdfcf8] text-stone-900 p-8 md:p-12 rounded-2xl shadow-2xl animate-slideUp">
                    <div className="flex items-center gap-3 mb-6 border-b border-stone-200 pb-4">
                        <Flame className="text-red-600" />
                        <h2 className="text-2xl font-serif font-bold">A Voz do Fogo</h2>
                    </div>
                    <div className="prose prose-stone max-w-none text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: result }} />
                    <button onClick={() => {setStep(1); setIntention(''); setSelectedFlame('');}} className="mt-8 text-red-700 font-bold hover:underline">Nova leitura</button>
                </div>
            )}
        </div>
    </div>
  );
};

export default CandleReader;