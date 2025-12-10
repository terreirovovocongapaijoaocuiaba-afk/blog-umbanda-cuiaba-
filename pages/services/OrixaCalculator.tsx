import React, { useState } from 'react';
import { Brain, Calendar, Loader2, CreditCard, Lock, Sparkles } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const OrixaCalculator: React.FC = () => {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [step, setStep] = useState(1);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    setTimeout(async () => {
        setLoading(false);
        await calculate();
    }, 2000);
  };

  const calculate = async () => {
      setStep(3);
      try {
        const settingsSnap = await getDoc(doc(db, 'settings', 'api_keys'));
        const apiKey = settingsSnap.exists() ? settingsSnap.data().geminiKey : null;
        if(!apiKey) throw new Error("API Key Missing");

        const ai = new GoogleGenAI({ apiKey });
        // Simulating Odu calculation logic via AI for this MVP
        const prompt = `
            Com base na data de nascimento ${date} e nome ${name}, realize um cálculo numerológico simbólico dos Odus (Umbanda/Candomblé) para sugerir prováveis Orixás regentes (Pai e Mãe de Cabeça).
            IMPORTANTE: Deixe claro que isso é uma estimativa numerológica e a confirmação real só ocorre no jogo de búzios.
            Estrutura:
            1. Orixá Provável (Pai e Mãe).
            2. Características da Personalidade (Arquétipo).
            3. Dia da semana e cor favorável.
            4. Mensagem para este filho(a).
            Use HTML simples.
        `;
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        setResult(response.text);
        setStep(4);
      } catch (e) { alert("Erro."); setStep(1); }
  };

  return (
    <div className="min-h-screen bg-[#1c1917] text-white pt-32 pb-20 px-6 font-sans bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
        <div className="max-w-xl mx-auto">
             <div className="text-center mb-10">
                <div className="w-20 h-20 bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-stone-600">
                    <Brain size={40} className="text-white" />
                </div>
                <h1 className="text-4xl font-serif font-bold text-white mb-2">Calculadora de Orixá</h1>
                <p className="text-stone-400">A numerologia sagrada revela quem caminha ao seu lado.</p>
            </div>

            {step === 1 && (
                <div className="bg-stone-900 p-8 rounded-2xl border border-stone-700 shadow-2xl animate-fadeIn space-y-6">
                    <div>
                        <label className="block text-xs font-bold uppercase text-stone-500 mb-2">Nome Completo</label>
                        <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-black/30 border border-stone-700 rounded p-3 focus:border-white focus:outline-none"/>
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-stone-500 mb-2">Data de Nascimento</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-black/30 border border-stone-700 rounded p-3 focus:border-white focus:outline-none text-white"/>
                    </div>
                    <button onClick={() => (name && date) ? setStep(2) : alert("Preencha tudo.")} className="w-full py-4 bg-stone-100 hover:bg-white text-black font-bold rounded-xl shadow-lg transition-all flex justify-center gap-2">
                         <Sparkles size={18}/> Calcular Orixá
                    </button>
                </div>
            )}

            {step === 2 && (
                <div className="bg-white dark:bg-stone-900 p-8 rounded-2xl border border-stone-700 shadow-2xl text-center animate-fadeIn">
                    <Lock size={40} className="mx-auto text-stone-500 mb-4" />
                    <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-2">Mapa Gerado</h2>
                    <p className="text-stone-500 mb-6">Seus Odus foram calculados. Descubra agora quem são seus pais ancestrais segundo a numerologia.</p>
                    <div className="bg-stone-800 p-4 rounded-lg mb-6 text-left">
                        <div className="flex justify-between font-bold text-white mb-1"><span>Mapa Completo</span> <span>R$ 9,90</span></div>
                    </div>
                    <button onClick={handlePay} disabled={loading} className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl flex items-center justify-center gap-2">
                        {loading ? <Loader2 className="animate-spin"/> : <CreditCard size={20}/>} Liberar Mapa
                    </button>
                </div>
            )}

            {step === 3 && <div className="text-center py-20"><Loader2 size={48} className="animate-spin text-white mx-auto"/><p className="mt-4">Calculando Odus...</p></div>}

            {step === 4 && (
                <div className="bg-[#fdfcf8] text-stone-900 p-8 md:p-12 rounded-2xl shadow-2xl animate-slideUp">
                    <div className="flex items-center gap-3 mb-6 border-b border-stone-200 pb-4">
                        <Brain className="text-stone-800" />
                        <h2 className="text-2xl font-serif font-bold">Seus Guardiões</h2>
                    </div>
                    <div className="prose prose-stone max-w-none text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: result }} />
                    <button onClick={() => {setStep(1); setName(''); setDate('');}} className="mt-8 text-stone-900 font-bold hover:underline">Calcular novamente</button>
                </div>
            )}
        </div>
    </div>
  );
};

export default OrixaCalculator;