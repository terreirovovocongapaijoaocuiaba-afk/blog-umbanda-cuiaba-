import React, { useState } from 'react';
import { Sparkles, Loader2, Lock, Star, AlertCircle, CheckCircle, CreditCard, HelpCircle } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

// Mock Card Data (Major Arcana inspired for Umbanda context)
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
  const [step, setStep] = useState<'intro' | 'shuffle' | 'selection' | 'payment' | 'reading' | 'result'>('intro');
  const [question, setQuestion] = useState('');
  const [selectedCards, setSelectedCards] = useState<any[]>([]);
  const [readingResult, setReadingResult] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  
  // Simulation of payment processing
  const [processingPayment, setProcessingPayment] = useState(false);

  const startReading = () => {
    if(!question.trim()) return alert("Mentalize sua pergunta primeiro.");
    setStep('shuffle');
    setTimeout(() => setStep('selection'), 2000);
  };

  const selectCard = (index: number) => {
    // Randomly pick a card from the deck data, ensuring no duplicates in current hand
    let card;
    do {
       card = CARDS[Math.floor(Math.random() * CARDS.length)];
    } while (selectedCards.find(c => c.id === card.id));

    const newHand = [...selectedCards, card];
    setSelectedCards(newHand);

    if(newHand.length === 3) {
        setTimeout(() => setStep('payment'), 1000);
    }
  };

  const handlePayment = () => {
      setProcessingPayment(true);
      // Simulate API call to Stripe/MercadoPago
      setTimeout(() => {
          setProcessingPayment(false);
          setStep('reading');
          generateReading();
      }, 2000);
  };

  const generateReading = async () => {
      setLoadingAI(true);
      try {
          // Fetch API Key securely (or assume set)
          const settingsSnap = await getDoc(doc(db, 'settings', 'api_keys'));
          const apiKey = settingsSnap.exists() ? settingsSnap.data().geminiKey : null;
          
          if(!apiKey) {
              setReadingResult("Erro: Chave de API não configurada no sistema. Contate o administrador.");
              setStep('result');
              setLoadingAI(false);
              return;
          }

          const ai = new GoogleGenAI({ apiKey });
          const cardNames = selectedCards.map(c => c.name).join(', ');
          
          const prompt = `
            Você é um sábio Guia de Umbanda (Preto Velho ou Caboclo). O consulente fez a pergunta: "${question}".
            As cartas tiradas no oráculo foram: ${cardNames}.
            
            Faça uma interpretação espiritual profunda, caridosa e direta.
            Use termos de umbanda (axé, caminhos, orixás) mas mantenha uma linguagem acessível.
            Estruture a resposta em:
            1. A Energia do Momento (Carta 1)
            2. O Desafio ou Caminho (Carta 2)
            3. O Conselho Final (Carta 3)
            
            Termine com uma mensagem de esperança e axé. Use formatação HTML simples (p, strong, br).
          `;

          const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
          setReadingResult(response.text);
          setStep('result');

      } catch (e) {
          console.error(e);
          setReadingResult("Não foi possível conectar com o plano espiritual agora. Tente novamente mais tarde.");
          setStep('result');
      } finally {
          setLoadingAI(false);
      }
  };

  return (
    <div className="min-h-screen bg-[#1a1520] text-stone-200 font-sans selection:bg-purple-900 overflow-hidden relative">
        {/* Background Atmosphere */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-purple-900/20 via-[#1a1520] to-[#1a1520] pointer-events-none"></div>

        <div className="relative z-10 container mx-auto px-4 py-32 flex flex-col items-center justify-center min-h-screen">
            
            {/* STAGE 1: INTRO */}
            {step === 'intro' && (
                <div className="max-w-2xl text-center animate-fadeIn">
                    <div className="inline-block p-4 rounded-full bg-purple-900/30 border border-purple-500/30 mb-6 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                        <Sparkles size={32} className="text-purple-400" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-amber-200 mb-6 drop-shadow-lg">
                        Oráculo de Aruanda
                    </h1>
                    <p className="text-lg text-purple-200/70 mb-10 leading-relaxed font-light">
                        Os búzios e cartas são ferramentas sagradas para iluminar caminhos. 
                        Mentalize sua dúvida com fé e peça permissão aos guias para tirar 3 cartas.
                    </p>
                    
                    <div className="bg-white/5 backdrop-blur-md p-1 rounded-xl border border-white/10 max-w-md mx-auto shadow-2xl">
                        <input 
                            value={question}
                            onChange={e => setQuestion(e.target.value)}
                            placeholder="Digite sua pergunta ou mentalize..." 
                            className="w-full bg-transparent p-4 text-center text-white placeholder-purple-300/50 focus:outline-none font-serif text-lg"
                        />
                    </div>
                    
                    <button 
                        onClick={startReading}
                        className="mt-8 px-10 py-4 bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-600 hover:to-indigo-700 text-white font-bold rounded-full shadow-[0_0_40px_rgba(147,51,234,0.4)] transition-all transform hover:scale-105 flex items-center gap-3 mx-auto border border-purple-500/50"
                    >
                        <Sparkles size={20} /> Iniciar Leitura Sagrada
                    </button>
                    <p className="mt-4 text-xs text-purple-400/50 uppercase tracking-widest">Leitura orientada por Inteligência Espiritual</p>
                </div>
            )}

            {/* STAGE 2: SHUFFLE */}
            {step === 'shuffle' && (
                <div className="flex flex-col items-center animate-fadeIn">
                    <h2 className="text-2xl font-serif text-purple-200 mb-8 animate-pulse">Embaralhando as energias...</h2>
                    <div className="relative w-48 h-72">
                        <div className="absolute inset-0 bg-purple-900 rounded-xl border-2 border-amber-500/50 animate-ping opacity-20"></div>
                        <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] bg-indigo-950 rounded-xl border-4 border-indigo-800 shadow-2xl flex items-center justify-center rotate-3 transition-transform">
                            <div className="w-20 h-20 rounded-full border-2 border-amber-500/30 flex items-center justify-center">
                                <Sparkles className="text-amber-500/50" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* STAGE 3: SELECTION */}
            {step === 'selection' && (
                <div className="w-full max-w-5xl animate-fadeIn text-center">
                    <h2 className="text-3xl font-serif text-white mb-2">Escolha {3 - selectedCards.length} Cartas</h2>
                    <p className="text-purple-300 mb-10 text-sm">Siga sua intuição. Onde sua mão parar, é a resposta.</p>
                    
                    {/* Hand Display */}
                    <div className="flex justify-center gap-4 mb-12 min-h-[160px]">
                        {selectedCards.map((card, i) => (
                            <div key={i} className="w-24 h-36 bg-amber-100 rounded border-2 border-amber-400 flex flex-col items-center justify-center text-stone-900 p-2 text-center animate-slideUp shadow-[0_0_20px_rgba(251,191,36,0.3)]">
                                <span className="text-[10px] uppercase font-bold text-amber-800">Carta {i+1}</span>
                                <span className="font-serif font-bold text-sm leading-tight mt-2">{card.name}</span>
                            </div>
                        ))}
                    </div>

                    {/* Deck Grid */}
                    <div className="flex flex-wrap justify-center gap-2 md:gap-4 perspective-1000">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <button 
                                key={i} 
                                onClick={() => selectCard(i)}
                                disabled={selectedCards.length >= 3}
                                className="w-16 h-24 md:w-24 md:h-36 bg-indigo-950 rounded-lg border border-indigo-700 hover:-translate-y-4 hover:bg-indigo-900 transition-all cursor-pointer shadow-lg bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]"
                            >
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* STAGE 4: PAYWALL */}
            {step === 'payment' && (
                <div className="max-w-md w-full bg-white dark:bg-stone-900 rounded-2xl p-8 text-center shadow-2xl border border-amber-500/30 animate-fadeIn relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-600 via-amber-500 to-purple-600"></div>
                    
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-600 animate-bounce">
                        <Lock size={32} />
                    </div>
                    
                    <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-white mb-2">
                        Sua Leitura está Pronta
                    </h2>
                    <p className="text-stone-500 dark:text-stone-400 text-sm mb-6">
                        As cartas revelaram um caminho poderoso para "{question}". Para honrar a energia despendida e manter o templo digital, pedimos uma contribuição simbólica.
                    </p>

                    <div className="bg-stone-50 dark:bg-stone-950 p-4 rounded-xl border border-stone-200 dark:border-stone-800 mb-6 text-left">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-stone-700 dark:text-stone-300 flex items-center gap-2"><Star size={14} className="text-amber-500"/> Interpretação Completa</span>
                            <span className="text-green-600 font-bold">R$ 9,90</span>
                        </div>
                        <ul className="text-xs text-stone-500 space-y-1 pl-6 list-disc">
                            <li>Análise profunda das 3 cartas</li>
                            <li>Conselho do Preto Velho</li>
                            <li>Previsão para os próximos dias</li>
                        </ul>
                    </div>

                    <button 
                        onClick={handlePayment}
                        disabled={processingPayment}
                        className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mb-4"
                    >
                        {processingPayment ? <Loader2 className="animate-spin" /> : <CreditCard size={20} />}
                        {processingPayment ? 'Processando...' : 'Liberar Leitura Agora'}
                    </button>
                    
                    <p className="text-[10px] text-stone-400 flex items-center justify-center gap-1">
                        <Lock size={10} /> Pagamento Seguro. Acesso Imediato.
                    </p>
                </div>
            )}

            {/* STAGE 5: AI PROCESSING */}
            {step === 'reading' && (
                <div className="text-center animate-fadeIn">
                    <div className="w-24 h-24 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                    <h2 className="text-2xl font-serif text-white mb-2">Consultando os Orixás...</h2>
                    <p className="text-purple-300 text-sm">Aguarde enquanto a mensagem é trazida da Aruanda.</p>
                </div>
            )}

            {/* STAGE 6: RESULT */}
            {step === 'result' && (
                <div className="max-w-3xl w-full bg-[#fdfcf8] text-stone-900 rounded-xl shadow-2xl overflow-hidden animate-slideUp">
                    <div className="bg-purple-900 p-8 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
                        <h2 className="text-3xl font-serif font-bold text-amber-200 relative z-10">O Conselho dos Guias</h2>
                        <p className="text-purple-200 text-sm relative z-10 mt-2">Para: "{question}"</p>
                    </div>
                    
                    <div className="p-8 md:p-12">
                         {/* Card Summary */}
                         <div className="flex justify-center gap-4 mb-8 border-b border-stone-200 pb-8">
                             {selectedCards.map((c, i) => (
                                 <div key={i} className="text-center">
                                     <div className="w-16 h-24 bg-stone-200 rounded mb-2 mx-auto border border-stone-300"></div>
                                     <p className="text-[10px] font-bold uppercase tracking-wide">{c.name}</p>
                                 </div>
                             ))}
                         </div>

                         {/* AI Text */}
                         <div className="prose prose-stone max-w-none font-serif leading-relaxed text-lg">
                             <div dangerouslySetInnerHTML={{ __html: readingResult }} />
                         </div>

                         <div className="mt-12 bg-amber-50 border border-amber-200 p-6 rounded-xl flex items-start gap-4">
                             <div className="bg-amber-100 p-2 rounded-full text-amber-600 mt-1"><Sparkles size={20}/></div>
                             <div>
                                 <h4 className="font-bold text-stone-900 text-sm uppercase mb-1">Nota Espiritual</h4>
                                 <p className="text-stone-600 text-sm">Esta leitura serve como orientação. O livre arbítrio é sempre seu. Para trabalhos espirituais específicos, agende uma consulta presencial.</p>
                             </div>
                         </div>
                    </div>

                    <div className="bg-stone-100 p-6 flex justify-between items-center">
                        <button onClick={() => window.print()} className="text-stone-500 hover:text-stone-900 text-sm font-bold flex items-center gap-2">
                             Salvar Leitura
                        </button>
                        <button onClick={() => {setStep('intro'); setSelectedCards([]); setQuestion('');}} className="bg-stone-900 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-stone-800">
                            Nova Tiragem
                        </button>
                    </div>
                </div>
            )}

        </div>
    </div>
  );
};

export default Oracle;