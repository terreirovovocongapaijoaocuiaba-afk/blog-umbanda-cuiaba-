import React, { useState } from 'react';
import { Sparkles, Loader2, Star, Lock } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { canUseFreeResource, registerFreeUsage } from '../lib/usageUtils';
import PremiumLock from '../components/PremiumLock';
import TrustBadges from '../components/TrustBadges';
import { FooterCTA } from '../components/ConversionSections';

const CARDS = [
  { id: 1, name: 'O Mago (Exu)', meaning: 'Poder, ação, início.' },
  { id: 2, name: 'A Sacerdotisa (Iemanjá)', meaning: 'Intuição, mistério, sabedoria.' },
  { id: 3, name: 'A Imperatriz (Oxum)', meaning: 'Fecundidade, amor, prosperidade.' },
  { id: 4, name: 'O Imperador (Xangô)', meaning: 'Justiça, autoridade, estabilidade.' },
  { id: 5, name: 'O Hierofante (Oxalá)', meaning: 'Fé, tradição, ensinamento.' },
  { id: 6, name: 'Os Enamorados (Ibejis)', meaning: 'Escolhas, harmonia, união.' },
  { id: 7, name: 'O Carro (Ogum)', meaning: 'Vitória, caminho, movimento.' },
  { id: 8, name: 'A Força (Iansã)', meaning: 'Coragem, domínio, paixão.' },
  { id: 9, name: 'O Eremita (Omolu)', meaning: 'Reflexão, cura, paciência.' },
  { id: 10, name: 'A Roda da Fortuna', meaning: 'Destino, mudanças, ciclos.' },
  { id: 11, name: 'A Justiça', meaning: 'Equilíbrio, lei, karma.' },
  { id: 12, name: 'O Enforcado', meaning: 'Sacrifício, nova visão.' },
  { id: 13, name: 'A Morte (Nanã)', meaning: 'Renascimento, transformação.' },
  { id: 14, name: 'A Temperança', meaning: 'Paciência, alquimia.' },
  { id: 15, name: 'O Diabo', meaning: 'Materialismo, vícios.' },
  { id: 16, name: 'A Torre', meaning: 'Ruptura, revelação.' },
  { id: 17, name: 'A Estrela', meaning: 'Esperança, renovação.' },
  { id: 18, name: 'A Lua', meaning: 'Ilusão, medo, subconsciente.' },
  { id: 19, name: 'O Sol', meaning: 'Sucesso, clareza, alegria.' },
  { id: 20, name: 'O Julgamento', meaning: 'Chamado, despertar.' },
  { id: 21, name: 'O Mundo', meaning: 'Conclusão, realização.' },
];

const Oracle: React.FC = () => {
  const [step, setStep] = useState<'intro' | 'shuffle' | 'selection' | 'reading' | 'result'>('intro');
  const [question, setQuestion] = useState('');
  const [selectedCards, setSelectedCards] = useState<any[]>([]);
  const [readingResult, setReadingResult] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const startReading = () => {
    if(!question.trim()) return alert("Mentalize sua pergunta primeiro.");
    setStep('shuffle');
    setTimeout(() => setStep('selection'), 2000);
  };

  const selectCard = (index: number) => {
    let card;
    do {
       card = CARDS[Math.floor(Math.random() * CARDS.length)];
    } while (selectedCards.find(c => c.id === card.id));

    const newHand = [...selectedCards, card];
    setSelectedCards(newHand);

    if(newHand.length === 3) {
        const freeAvailable = canUseFreeResource();
        setIsLocked(!freeAvailable);
        generateReading(freeAvailable);
        setStep('reading');
    }
  };

  const generateReading = async (isFree: boolean) => {
      setLoadingAI(true);
      try {
          const settingsSnap = await getDoc(doc(db, 'settings', 'api_keys'));
          const apiKey = settingsSnap.exists() ? settingsSnap.data().geminiKey : null;
          
          if(!apiKey) {
              setReadingResult("Erro: Chave de API não configurada.");
              setStep('result');
              setLoadingAI(false);
              return;
          }

          const ai = new GoogleGenAI({ apiKey });
          const cardNames = selectedCards.map(c => c.name).join(', ');
          
          const prompt = `
            Você é um sábio Guia de Umbanda. O consulente perguntou: "${question}".
            Cartas: ${cardNames}.
            Interpretação profunda e estruturada (HTML simples).
            ${!isFree ? 'Gere a leitura completa, ela será parcialmente ocultada.' : ''}
          `;

          const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
          setReadingResult(response.text);
          
          if (isFree) registerFreeUsage();
          
          setStep('result');

      } catch (e) {
          console.error(e);
          setReadingResult("Erro na conexão espiritual.");
          setStep('result');
      } finally {
          setLoadingAI(false);
      }
  };

  const handleUnlock = () => {
      setTimeout(() => setIsLocked(false), 1500);
  };

  return (
    <div className="min-h-screen bg-[#1a1520] text-stone-200 font-sans selection:bg-purple-900 overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-purple-900/20 via-[#1a1520] to-[#1a1520] pointer-events-none"></div>

        <div className="relative z-10 pt-20">
            {step === 'intro' && (
                <div className="min-h-screen flex flex-col justify-center px-4">
                    <div className="max-w-2xl mx-auto text-center animate-fadeIn">
                        <TrustBadges />
                        <div className="mt-8 mb-6">
                            <div className="inline-block p-4 rounded-full bg-purple-900/30 border border-purple-500/30 mb-6 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                                <Sparkles size={32} className="text-purple-400" />
                            </div>
                            <h1 className="text-4xl md:text-6xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-amber-200 mb-6 drop-shadow-lg">
                                Oráculo de Aruanda
                            </h1>
                            <p className="text-lg text-purple-200/70 mb-10 leading-relaxed font-light">
                                Mentalize sua dúvida com fé. A resposta que você procura pode estar a um clique de distância.
                                {canUseFreeResource() ? <span className="block mt-2 text-green-400 font-bold bg-green-900/20 py-1 rounded border border-green-500/30 w-fit mx-auto px-4">✨ Leitura Diária Gratuita Disponível</span> : <span className="block mt-2 text-amber-400 font-bold bg-amber-900/20 py-1 rounded border border-amber-500/30 w-fit mx-auto px-4">🔒 Modo Premium</span>}
                            </p>
                        </div>
                        
                        <div className="bg-white/5 backdrop-blur-md p-2 rounded-2xl border border-white/10 max-w-md mx-auto shadow-2xl transition-all focus-within:ring-2 ring-purple-500">
                            <input 
                                value={question}
                                onChange={e => setQuestion(e.target.value)}
                                placeholder="Digite sua pergunta..." 
                                className="w-full bg-transparent p-4 text-center text-white placeholder-purple-300/50 focus:outline-none font-serif text-lg"
                            />
                        </div>
                        
                        <button 
                            onClick={startReading}
                            className="mt-8 px-12 py-5 bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-600 hover:to-indigo-700 text-white font-bold rounded-full shadow-lg transition-all transform hover:scale-105 flex items-center gap-3 mx-auto text-lg border border-white/10"
                        >
                            <Sparkles size={24} /> Iniciar Leitura
                        </button>
                    </div>
                </div>
            )}

            {step === 'shuffle' && (
                <div className="min-h-screen flex items-center justify-center text-center animate-fadeIn">
                    <div>
                        <h2 className="text-3xl font-serif text-purple-200 mb-8 animate-pulse">Embaralhando o Destino...</h2>
                        <div className="w-32 h-48 bg-indigo-950 rounded-xl border-2 border-amber-500/50 animate-spin mx-auto shadow-[0_0_50px_rgba(168,85,247,0.3)]"></div>
                    </div>
                </div>
            )}

            {step === 'selection' && (
                <div className="min-h-screen flex items-center justify-center px-4">
                    <div className="w-full max-w-5xl animate-fadeIn text-center">
                        <h2 className="text-4xl font-serif text-white mb-2">Escolha {3 - selectedCards.length} Cartas</h2>
                        <p className="text-purple-300 mb-10">Use sua intuição. As cartas certas chamarão sua atenção.</p>
                        <div className="flex flex-wrap justify-center gap-4">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => selectCard(i)}
                                    disabled={selectedCards.length >= 3}
                                    className="w-20 h-32 md:w-24 md:h-40 bg-gradient-to-br from-indigo-900 to-black rounded-lg border border-indigo-700 hover:-translate-y-4 hover:border-amber-400 hover:shadow-[0_0_20px_rgba(251,191,36,0.4)] transition-all duration-300 cursor-pointer"
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {step === 'reading' && (
                <div className="min-h-screen flex items-center justify-center text-center animate-fadeIn">
                    <div>
                        <Loader2 size={64} className="animate-spin text-purple-500 mx-auto mb-6"/>
                        <h2 className="text-3xl font-serif text-white">Consultando os Orixás...</h2>
                        <p className="text-stone-400 mt-2">Aguarde a conexão espiritual.</p>
                    </div>
                </div>
            )}

            {step === 'result' && (
                <div className="container mx-auto px-4 pb-20">
                    <div className="w-full max-w-4xl mx-auto animate-slideUp">
                        {/* Card Reveal */}
                        <div className="flex justify-center gap-4 mb-12">
                             {selectedCards.map((c, i) => (
                                 <div key={i} className="text-center text-white w-28 md:w-32 animate-fadeIn" style={{animationDelay: `${i*200}ms`}}>
                                     <div className="h-40 md:h-48 bg-amber-100 rounded-lg mb-3 border-4 border-amber-500 shadow-2xl text-stone-900 flex items-center justify-center text-sm font-bold p-2 text-center transform hover:scale-105 transition-transform">
                                         {c.name}
                                     </div>
                                 </div>
                             ))}
                        </div>

                        <PremiumLock 
                            isLocked={isLocked}
                            onUnlock={handleUnlock}
                            title="Leitura de Cartas"
                            price="9,90"
                        >
                            <div className="bg-[#fdfcf8] text-stone-900 p-8 md:p-12 rounded-3xl shadow-2xl border-4 border-purple-900/30">
                                <div className="bg-purple-900 p-8 -mx-8 md:-mx-12 -mt-8 md:-mt-12 mb-10 text-center relative overflow-hidden">
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                                    <h2 className="text-3xl font-serif font-bold text-amber-200 relative z-10">Conselho dos Guias</h2>
                                    <p className="text-purple-200 text-sm mt-2 relative z-10">Resposta para: "{question}"</p>
                                </div>
                                <div className="prose prose-stone max-w-none text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: readingResult }} />
                                
                                {!isLocked && (
                                    <div className="mt-12 p-6 bg-purple-50 rounded-xl border border-purple-100 text-center">
                                        <p className="text-sm text-purple-900 mb-4 font-medium">Esta foi uma leitura sintetizada. Para uma análise profunda da sua vida, torne-se membro.</p>
                                        <button className="px-8 py-3 bg-stone-900 text-white rounded-lg font-bold uppercase text-xs hover:bg-stone-800 shadow-lg transition-transform hover:-translate-y-1">
                                            Conhecer Clube VIP
                                        </button>
                                    </div>
                                )}

                                 <button onClick={() => {setStep('intro'); setSelectedCards([]); setQuestion('');}} className="mt-10 text-indigo-600 font-bold hover:underline block mx-auto text-sm uppercase tracking-widest">
                                    Realizar Nova Tiragem
                                </button>
                            </div>
                        </PremiumLock>
                    </div>
                    <div className="mt-20">
                        <FooterCTA />
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default Oracle;