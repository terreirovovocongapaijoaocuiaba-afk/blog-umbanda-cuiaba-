import React, { useState } from 'react';
import { Moon, Sparkles, Loader2, Info } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { canUseFreeResource, registerFreeUsage } from '../../lib/usageUtils';
import PremiumLock from '../../components/PremiumLock';
import TrustBadges from '../../components/TrustBadges';
import { FooterCTA } from '../../components/ConversionSections';

const DreamInterpreter: React.FC = () => {
  const [dream, setDream] = useState('');
  const [step, setStep] = useState<'input' | 'processing' | 'result'>('input');
  const [result, setResult] = useState('');
  const [isLocked, setIsLocked] = useState(false);

  const handleAnalyze = async () => {
      if(dream.length < 10) return alert("Descreva seu sonho com mais detalhes.");
      const freeAvailable = canUseFreeResource();
      setIsLocked(!freeAvailable);
      setStep('processing');
      await generateInterpretation(freeAvailable);
  };

  const generateInterpretation = async (isFree: boolean) => {
      try {
        const settingsSnap = await getDoc(doc(db, 'settings', 'api_keys'));
        const apiKey = settingsSnap.exists() ? settingsSnap.data().geminiKey : null;
        if(!apiKey) throw new Error("API Key Missing");

        const ai = new GoogleGenAI({ apiKey });
        const prompt = `
            Atue como um Preto Velho sábio. Interprete este sonho na visão da espiritualidade e umbanda: "${dream}".
            Estruture a resposta em HTML simples:
            1. Significado Espiritual (detalhado).
            2. Aviso ou Conselho.
            3. Sugestão de números da sorte (Bicho e Milhar).
            4. Banho recomendado.
            ${!isFree ? 'Gere uma resposta completa, pois vou usá-la como preview borrado.' : ''}
        `;
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        setResult(response.text);
        if (isFree) registerFreeUsage();
        setStep('result');
      } catch (e) {
          alert("Erro ao conectar com a espiritualidade. Tente novamente.");
          setStep('input');
      }
  };

  return (
    <div className="min-h-screen bg-[#0f0a14] text-white pt-24 font-sans bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]">
        <div className="container mx-auto px-6 pb-20">
            
            <div className="max-w-3xl mx-auto text-center mb-12 pt-10">
                <div className="w-20 h-20 bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                    <Moon size={40} className="text-indigo-300" />
                </div>
                <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-purple-400">Revelador de Sonhos</h1>
                <p className="text-indigo-200/60 text-lg mb-8">Os sonhos são cartas do mundo espiritual. O que eles querem te dizer?</p>
                <TrustBadges />
            </div>

            <div className="max-w-2xl mx-auto">
                {step === 'input' && (
                    <div className="bg-white/5 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-2xl animate-fadeIn">
                        <textarea 
                            value={dream}
                            onChange={e => setDream(e.target.value)}
                            placeholder="Descreva seu sonho aqui com detalhes... (Ex: Sonhei que estava voando sobre o mar e vi um homem de branco...)"
                            className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white placeholder-white/30 min-h-[150px] focus:outline-none focus:border-indigo-500 transition-colors text-lg"
                        />
                        <button onClick={handleAnalyze} className="w-full mt-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 transform hover:scale-[1.02]">
                            <Sparkles size={20}/> Revelar Significado
                        </button>
                        <p className="text-center text-xs text-white/40 mt-4 font-medium uppercase tracking-wide">
                            {canUseFreeResource() ? '✨ 1 interpretação gratuita disponível hoje' : '🔒 Limite diário atingido (Acesso Premium)'}
                        </p>
                    </div>
                )}

                {step === 'processing' && (
                    <div className="text-center py-20 animate-fadeIn bg-white/5 rounded-2xl border border-white/5">
                         <Loader2 size={48} className="animate-spin text-indigo-500 mx-auto mb-4"/>
                         <h3 className="text-2xl font-serif mb-2">Consultando o Livro da Vida...</h3>
                         <p className="text-white/50 text-sm">Decifrando simbolismos ancestrais</p>
                    </div>
                )}

                {step === 'result' && (
                    <PremiumLock 
                        isLocked={isLocked} 
                        onUnlock={() => setTimeout(() => setIsLocked(false), 1500)}
                        title="Interpretação de Sonhos"
                        benefits={["Significado Oculto", "Números da Sorte", "Banho de Ervas", "Conselho do Guia"]}
                    >
                        <div className="bg-[#fdfcf8] text-stone-900 p-8 md:p-12 rounded-2xl shadow-2xl animate-slideUp">
                            <div className="flex items-center gap-3 mb-6 border-b border-stone-200 pb-4">
                                <Moon className="text-indigo-600" />
                                <h2 className="text-2xl font-serif font-bold">A Mensagem do Sonho</h2>
                            </div>
                            <div className="prose prose-stone max-w-none text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: result }} />
                            
                            {!isLocked && (
                                <div className="mt-8 p-4 bg-indigo-50 rounded-lg border border-indigo-100 text-sm text-indigo-800 flex gap-3">
                                    <Info className="flex-shrink-0" size={20}/>
                                    <div>
                                        <strong>Conselho Premium:</strong> Sonhos recorrentes indicam mediunidade aflorando. Recomendamos agendar uma consulta.
                                    </div>
                                </div>
                            )}

                            <button onClick={() => { setStep('input'); setDream(''); }} className="mt-8 w-full py-3 border border-indigo-200 text-indigo-600 font-bold rounded-lg hover:bg-indigo-50 transition-colors uppercase text-sm">
                                Interpretar outro sonho
                            </button>
                        </div>
                    </PremiumLock>
                )}
            </div>

            {/* USP Section */}
            <div className="mt-20 max-w-4xl mx-auto text-center border-t border-white/10 pt-10">
                <h3 className="text-2xl font-serif font-bold mb-8">Por que interpretar seus sonhos?</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                        <h4 className="font-bold text-indigo-300 mb-2">Avisos Espirituais</h4>
                        <p className="text-sm text-white/60">Muitos sonhos são alertas de proteção dos seus guias.</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                        <h4 className="font-bold text-indigo-300 mb-2">Números da Sorte</h4>
                        <p className="text-sm text-white/60">O subconsciente revela padrões numéricos que trazem prosperidade.</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                        <h4 className="font-bold text-indigo-300 mb-2">Autoconhecimento</h4>
                        <p className="text-sm text-white/60">Entenda seus medos e desejos mais profundos.</p>
                    </div>
                </div>
            </div>

            <div className="mt-12">
                <FooterCTA />
            </div>
        </div>
    </div>
  );
};

export default DreamInterpreter;