import React, { useState } from 'react';
import { Brain, Sparkles, Loader2, Calendar } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { canUseFreeResource, registerFreeUsage } from '../../lib/usageUtils';
import PremiumLock from '../../components/PremiumLock';
import TrustBadges from '../../components/TrustBadges';
import { FooterCTA } from '../../components/ConversionSections';

const OrixaCalculator: React.FC = () => {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [step, setStep] = useState(1);
  const [result, setResult] = useState('');
  const [isLocked, setIsLocked] = useState(false);

  const calculate = async () => {
      setStep(3);
      const freeAvailable = canUseFreeResource();
      setIsLocked(!freeAvailable);

      try {
        const settingsSnap = await getDoc(doc(db, 'settings', 'api_keys'));
        const apiKey = settingsSnap.exists() ? settingsSnap.data().geminiKey : null;
        if(!apiKey) throw new Error("API Key Missing");

        const ai = new GoogleGenAI({ apiKey });
        const prompt = `
            Com base na data ${date} e nome ${name}, realize um cálculo numerológico simbólico dos Odus (Umbanda).
            Estrutura HTML:
            1. Orixá Provável (Pai e Mãe).
            2. Características.
            3. Dia/Cor.
            4. Mensagem.
            Deixe claro que é numerologia.
        `;
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        setResult(response.text);
        if (freeAvailable) registerFreeUsage();
        setStep(4);
      } catch (e) { alert("Erro."); setStep(1); }
  };

  return (
    <div className="min-h-screen bg-[#1c1917] text-white pt-24 font-sans bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
        <div className="container mx-auto px-6 pb-20">
             <div className="max-w-3xl mx-auto text-center mb-12 pt-10">
                <div className="w-20 h-20 bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-stone-600">
                    <Brain size={40} className="text-white" />
                </div>
                <h1 className="text-4xl font-serif font-bold text-white mb-2">Calculadora de Orixá</h1>
                <p className="text-stone-400 mb-8">A numerologia sagrada revela quem caminha ao seu lado.</p>
                <TrustBadges />
            </div>

            <div className="max-w-xl mx-auto">
                {step === 1 && (
                    <div className="bg-stone-900 p-8 rounded-2xl border border-stone-700 shadow-2xl animate-fadeIn space-y-6">
                        <div>
                            <label className="block text-xs font-bold uppercase text-stone-500 mb-2">Nome Completo</label>
                            <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-black/30 border border-stone-700 rounded p-4 focus:border-white focus:outline-none transition-colors" placeholder="Seu nome de batismo"/>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-stone-500 mb-2">Data de Nascimento</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-3.5 text-stone-500" size={20}/>
                                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-black/30 border border-stone-700 rounded p-4 pl-12 focus:border-white focus:outline-none text-white"/>
                            </div>
                        </div>
                        <button onClick={() => (name && date) ? calculate() : alert("Preencha tudo.")} className="w-full py-4 bg-stone-100 hover:bg-white text-black font-bold rounded-xl shadow-lg transition-all flex justify-center gap-2 transform hover:scale-[1.02]">
                             <Sparkles size={18}/> Calcular Meus Odus
                        </button>
                        <p className="text-center text-xs text-stone-500 mt-2">
                            {canUseFreeResource() ? '✨ Gratuito hoje.' : '🔒 Limite diário expirou.'}
                        </p>
                    </div>
                )}

                {step === 3 && (
                    <div className="text-center py-20 bg-stone-900/50 rounded-2xl border border-stone-800">
                        <Loader2 size={48} className="animate-spin text-white mx-auto"/>
                        <p className="mt-4 text-stone-300">Consultando a numerologia sagrada...</p>
                    </div>
                )}

                {step === 4 && (
                    <PremiumLock isLocked={isLocked} onUnlock={() => setTimeout(() => setIsLocked(false), 1500)} title="Mapa de Orixá" price="9,90">
                        <div className="bg-[#fdfcf8] text-stone-900 p-8 md:p-12 rounded-2xl shadow-2xl animate-slideUp">
                            <div className="flex items-center gap-3 mb-6 border-b border-stone-200 pb-4">
                                <Brain className="text-stone-800" />
                                <h2 className="text-2xl font-serif font-bold">Seus Guardiões</h2>
                            </div>
                            <div className="prose prose-stone max-w-none text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: result }} />
                            <button onClick={() => {setStep(1); setName(''); setDate('');}} className="mt-8 w-full py-3 bg-stone-900 text-white font-bold rounded-lg hover:bg-stone-700 transition-colors uppercase text-sm">Calcular novamente</button>
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

export default OrixaCalculator;