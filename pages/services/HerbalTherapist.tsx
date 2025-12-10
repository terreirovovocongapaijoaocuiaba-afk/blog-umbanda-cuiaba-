import React, { useState } from 'react';
import { Sun, Check, Loader2, CreditCard, Lock, Leaf } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

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
  const [loading, setLoading] = useState(false);

  const toggleSymptom = (s: string) => {
      if(selected.includes(s)) setSelected(selected.filter(i => i !== s));
      else setSelected([...selected, s]);
  };

  const handlePay = async () => {
      setLoading(true);
      setTimeout(async () => {
          setLoading(false);
          await generatePrescription();
      }, 2000);
  };

  const generatePrescription = async () => {
      setStep(3); // Loading UI
      try {
        const settingsSnap = await getDoc(doc(db, 'settings', 'api_keys'));
        const apiKey = settingsSnap.exists() ? settingsSnap.data().geminiKey : null;
        if(!apiKey) throw new Error("API Key Missing");

        const ai = new GoogleGenAI({ apiKey });
        const prompt = `
            Atue como um especialista em Ervas da Umbanda (Erveiro). O consulente relatou estes sintomas: ${selected.join(', ')}.
            Receite um BANHO DE ERVAS poderoso e específico.
            1. Nome do Banho.
            2. Ingredientes exatos.
            3. Modo de preparo (ferver ou macerar?).
            4. Dia da semana e Lua ideais.
            5. Uma reza curta para fazer durante o banho.
            Use HTML simples.
        `;
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        setResult(response.text);
        setStep(4);
      } catch (e) { alert("Erro."); setStep(1); }
  };

  return (
    <div className="min-h-screen bg-[#0f1410] text-white pt-32 pb-20 px-6 font-sans bg-[url('https://www.transparenttextures.com/patterns/leaves.png')]">
        <div className="max-w-2xl mx-auto">
             <div className="text-center mb-10">
                <div className="w-20 h-20 bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
                    <Leaf size={40} className="text-green-400" />
                </div>
                <h1 className="text-4xl font-serif font-bold text-green-100 mb-2">Terapeuta das Folhas</h1>
                <p className="text-green-200/60">As ervas curam, limpam e protegem. O que você está sentindo?</p>
            </div>

            {step === 1 && (
                <div className="bg-stone-900/80 p-8 rounded-2xl border border-green-900 shadow-2xl animate-fadeIn">
                    <h3 className="font-bold text-lg mb-6 text-green-400">Marque o que você sente:</h3>
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
                        className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition-all"
                    >
                        Ver Meu Banho Ideal
                    </button>
                </div>
            )}

            {step === 2 && (
                <div className="bg-white dark:bg-stone-900 p-8 rounded-2xl border border-green-500/30 shadow-2xl text-center animate-fadeIn max-w-md mx-auto">
                    <Lock size={40} className="mx-auto text-green-500 mb-4" />
                    <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-2">Receita Pronta</h2>
                    <p className="text-stone-500 mb-6">A combinação exata de ervas para limpar sua aura foi gerada. Libere o acesso para ver a receita e a reza de consagração.</p>
                    <div className="bg-green-900/20 p-4 rounded-lg mb-6 text-left">
                        <div className="flex justify-between font-bold text-green-300 mb-1"><span>Receita Completa</span> <span>R$ 6,90</span></div>
                    </div>
                    <button onClick={handlePay} disabled={loading} className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl flex items-center justify-center gap-2">
                        {loading ? <Loader2 className="animate-spin"/> : <CreditCard size={20}/>} Liberar Receita
                    </button>
                </div>
            )}

            {step === 3 && <div className="text-center py-20"><Loader2 size={48} className="animate-spin text-green-500 mx-auto"/><p className="mt-4">Preparando as ervas...</p></div>}

            {step === 4 && (
                <div className="bg-[#fdfcf8] text-stone-900 p-8 md:p-12 rounded-2xl shadow-2xl animate-slideUp">
                    <div className="flex items-center gap-3 mb-6 border-b border-stone-200 pb-4">
                        <Leaf className="text-green-600" />
                        <h2 className="text-2xl font-serif font-bold">Seu Banho de Poder</h2>
                    </div>
                    <div className="prose prose-stone max-w-none text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: result }} />
                    <button onClick={() => {setStep(1); setSelected([]);}} className="mt-8 text-green-700 font-bold hover:underline">Nova consulta</button>
                </div>
            )}
        </div>
    </div>
  );
};

export default HerbalTherapist;