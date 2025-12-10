import React, { useState } from 'react';
import { Moon, Sparkles, Lock, Loader2, CreditCard } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const DreamInterpreter: React.FC = () => {
  const [dream, setDream] = useState('');
  const [step, setStep] = useState<'input' | 'processing' | 'paywall' | 'result'>('input');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAnalyze = () => {
      if(dream.length < 10) return alert("Descreva seu sonho com mais detalhes.");
      setStep('paywall');
  };

  const handlePayment = async () => {
      setLoading(true);
      // Simulating Payment
      setTimeout(async () => {
          setLoading(false);
          await generateInterpretation();
      }, 2000);
  };

  const generateInterpretation = async () => {
      setStep('processing');
      try {
        const settingsSnap = await getDoc(doc(db, 'settings', 'api_keys'));
        const apiKey = settingsSnap.exists() ? settingsSnap.data().geminiKey : null;
        if(!apiKey) throw new Error("API Key Missing");

        const ai = new GoogleGenAI({ apiKey });
        const prompt = `
            Atue como um Preto Velho sábio. Interprete este sonho na visão da espiritualidade e umbanda: "${dream}".
            1. Significado Espiritual.
            2. Aviso ou Conselho.
            3. Sugestão de números da sorte (Bicho e Milhar).
            4. Banho recomendado.
            Use HTML simples (h3, p, strong, ul).
        `;
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        setResult(response.text);
        setStep('result');
      } catch (e) {
          alert("Erro ao conectar com a espiritualidade. Tente novamente.");
          setStep('input');
      }
  };

  return (
    <div className="min-h-screen bg-[#0f0a14] text-white pt-32 pb-20 px-6 font-sans bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]">
        <div className="max-w-2xl mx-auto">
            
            <div className="text-center mb-12">
                <div className="w-20 h-20 bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                    <Moon size={40} className="text-indigo-300" />
                </div>
                <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-purple-400">Revelador de Sonhos</h1>
                <p className="text-indigo-200/60 text-lg">Os sonhos são cartas do mundo espiritual. O que eles querem te dizer?</p>
            </div>

            {step === 'input' && (
                <div className="bg-white/5 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-2xl animate-fadeIn">
                    <textarea 
                        value={dream}
                        onChange={e => setDream(e.target.value)}
                        placeholder="Descreva seu sonho aqui... (Ex: Sonhei que estava voando sobre o mar...)"
                        className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white placeholder-white/30 min-h-[150px] focus:outline-none focus:border-indigo-500 transition-colors text-lg"
                    />
                    <button onClick={handleAnalyze} className="w-full mt-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
                        <Sparkles size={20}/> Revelar Significado
                    </button>
                    <p className="text-center text-xs text-white/30 mt-4">Análise baseada em arquétipos ancestrais.</p>
                </div>
            )}

            {step === 'paywall' && (
                <div className="bg-white dark:bg-stone-900 p-8 rounded-2xl border border-indigo-500/30 shadow-2xl text-center animate-fadeIn max-w-md mx-auto">
                    <Lock size={40} className="mx-auto text-indigo-500 mb-4" />
                    <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-2">Interpretação Pronta</h2>
                    <p className="text-stone-500 mb-6">Seu sonho contém uma mensagem importante sobre seu momento atual. Libere a análise completa + números da sorte.</p>
                    <div className="bg-indigo-900/20 p-4 rounded-lg mb-6 text-left">
                        <div className="flex justify-between font-bold text-indigo-300 mb-1"><span>Análise Completa</span> <span>R$ 4,90</span></div>
                        <p className="text-xs text-indigo-400">Inclui conselho do Preto Velho.</p>
                    </div>
                    <button onClick={handlePayment} disabled={loading} className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl flex items-center justify-center gap-2">
                        {loading ? <Loader2 className="animate-spin"/> : <CreditCard size={20}/>} Liberar Agora
                    </button>
                </div>
            )}

            {step === 'processing' && (
                <div className="text-center py-20 animate-fadeIn">
                     <Loader2 size={48} className="animate-spin text-indigo-500 mx-auto mb-4"/>
                     <h3 className="text-2xl font-serif">Consultando o Livro da Vida...</h3>
                </div>
            )}

            {step === 'result' && (
                <div className="bg-[#fdfcf8] text-stone-900 p-8 md:p-12 rounded-2xl shadow-2xl animate-slideUp">
                    <div className="flex items-center gap-3 mb-6 border-b border-stone-200 pb-4">
                        <Moon className="text-indigo-600" />
                        <h2 className="text-2xl font-serif font-bold">A Mensagem do Sonho</h2>
                    </div>
                    <div className="prose prose-stone max-w-none text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: result }} />
                    <button onClick={() => setStep('input')} className="mt-8 text-indigo-600 font-bold hover:underline">Interpretar outro sonho</button>
                </div>
            )}

        </div>
    </div>
  );
};

export default DreamInterpreter;