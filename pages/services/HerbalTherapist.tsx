import React, { useState } from 'react';
import { Sun, Check, Loader2, Leaf, HeartPulse } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { canUseFreeResource, registerFreeUsage } from '../../lib/usageUtils';
import PremiumLock from '../../components/PremiumLock';
import TrustBadges from '../../components/TrustBadges';
import { FooterCTA } from '../../components/ConversionSections';

const SYMPTOMS = [
    "Cansaço excessivo sem motivo",
    "Insônia ou pesadelos",
    "Irritabilidade constante",
    "Sensação de peso nas costas",
    "Brigam muito na minha casa",
    "Caminhos financeiros fechados",
    "Tristeza ou desânimo profundo",
    "Dor de cabeça frequente",
    "Falta de foco/concentração"
];

const HerbalTherapist: React.FC = () => {
  const [selected, setSelected] = useState<string[]>([]);
  const [step, setStep] = useState(1);
  const [result, setResult] = useState('');
  const [isLocked, setIsLocked] = useState(false);

  const toggleSymptom = (s: string) => {
      if(selected.includes(s)) setSelected(selected.filter(i => i !== s));
      else setSelected([...selected, s]);
  };

  const generatePrescription = async () => {
      setStep(3);
      const freeAvailable = canUseFreeResource();
      setIsLocked(!freeAvailable);

      try {
        const settingsSnap = await getDoc(doc(db, 'settings', 'api_keys'));
        const apiKey = settingsSnap.exists() ? settingsSnap.data().geminiKey : null;
        if(!apiKey) throw new Error("API Key Missing");

        const ai = new GoogleGenAI({ apiKey });
        const prompt = `
            Atue como um Erveiro. Sintomas: ${selected.join(', ')}.
            Receite um BANHO DE ERVAS completo.
            1. Nome do Banho.
            2. Ingredientes.
            3. Preparo e Dia ideal.
            4. Reza curta.
            HTML simples.
        `;
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        setResult(response.text);
        if (freeAvailable) registerFreeUsage();
        setStep(4);
      } catch (e) { alert("Erro."); setStep(1); }
  };

  return (
    <div className="min-h-screen bg-[#0f1410] text-white pt-24 font-sans bg-[url('https://www.transparenttextures.com/patterns/leaves.png')]">
        <div className="container mx-auto px-6 pb-20">
             <div className="max-w-3xl mx-auto text-center mb-12 pt-10">
                <div className="w-20 h-20 bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
                    <Leaf size={40} className="text-green-400" />
                </div>
                <h1 className="text-4xl font-serif font-bold text-green-100 mb-2">Terapeuta das Folhas</h1>
                <p className="text-green-200/60 mb-8">As ervas curam, limpam e protegem. O que você está sentindo?</p>
                <TrustBadges />
            </div>

            <div className="max-w-2xl mx-auto">
                {step === 1 && (
                    <div className="bg-stone-900/80 p-8 rounded-2xl border border-green-900 shadow-2xl animate-fadeIn">
                        <h3 className="font-bold text-lg mb-6 text-green-400 flex items-center gap-2">
                            <HeartPulse size={20}/> Marque seus sintomas:
                        </h3>
                        <div className="grid grid-cols-1 gap-3 mb-8">
                            {SYMPTOMS.map(s => (
                                <button 
                                    key={s}
                                    onClick={() => toggleSymptom(s)}
                                    className={`p-4 rounded-xl border text-left flex justify-between items-center transition-all ${selected.includes(s) ? 'bg-green-900/40 border-green-500 text-white' : 'bg-black/20 border-white/10 text-stone-400 hover:bg-white/5'}`}
                                >
                                    {s}
                                    {selected.includes(s) && <Check size={18} className="text-green-400"/>}
                                </button>
                            ))}
                        </div>
                        <button 
                            onClick={() => selected.length > 0 ? setStep(2) : alert("Selecione pelo menos um sintoma.")}
                            className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition-all transform hover:scale-[1.02]"
                        >
                            Ver Meu Banho Ideal
                        </button>
                        <p className="text-center text-xs text-stone-500 mt-4">
                            {canUseFreeResource() ? '🌿 1 receita gratuita hoje.' : '🔒 Acesso Premium.'}
                        </p>
                    </div>
                )}

                {step === 2 && (
                   <div className="text-center py-20 animate-fadeIn bg-stone-900/80 rounded-2xl border border-green-900/30">
                       <h3 className="text-2xl font-bold text-white mb-4">Confirmar Diagnóstico?</h3>
                       <p className="mb-8 text-stone-300 max-w-md mx-auto">Selecionamos as ervas ideais para o seu campo energético com base nos sintomas relatados.</p>
                       <div className="flex justify-center gap-4">
                           <button onClick={() => setStep(1)} className="px-6 py-3 border border-stone-600 rounded-lg text-stone-400 hover:text-white transition-colors">Voltar</button>
                           <button onClick={generatePrescription} className="px-8 py-3 bg-green-600 hover:bg-green-500 rounded-lg font-bold shadow-lg transition-all transform hover:scale-105">Sim, Ver Receita</button>
                       </div>
                   </div>
                )}

                {step === 3 && (
                    <div className="text-center py-20 bg-stone-900/80 rounded-2xl">
                        <Loader2 size={48} className="animate-spin text-green-500 mx-auto"/>
                        <p className="mt-4 text-green-200">Preparando as ervas...</p>
                    </div>
                )}

                {step === 4 && (
                    <PremiumLock isLocked={isLocked} onUnlock={() => setTimeout(() => setIsLocked(false), 1500)} title="Receita de Banho" price="6,90">
                        <div className="bg-[#fdfcf8] text-stone-900 p-8 md:p-12 rounded-2xl shadow-2xl animate-slideUp">
                            <div className="flex items-center gap-3 mb-6 border-b border-stone-200 pb-4">
                                <Leaf className="text-green-600" />
                                <h2 className="text-2xl font-serif font-bold">Seu Banho de Poder</h2>
                            </div>
                            <div className="prose prose-stone max-w-none text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: result }} />
                            <button onClick={() => {setStep(1); setSelected([]);}} className="mt-8 w-full py-3 border border-green-600 text-green-700 font-bold rounded-lg hover:bg-green-50 transition-colors">Nova consulta</button>
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

export default HerbalTherapist;